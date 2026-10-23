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
  {
    source: "github",
    id: "flamingo",
    repo: "Se7enBit/flamingo",
    title: "Flamingo",
    description: "Android list app you can walk through hands-free: items are read aloud and checked off with earbud buttons or offline voice commands.",
    tags: ["Kotlin", "Jetpack Compose", "Android", "Room", "Vosk"],
  },
  {
    source: "github",
    id: "alarmin",
    repo: "ntua-el20014/alarmin",
    title: "Alarmin",
    description: "Android app that bundles alarms, a calendar, a timer, and a stopwatch.",
    tags: ["Dart", "Flutter", "Android", "Drift"],
  },
  {
    source: "github",
    id: "dev-time-tracker",
    repo: "ntua-el20014/dev-time-tracker",
    title: "Dev Time Tracker",
    description: "Desktop time tracker for developers who bill their time, including time spent supervising AI coding agents, with invoicing and Supabase sync.",
    tags: ["TypeScript", "Supabase", "Desktop"],
  },
  {
    source: "github",
    id: "taxall",
    repo: "ntua-el20014/site-taxall",
    title: "TaxAll",
    description: "Static website for an accounting office, built as a React single-page app with Vite.",
    tags: ["React", "Vite", "JavaScript", "CSS"],
  },
  {
    source: "github",
    id: "chordify",
    repo: "ntua-el20014/Distributed-Systems",
    title: "Chordify",
    description: "Peer-to-peer song-sharing network built on the Chord DHT, with replication and linearizable or eventual consistency.",
    tags: ["Python", "Distributed Systems", "DHT", "Sockets"],
    media: [
      { type: "image", src: "/projects/chordify/architecture.png", alt: "Diagram of a Chord ring: nodes and song keys placed on a circular identifier space" },
      { type: "video", src: "/projects/chordify/visualizer.mp4", caption: "The visualizer showing nodes, stored items and replicas live" },
    ],
  },
  {
    source: "github",
    id: "anamnesis",
    repo: "ntua-el20014/HCI-Project",
    title: "Anamnesis",
    description: "Flutter app for saving memories (trips, places, events) on a map, with photos and a voice-recorded journal.",
    tags: ["Dart", "Flutter", "HCI"],
  },
  {
    source: "github",
    id: "school-library",
    repo: "Se7enBit/DatabasesProject",
    title: "School Library",
    description: "Full-stack library network where students and teachers rent, reserve, and rate books, with admin roles.",
    tags: ["Python", "Flask", "MySQL", "JavaScript"],
    media: [
      { type: "image", src: "/projects/school-library/catalog.png", alt: "Book catalog page listing available titles" },
      { type: "image", src: "/projects/school-library/book-page.png", alt: "A book's page with rent and reserve buttons, details, ratings and comments" },
      { type: "image", src: "/projects/school-library/admin.png", alt: "School admin dashboard for approving comments, rentals and reservations" },
    ],
  },

  // ---- Templates: copy one above, fill it in, and uncomment. ----
  // Media files go in public/projects/<id>/ (a missing file fails the build).
  //
  // {
  //   source: "github",
  //   id: "my-repo",                       // `cat my-repo` in the terminal
  //   repo: "Se7enBit/my-repo",
  //   featured: true,                      // optional: highlighted + shown first
  //   title: "My Repo",                    // optional: overrides the GitHub name
  //   description: "One line.",            // optional: overrides the GitHub description
  //   tags: ["TypeScript"],
  //   media: [
  //     { type: "image", src: "/projects/my-repo/cover.png", alt: "What the screenshot shows" },
  //     { type: "video", src: "/projects/my-repo/demo.mp4", poster: "/projects/my-repo/poster.png" },
  //     { type: "youtube", id: "VIDEO_ID", caption: "Demo" },
  //   ],
  // },
  // {
  //   source: "manual",                    // private / not on GitHub: nothing is fetched
  //   id: "my-private-project",
  //   title: "My Private Project",
  //   description: "One line for the card.",
  //   longDescription: "Longer text for the detail view.",
  //   role: "Solo developer",
  //   tags: ["C"],
  //   highlights: ["What you did or achieved"],
  //   links: [{ label: "Demo video", url: "https://youtu.be/VIDEO_ID" }],
  //   status: "completed",                 // active | completed | archived | wip
  //   date: "2026",
  // },
];
