// Lexical search snippets come from Postgres `ts_headline` and contain only
// `<mark>` tags around matched terms. The text itself is crawled/uploaded
// content, so never hand it to `dangerouslySetInnerHTML`: split it into plain
// text segments and let the component render `<mark>` itself.

export interface SnippetSegment {
  text: string;
  highlighted: boolean;
}

const MARK_SPLIT_RE = /(<\/?mark\s*>)/i;
const OPEN_MARK_RE = /^<mark\s*>$/i;
const CLOSE_MARK_RE = /^<\/mark\s*>$/i;
// Any other tag (`<b>`, `<script>`, `<img …>`) is dropped; its inner text is
// kept as plain text, which is harmless once rendered as a text node.
const OTHER_TAG_RE = /<\/?[a-z][^>]*>/gi;

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

// Named entities plus numeric ones (`&#038;`, `&#x26;`), which crawled titles
// and chunks carry through from the source HTML.
const decodeEntities = (text: string) =>
  text
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (match) => ENTITIES[match])
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    );

/** Splits a `ts_headline` snippet into highlighted / plain text segments. */
export function snippetToSegments(snippet?: string | null): SnippetSegment[] {
  if (!snippet) return [];

  const segments: SnippetSegment[] = [];
  let highlighted = false;

  for (const part of snippet.split(MARK_SPLIT_RE)) {
    if (OPEN_MARK_RE.test(part)) {
      highlighted = true;
      continue;
    }
    if (CLOSE_MARK_RE.test(part)) {
      highlighted = false;
      continue;
    }
    const text = decodeEntities(part.replace(OTHER_TAG_RE, ""));
    if (!text) continue;

    const last = segments[segments.length - 1];
    if (last && last.highlighted === highlighted) {
      last.text += text;
    } else {
      segments.push({ text, highlighted });
    }
  }

  return segments;
}

/** Plain text of a snippet with every tag removed (analytics, fallbacks). */
export function sanitizeSnippet(snippet?: string | null): string {
  return snippetToSegments(snippet)
    .map((segment) => segment.text)
    .join("");
}
