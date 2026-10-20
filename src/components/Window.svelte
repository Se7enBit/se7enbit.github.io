<script lang="ts">
  import type { Snippet } from "svelte";
  import { motion, type WindowId } from "../lib/desktop.svelte";

  type Props = {
    id: WindowId;
    title: string;
    focused: boolean;
    z: number;
    /** The main terminal: centered, not draggable, not closable. */
    fixed?: boolean;
    /** Initial position (CSS lengths) for floating windows. */
    x?: string;
    y?: string;
    /** false → the body doesn't scroll or pad; the content manages its own scrolling. */
    scroll?: boolean;
    onfocus: () => void;
    onclose?: () => void;
    children: Snippet;
  };

  let { id, title, focused, z, fixed = false, x = "10%", y = "8%", scroll = true, onfocus, onclose, children }: Props =
    $props();

  function pop(_node: Element) {
    return {
      duration: motion(120),
      css: (t: number) => `opacity: ${t}; transform: scale(${0.97 + 0.03 * t})`,
    };
  }
</script>

<!-- Pointer/focus handlers only raise the window; keyboard users switch windows via the taskbar and workspaces. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  id="window-{id}"
  class="window"
  class:fixed
  class:focused
  style:z-index={z}
  style:--x={x}
  style:--y={y}
  aria-labelledby="window-{id}-title"
  tabindex="-1"
  onpointerdown={onfocus}
  onfocusin={onfocus}
  transition:pop|global
>
  <header class="titlebar">
    <h2 id="window-{id}-title" class="title">{title}</h2>
    {#if onclose}
      <button type="button" class="close" onclick={onclose} aria-label="Close {title}">[x]</button>
    {/if}
  </header>
  <div class="body" class:scroll>
    {@render children()}
  </div>
</section>

<style>
  .window {
    --w: min(560px, 100% - 1rem);
    --h: min(420px, 100% - 1rem);
    position: absolute;
    /* Keep the whole window inside the workspace. */
    left: max(0px, min(var(--x), 100% - var(--w)));
    top: max(0px, min(var(--y), 100% - var(--h)));
    width: var(--w);
    height: var(--h);
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.45);
    overflow: hidden;
  }

  .window.fixed {
    inset: 0;
    margin: auto;
    width: clamp(min(640px, 100% - 1rem), 68%, 1100px);
    height: clamp(min(420px, 100% - 1rem), 74%, 820px);
  }

  .window.focused {
    border-color: var(--accent-3);
  }

  .window:focus {
    outline: none;
  }

  .titlebar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
    padding: 0 2.75rem;
    background: var(--bg-dark);
    border-bottom: 1px solid var(--border);
    user-select: none;
  }

  .focused .titlebar {
    background: var(--bg-highlight);
  }

  .title {
    overflow: hidden;
    color: var(--fg-dim);
    font-weight: 400;
    font-size: 0.875rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .focused .title {
    color: var(--fg);
    font-weight: 700;
  }

  .close {
    position: absolute;
    right: 0.25rem;
    padding: 0 0.375rem;
    background: none;
    border: 0;
    color: var(--fg-dim);
    cursor: pointer;
  }

  .close:hover {
    color: var(--red);
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .body.scroll {
    overflow: auto;
    padding: 0.75rem 1rem;
  }
</style>
