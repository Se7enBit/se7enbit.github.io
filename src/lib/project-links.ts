// Client-safe helpers for displaying projects (lib/projects.ts uses node:fs, so components import from here).
import type { Link } from "../data/projects";
import type { Project } from "./projects";

/** Repo (public GitHub projects only), demo (GitHub homepage) and the extra links, in display order. */
export function projectLinks(p: Project): Link[] {
  return [
    ...(p.github && !p.private ? [{ label: "repo", url: p.github.url }] : []),
    ...(p.github?.homepage ? [{ label: "demo", url: p.github.homepage }] : []),
    ...p.links,
  ];
}
