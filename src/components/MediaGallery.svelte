<script lang="ts">
  import type { Media } from "../data/projects";

  let { media, title }: { media: Media[]; title: string } = $props();

  type ImageMedia = Extract<Media, { type: "image" }>;
  const images = $derived(media.filter((m): m is ImageMedia => m.type === "image"));

  // YouTube iframes are only created after a click (no third-party script before that).
  let playing = $state<Record<number, boolean>>({});

  let dialog: HTMLDialogElement;
  let current = $state(0);
  const shown = $derived(images[current]);

  function openLightbox(m: ImageMedia) {
    current = images.indexOf(m);
    dialog.showModal();
  }

  function step(delta: number) {
    current = (current + delta + images.length) % images.length;
  }

  function onkeydown(e: KeyboardEvent) {
    if (images.length < 2) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  }

  // Clicking the dimmed area around the image closes the lightbox.
  function onclick(e: MouseEvent) {
    if (e.target === dialog) dialog.close();
  }
</script>

<ul class="gallery" aria-label="Media for {title}">
  {#each media as m, i (i)}
    <li>
      <figure>
        {#if m.type === "image"}
          <button type="button" class="frame shot" onclick={() => openLightbox(m)} aria-label="View larger: {m.alt}">
            <img src={m.src} alt={m.alt} loading="lazy" decoding="async" />
          </button>
        {:else if m.type === "video"}
          <!-- Demo videos come without caption tracks; the optional caption below describes them. -->
          <!-- svelte-ignore a11y_media_has_caption -->
          <video class="frame" src={m.src} poster={m.poster} controls preload="none" playsinline></video>
        {:else if playing[i]}
          <iframe
            class="frame"
            src="https://www.youtube-nocookie.com/embed/{m.id}?autoplay=1"
            title={m.caption ?? `${title} video`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
          ></iframe>
        {:else}
          <button
            type="button"
            class="frame yt"
            onclick={() => (playing[i] = true)}
            aria-label="Play video: {m.caption ?? title} (loads YouTube)"
          >
            <img src="https://i.ytimg.com/vi/{m.id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" />
            <span class="play" aria-hidden="true">▶</span>
          </button>
        {/if}
        {#if m.caption}<figcaption>{m.caption}</figcaption>{/if}
      </figure>
    </li>
  {/each}
</ul>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} class="lightbox" aria-label="Image viewer" {onkeydown} {onclick}>
  {#if shown}
    <figure>
      <img src={shown.src} alt={shown.alt} />
      <figcaption>
        {#if images.length > 1}<span class="count">{current + 1}/{images.length}</span>{/if}
        {shown.caption ?? shown.alt}
      </figcaption>
    </figure>
    <div class="controls">
      {#if images.length > 1}
        <button type="button" onclick={() => step(-1)} aria-label="Previous image">[ ← ]</button>
        <button type="button" onclick={() => step(1)} aria-label="Next image">[ → ]</button>
      {/if}
      <button type="button" onclick={() => dialog.close()} aria-label="Close image viewer">[ esc ]</button>
    </div>
  {/if}
</dialog>

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  figure {
    margin: 0;
  }

  .frame {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    padding: 0;
    background: var(--bg-dark);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }

  .shot,
  .yt {
    position: relative;
    cursor: zoom-in;
  }

  .yt {
    cursor: pointer;
  }

  .shot:hover,
  .yt:hover {
    border-color: var(--accent);
  }

  .frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  video.frame {
    object-fit: contain;
  }

  .play {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    background: rgb(22 22 30 / 0.85);
    border: 1px solid var(--accent);
    border-radius: 50%;
    color: var(--accent);
  }

  figcaption {
    margin-top: 0.25rem;
    color: var(--fg-dim);
    font-size: 0.875rem;
  }

  .lightbox {
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 1rem;
    background: rgb(22 22 30 / 0.95);
    border: 0;
    color: var(--fg);
  }

  .lightbox[open] {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 0.75rem;
    place-items: center;
  }

  .lightbox::backdrop {
    background: transparent;
  }

  .lightbox figure {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 0.5rem;
    justify-items: center;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  .lightbox img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .count {
    margin-right: 1ch;
    color: var(--accent);
  }

  .controls {
    display: flex;
    gap: 1rem;
  }

  .controls button {
    padding: 0.25rem 0.5rem;
    background: none;
    border: 0;
    color: var(--accent);
    cursor: pointer;
  }

  .controls button:hover {
    background: var(--bg-highlight);
  }

  @media (max-width: 767px) {
    /* Horizontal swipe row on small screens. */
    .gallery {
      grid-auto-flow: column;
      grid-template-columns: none;
      grid-auto-columns: 85%;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
    }

    .gallery li {
      scroll-snap-align: start;
    }
  }
</style>
