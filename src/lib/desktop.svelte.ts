// Shared desktop state: launch screen + window stack. Used by every part of the island.
import { profile } from "../data/profile";

export type WindowId = "terminal" | "projects" | "about" | "contact";

export type WindowInfo = {
  id: WindowId;
  label: string;      // taskbar text
  title: string;      // title bar + status bar
  glyph: string;      // taskbar icon
  workspace: number;  // status bar workspace number
};

export const WINDOWS: readonly WindowInfo[] = [
  { id: "terminal", label: "Terminal", title: `guest@${profile.handle}: ~`, glyph: ">_", workspace: 1 },
  { id: "projects", label: "Projects", title: "~/projects", glyph: "[]", workspace: 2 },
  { id: "about", label: "About", title: "~/about", glyph: "i", workspace: 3 },
  { id: "contact", label: "Contact", title: "~/contact", glyph: "@", workspace: 4 },
];

/** sessionStorage key; also read by the inline script in index.astro to skip the launch screen without a flash. */
export const LAUNCHED_KEY = "se7enbit:launched";

/** Transition duration that collapses to 0 under prefers-reduced-motion. */
export function motion(ms: number): number {
  if (typeof window === "undefined") return ms;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
}

class DesktopState {
  launched = $state(false);

  /** Open windows in z-order; the last one is focused. The terminal is always open. */
  stack = $state<WindowId[]>(["terminal"]);

  focused = $derived(this.stack.at(-1) ?? "terminal");

  isOpen(id: WindowId): boolean {
    return this.stack.includes(id);
  }

  zIndex(id: WindowId): number {
    return this.stack.indexOf(id) + 1;
  }

  /** Open the window if needed and bring it to the front. */
  open(id: WindowId): void {
    if (this.focused === id) return;
    this.stack = [...this.stack.filter((w) => w !== id), id];
  }

  close(id: WindowId): void {
    if (id === "terminal") return;
    this.stack = this.stack.filter((w) => w !== id);
  }

  /** Skip the launch screen if the visitor already launched in this browser session. */
  restore(): void {
    try {
      if (sessionStorage.getItem(LAUNCHED_KEY) === "1") this.launched = true;
    } catch {
      // storage blocked: just show the launch screen
    }
  }

  launch(): void {
    if (this.launched) return;
    this.launched = true;
    document.documentElement.dataset.launched = "";
    try {
      sessionStorage.setItem(LAUNCHED_KEY, "1");
    } catch {
      // ignore
    }
  }

  /** Back to the launch screen (the `exit` command). */
  exit(): void {
    this.launched = false;
    this.stack = ["terminal"];
    delete document.documentElement.dataset.launched;
    try {
      sessionStorage.removeItem(LAUNCHED_KEY);
    } catch {
      // ignore
    }
  }
}

export const desktop = new DesktopState();
