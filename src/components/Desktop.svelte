<script lang="ts">
  import { onMount, tick } from "svelte";
  import { profile } from "../data/profile";
  import { desktop, focusWindow, WINDOWS, type WindowId } from "../lib/desktop.svelte";
  import type { Project } from "../lib/projects";
  import AboutView from "./AboutView.svelte";
  import ContactView from "./ContactView.svelte";
  import LaunchScreen from "./LaunchScreen.svelte";
  import ProjectsView from "./ProjectsView.svelte";
  import StatusBar from "./StatusBar.svelte";
  import Taskbar from "./Taskbar.svelte";
  import Terminal from "./Terminal.svelte";
  import Window from "./Window.svelte";

  let { projects }: { projects: Project[] } = $props();

  // Initial position (cascade) and preferred size of the floating windows. Positions don't persist.
  const LAYOUT: Record<Exclude<WindowId, "terminal">, { x: string; y: string; w: string; h: string }> = {
    projects: { x: "5%", y: "4%", w: "880px", h: "640px" },
    about: { x: "24%", y: "10%", w: "580px", h: "500px" },
    contact: { x: "40%", y: "18%", w: "520px", h: "340px" },
  };

  function close(id: WindowId) {
    desktop.close(id);
    focusWindow(desktop.focused);
  }

  onMount(() => {
    desktop.restore();

    const onKey = (e: KeyboardEvent) => {
      if (!desktop.launched) return;

      // Esc: leave a project's detail view, otherwise close the top window. The lightbox handles its own Esc.
      if (e.key === "Escape" && !document.querySelector("dialog[open]")) {
        const top = desktop.focused;
        if (top === "projects" && desktop.selectedProject) {
          e.preventDefault();
          desktop.showProject(null);
        } else if (top !== "terminal") {
          e.preventDefault();
          close(top);
        }
        return;
      }

      // Typing while nothing in particular has focus goes to the terminal prompt.
      const idle = document.activeElement === document.body || document.activeElement?.classList.contains("window");
      if (idle && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        desktop.open("terminal");
        focusWindow("terminal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Hand keyboard focus to the terminal prompt once the desktop is up.
  $effect(() => {
    if (desktop.launched) tick().then(() => focusWindow("terminal"));
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
            scroll={false}
            focused={desktop.focused === w.id}
            z={desktop.zIndex(w.id)}
            onfocus={() => desktop.open(w.id)}
          >
            <Terminal {projects} />
          </Window>
        {:else}
          <Window
            id={w.id}
            title={w.title}
            {...LAYOUT[w.id]}
            focused={desktop.focused === w.id}
            z={desktop.zIndex(w.id)}
            onfocus={() => desktop.open(w.id)}
            onclose={() => close(w.id)}
          >
            {#if w.id === "projects"}
              <ProjectsView {projects} />
            {:else if w.id === "about"}
              <AboutView />
            {:else}
              <ContactView />
            {/if}
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
</style>
