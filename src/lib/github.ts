// Build-time GitHub API fetch for `source: "github"` projects.
// Never throws: a failed repo logs a warning and returns null, so the caller
// falls back to the fields written in projects.ts.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type RepoData = {
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  stars: number;
  language: string | null;
  topics: string[];
  pushedAt: string | null;
};

type FetchResult =
  | { status: "ok"; data: RepoData }
  | { status: "missing" }                 // 404: repo doesn't exist or isn't public
  | { status: "error"; reason: string };  // rate limit, network, 5xx...

type CacheEntry = { fetchedAt: number; result: FetchResult };

const API_BASE = "https://api.github.com/repos/";
const TIMEOUT_MS = 10_000;

// Local dev/builds only: CI always fetches fresh data (that's the point of the daily rebuild).
const USE_CACHE = !process.env.CI;
const CACHE_FILE = path.join(process.cwd(), ".cache", "github.json");
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function fetchRepos(repos: string[]): Promise<Map<string, RepoData | null>> {
  const cache = USE_CACHE ? await readCache() : {};
  let cacheDirty = false;

  const entries = await Promise.all(
    [...new Set(repos)].map(async (repo) => {
      const cached = cache[repo];
      let result: FetchResult;
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        result = cached.result;
      } else {
        result = await request(repo);
        // Cache definitive answers only; transient errors get retried next time.
        if (result.status !== "error") {
          cache[repo] = { fetchedAt: Date.now(), result };
          cacheDirty = true;
        }
      }

      if (result.status === "missing") {
        console.warn(`[github] ${repo}: not found (404) — using fields from projects.ts`);
      } else if (result.status === "error") {
        console.warn(`[github] ${repo}: ${result.reason} — using fields from projects.ts`);
      }
      return [repo, result.status === "ok" ? result.data : null] as const;
    }),
  );

  if (USE_CACHE && cacheDirty) await writeCache(cache);
  return new Map(entries);
}

async function request(repo: string): Promise<FetchResult> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "se7enbit.github.io-build",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(API_BASE + repo, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (res.status === 404) return { status: "missing" };
    if (!res.ok) {
      const limited = res.headers.get("x-ratelimit-remaining") === "0";
      const hint = limited && !token ? " (set GITHUB_TOKEN to raise the limit)" : "";
      return { status: "error", reason: limited ? `rate limited${hint}` : `HTTP ${res.status}` };
    }
    return { status: "ok", data: pick((await res.json()) as Record<string, unknown>) };
  } catch (err) {
    return { status: "error", reason: err instanceof Error ? err.message : String(err) };
  }
}

function pick(json: Record<string, unknown>): RepoData {
  const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
  return {
    name: str(json.name) ?? "",
    description: str(json.description),
    htmlUrl: str(json.html_url) ?? "",
    homepage: str(json.homepage),
    stars: typeof json.stargazers_count === "number" ? json.stargazers_count : 0,
    language: str(json.language),
    topics: Array.isArray(json.topics) ? json.topics.filter((t): t is string => typeof t === "string") : [],
    pushedAt: str(json.pushed_at),
  };
}

async function readCache(): Promise<Record<string, CacheEntry>> {
  try {
    return JSON.parse(await readFile(CACHE_FILE, "utf8")) as Record<string, CacheEntry>;
  } catch {
    return {};
  }
}

async function writeCache(cache: Record<string, CacheEntry>): Promise<void> {
  try {
    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.warn(`[github] could not write cache: ${err instanceof Error ? err.message : String(err)}`);
  }
}
