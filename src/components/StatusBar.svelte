<script lang="ts">
  import { onMount } from "svelte";
  import { profile } from "../data/profile";
  import { desktop, WINDOWS } from "../lib/desktop.svelte";

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n: number) => String(n).padStart(2, "0");

  const githubs = profile.github.map((url) => ({ url, user: url.replace(/\/+$/, "").split("/").pop() ?? url }));

  const focusedTitle = $derived(WINDOWS.find((w) => w.id === desktop.focused)?.title ?? "");

  // Rendered at build time as placeholders; the visitor's local time fills in after hydration.
  let now = $state<Date | null>(null);
  let cpu = $state(7);
  let mem = $state(2.1);

  const date = $derived(now ? `${DAYS[now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}` : "--- --- --");
  const time = $derived(now ? `${pad(now.getHours())}:${pad(now.getMinutes())}` : "--:--");

  onMount(() => {
    now = new Date();
    const tick = setInterval(() => (now = new Date()), 1000);
    // Decorative "system load": a gentle random walk.
    const load = setInterval(() => {
      cpu = Math.round(Math.min(32, Math.max(2, cpu + (Math.random() - 0.5) * 8)));
      mem = Math.round(Math.min(3.4, Math.max(1.6, mem + (Math.random() - 0.5) * 0.2)) * 10) / 10;
    }, 2500);
    return () => {
      clearInterval(tick);
      clearInterval(load);
    };
  });
</script>

<header class="statusbar">
  <nav class="workspaces" aria-label="Workspaces">
    {#each WINDOWS as w (w.id)}
      <button
        type="button"
        class:active={desktop.focused === w.id}
        class:occupied={desktop.isOpen(w.id)}
        aria-current={desktop.focused === w.id ? "true" : undefined}
        aria-label="Workspace {w.workspace}: {w.label}"
        onclick={() => desktop.open(w.id)}>{w.workspace}</button
      >
    {/each}
  </nav>

  <div class="title" aria-hidden="true">{focusedTitle}</div>

  <div class="modules">
    <span class="module sys" aria-hidden="true"><span class="key">cpu</span> {pad(cpu)}%</span>
    <span class="module sys" aria-hidden="true"><span class="key">mem</span> {mem.toFixed(1)}G</span>
    <span class="module sys" aria-hidden="true"><span class="key">net</span> ▲▼</span>
    {#each githubs as gh (gh.url)}
      <a class="module gh" href={gh.url} target="_blank" rel="noopener noreferrer" title="GitHub: {gh.user}">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            fill="currentColor"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
          />
        </svg>
        <span class="sr-only">GitHub: {gh.user} (opens in a new tab)</span>
      </a>
    {/each}
    <time class="module clock" datetime={now?.toISOString()}><span class="date">{date}</span> {time}</time>
  </div>
</header>

<style>
  .statusbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1rem;
    height: 28px;
    padding: 0 0.5rem;
    background: var(--bg-dark);
    border-bottom: 1px solid var(--border);
    font-size: 0.8125rem;
    white-space: nowrap;
    overflow: hidden;
  }

  .workspaces {
    display: flex;
    gap: 0.25rem;
  }

  .workspaces button {
    min-width: 1.5rem;
    height: 20px;
    padding: 0 0.375rem;
    background: none;
    border: 0;
    border-radius: 3px;
    color: var(--comment);
    line-height: 20px;
    cursor: pointer;
  }

  .workspaces button.occupied {
    color: var(--fg-dim);
  }

  .workspaces button:hover {
    background: var(--bg-highlight);
    color: var(--fg);
  }

  .workspaces button.active {
    background: var(--accent);
    color: var(--bg-dark);
    font-weight: 700;
  }

  .title {
    overflow: hidden;
    max-width: 50vw;
    color: var(--fg-dim);
    text-overflow: ellipsis;
  }

  .modules {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.875rem;
  }

  .module {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: var(--fg-dim);
  }

  .key {
    color: var(--accent-2);
  }

  .gh {
    color: var(--fg-dim);
  }

  .gh:hover {
    color: var(--accent);
  }

  .clock {
    color: var(--accent);
    font-weight: 700;
  }

  @media (max-width: 1023px) {
    .sys {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .statusbar {
      grid-template-columns: auto 1fr;
    }

    .title {
      display: none;
    }
  }

  @media (max-width: 479px) {
    .date {
      display: none;
    }
  }
</style>
