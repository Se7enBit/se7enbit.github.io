<script lang="ts">
  import { profile } from "../data/profile";
  import { chipLogo } from "../lib/ascii";
  import type { Project } from "../lib/projects";

  let { projects }: { projects: readonly Project[] } = $props();

  const logo = chipLogo();

  // Field order follows real neofetch. Computed fields can be overridden (or extended) in profile.neofetch.
  const ORDER = ["OS", "Host", "Kernel", "Uptime", "Packages", "Shell", "DE", "Location", "Contact"];
  const rows = $derived.by(() => {
    const github = projects.filter((p) => p.source === "github").length;
    const fields: Record<string, string> = {
      Host: profile.name,
      Uptime: profile.graduation,
      Packages: `${projects.length} projects (${github} github)`,
      Location: profile.location,
      Contact: profile.email,
      ...profile.neofetch,
    };
    const extra = Object.keys(profile.neofetch).filter((k) => !ORDER.includes(k));
    return [...ORDER, ...extra].filter((k) => fields[k]).map((k) => [k, fields[k]!] as const);
  });

  const user = "guest";
  const host = profile.handle;

  // Tokyo Night terminal palette: normal + bright.
  const NORMAL = ["--bg-dark", "--red", "--accent", "--yellow", "--blue", "--magenta", "--cyan", "--fg-dim"];
  const BRIGHT = ["--comment-dim", "--red", "--accent", "--yellow", "--blue", "--magenta", "--cyan", "--fg"];
</script>

<div class="neofetch">
  <div class="logo" aria-hidden="true">
    {#each logo as line, i (i)}
      <div>{#each line as r, j (j)}<span class={r.ink ?? undefined}>{r.text}</span>{/each}</div>
    {/each}
  </div>

  <div class="info">
    <p><span class="id">{user}</span>@<span class="id">{host}</span></p>
    <p class="sep" aria-hidden="true">{"-".repeat(user.length + host.length + 1)}</p>
    <dl>
      {#each rows as [k, v] (k)}
        <div class="row">
          <dt>{k}:</dt>
          <dd>
            {#if k === "Contact" && v === profile.email}
              <a href="mailto:{v}">{v}</a>
            {:else}
              {v}
            {/if}
          </dd>
        </div>
      {/each}
    </dl>
    <div class="palette" aria-hidden="true">
      {#each [NORMAL, BRIGHT] as set, i (i)}
        <div>
          {#each set as c, j (j)}<span style:background="var({c})"></span>{/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .neofetch {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem 2.5rem;
    margin: 0.25rem 0 0.75rem;
  }

  .logo {
    /* line-height 1: block and box-drawing glyphs overlap a hair, so there are no seams between rows. */
    line-height: 1;
    white-space: pre;
  }

  /* Runs of █ drawn as one filled box each: no hairline seams between cells. */
  .block {
    background: var(--accent);
    color: transparent;
  }

  .fill {
    color: var(--accent);
  }

  .shade {
    color: var(--comment-dim);
  }

  .frame {
    color: var(--accent-3);
  }

  .info {
    min-width: 0;
  }

  .id {
    color: var(--accent);
    font-weight: 700;
  }

  .sep {
    color: var(--fg-dim);
  }

  dl {
    margin: 0;
  }

  .row {
    display: flex;
    gap: 1ch;
  }

  dt {
    flex: none;
    color: var(--accent-2);
    font-weight: 700;
  }

  dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .palette {
    display: grid;
    gap: 0;
    margin-top: 0.75rem;
  }

  .palette div {
    display: flex;
  }

  .palette span {
    width: 3ch;
    height: 1.2em;
  }
</style>
