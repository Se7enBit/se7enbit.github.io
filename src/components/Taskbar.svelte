<script lang="ts">
  import { profile } from "../data/profile";
  import { desktop, focusWindow, WINDOWS } from "../lib/desktop.svelte";
</script>

<nav class="taskbar" aria-label="Taskbar">
  <ul>
    {#each WINDOWS as w (w.id)}
      <li>
        <button
          type="button"
          class="item"
          class:open={desktop.isOpen(w.id)}
          class:focused={desktop.focused === w.id}
          onclick={() => {
            desktop.open(w.id);
            focusWindow(w.id);
          }}
        >
          <span class="glyph" aria-hidden="true">{w.glyph}</span>
          {w.label}
          {#if desktop.isOpen(w.id)}<span class="sr-only">(open)</span>{/if}
        </button>
      </li>
    {/each}
    <li>
      <a class="item" href={profile.cv} target="_blank" rel="noopener">
        <span class="glyph" aria-hidden="true">↓</span>
        CV
        <span class="sr-only">(PDF, opens in a new tab)</span>
      </a>
    </li>
  </ul>
</nav>

<style>
  .taskbar {
    background: var(--bg-dark);
    border-top: 1px solid var(--border);
    overflow-x: auto;
  }

  ul {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
    min-width: max-content;
    margin: 0 auto;
    padding: 0.25rem 0.5rem;
    list-style: none;
  }

  .item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    height: 34px;
    padding: 0 0.875rem;
    background: none;
    border: 0;
    border-radius: 4px;
    color: var(--fg-dim);
    font-size: 0.875rem;
    text-decoration: none;
    cursor: pointer;
  }

  .item:hover {
    background: var(--bg-highlight);
    color: var(--fg);
  }

  .glyph {
    color: var(--accent-2);
    font-weight: 700;
  }

  /* Open-window indicator */
  .item.open::after {
    content: "";
    position: absolute;
    left: 25%;
    right: 25%;
    bottom: 2px;
    height: 2px;
    border-radius: 1px;
    background: var(--accent);
  }

  .item.focused {
    color: var(--fg);
  }

  .item.focused::after {
    left: 12%;
    right: 12%;
  }

  @media (max-width: 479px) {
    .item {
      padding: 0 0.5rem;
      font-size: 0.8125rem;
    }

    .glyph {
      display: none;
    }
  }
</style>
