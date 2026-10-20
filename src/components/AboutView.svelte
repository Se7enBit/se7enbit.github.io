<script lang="ts">
  import { profile } from "../data/profile";

  const facts = [profile.university, profile.graduation, profile.location].filter(Boolean).join(" · ");
</script>

<div class="about">
  <p class="cmdline"><span class="ps1">~$</span> whoami</p>

  <header>
    <h3>{profile.name}</h3>
    <p class="title">{profile.title}</p>
    <p class="facts">{facts}</p>
  </header>

  <p>{profile.bio}</p>

  <section>
    <h4>skills</h4>
    <dl>
      {#each Object.entries(profile.skills) as [group, items] (group)}
        <div class="group">
          <dt>{group}</dt>
          <dd>
            <ul>{#each items as s, i (i)}<li>{s}</li>{/each}</ul>
          </dd>
        </div>
      {/each}
    </dl>
  </section>

  <p><a class="cv" href={profile.cv} target="_blank" rel="noopener">↓ cv.pdf</a></p>
</div>

<style>
  .about {
    display: grid;
    gap: 1rem;
  }

  .ps1 {
    color: var(--accent);
    font-weight: 700;
  }

  header {
    display: grid;
    gap: 0.125rem;
  }

  h3 {
    color: var(--fg);
    font-size: 1.25rem;
  }

  .title {
    color: var(--accent-2);
  }

  .facts {
    color: var(--comment);
    font-size: 0.875rem;
  }

  h4 {
    margin-bottom: 0.5rem;
    color: var(--accent);
    font-weight: 400;
  }

  h4::before {
    content: "## ";
    color: var(--comment);
  }

  dl {
    display: grid;
    gap: 0.5rem;
    margin: 0;
  }

  .group {
    display: grid;
    grid-template-columns: 11ch 1fr;
    gap: 1ch;
  }

  dt {
    color: var(--accent-2);
  }

  dd {
    margin: 0;
  }

  dd ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  dd li {
    padding: 0 0.5rem;
    border: 1px solid var(--border);
    border-radius: 3px;
    font-size: 0.875rem;
  }

  .cv {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--accent);
    border-radius: 4px;
    text-decoration: none;
  }

  .cv:hover {
    background: var(--accent);
    color: var(--bg-dark);
  }

  @media (max-width: 479px) {
    .group {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
  }
</style>
