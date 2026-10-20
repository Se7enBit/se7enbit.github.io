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
    /** Initial position and preferred size (CSS lengths) for floating windows. */
    x?: string;
    y?: string;
    w?: string;
    h?: string;
    /** false → the body doesn't scroll or pad; the content manages its own scrolling. */
    scroll?: boolean;
    onfocus: () => void;
    onclose?: () => void;
    children: Snippet;
  };

  let {
    id,
    title,
    focused,
    z,
    fixed = false,
    x = "10%",
    y = "8%",
    w = "560px",
    h = "420px",
    scroll = true,
    onfocus,
    onclose,
    children,
  }: Props = $props();

  let el: HTMLElement;
  /** Position in px once the window has been dragged; positions don't persist across sessions. */
  let pos = $state<{ x: number; y: number } | null>(null);
  let dragging = $state(false);

  function startDrag(e: PointerEvent) {
    if (fixed || e.button !== 0 || (e.target as Element).closest("button")) return;
    const bar = e.currentTarget as HTMLElement;
    const area = el.offsetParent as HTMLElement | null;
    if (!area) return;

    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const originX = el.offsetLeft;
    const originY = el.offsetTop;
    // Keep the whole window inside the workspace.
    const maxX = Math.max(0, area.clientWidth - el.offsetWidth);
    const maxY = Math.max(0, area.clientHeight - el.offsetHeight);
    const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

    const move = (ev: PointerEvent) => {
      pos = { x: clamp(originX + ev.clientX - startX, maxX), y: clamp(originY + ev.clientY - startY, maxY) };
    };
    const end = () => {
      dragging = false;
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", end);
      bar.removeEventListener("pointercancel", end);
    };

    dragging = true;
    try {
      bar.setPointerCapture(e.pointerId);
    } catch {
      // pointer already gone; the listeners below still end the drag
    }
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }

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
  class:dragging
  bind:this={el}
  style:z-index={z}
  style:--x={pos ? `${pos.x}px` : x}
  style:--y={pos ? `${pos.y}px` : y}
  style:--pref-w={w}
  style:--pref-h={h}
  aria-labelledby="window-{id}-title"
  tabindex="-1"
  onpointerdown={onfocus}
  onfocusin={onfocus}
  transition:pop|global
>
  <!-- Dragging is a pointer-only convenience; windows are fully usable without moving them. -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <header class="titlebar" class:draggable={!fixed} onpointerdown={startDrag}>
    <h2 id="window-{id}-title" class="title">{title}</h2>
    {#if onclose}
      <button type="button" class="close" onclick={onclose} aria-label="Close {title}" title="Close (Esc)">[×]</button>
    {/if}
  </header>
  <div class="body" class:scroll>
    {@render children()}
  </div>
</section>

<style>
  .window {
    --w: min(var(--pref-w), 100% - 1rem);
    --h: min(var(--pref-h), 100% - 1rem);
    position: absolute;
    /* Keep the whole window inside the workspace, also after the viewport shrinks. */
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

  .window:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
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

  .titlebar.draggable {
    cursor: grab;
    touch-action: none;
  }

  .dragging .titlebar {
    cursor: grabbing;
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
    padding: 0.75rem 1rem 1rem;
  }
</style>
