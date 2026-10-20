// Generates public/og.png (1200×630, the social preview) and public/apple-touch-icon.png (180×180)
// from src/data/profile.ts, using a locally installed Chrome/Edge in headless mode.
//
//   npm run og            (re-run after editing profile.ts, then commit the PNGs)
//
// Set CHROME_PATH if your browser isn't found automatically.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { banner, chipLogo } from "../src/lib/ascii.ts";
import { profile } from "../src/data/profile.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fontUrl = (file) => pathToFileURL(path.join(root, "public", "fonts", file)).href;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = candidates.find((p) => p && existsSync(p));
  if (!found) throw new Error("No Chrome/Edge found. Set CHROME_PATH to your browser executable.");
  return found;
}

const base = `
  @font-face { font-family: Hack; src: url("${fontUrl("hack-regular.woff2")}"); font-weight: 400; }
  @font-face { font-family: Hack; src: url("${fontUrl("hack-bold.woff2")}"); font-weight: 700; }
  * { box-sizing: border-box; margin: 0; }
  body { font-family: Hack, monospace; color: #c0caf5; background: #1a1b26; }
`;

// Art → HTML with one span per colored run (fill / shade / frame).
const artHtml = (lines) =>
  lines.map((line) => line.map((r) => (r.ink ? `<span class="${r.ink}">${esc(r.text)}</span>` : esc(r.text))).join("")).join("\n");
const logo = artHtml(chipLogo());
const handleArt = artHtml(banner(profile.handle));

const og = `<!doctype html><meta charset="utf-8"><style>${base}
  body {
    width: 1200px; height: 630px; padding: 56px; overflow: hidden;
    background-color: #1a1b26;
    background-image:
      radial-gradient(circle at 12% 8%, rgb(158 206 106 / 0.12), transparent 45%),
      radial-gradient(circle at 92% 96%, rgb(115 218 202 / 0.10), transparent 50%),
      radial-gradient(rgb(59 66 97 / 0.55) 1.5px, transparent 1.5px);
    background-size: auto, auto, 26px 26px;
  }
  .win { height: 100%; display: flex; flex-direction: column; background: #16161e; border: 2px solid #41a6b5;
         border-radius: 14px; overflow: hidden; box-shadow: 0 24px 60px rgb(0 0 0 / 0.5); }
  .bar { padding: 12px; text-align: center; background: #292e42; border-bottom: 2px solid #3b4261; font-size: 22px; font-weight: 700; }
  .body { flex: 1; display: flex; align-items: center; justify-content: space-between; padding: 36px 48px; gap: 32px; }
  .ps1 { color: #9ece6a; font-weight: 700; }
  .cmd { font-size: 26px; }
  .banner { margin: 26px 0 22px; font-size: 18px; line-height: 1; letter-spacing: -0.02em; }
  .name { font-size: 36px; font-weight: 700; }
  .title { margin-top: 8px; color: #73daca; font-size: 28px; }
  .url { margin-top: 28px; color: #8089b3; font-size: 24px; }
  .logo { font-size: 22px; line-height: 1; }
  .block { background: #9ece6a; color: transparent; }
  .fill { color: #9ece6a; }
  .shade { color: #565f89; }
  .frame { color: #41a6b5; }
</style>
<div class="win">
  <div class="bar">guest@${esc(profile.handle)}: ~</div>
  <div class="body">
    <div>
      <p class="cmd"><span class="ps1">guest@${esc(profile.handle)}:~$</span> whoami</p>
      <pre class="banner">${handleArt}</pre>
      <p class="name">${esc(profile.name)}</p>
      <p class="title">${esc(profile.title)}</p>
      <p class="url">${esc(new URL("https://se7enbit.github.io").host)}</p>
    </div>
    <pre class="logo">${logo}</pre>
  </div>
</div>`;

const icon = `<!doctype html><meta charset="utf-8"><style>${base}
  body { width: 180px; height: 180px; background: #1a1b26; }
  img { display: block; width: 180px; height: 180px; }
</style><img src="${pathToFileURL(path.join(root, "public", "favicon.svg")).href}" alt="">`;

const browser = findBrowser();
const tmp = mkdtempSync(path.join(tmpdir(), "og-"));
try {
  for (const [name, html, w, h] of [
    ["og.png", og, 1200, 630],
    ["apple-touch-icon.png", icon, 180, 180],
  ]) {
    const page = path.join(tmp, `${name}.html`);
    writeFileSync(page, html);
    const out = path.join(root, "public", name);
    execFileSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--allow-file-access-from-files",
        `--user-data-dir=${path.join(tmp, "profile")}`,
        `--window-size=${w},${h}`,
        "--virtual-time-budget=3000",
        `--screenshot=${out}`,
        pathToFileURL(page).href,
      ],
      { stdio: "ignore" },
    );
    if (!existsSync(out)) throw new Error(`Screenshot failed for ${name}`);
    console.log(`wrote public/${name}`);
  }
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
