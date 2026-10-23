# se7enbit.github.io

My portfolio, styled as a Linux desktop session: a status bar, a taskbar, and terminal windows in a Tokyo Night
palette. You can type shell commands or click your way around.

**Live:** https://se7enbit.github.io

## Using the site

The main terminal runs `neofetch` on launch. Type `help` to see every command. Each command name in the output is
clickable, and the taskbar opens the same windows.

| Command | What it does |
| --- | --- |
| `whoami` / `about` | Short bio, opens the About window |
| `projects` / `ls projects` | Lists projects, opens the Projects window |
| `cat <project>` / `open <project>` | Project details / opens its repo or demo |
| `skills`, `contact`, `cv` | Skills, contact links, the CV |
| `history`, `clear`, `exit` | History, clear the screen, back to the launch screen |

On phones the site becomes a single scrolling page. It also works with JavaScript off.

## Editing the content

Personal info and projects live in two files. Nothing personal is hard-coded anywhere else.

- **[`src/data/profile.ts`](src/data/profile.ts)** holds the name, bio, contact links, skills, and the neofetch rows.
- **[`src/data/projects.ts`](src/data/projects.ts)** holds the project list. The order in the array is the display
  order. There are two kinds of entry:
  - `source: "github"`: a public repo from `Se7enBit` or `ntua-el20014`. Its description, stars, and language are
    fetched from the GitHub API at build time, and any field written in the file overrides the fetched one.
  - `source: "manual"`: private or non-GitHub work. You write every field, nothing is fetched, and the card gets a
    🔒 private badge.

  Commented templates for both kinds are at the bottom of the file.

**Media** goes in `public/projects/<id>/` and is referenced from the project's `media` list. You can use images,
self-hosted videos (mp4/webm, keep them small), or YouTube ids. The first image becomes the card thumbnail. A
missing file fails the build with a clear error.

**CV:** replace `public/cv.pdf`.

**Social preview:** after changing your name, title, or handle, run `npm run og`. It regenerates `public/og.png`
and `public/apple-touch-icon.png`, and needs a local Chrome or Edge.

## Development

You need Node 22.22 or newer.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check + static build into dist/
npm run preview   # serve the built site
```

The build caches GitHub API responses in `.cache/github.json` (git-ignored) so local rebuilds don't hit rate limits.
Delete the file to refetch. Set `GITHUB_TOKEN` if you need a higher rate limit. It's optional locally.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys to GitHub Pages. It runs on every
push to `main`, on demand, and once a day so star counts and descriptions stay current. In the repo settings,
**Pages → Source** must be set to **GitHub Actions**.

## Stack

[Astro](https://astro.build) with static output, plus one [Svelte](https://svelte.dev) island for the desktop
(window manager and terminal). TypeScript, plain CSS, and the [Hack](https://sourcefoundry.org/hack/) font,
self-hosted. There are no runtime dependencies beyond those.

```
src/data/        profile.ts, projects.ts   ← the content
src/components/  Desktop, Terminal, Window, Neofetch, project cards, gallery, mobile view
src/lib/         command registry, GitHub fetch, project validation, ASCII art
src/styles/      palette tokens and global styles
public/          fonts, CV, project media, favicon, social preview
```

## Other files hosted here

These files support the [Flamingo](https://github.com/Se7enBit/flamingo) Android app. They're copied from that
repo's `web/` folder, so update them there first.

- `/l/`: shows a shared list in the browser for people without the app. The list is decoded from the URL fragment,
  so it never reaches a server.
- `/.well-known/assetlinks.json`: lets the app open `/l/` links directly.
- `/flamingo/privacy.html`: the app's privacy policy.

## License

The code is under the [PolyForm Noncommercial License 1.0.0](LICENSE.md). You can use, copy, and modify it for
noncommercial purposes, but commercial use isn't allowed. My personal content (profile and project data, CV, and
project media) and the Flamingo files aren't covered by that license, and all rights to them are reserved. If you
fork this, replace them with your own.
