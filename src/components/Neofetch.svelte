<script lang="ts">
  import { profile } from "../data/profile";
  import { chipLogo } from "../lib/ascii";
  import type { Project } from "../lib/projects";

  let { projects }: { projects: readonly Project[] } = $props();

  // Split each logo line into runs so the "7" and the package get different colors.
  const logo = chipLogo().map((line) => {
    const runs: { text: string; glyph: boolean }[] = [];
    for (const ch of line) {
      const glyph = ch === "█";
      const last = runs.at(-1);
      if (last && last.glyph === glyph) last.text += ch;
      else runs.push({ text: ch, glyph });
    }
    return runs;
  });

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
    {#each logo as runs, i (i)}
      <div>{#each runs as r, j (j)}<span class:glyph={r.glyph}>{r.text}</span>{/each}</div>
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
    color: var(--accent-3);
    /* Hack's natural line height, so box-drawing characters connect vertically. */
    line-height: 1.164;
    white-space: pre;
  }

  .glyph {
    color: var(--accent);
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
