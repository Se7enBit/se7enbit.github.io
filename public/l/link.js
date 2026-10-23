/*
 * Flamingo share-link page.
 *
 * Decodes "#<version>.<payload>" where payload = base64url(rawDeflate(JSON)) and
 * JSON = {"v":1,"t":title,"c":colorKey,"i":[{"x":text},...]} (mirrors ShareCodec.kt in the app),
 * then shows the list read-only. Everything happens in the browser: the fragment is never sent to a server.
 *
 * Inflating uses the browser's DecompressionStream("deflate-raw"). Only browsers without it load
 * pako 2.1.0 from jsDelivr, pinned by its integrity hash.
 */
(function (root) {
  "use strict";

  var VERSION = 1;
  var MAX_INFLATED_BYTES = 512 * 1024;
  var MAX_ITEMS = 2000;
  var MAX_TEXT_LENGTH = 2000;
  var PAKO_URL = "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako_inflate.min.js";
  var PAKO_INTEGRITY = "sha384-taEjHL+GUvC8IhXeCaTNUxz3O8ItsajGFLDFj4v/VJvM24HU36qP/6sRpuAGGfeT";

  /** kind: "malformed" (cut off, edited, not a list) or "version" (made by a newer app). */
  function LinkError(kind) {
    this.kind = kind;
  }

  function malformed() {
    return new LinkError("malformed");
  }

  function base64UrlToBytes(text) {
    if (!/^[A-Za-z0-9_-]+={0,2}$/.test(text)) throw malformed();
    var b64 = text.replace(/=+$/, "").replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    var binary;
    try {
      binary = atob(b64);
    } catch (e) {
      throw malformed();
    }
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function hasNativeRawInflate() {
    try {
      new DecompressionStream("deflate-raw");
      return true;
    } catch (e) {
      return false; // missing, or an older version without the "deflate-raw" format
    }
  }

  async function inflateNative(bytes) {
    var reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
    var chunks = [];
    var total = 0;
    try {
      for (;;) {
        var step = await reader.read();
        if (step.done) break;
        total += step.value.length;
        if (total > MAX_INFLATED_BYTES) {
          reader.cancel();
          throw malformed();
        }
        chunks.push(step.value);
      }
    } catch (e) {
      throw e instanceof LinkError ? e : malformed();
    }
    var out = new Uint8Array(total);
    var offset = 0;
    chunks.forEach(function (chunk) {
      out.set(chunk, offset);
      offset += chunk.length;
    });
    return out;
  }

  function loadPako() {
    return new Promise(function (resolve, reject) {
      if (root.pako) return resolve(root.pako);
      var script = document.createElement("script");
      script.src = PAKO_URL;
      script.integrity = PAKO_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      script.onload = function () {
        resolve(root.pako);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function inflateRaw(bytes) {
    if (hasNativeRawInflate()) return inflateNative(bytes);
    var pako = await loadPako();
    var out;
    try {
      out = pako.inflateRaw(bytes);
    } catch (e) {
      throw malformed();
    }
    if (!out || out.length > MAX_INFLATED_BYTES) throw malformed();
    return out;
  }

  /** Decodes the part after "#". Resolves to {title, color, items}; rejects with a LinkError. */
  async function decodeFragment(fragment) {
    var match = /^(\d+)\.(.+)$/.exec(fragment || "");
    if (!match) throw malformed();
    var version = parseInt(match[1], 10);
    if (version > VERSION) throw new LinkError("version");
    if (version < 1) throw malformed();

    var bytes = await inflateRaw(base64UrlToBytes(match[2]));
    var data;
    try {
      data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    } catch (e) {
      throw malformed();
    }
    if (!data || typeof data !== "object" || Number(data.v) !== version) throw malformed();

    var title = data.t === undefined ? "" : data.t;
    var items = data.i === undefined ? [] : data.i;
    if (typeof title !== "string" || !Array.isArray(items) || items.length > MAX_ITEMS) throw malformed();
    var texts = items.map(function (item) {
      if (!item || typeof item.x !== "string") throw malformed();
      return item.x.trim().slice(0, MAX_TEXT_LENGTH);
    });
    return {
      title: title.trim().slice(0, MAX_TEXT_LENGTH),
      color: typeof data.c === "string" ? data.c : "default",
      items: texts.filter(function (text) {
        return text.length > 0;
      }),
    };
  }

  root.FlamingoLink = { decodeFragment: decodeFragment, LinkError: LinkError, VERSION: VERSION };

  // ---- Page (browser only) ----

  if (typeof document === "undefined") return;

  var COLORS = ["coral", "peach", "sand", "mint", "sage", "fog", "storm", "dusk", "blossom", "clay", "chalk"];

  function show(id) {
    ["loading", "list", "error"].forEach(function (section) {
      document.getElementById(section).hidden = section !== id;
    });
  }

  function render(list) {
    var card = document.getElementById("card");
    card.className = "card" + (COLORS.indexOf(list.color) >= 0 ? " c-" + list.color : "");
    document.getElementById("title").textContent = list.title || "Untitled list";
    var ul = document.getElementById("items");
    ul.textContent = "";
    list.items.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text; // never innerHTML: the link content is untrusted
      ul.appendChild(li);
    });
    document.getElementById("count").textContent =
      list.items.length === 1 ? "1 item" : list.items.length + " items";
    if (list.title) document.title = list.title + " · Flamingo";
    show("list");
  }

  function renderError(error) {
    document.getElementById("error-text").textContent =
      error instanceof LinkError && error.kind === "version"
        ? "This list was shared from a newer version of Flamingo. Update the app to open it."
        : "This link doesn’t contain a list that can be shown. It may have been cut off when it was shared.";
    show("error");
  }

  function load() {
    show("loading");
    decodeFragment(location.hash.replace(/^#/, "")).then(render, renderError);
  }

  window.addEventListener("hashchange", load);
  load();
})(typeof window !== "undefined" ? window : globalThis);
