// Validates src/data/projects.ts and merges GitHub API data into one normalized list.
// Components should use getProjects(), never the raw entries.
import { existsSync } from "node:fs";
import path from "node:path";
import { projects as entries, type Link, type Media, type ProjectEntry } from "../data/projects";
import { fetchRepos } from "./github";

export type Project = {
  id: string;
  source: ProjectEntry["source"];
  title: string;
  description: string;
  longDescription?: string;
  role?: string;
  featured: boolean;
  tags: string[];
  highlights: string[];
  links: Link[];
  media: Media[];
  date?: string;
  status?: ProjectEntry["status"];
  /** true → show the 🔒 private badge, no repo link or stats */
  private: boolean;
  /** GitHub projects only */
  github?: {
    repo: string;
    url: string;
    homepage?: string;
    stars?: number;       // undefined when hideStats or the fetch failed
    language?: string;
    pushedAt?: string;
    fetched: boolean;     // false → API failed, only projects.ts fields are shown
  };
};

const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO_RE = /^(Se7enBit|ntua-el20014)\/[A-Za-z0-9._-]+$/;
const YOUTUBE_RE = /^[A-Za-z0-9_-]{11}$/;
const PUBLIC_DIR = path.join(process.cwd(), "public");

let loaded: Promise<Project[]> | undefined;

/** Validated, merged project list in display order (featured first). Throws on invalid config. */
export function getProjects(): Promise<Project[]> {
  loaded ??= load();
  return loaded;
}

async function load(): Promise<Project[]> {
  const errors = validate(entries);
  if (errors.length > 0) {
    throw new Error(
      `Invalid project config in src/data/projects.ts (${errors.length} problem${errors.length > 1 ? "s" : ""}):\n` +
        errors.map((e) => `  - ${e}`).join("\n"),
    );
  }

  // Only `source: "github"` entries are ever sent to the API.
  const repos = await fetchRepos(entries.flatMap((e) => (e.source === "github" ? [e.repo] : [])));

  const merged = entries.map((entry): Project => {
    const common = {
      id: entry.id,
      source: entry.source,
      featured: entry.featured ?? false,
      highlights: entry.highlights ?? [],
      links: entry.links ?? [],
      media: entry.media ?? [],
      date: entry.date,
      status: entry.status,
    };

    if (entry.source === "manual") {
      return {
        ...common,
        title: entry.title,
        description: entry.description,
        longDescription: entry.longDescription,
        role: entry.role,
        tags: entry.tags ?? [],
        private: entry.private ?? true,
      };
    }

    // Manual fields in projects.ts override API fields.
    const api = repos.get(entry.repo) ?? null;
    const showStats = api !== null && !entry.hideStats;
    return {
      ...common,
      title: entry.title ?? api?.name ?? entry.repo.split("/")[1]!,
      description: entry.description ?? api?.description ?? "",
      tags: entry.tags ?? api?.topics ?? [],
      private: false,
      github: {
        repo: entry.repo,
        url: api?.htmlUrl || `https://github.com/${entry.repo}`,
        homepage: api?.homepage ?? undefined,
        stars: showStats ? api.stars : undefined,
        language: showStats ? (api.language ?? undefined) : undefined,
        pushedAt: api?.pushedAt ?? undefined,
        fetched: api !== null,
      },
    };
  });

  // Stable sort: featured first, otherwise keep array order.
  return merged.sort((a, b) => Number(b.featured) - Number(a.featured));
}

function validate(list: ProjectEntry[]): string[] {
  const errors: string[] = [];
  const seen = new Map<string, number>();
  const isBlank = (v: unknown) => typeof v !== "string" || v.trim() === "";

  list.forEach((p, i) => {
    const at = `projects[${i}]${typeof p.id === "string" && p.id ? ` "${p.id}"` : ""}`;

    if (isBlank(p.id)) {
      errors.push(`${at}: "id" is required`);
    } else if (!ID_RE.test(p.id)) {
      errors.push(`${at}: id must be lowercase letters, digits and dashes (e.g. "alarm-app")`);
    } else if (seen.has(p.id)) {
      errors.push(`${at}: duplicate id (also used by projects[${seen.get(p.id)}])`);
    } else {
      seen.set(p.id, i);
    }

    if (p.source === "github") {
      if (!REPO_RE.test(p.repo ?? "")) {
        errors.push(`${at}: repo "${p.repo}" must be "Se7enBit/<name>" or "ntua-el20014/<name>"`);
      }
    } else if (p.source === "manual") {
      if (isBlank(p.title)) errors.push(`${at}: manual projects need a "title"`);
      if (isBlank(p.description)) errors.push(`${at}: manual projects need a "description"`);
    } else {
      errors.push(`${at}: source must be "github" or "manual"`);
    }

    p.links?.forEach((link, j) => {
      if (isBlank(link.label)) errors.push(`${at}: links[${j}] needs a "label"`);
      if (!isHttpUrl(link.url)) errors.push(`${at}: links[${j}].url "${link.url}" is not a valid http(s) URL`);
    });

    p.media?.forEach((m, j) => {
      const mat = `${at}: media[${j}]`;
      if (m.type === "image") {
        if (isBlank(m.alt)) errors.push(`${mat}: images need "alt" text`);
        checkFile(m.src, `${mat}.src`, errors);
      } else if (m.type === "video") {
        checkFile(m.src, `${mat}.src`, errors);
        if (m.poster !== undefined) checkFile(m.poster, `${mat}.poster`, errors);
      } else if (m.type === "youtube") {
        if (!YOUTUBE_RE.test(m.id ?? "")) errors.push(`${mat}: "${m.id}" is not a YouTube video id (11 chars)`);
      } else {
        errors.push(`${mat}: type must be "image", "video" or "youtube"`);
      }
    });
  });

  return errors;
}

function checkFile(src: unknown, at: string, errors: string[]): void {
  if (typeof src !== "string" || !src.startsWith("/") || src.includes("..")) {
    errors.push(`${at}: "${String(src)}" must be a path inside public/, starting with "/" (e.g. "/projects/<id>/cover.png")`);
  } else if (!existsSync(path.join(PUBLIC_DIR, src))) {
    errors.push(`${at}: file not found: public${src}`);
  }
}

function isHttpUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}
