<script lang="ts">
  import { profile } from "../data/profile";

  const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

  const rows: { key: string; label: string; href: string; external: boolean }[] = [
    { key: "email", label: profile.email, href: `mailto:${profile.email}`, external: false },
    { key: "linkedin", label: strip(profile.linkedin), href: profile.linkedin, external: true },
    ...profile.github.map((url) => ({ key: "github", label: strip(url), href: url, external: true })),
    { key: "cv", label: "cv.pdf", href: profile.cv, external: true },
  ];
</script>

<div class="contact">
  <p class="cmdline"><span class="ps1">~$</span> cat contact.txt</p>
  <dl>
    {#each rows as r, i (i)}
      <div class="row">
        <dt>{r.key}</dt>
        <dd>
          <a href={r.href} target={r.external ? "_blank" : undefined} rel={r.external ? "noopener noreferrer" : undefined}
            >{r.label}</a
          >
        </dd>
      </div>
    {/each}
  </dl>
</div>

<style>
  .contact {
    display: grid;
    gap: 1rem;
  }

  .ps1 {
    color: var(--accent);
    font-weight: 700;
  }

  dl {
    display: grid;
    gap: 0.375rem;
    margin: 0;
  }

  .row {
    display: grid;
    grid-template-columns: 9ch 1fr;
    gap: 1ch;
  }

  dt {
    color: var(--accent-2);
  }

  dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
</style>
