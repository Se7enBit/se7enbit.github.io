<script lang="ts">
  import type { Project } from "../lib/projects";

  let { project: p, onopen }: { project: Project; onopen: () => void } = $props();

  const cover = $derived(p.media.find((m) => m.type === "image"));
  const stats = $derived(
    p.github && !p.private
      ? [p.github.stars !== undefined ? `★ ${p.github.stars}` : "", p.github.language ?? ""].filter(Boolean).join("  ")
      : "",
  );
</script>

<!-- The whole card is one button; it only contains phrasing content (spans), no nested controls. -->
<button type="button" class="card" class:featured={p.featured} data-card={p.id} onclick={onopen}>
  <span class="thumb">
    {#if cover}
      <img src={cover.src} alt="" loading="lazy" decoding="async" />
    {:else}
      <!-- No image: terminal-styled placeholder with the title. -->
      <span class="placeholder" aria-hidden="true">
        <span class="ps1">$ cat {p.id}</span>
        <span class="ph-title">{p.title}</span>
      </span>
    {/if}
  </span>
  <span class="info">
    <span class="title">
      {p.title}
      {#if p.featured}<span class="star" title="featured">★</span>{/if}
    </span>
    {#if p.description}<span class="desc">{p.description}</span>{/if}
    {#if p.tags.length}
      <span class="tags">{#each p.tags as t, i (i)}<span class="tag">{t}</span>{/each}</span>
    {/if}
    <span class="foot">
      {#if p.private}<span class="private">🔒 private</span>{:else if stats}<span>{stats}</span>{/if}
      {#if p.date}<span class="date">{p.date}</span>{/if}
    </span>
  </span>
</button>

<style>
  .card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
    background: var(--bg-dark);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--fg);
    text-align: left;
    overflow: hidden;
    cursor: pointer;
    transition: border-color var(--duration-fast);
  }

  .card:hover {
    border-color: var(--accent-3);
  }

  .card.featured {
    border-color: var(--accent);
  }

  .thumb {
    display: block;
    aspect-ratio: 16 / 9;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  .thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;
    height: 100%;
    padding: 0.75rem;
    background-image: radial-gradient(rgb(59 66 97 / 0.4) 1px, transparent 1px);
    background-size: 12px 12px;
  }

  .ps1 {
    color: var(--comment);
    font-size: 0.8125rem;
  }

  .ph-title {
    color: var(--accent);
    font-weight: 700;
    font-size: 1.125rem;
    line-height: 1.2;
  }

  .info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.625rem 0.75rem 0.75rem;
  }

  .title {
    color: var(--accent-2);
    font-weight: 700;
  }

  .star {
    color: var(--yellow);
  }

  .desc {
    display: -webkit-box;
    overflow: hidden;
    color: var(--fg-dim);
    font-size: 0.875rem;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .tag {
    padding: 0 0.375rem;
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--accent);
    font-size: 0.75rem;
  }

  .foot {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: auto;
    padding-top: 0.25rem;
    color: var(--comment);
    font-size: 0.8125rem;
  }

  .private {
    color: var(--yellow);
  }
</style>
