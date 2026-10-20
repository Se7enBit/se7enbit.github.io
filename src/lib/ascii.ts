// ASCII art helpers: the launch-screen name banner and the neofetch logo.
// Art is returned as lines of colored runs, so components can tint the solid blocks,
// the box-drawing "shadow" and the chip outline separately.
//
// Ink: "block" = runs of █ (render as a background-filled span so adjacent cells can't show seams),
//      "fill"  = partial blocks (▄▀…), "shade" = box-drawing shadow, "frame" = chip outline.
export type Ink = "block" | "fill" | "shade" | "frame";
export type Run = { text: string; ink: Ink | null };
export type ArtLine = Run[];

// Glyphs from the "ANSI Shadow" FIGlet font (xero/figlet-fonts; originally a TheDraw font,
// converted with patorjk.com's FIGfont editor). Six rows per glyph.
const ANSI_SHADOW: Record<string, string[]> = {
  "A": [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  "B": ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██████╔╝", "╚═════╝ "],
  "C": [" ██████╗", "██╔════╝", "██║     ", "██║     ", "╚██████╗", " ╚═════╝"],
  "D": ["██████╗ ", "██╔══██╗", "██║  ██║", "██║  ██║", "██████╔╝", "╚═════╝ "],
  "E": ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  "F": ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "██║     ", "╚═╝     "],
  "G": [" ██████╗ ", "██╔════╝ ", "██║  ███╗", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  "H": ["██╗  ██╗", "██║  ██║", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  "I": ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
  "J": ["     ██╗", "     ██║", "     ██║", "██   ██║", "╚█████╔╝", " ╚════╝ "],
  "K": ["██╗  ██╗", "██║ ██╔╝", "█████╔╝ ", "██╔═██╗ ", "██║  ██╗", "╚═╝  ╚═╝"],
  "L": ["██╗     ", "██║     ", "██║     ", "██║     ", "███████╗", "╚══════╝"],
  "M": ["███╗   ███╗", "████╗ ████║", "██╔████╔██║", "██║╚██╔╝██║", "██║ ╚═╝ ██║", "╚═╝     ╚═╝"],
  "N": ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
  "O": [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  "P": ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔═══╝ ", "██║     ", "╚═╝     "],
  "Q": [" ██████╗ ", "██╔═══██╗", "██║   ██║", "██║▄▄ ██║", "╚██████╔╝", " ╚══▀▀═╝ "],
  "R": ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  "S": ["███████╗", "██╔════╝", "███████╗", "╚════██║", "███████║", "╚══════╝"],
  "T": ["████████╗", "╚══██╔══╝", "   ██║   ", "   ██║   ", "   ██║   ", "   ╚═╝   "],
  "U": ["██╗   ██╗", "██║   ██║", "██║   ██║", "██║   ██║", "╚██████╔╝", " ╚═════╝ "],
  "V": ["██╗   ██╗", "██║   ██║", "██║   ██║", "╚██╗ ██╔╝", " ╚████╔╝ ", "  ╚═══╝  "],
  "W": ["██╗    ██╗", "██║    ██║", "██║ █╗ ██║", "██║███╗██║", "╚███╔███╔╝", " ╚══╝╚══╝ "],
  "X": ["██╗  ██╗", "╚██╗██╔╝", " ╚███╔╝ ", " ██╔██╗ ", "██╔╝ ██╗", "╚═╝  ╚═╝"],
  "Y": ["██╗   ██╗", "╚██╗ ██╔╝", " ╚████╔╝ ", "  ╚██╔╝  ", "   ██║   ", "   ╚═╝   "],
  "Z": ["███████╗", "╚══███╔╝", "  ███╔╝ ", " ███╔╝  ", "███████╗", "╚══════╝"],
  "0": [" ██████╗ ", "██╔═████╗", "██║██╔██║", "████╔╝██║", "╚██████╔╝", " ╚═════╝ "],
  "1": [" ██╗", "███║", "╚██║", " ██║", " ██║", " ╚═╝"],
  "2": ["██████╗ ", "╚════██╗", " █████╔╝", "██╔═══╝ ", "███████╗", "╚══════╝"],
  "3": ["██████╗ ", "╚════██╗", " █████╔╝", " ╚═══██╗", "██████╔╝", "╚═════╝ "],
  "4": ["██╗  ██╗", "██║  ██║", "███████║", "╚════██║", "     ██║", "     ╚═╝"],
  "5": ["███████╗", "██╔════╝", "███████╗", "╚════██║", "███████║", "╚══════╝"],
  "6": [" ██████╗ ", "██╔════╝ ", "███████╗ ", "██╔═══██╗", "╚██████╔╝", " ╚═════╝ "],
  "7": ["███████╗", "╚════██║", "    ██╔╝", "   ██╔╝ ", "   ██║  ", "   ╚═╝  "],
  "8": [" █████╗ ", "██╔══██╗", "╚█████╔╝", "██╔══██╗", "╚█████╔╝", " ╚════╝ "],
  "9": [" █████╗ ", "██╔══██╗", "╚██████║", " ╚═══██║", " █████╔╝", " ╚════╝ "],
  " ": ["    ", "    ", "    ", "    ", "    ", "    "],
  "-": ["      ", "      ", "█████╗", "╚════╝", "      ", "      "],
  ".": ["   ", "   ", "   ", "   ", "██╗", "╚═╝"],
  "'": ["", "", "", "", "", ""],
  "&": ["   ██╗   ", "   ██║   ", "████████╗", "██╔═██╔═╝", "██████║  ", "╚═════╝  "],
  "_": ["        ", "        ", "        ", "        ", "███████╗", "╚══════╝"],
};

const FILL = /[▄▀▌▐░▒▓·]/;

/** Split a line into runs: █ → "block", partial blocks → "fill", other glyph characters → `other`, spaces → null. */
function toRuns(line: string, other: Ink = "shade"): Run[] {
  const runs: Run[] = [];
  for (const ch of line) {
    const ink: Ink | null = ch === " " ? null : ch === "█" ? "block" : FILL.test(ch) ? "fill" : other;
    const last = runs.at(-1);
    if (last && last.ink === ink) last.text += ch;
    else runs.push({ text: ch, ink });
  }
  return runs;
}

function glyphsFor(word: string): string[][] {
  return [...word]
    .map((ch) => ANSI_SHADOW[ch])
    .filter((g): g is string[] => g !== undefined && g[0]!.length > 0);
}

const width = (glyphs: string[][]) => glyphs.reduce((w, g) => w + g[0]!.length, 0);

/**
 * Render text as an ANSI Shadow banner (6 rows per line of text). Words wrap onto a new line
 * when a line would exceed `maxCols`. Unsupported characters are skipped; returns [] if nothing renders.
 */
export function banner(text: string, maxCols = 80): ArtLine[] {
  const words = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toUpperCase()
    .split(/\s+/)
    .map(glyphsFor)
    .filter((g) => g.length > 0);

  const space = ANSI_SHADOW[" "]!;
  const lines: string[][][] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (current && width(current) + width([space]) + width(word) <= maxCols) current.push(space, ...word);
    else lines.push([...word]);
  }

  const out: ArtLine[] = [];
  lines.forEach((glyphs, i) => {
    if (i > 0) out.push([]); // one blank row between wrapped lines
    for (let r = 0; r < 6; r++) out.push(toRuns(glyphs.map((g) => g[r]).join("").trimEnd()));
  });
  return out;
}

/** Neofetch logo: a chip package with an ANSI Shadow "7" on it. */
export function chipLogo(): ArtLine[] {
  const W = 15;
  const pins = new Set([1, 4, 7, 10, 13]);
  const edge = (pin: string, rest: string) => Array.from({ length: W }, (_, i) => (pins.has(i) ? pin : rest)).join("");
  const seven = ANSI_SHADOW["7"]!;
  const body = ["", ...seven, ""].map((row) => `    ${row}`.padEnd(W));

  const frame = (text: string): Run => ({ text, ink: "frame" });
  const stubs = (ch: string): ArtLine => toRuns(`     ${edge(ch, " ")}`.trimEnd(), "frame");
  return [
    stubs("│"),
    [frame(`   ╭${edge("┴", "─")}╮`)],
    ...body.map((row): ArtLine => [frame(" ──┤"), ...toRuns(row), frame("├──")]),
    [frame(`   ╰${edge("┬", "─")}╯`)],
    stubs("│"),
  ];
}

/** Plain-text version of a piece of art (for alt text or debugging). */
export function artToString(lines: ArtLine[]): string {
  return lines.map((l) => l.map((r) => r.text).join("")).join("\n");
}
