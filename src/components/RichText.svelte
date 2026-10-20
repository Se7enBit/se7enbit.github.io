<script lang="ts">
  import { parseMarkdown, type Inline } from "../lib/markdown";

  let { text }: { text: string } = $props();

  const blocks = $derived(parseMarkdown(text));
</script>

{#snippet inline(parts: Inline[])}
  {#each parts as part, i (i)}{#if part.kind === "code"}<code>{part.text}</code>{:else if part.kind === "strong"}<strong
        >{part.text}</strong
      >{:else if part.kind === "link"}<a
        href={part.href}
        target={part.href.startsWith("http") ? "_blank" : undefined}
        rel={part.href.startsWith("http") ? "noopener noreferrer" : undefined}>{part.text}</a
      >{:else}{part.text}{/if}{/each}
{/snippet}

<div class="rich">
  {#each blocks as block, i (i)}
    {#if block.kind === "ul"}
      <ul>
        {#each block.items as item, j (j)}<li>{@render inline(item)}</li>{/each}
      </ul>
    {:else}
      <p>{@render inline(block.content)}</p>
    {/if}
  {/each}
</div>

<style>
  .rich {
    display: grid;
    gap: 0.75rem;
  }

  ul {
    margin: 0;
    padding-left: 2ch;
  }

  code {
    padding: 0 0.25em;
    background: var(--bg-highlight);
    border-radius: 3px;
    color: var(--accent-2);
  }

  strong {
    color: var(--fg);
  }
</style>
