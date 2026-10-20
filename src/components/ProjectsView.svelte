<script lang="ts">
  import { tick } from "svelte";
  import { desktop, focusIsIdleOrWithin } from "../lib/desktop.svelte";
  import type { Project } from "../lib/projects";
  import ProjectCard from "./ProjectCard.svelte";
  import ProjectDetail from "./ProjectDetail.svelte";

  let { projects }: { projects: readonly Project[] } = $props();

  let tag = $state<string | null>(null);

  // Tag chips, most used first.
  const tags = $derived.by(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  });
  const visible = $derived(tag ? projects.filter((p) => p.tags.includes(tag!)) : projects);
  const selected = $derived(projects.find((p) => p.id === desktop.selectedProject));

  // Coming back from a detail view: return focus to the card that opened it.
  let lastOpened: string | null = null;
  $effect(() => {
    const id = desktop.selectedProject;
    if (id) {
      lastOpened = id;
    } else if (lastOpened) {
      const back = lastOpened;
      lastOpened = null;
      if (focusIsIdleOrWithin(document.getElementById("window-projects"))) {
        tick().then(() => document.querySelector<HTMLElement>(`[data-card="${CSS.escape(back)}"]`)?.focus());
      }
    }
  });
</script>

{#if selected}
  <ProjectDetail project={selected} onback={() => desktop.showProject(null)} />
{:else}
  <div class="projects">
    <p class="cmdline"><span class="ps1">~/projects$</span> ls <span class="dim">— {projects.length} projects</span></p>

    {#if tags.length}
      <div class="chips" role="group" aria-label="Filter projects by tag">
        <button type="button" aria-pressed={tag === null} onclick={() => (tag = null)}>all</button>
        {#each tags as [t, n] (t)}
          <button type="button" aria-pressed={tag === t} onclick={() => (tag = tag === t ? null : t)}>
            {t}<span class="n">{n}</span>
          </button>
        {/each}
      </div>
    {/if}

    {#if visible.length}
      <ul class="grid">
        {#each visible as p (p.id)}
          <li><ProjectCard project={p} onopen={() => desktop.showProject(p.id)} /></li>
        {/each}
      </ul>
    {:else}
      <p class="dim">no projects yet</p>
    {/if}
  </div>
{/if}

<style>
  .projects {
    display: grid;
    gap: 0.875rem;
  }

  .ps1 {
    color: var(--accent);
    font-weight: 700;
  }

  .dim {
    color: var(--comment);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .chips button {
    display: inline-flex;
    gap: 0.5ch;
    padding: 0.125rem 0.625rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 999px;
    color: var(--fg-dim);
    font-size: 0.8125rem;
    cursor: pointer;
  }

  .chips button:hover {
    border-color: var(--accent-3);
    color: var(--fg);
  }

  .chips button[aria-pressed="true"] {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg-dark);
    font-weight: 700;
  }

  .n {
    opacity: 0.75;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 0.875rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
