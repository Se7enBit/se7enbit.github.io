<script lang="ts">
  import { onMount, tick } from "svelte";
  import { profile } from "../data/profile";
  import { complete, execute, type Block, type Ctx, type Seg } from "../lib/commands";
  import { desktop } from "../lib/desktop.svelte";
  import type { Project } from "../lib/projects";
  import Neofetch from "./Neofetch.svelte";

  let { projects }: { projects: readonly Project[] } = $props();

  type Entry = { id: number; input: string | null; blocks: Block[] };

  const PS1 = `guest@${profile.handle}:~$`;
  const MAX_ENTRIES = 200;

  const welcome = (): Entry[] => [
    {
      id: 0,
      input: "neofetch",
      blocks: [
        { type: "neofetch" },
        {
          type: "lines",
          lines: [
            [
              "Type ",
              { text: "help", run: "help", tone: "accent" },
              " or click a command: ",
              { text: "projects", run: "projects", tone: "accent" },
              "  ",
              { text: "whoami", run: "whoami", tone: "accent" },
              "  ",
              { text: "contact", run: "contact", tone: "accent" },
              "  ",
              { text: "cv", run: "cv", tone: "accent" },
            ],
          ],
        },
      ],
    },
  ];

  let entries = $state<Entry[]>(welcome());
  let nextId = 1;
  let value = $state("");
  let caret = $state(0);
  let scrollLeft = $state(0);
  let focused = $state(false);

  const history: string[] = [];
  let historyPos = 0;
  let draft = "";

  let input: HTMLInputElement;
  let scroller: HTMLDivElement;

  // Set by ctx.clear / ctx.exit while a command runs.
  let pending: "clear" | "exit" | null = null;

  const ctx: Ctx = {
    get projects() {
      return projects;
    },
    history,
    openWindow: (id) => desktop.open(id),
    openUrl: (url) => window.open(url, "_blank", "noopener,noreferrer"),
    clear: () => (pending = "clear"),
    exit: () => (pending = "exit"),
  };

  function push(entry: Omit<Entry, "id">) {
    entries.push({ id: nextId++, ...entry });
    if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  }

  function run(raw: string) {
    const line = raw.trim();
    if (line && history.at(-1) !== line) history.push(line);
    historyPos = history.length;
    draft = "";

    pending = null;
    const blocks = line ? execute(line, ctx) : [];

    if (pending === "exit") {
      entries = welcome();
      desktop.exit();
      return;
    }
    if (pending === "clear") entries = [];
    else push({ input: raw, blocks });
    scrollToEnd();
  }

  /** Run a clicked command as if it had been typed. */
  function runClicked(command: string) {
    value = "";
    run(command);
    focusInput();
  }

  function fill(text: string) {
    setValue(text);
    focusInput();
  }

  function setValue(text: string) {
    value = text;
    tick().then(() => {
      input.setSelectionRange(text.length, text.length);
      syncCaret();
    });
  }

  function focusInput() {
    input.focus({ preventScroll: true });
  }

  async function scrollToEnd() {
    await tick();
    scroller.scrollTop = scroller.scrollHeight;
  }

  function syncCaret() {
    caret = input.selectionStart ?? value.length;
    scrollLeft = input.scrollLeft;
  }

  function onkeydown(e: KeyboardEvent) {
    const plain = !e.ctrlKey && !e.metaKey && !e.altKey;

    if (e.key === "Enter") {
      e.preventDefault();
      const raw = value;
      value = "";
      run(raw);
    } else if (e.key === "Tab" && plain && !e.shiftKey && value.trim() !== "") {
      // Tab completes; with an empty prompt it moves focus as usual.
      e.preventDefault();
      const result = complete(value, ctx);
      if (result.options.length) {
        push({ input: value, blocks: [{ type: "lines", lines: [result.options.map((o) => `${o}  `)] }] });
        scrollToEnd();
      }
      setValue(result.value);
    } else if (e.key === "ArrowUp" && plain) {
      e.preventDefault();
      if (historyPos === history.length) draft = value;
      if (historyPos > 0) setValue(history[--historyPos]!);
    } else if (e.key === "ArrowDown" && plain) {
      e.preventDefault();
      if (historyPos < history.length) {
        historyPos++;
        setValue(historyPos === history.length ? draft : history[historyPos]!);
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      entries = [];
    } else if (e.ctrlKey && e.key.toLowerCase() === "c" && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      push({ input: `${value}^C`, blocks: [] });
      value = "";
      historyPos = history.length;
      scrollToEnd();
    }
  }

  // Clicking empty space in the terminal focuses the prompt (unless the visitor is selecting text).
  function onclick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    focusInput();
  }

  onMount(() => {
    const onSelection = () => {
      if (document.activeElement === input) syncCaret();
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  });

  const isExternal = (href: string) => /^https?:/.test(href);
</script>

{#snippet segment(s: Seg)}
  {#if typeof s === "string"}{s}{:else if s.run !== undefined}<button
      type="button"
      class="cmd"
      data-tone={s.tone}
      onclick={() => runClicked(s.run!)}>{s.text}</button
    >{:else if s.fill !== undefined}<button type="button" class="cmd" data-tone={s.tone} onclick={() => fill(s.fill!)}
      >{s.text}</button
    >{:else if s.href !== undefined}<a
      href={s.href}
      data-tone={s.tone}
      target={isExternal(s.href) ? "_blank" : undefined}
      rel={isExternal(s.href) ? "noopener noreferrer" : undefined}>{s.text}</a
    >{:else}<span data-tone={s.tone}>{s.text}</span>{/if}
{/snippet}

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="terminal" bind:this={scroller} {onclick}>
  <div class="output" role="log" aria-label="Terminal output">
    {#each entries as entry (entry.id)}
      <div class="entry">
        {#if entry.input !== null}
          <p class="line"><span class="ps1">{PS1}</span> {entry.input}</p>
        {/if}
        {#each entry.blocks as block, i (i)}
          {#if block.type === "neofetch"}
            <Neofetch {projects} />
          {:else}
            {#each block.lines as line, j (j)}
              <p class="line">{#each line as s, k (k)}{@render segment(s)}{/each}</p>
            {/each}
          {/if}
        {/each}
      </div>
    {/each}
  </div>

  <form class="prompt" onsubmit={(e) => e.preventDefault()}>
    <label class="ps1" for="term-input">{PS1}<span class="sr-only"> type a command, for example help</span></label>
    <div class="field">
      <input
        id="term-input"
        bind:this={input}
        bind:value
        type="text"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        enterkeyhint="send"
        {onkeydown}
        oninput={syncCaret}
        onfocus={() => {
          focused = true;
          syncCaret();
        }}
        onblur={() => (focused = false)}
        onscroll={syncCaret}
      />
      <span class="block" class:idle={!focused} style:left="calc({caret}ch - {scrollLeft}px)" aria-hidden="true"
        >{value[caret] ?? " "}</span
      >
    </div>
  </form>
</div>

<style>
  .terminal {
    height: 100%;
    overflow-y: auto;
    padding: 0.75rem 1rem;
    cursor: text;
  }

  .line {
    min-height: 1lh;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .entry + .entry {
    margin-top: 0.25rem;
  }

  .ps1 {
    flex: none;
    color: var(--accent);
    font-weight: 700;
  }

  [data-tone="accent"] {
    color: var(--accent);
  }

  [data-tone="accent2"] {
    color: var(--accent-2);
  }

  [data-tone="dim"] {
    color: var(--comment);
  }

  [data-tone="err"] {
    color: var(--red);
  }

  [data-tone="warn"] {
    color: var(--yellow);
  }

  [data-tone="bold"] {
    color: var(--fg);
    font-weight: 700;
  }

  .cmd {
    display: inline;
    padding: 0;
    background: none;
    border: 0;
    color: var(--accent);
    text-decoration: underline dotted;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .cmd:hover {
    text-decoration-style: solid;
  }

  .prompt {
    display: flex;
    gap: 1ch;
  }

  .field {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  input {
    width: 100%;
    padding: 0;
    background: transparent;
    border: 0;
    outline: none;
    color: var(--fg);
    caret-color: transparent;
    letter-spacing: 0;
  }

  .block {
    position: absolute;
    top: 0;
    width: 1ch;
    background: var(--accent);
    color: var(--bg);
    white-space: pre;
    pointer-events: none;
    animation: blink 1s steps(1) infinite;
  }

  .block.idle {
    background: transparent;
    color: transparent;
    outline: 1px solid var(--accent);
    outline-offset: -1px;
    animation: none;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
</style>
