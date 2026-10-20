// Tiny, safe "simple markdown" for project long descriptions: paragraphs (blank-line separated),
// "- " bullet lists, `code`, **bold** and [label](https://…) links. Produces data, never HTML.

export type Inline =
  | { kind: "text" | "code" | "strong"; text: string }
  | { kind: "link"; text: string; href: string };

export type MdBlock = { kind: "p"; content: Inline[] } | { kind: "ul"; items: Inline[][] };

const BULLET = /^\s*[-*]\s+/;
const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function parseMarkdown(src: string): MdBlock[] {
  return src
    .trim()
    .split(/\n\s*\n/)
    .map((chunk): MdBlock => {
      const lines = chunk.split("\n");
      if (lines.every((l) => BULLET.test(l))) {
        return { kind: "ul", items: lines.map((l) => parseInline(l.replace(BULLET, ""))) };
      }
      return { kind: "p", content: parseInline(lines.map((l) => l.trim()).join(" ")) };
    });
}

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "code", text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: "strong", text: m[2] });
    else if (/^(https?:|mailto:)/.test(m[4]!)) out.push({ kind: "link", text: m[3]!, href: m[4]! });
    else out.push({ kind: "text", text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}
