<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { profile } from "../data/profile";
  import { banner } from "../lib/ascii";
  import { desktop, motion } from "../lib/desktop.svelte";

  const art = banner(profile.name);
  let start: HTMLButtonElement;

  onMount(() => {
    start.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        desktop.launch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
</script>

<!-- Clicking/tapping anywhere launches; the focused button and the Enter key cover keyboard users. -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="launch" role="presentation" onclick={() => desktop.launch()} out:fade|global={{ duration: motion(120) }}>
  <div class="content">
    <pre class="banner" aria-hidden="true">{art}</pre>
    <p class="tagline">{profile.title}</p>
    <p class="prompt">
      <span class="ps1">guest@portfolio:~$</span> startx<span class="cursor" aria-hidden="true"></span>
    </p>
    <button type="button" class="start" bind:this={start}>[ press Enter or click to start ]</button>
  </div>
</div>

<style>
  .launch {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--bg-dark);
    cursor: pointer;
  }

  /* Returning visitors: hidden before hydration by the inline script in index.astro. */
  :global(:root[data-launched]) .launch {
    display: none;
  }

  .content {
    display: grid;
    gap: 1rem;
    max-width: 100%;
  }

  .banner {
    margin: 0 0 0.5rem;
    overflow: hidden;
    color: var(--accent);
    font-size: clamp(8px, 2.6vw, 18px);
    line-height: 1;
    /* Overlap block glyphs slightly so antialiasing doesn't leave seams between cells. */
    letter-spacing: -0.03em;
  }

  .tagline {
    color: var(--accent-2);
  }

  .ps1 {
    color: var(--accent);
    font-weight: 700;
  }

  .start {
    justify-self: start;
    padding: 0;
    background: none;
    border: 0;
    color: var(--comment);
    cursor: pointer;
  }

  .start:hover,
  .start:focus-visible {
    color: var(--fg);
  }
</style>
