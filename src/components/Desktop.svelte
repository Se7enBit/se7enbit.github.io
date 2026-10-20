<script lang="ts">
  import { onMount, tick } from "svelte";
  import { profile } from "../data/profile";
  import { desktop, WINDOWS } from "../lib/desktop.svelte";
  import LaunchScreen from "./LaunchScreen.svelte";
  import StatusBar from "./StatusBar.svelte";
  import Taskbar from "./Taskbar.svelte";
  import Window from "./Window.svelte";

  // Initial positions for floating windows (cascade). Dragging comes in Phase 5.
  const POSITIONS: Record<string, { x: string; y: string }> = {
    projects: { x: "8%", y: "6%" },
    about: { x: "18%", y: "12%" },
    contact: { x: "28%", y: "18%" },
  };

  onMount(() => desktop.restore());

  // Hand keyboard focus to the terminal once the desktop is up.
  $effect(() => {
    if (desktop.launched) {
      tick().then(() => document.getElementById("window-terminal")?.focus({ preventScroll: true }));
    }
  });
</script>

<div class="desktop" inert={!desktop.launched}>
  <h1 class="sr-only">{profile.name} — {profile.title}</h1>
  <StatusBar />

  <main id="main" class="workspace">
    {#each WINDOWS as w (w.id)}
      {#if desktop.isOpen(w.id)}
        {#if w.id === "terminal"}
          <Window
            id={w.id}
            title={w.title}
            fixed
            focused={desktop.focused === w.id}
            z={desktop.zIndex(w.id)}
            onfocus={() => desktop.open(w.id)}
          >
            <!-- Phase 4 replaces this with the interactive terminal + neofetch. -->
            <div class="term-placeholder">
              <p><span class="ps1">guest@{profile.handle}:~$</span> neofetch</p>
              <p class="dim"># neofetch + interactive shell arrive in Phase 4</p>
              <p><span class="ps1">guest@{profile.handle}:~$</span> <span class="cursor" aria-hidden="true"></span></p>
            </div>
          </Window>
        {:else}
          <Window
            id={w.id}
            title={w.title}
            x={POSITIONS[w.id]?.x}
            y={POSITIONS[w.id]?.y}
            focused={desktop.focused === w.id}
            z={desktop.zIndex(w.id)}
            onfocus={() => desktop.open(w.id)}
            onclose={() => desktop.close(w.id)}
          >
            <p class="dim"># TODO: {w.label} window (Phase 5)</p>
          </Window>
        {/if}
      {/if}
    {/each}
  </main>

  <Taskbar />
</div>

{#if !desktop.launched}
  <LaunchScreen />
{/if}

<style>
  .desktop {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-columns: minmax(0, 1fr);
    background-color: var(--bg);
    background-image:
      radial-gradient(circle at 15% 10%, rgb(158 206 106 / 0.07), transparent 45%),
      radial-gradient(circle at 90% 95%, rgb(115 218 202 / 0.06), transparent 50%),
      radial-gradient(rgb(59 66 97 / 0.4) 1px, transparent 1px);
    background-size: auto, auto, 22px 22px;
  }

  .workspace {
    position: relative;
    overflow: hidden;
  }

  .term-placeholder {
    display: grid;
    gap: 0.25rem;
  }

  .ps1 {
    color: var(--accent);
    font-weight: 700;
  }

  .dim {
    color: var(--comment);
  }
</style>
