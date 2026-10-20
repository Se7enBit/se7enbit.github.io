// The project selection list. Order in the array = display order (featured entries go first).
// Media files live in public/projects/<id>/ and are checked at build time.

// ---------- shared ----------
export type Media =
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "video"; src: string; poster?: string; caption?: string }   // self-hosted mp4/webm
  | { type: "youtube"; id: string; caption?: string };                  // YouTube video id

export type Link = { label: string; url: string };                      // e.g. "Play Store", "Paper", "Demo"

type Common = {
  id: string;                 // url/command slug, e.g. "alarm-app" → `cat alarm-app`
  featured?: boolean;         // highlighted + shown first
  tags?: string[];            // tech stack chips
  highlights?: string[];      // bullet points for the detail view
  links?: Link[];             // extra links (demo, store, paper, video...)
  media?: Media[];            // first image = card thumbnail
  date?: string;              // "2026" or "2025-06"
  status?: "active" | "completed" | "archived" | "wip";
};

// ---------- 1) public GitHub repo: fetched at build time ----------
export type GitHubProject = Common & {
  source: "github";
  repo: `${"Se7enBit" | "ntua-el20014"}/${string}`;
  title?: string;             // override GitHub name
  description?: string;       // override GitHub description
  hideStats?: boolean;        // hide stars / language
};

// ---------- 2) private / non-GitHub: everything written here ----------
export type ManualProject = Common & {
  source: "manual";
  title: string;              // required
  description: string;        // required (1–2 sentences for the card)
  longDescription?: string;   // optional, for the detail view (plain text or simple markdown)
  role?: string;              // e.g. "Diploma thesis", "Solo developer"
  private?: boolean;          // default true → shows 🔒 badge, no repo link
};

export type ProjectEntry = GitHubProject | ManualProject;

export const projects: ProjectEntry[] = [
  // TODO: owner fills these in. Placeholders:
  {
    source: "github",
    id: "todo-public-1",
    repo: "Se7enBit/TODO-repo-1",
    featured: true,
    media: [{ type: "image", src: "/projects/todo-public-1/cover.svg", alt: "TODO" }],
  },
  { source: "github", id: "todo-public-2", repo: "ntua-el20014/TODO-repo-2" },
  {
    source: "manual",
    id: "todo-private-1",
    title: "TODO Private Project",
    description: "TODO one-line description.",
    longDescription: "TODO longer description for the detail view.",
    role: "TODO",
    tags: ["TODO"],
    highlights: ["TODO"],
    links: [{ label: "Demo video", url: "https://youtu.be/TODO" }],
    media: [
      { type: "image", src: "/projects/todo-private-1/screenshot-1.svg", alt: "TODO" },
      // Other media kinds (add the file to public/projects/<id>/ first; missing files fail the build):
      // { type: "video", src: "/projects/todo-private-1/demo.mp4", poster: "/projects/todo-private-1/poster.png" },
      // { type: "youtube", id: "dQw4w9WgXcQ", caption: "Demo" },
    ],
    status: "completed",
    date: "TODO",
  },
];
