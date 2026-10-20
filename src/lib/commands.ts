// Terminal command registry. Adding a command = adding one entry to COMMANDS.
// Output is structured (segments), never raw HTML.
import { profile } from "../data/profile";
import type { WindowId } from "./desktop.svelte";
import type { Project } from "./projects";

export type Tone = "accent" | "accent2" | "dim" | "err" | "warn" | "bold";

/** A piece of output text. `run` makes it a clickable command, `fill` puts text in the prompt, `href` makes it a link. */
export type Seg = string | { text: string; tone?: Tone; run?: string; fill?: string; href?: string };
export type Line = Seg[];
export type Block = { type: "lines"; lines: Line[] } | { type: "neofetch" };

export type Ctx = {
  projects: readonly Project[];
  history: readonly string[];
  openWindow: (id: WindowId) => void;
  /** Open the Projects window on a project's detail view (or the grid with null). */
  showProject: (id: string | null) => void;
  openUrl: (url: string) => void;
  clear: () => void;
  exit: () => void;
};

export type Command = {
  name: string;
  aliases?: string[];
  /** Shown in `help` instead of the name, e.g. "cat <project>". With a required <arg>, clicking fills the prompt instead of running. */
  usage?: string;
  summary: string;
  /** Not listed in `help` or completed. */
  hidden?: boolean;
  /** Tab-completion candidates for the first argument. */
  args?: (ctx: Ctx) => string[];
  run: (args: string[], ctx: Ctx) => Block[] | void;
};

// ---------- output helpers ----------
const lines = (...ls: Line[]): Block[] => [{ type: "lines", lines: ls }];
const cmd = (command: string, label = command): Seg => ({ text: label, run: command, tone: "accent" });
const key = (text: string): Seg => ({ text, tone: "accent2" });
const dim = (text: string): Seg => ({ text, tone: "dim" });
const err = (text: string): Seg => ({ text, tone: "err" });
const link = (text: string, href: string): Seg => ({ text, href });

// Pseudo-files shown by `ls`, and what they do.
const FILES: Record<string, string> = {
  "projects/": "ls projects",
  "about.txt": "cat about.txt",
  "skills.txt": "cat skills.txt",
  "contact.txt": "cat contact.txt",
  "cv.pdf": "cv",
};

function findProject(arg: string, ctx: Ctx): Project | undefined {
  const id = arg.replace(/^(\.\/)?projects\//, "").replace(/\/$/, "").toLowerCase();
  return ctx.projects.find((p) => p.id === id);
}

function projectUrl(p: Project): string | undefined {
  return p.github?.homepage ?? p.github?.url ?? p.links[0]?.url;
}

// ---------- command bodies (shared by aliases and pseudo-files) ----------
function about(ctx: Ctx): Block[] {
  ctx.openWindow("about");
  return lines(
    [{ text: profile.name, tone: "bold" }, " — ", key(profile.title)],
    [dim(`${profile.university} · ${profile.graduation} · ${profile.location}`)],
    [],
    [profile.bio],
    [],
    [dim("more: "), cmd("skills"), dim(" · "), cmd("projects"), dim(" · "), cmd("contact"), dim(" · "), cmd("cv")],
  );
}

function listProjects(ctx: Ctx): Block[] {
  ctx.showProject(null);
  const ps = ctx.projects;
  if (ps.length === 0) return lines([dim("no projects yet")]);
  const w = Math.max(...ps.map((p) => p.id.length));
  return lines(
    [dim(`total ${ps.length}`)],
    ...ps.map((p): Line => [
      p.featured ? { text: "★ ", tone: "warn" } : "  ",
      cmd(`cat ${p.id}`, p.id),
      " ".repeat(w - p.id.length + 2),
      p.title,
      p.private ? dim("  [private]") : "",
    ]),
    [],
    [dim("click a name or run "), { text: "cat <project>", fill: "cat ", tone: "accent" }, dim(" for details")],
  );
}

function projectDetails(p: Project): Block[] {
  const out: Line[] = [];
  const row = (label: string, ...value: Seg[]) => out.push([key(`${label}:`.padEnd(8)), ...value]);

  out.push([
    { text: p.title, tone: "bold" },
    p.featured ? { text: "  ★ featured", tone: "warn" } : "",
    p.private ? dim("  🔒 private") : "",
  ]);
  if (p.description) out.push([p.description]);
  if (p.longDescription && p.longDescription !== p.description) {
    out.push([], ...p.longDescription.split("\n").map((l): Line => [l]));
  }
  out.push([]);
  if (p.role) row("role", p.role);
  if (p.status) row("status", p.status);
  if (p.date) row("date", p.date);
  if (p.tags.length) row("tags", { text: p.tags.map((t) => `[${t}]`).join(" "), tone: "accent" });
  if (p.github) {
    row("repo", link(p.github.repo, p.github.url));
    const stats = [p.github.stars !== undefined ? `★ ${p.github.stars}` : "", p.github.language ?? ""].filter(Boolean);
    if (stats.length) row("stats", stats.join(" · "));
    if (p.github.homepage) row("demo", link(p.github.homepage, p.github.homepage));
  }
  for (const l of p.links) row("link", link(l.label, l.url), dim(`  ${l.url}`));
  if (p.media.length) {
    const counts = new Map<string, number>();
    for (const m of p.media) counts.set(m.type, (counts.get(m.type) ?? 0) + 1);
    row("media", dim([...counts].map(([t, n]) => `${n} ${t}`).join(", ")));
  }
  if (p.highlights.length) {
    out.push([], [key("highlights:")], ...p.highlights.map((h): Line => ["  • ", h]));
  }
  if (projectUrl(p)) out.push([], [cmd(`open ${p.id}`), dim(" to visit")]);
  return lines(...out);
}

function skills(): Block[] {
  const entries = Object.entries(profile.skills);
  const w = Math.max(...entries.map(([k]) => k.length));
  return lines(...entries.map(([k, items]): Line => [key(`${k}:`.padEnd(w + 2)), items.join(", ")]));
}

function contact(ctx: Ctx): Block[] {
  ctx.openWindow("contact");
  return lines(
    [key("email:    "), link(profile.email, `mailto:${profile.email}`)],
    [key("linkedin: "), link(profile.linkedin.replace(/^https?:\/\//, ""), profile.linkedin)],
    ...profile.github.map((url): Line => [key("github:   "), link(url.replace(/^https?:\/\//, ""), url)]),
  );
}

function openCv(ctx: Ctx): Block[] {
  ctx.openUrl(profile.cv);
  return lines(["opening ", link("cv.pdf", profile.cv), " in a new tab …"]);
}

// ---------- the registry ----------
export const COMMANDS: Command[] = [
  {
    name: "help",
    summary: "list available commands",
    run: () => {
      const visible = COMMANDS.filter((c) => !c.hidden);
      const label = (c: Command) => c.usage ?? c.name;
      const w = Math.max(...visible.map((c) => label(c).length));
      return lines(
        ["available commands — click one or type it:"],
        [],
        ...visible.map((c): Line => [
          "  ",
          c.usage?.includes("<") ? { text: c.usage, fill: `${c.name} `, tone: "accent" } : cmd(c.name, label(c)),
          " ".repeat(w - label(c).length + 3),
          c.summary,
          c.aliases?.length ? dim(`  (also: ${c.aliases.join(", ")})`) : "",
        ]),
        [],
        [dim("Tab completes · ↑/↓ history · Ctrl+L clears")],
      );
    },
  },
  {
    name: "neofetch",
    summary: "show system info",
    run: () => [{ type: "neofetch" }],
  },
  {
    name: "whoami",
    aliases: ["about"],
    summary: "short bio",
    run: (_, ctx) => about(ctx),
  },
  {
    name: "projects",
    summary: "list selected projects (also: ls projects)",
    run: (_, ctx) => listProjects(ctx),
  },
  {
    name: "ls",
    usage: "ls [projects]",
    summary: "list files",
    args: () => ["projects"],
    run: (args, ctx) => {
      const target = args[0]?.replace(/^\.\//, "").replace(/\/$/, "");
      if (!target || target === "." || target === "~") {
        return lines(Object.entries(FILES).flatMap(([name, run], i): Seg[] => [i ? "  " : "", cmd(run, name)]));
      }
      if (target === "projects") return listProjects(ctx);
      return lines([err(`ls: cannot access '${args[0]}': No such file or directory`)]);
    },
  },
  {
    name: "cat",
    usage: "cat <project>",
    summary: "show project details",
    args: (ctx) => [...ctx.projects.map((p) => p.id), ...Object.keys(FILES).filter((f) => !f.endsWith("/"))],
    run: (args, ctx) => {
      const arg = args[0];
      if (!arg) return lines([err("cat: missing operand")], [dim("usage: cat <project> — try "), cmd("ls projects")]);
      if (arg === "about.txt") return about(ctx);
      if (arg === "skills.txt") return skills();
      if (arg === "contact.txt") return contact(ctx);
      if (arg === "cv.pdf") return lines([err("cat: cv.pdf: binary file"), dim(" — try "), cmd("cv")]);
      const p = findProject(arg, ctx);
      if (!p) return lines([err(`cat: ${arg}: No such file or directory`), dim(" — try "), cmd("ls projects")]);
      ctx.showProject(p.id);
      return projectDetails(p);
    },
  },
  {
    name: "open",
    usage: "open <project>",
    summary: "open a project's repo or demo in a new tab",
    args: (ctx) => ctx.projects.filter((p) => projectUrl(p)).map((p) => p.id),
    run: (args, ctx) => {
      const arg = args[0];
      if (!arg) return lines([err("open: missing operand")], [dim("usage: open <project> — try "), cmd("ls projects")]);
      const p = findProject(arg, ctx);
      if (!p) return lines([err(`open: ${arg}: no such project`), dim(" — try "), cmd("ls projects")]);
      const url = projectUrl(p);
      if (!url) return lines([dim(`open: ${p.id} is private and has no public link — try `), cmd(`cat ${p.id}`)]);
      ctx.openUrl(url);
      return lines(["opening ", link(url, url), " …"]);
    },
  },
  {
    name: "skills",
    summary: "skills by category",
    run: () => skills(),
  },
  {
    name: "contact",
    summary: "email, LinkedIn, GitHub",
    run: (_, ctx) => contact(ctx),
  },
  {
    name: "cv",
    aliases: ["resume"],
    summary: "open my CV (PDF)",
    run: (_, ctx) => openCv(ctx),
  },
  {
    name: "history",
    summary: "show command history",
    run: (_, ctx) =>
      lines(...ctx.history.map((h, i): Line => [dim(String(i + 1).padStart(4)), "  ", cmd(h)])),
  },
  {
    name: "clear",
    summary: "clear the terminal (Ctrl+L)",
    run: (_, ctx) => ctx.clear(),
  },
  {
    name: "exit",
    summary: "log out to the start screen",
    run: (_, ctx) => ctx.exit(),
  },

  // ---------- easter eggs ----------
  {
    name: "sudo",
    hidden: true,
    summary: "",
    run: () =>
      lines(
        [err("guest is not in the sudoers file. This incident will be reported.")],
        [dim("(not really. try "), cmd("help"), dim(")")],
      ),
  },
  {
    name: "rm",
    hidden: true,
    summary: "",
    run: (args) =>
      lines([err(`rm: cannot remove '${args.at(-1) ?? ""}': Read-only file system`)], [dim("nice try — this portfolio is immutable")]),
  },
  {
    name: "startx",
    hidden: true,
    summary: "",
    run: () => lines([dim("startx: X server is already running on display :0")]),
  },
];

const byName = new Map<string, Command>();
for (const c of COMMANDS) for (const n of [c.name, ...(c.aliases ?? [])]) byName.set(n, c);

/** Run one input line and return its output. */
export function execute(input: string, ctx: Ctx): Block[] {
  const [name = "", ...args] = input.trim().split(/\s+/);
  const command = byName.get(name.toLowerCase());
  if (!command) {
    return lines([err(`command not found: ${name}`), dim(" — try "), cmd("help", "'help'")]);
  }
  return command.run(args, ctx) ?? [];
}

/** Tab completion: completes a command name or its first argument. */
export function complete(input: string, ctx: Ctx): { value: string; options: string[] } {
  const words = input.trimStart().split(/\s+/);
  const lead = input.slice(0, input.length - input.trimStart().length);
  let base: string;
  let partial: string;
  let candidates: string[];

  if (words.length === 1) {
    base = lead;
    partial = words[0]!;
    candidates = [...byName.entries()].filter(([, c]) => !c.hidden).map(([n]) => n);
  } else if (words.length === 2) {
    partial = words[1]!;
    base = input.slice(0, input.length - partial.length);
    candidates = byName.get(words[0]!.toLowerCase())?.args?.(ctx) ?? [];
  } else {
    return { value: input, options: [] };
  }

  const matches = [...new Set(candidates.filter((c) => c.startsWith(partial)))].sort();
  if (matches.length === 0) return { value: input, options: [] };
  if (matches.length === 1) return { value: `${base}${matches[0]} `, options: [] };

  let prefix = matches[0]!;
  for (const m of matches) while (!m.startsWith(prefix)) prefix = prefix.slice(0, -1);
  if (prefix.length > partial.length) return { value: base + prefix, options: [] };
  return { value: input, options: matches };
}
