<script lang="ts">
  import { onMount } from "svelte";
  import { focusIsIdleOrWithin } from "../lib/desktop.svelte";
  import type { Project } from "../lib/projects";
  import MediaGallery from "./MediaGallery.svelte";
  import RichText from "./RichText.svelte";

  let { project: p, onback }: { project: Project; onback: () => void } = $props();

  let heading: HTMLHeadingElement;

  const meta = $derived([p.role, p.status, p.date].filter(Boolean).join(" · "));
  const links = $derived([
    ...(p.github && !p.private ? [{ label: "repo", url: p.github.url }] : []),
    ...(p.github?.homepage ? [{ label: "demo", url: p.github.homepage }] : []),
    ...p.links,
  ]);

  // Follow the visitor into the detail view, unless they're typing in the terminal (`cat <project>`).
  onMount(() => {
    if (focusIsIdleOrWithin(document.getElementById("window-projects"))) heading.focus({ preventScroll: true });
  });
</script>

<article class="detail">
  <button type="button" class="back" onclick={onback}>← cd ..</button>

  <header>
    <h3 bind:this={heading} tabindex="-1">{p.title}</h3>
    <p class="badges">
      {#if p.featured}<span class="featured">★ featured</span>{/if}
      {#if p.private}<span class="private">🔒 private</span>{/if}
      {#if p.github && !p.private && p.github.stars !== undefined}<span>★ {p.github.stars}</span>{/if}
      {#if p.github && !p.private && p.github.language}<span>{p.github.language}</span>{/if}
    </p>
    {#if meta}<p class="meta">{meta}</p>{/if}
  </header>

  {#if p.description}<p class="lead">{p.description}</p>{/if}
  {#if p.longDescription && p.longDescription !== p.description}<RichText text={p.longDescription} />{/if}

  {#if p.tags.length}
    <ul class="tags" aria-label="Tech stack">
      {#each p.tags as t, i (i)}<li>{t}</li>{/each}
    </ul>
  {/if}

  {#if p.highlights.length}
    <section>
      <h4>highlights</h4>
      <ul class="highlights">
        {#each p.highlights as h, i (i)}<li>{h}</li>{/each}
      </ul>
    </section>
  {/if}

  {#if links.length}
    <section>
      <h4>links</h4>
      <ul class="links">
        {#each links as l, i (i)}
          <li><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a> <span class="url">{l.url}</span></li>
        {/each}
      </ul>
    </section>
  {/if}

  {#if p.media.length}
    <section>
      <h4>media</h4>
      <MediaGallery media={p.media} title={p.title} />
    </section>
  {/if}
</article>

<style>
  .detail {
    display: grid;
    gap: 1rem;
  }

  .back {
    justify-self: start;
    padding: 0;
    background: none;
    border: 0;
    color: var(--accent);
    cursor: pointer;
  }

  .back:hover {
    text-decoration: underline;
  }

  header {
    display: grid;
    gap: 0.25rem;
  }

  h3 {
    color: var(--accent-2);
    font-size: 1.25rem;
  }

  h3:focus {
    outline: none;
  }

  h3:focus-visible {
    outline: 2px solid var(--accent);
  }

  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    color: var(--fg-dim);
    font-size: 0.875rem;
  }

  .badges:empty {
    display: none;
  }

  .featured,
  .private {
    color: var(--yellow);
  }

  .meta {
    color: var(--comment);
    font-size: 0.875rem;
  }

  .lead {
    color: var(--fg);
  }

  h4 {
    margin-bottom: 0.375rem;
    color: var(--accent);
    font-weight: 400;
  }

  h4::before {
    content: "## ";
    color: var(--comment);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tags li {
    padding: 0 0.5rem;
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--accent);
    font-size: 0.875rem;
  }

  .highlights {
    margin: 0;
    padding-left: 2ch;
  }

  .highlights li::marker {
    content: "• ";
    color: var(--accent);
  }

  .links {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .url {
    color: var(--comment);
    font-size: 0.8125rem;
    overflow-wrap: anywhere;
  }
</style>
