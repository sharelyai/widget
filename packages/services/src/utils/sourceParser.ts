import type { Source } from "../types/agent";

interface RawSourceItem {
  text: string;
  source: string; // "pageNumber:filename:knowledgeId"
}

interface ParsedSourceData {
  pageNumber: number;
  filename: string;
  knowledgeId: string;
}

interface RawSourceData {
  pageNumber: number;
  filename: string;
  text: string;
}

/** Shape of a single entry in semantic_search output.sourcesMetadata.
 *  Backend sends flat objects (text, title, knowledgeId at top level),
 *  but some paths may nest them under a `metadata` key. Handle both. */
interface SemanticSourceMetadataEntry {
  id: string;
  score?: number;
  text?: string;
  type?: string;
  title?: string;
  source?: string;
  sourceUrl?: string;
  knowledgeId?: string;
  metadata?: {
    text?: string;
    type?: string;
    title?: string;
    source?: string;
    sourceUrl?: string;
    knowledgeId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Shape of a single entry in search_knowledge output.results */
interface SearchKnowledgeResult {
  id: string;
  type?: string;
  title?: string;
  content?: string;
  filename?: string;
  sourceUrl?: string | null;
}

/**
 * Parses the source string from tool_call_end event
 * Format: "pageNumber:filename:knowledgeId"
 * Example: "0:Guide_Notes_2025_v1.html:aa11bb22-cc33-4d44-8e55-ff6677889900"
 */
export function parseSourceString(sourceStr: string): ParsedSourceData {
  const parts = sourceStr.split(":");
  // Handle format: "pageNumber:filename:knowledgeId"
  // The knowledgeId is always the last part (UUID format)
  // The pageNumber is always the first part
  // The filename is everything in between (may contain colons)
  const pageNumber = parseInt(parts[0], 10) || 1;
  const knowledgeId = parts[parts.length - 1];
  const filename = parts.slice(1, -1).join(":");
  return { pageNumber, filename, knowledgeId };
}

/**
 * Transforms raw sources from tool_call_end into a Map keyed by knowledgeId
 */
export function transformRawSourcesToMap(
  rawSources: RawSourceItem[],
): Map<string, RawSourceData> {
  const map = new Map<string, RawSourceData>();
  rawSources.forEach((raw) => {
    const { pageNumber, filename, knowledgeId } = parseSourceString(raw.source);
    map.set(knowledgeId, { pageNumber, filename, text: raw.text });
  });
  return map;
}

/**
 * Merges clean sources from "sources" event with raw data from "tool_call_end" event
 * This combines the metadata from both events to get complete source info
 */
export function mergeSourcesWithRawData(
  sources: Source[],
  rawDataMap: Map<string, RawSourceData>,
): Source[] {
  return sources.map((source) => {
    const rawData = rawDataMap.get(source.id);
    const cleanSnippet = source.snippet
      ? stripHtml(source.snippet)
      : source.snippet;
    const cleanExcerpt = (source as any).excerpt
      ? stripHtml((source as any).excerpt)
      : (source as any).excerpt;
    if (rawData) {
      return {
        ...source,
        snippet: cleanSnippet,
        excerpt: cleanExcerpt,
        metadata: {
          ...source.metadata,
          pageNumber: rawData.pageNumber,
          filename: rawData.filename || source.metadata?.filename,
          knowledgeId: source.id,
        },
      };
    }
    return {
      ...source,
      snippet: cleanSnippet,
      excerpt: cleanExcerpt,
      metadata: {
        ...source.metadata,
        knowledgeId: source.id,
      },
    };
  });
}

/**
 * Returns true when the value is a non-empty string starting with http(s)://.
 * Used to decide whether a free-form field (snippet, source, sourceUrl) actually
 * contains a URL we can navigate to.
 */
export function isLikelyUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * Resolves the best external URL for a Source using a strict priority chain.
 * Snippet is the LAST resort and only used when it's a real URL — plain prose
 * snippets are ignored.
 */
export function resolveSourceUrl(
  source: Source | undefined | null,
): string | undefined {
  if (!source) return undefined;
  const meta = (source.metadata || {}) as Record<string, unknown>;
  if (isLikelyUrl(source.url)) return source.url;
  if (isLikelyUrl(meta.sourceUrl)) return meta.sourceUrl as string;
  if (isLikelyUrl(meta.source)) return meta.source as string;
  if (isLikelyUrl(source.snippet)) return source.snippet;
  return undefined;
}

/**
 * Reads the page number from a Source's metadata across the three shapes the
 * backend has emitted over time:
 *   - new (preferred): metadata.loc.pageNumber  (nested loc object)
 *   - flat-key:        metadata["loc.pageNumber"]
 *   - direct:          metadata.pageNumber
 */
export function getSourcePageNumber(
  source: Source | undefined | null,
): number | undefined {
  if (!source) return undefined;
  const meta = source.metadata as Record<string, unknown> | undefined;
  if (!meta) return undefined;
  const loc = meta.loc as { pageNumber?: unknown } | undefined;
  if (loc && typeof loc.pageNumber === "number") return loc.pageNumber;
  const flat = meta["loc.pageNumber"];
  if (typeof flat === "number") return flat;
  if (typeof meta.pageNumber === "number") return meta.pageNumber;
  return undefined;
}

export function withPdfPage(url: string, page?: number | null): string {
  if (!url || !page || page <= 1 || url.includes("#")) return url;
  return `${url}#page=${page}`;
}

/** Reads metadata.blobType (MIME type) when present. */
export function getSourceBlobType(
  source: Source | undefined | null,
): string | undefined {
  const blobType = (source?.metadata as Record<string, unknown> | undefined)
    ?.blobType;
  return typeof blobType === "string" ? blobType : undefined;
}

/**
 * True when the source represents a PDF document. Detects via blobType
 * (application/pdf), an explicit .pdf filename, or a .pdf-suffixed title.
 */
export function isPdfSource(source: Source | undefined | null): boolean {
  if (!source) return false;
  const blobType = getSourceBlobType(source);
  if (blobType && /pdf/i.test(blobType)) return true;
  const filename = (source.metadata as any)?.filename;
  if (typeof filename === "string" && /\.pdf$/i.test(filename)) return true;
  if (typeof source.title === "string" && /\.pdf$/i.test(source.title))
    return true;
  return false;
}

/**
 * True when a source can only be shown as an inline preview — no URL to open,
 * no downloadable file. Calling the download endpoint for these would error,
 * so the UI should display the snippet/title in a small dialog instead.
 *
 * Examples: a string-typed knowledge entry whose snippet describes content
 * but has no `url`, `metadata.sourceUrl`, `metadata.filename`, or `blobType`.
 */
export function isPreviewOnlySource(
  source: Source | undefined | null,
): boolean {
  if (!source) return false;
  if (resolveSourceUrl(source)) return false;
  if (getSourceFileLabel(source)) return false;
  return true;
}

/**
 * Returns a short label like "PDF", "DOCX", "PPTX", "TXT" for the source's
 * file type, derived from filename/title extension or blobType. Returns null
 * when the source isn't a recognizable file (e.g., URL articles).
 */
export function getSourceFileLabel(
  source: Source | undefined | null,
): string | null {
  if (!source) return null;
  const filename = (source.metadata as any)?.filename;
  if (typeof filename === "string") {
    const m = filename.match(/\.([a-zA-Z0-9]+)$/);
    if (m) return m[1].toUpperCase();
  }
  if (typeof source.title === "string") {
    const m = source.title.match(/\.([a-zA-Z0-9]+)$/);
    if (m) return m[1].toUpperCase();
  }
  const blobType = getSourceBlobType(source);
  if (blobType) {
    if (/pdf/i.test(blobType)) return "PDF";
    if (/wordprocessingml|msword|word/i.test(blobType)) return "DOCX";
    if (/spreadsheetml|excel|ms-excel/i.test(blobType)) return "XLSX";
    if (/presentationml|powerpoint/i.test(blobType)) return "PPTX";
    if (/text\/plain/i.test(blobType)) return "TXT";
  }
  return null;
}

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/<[^>]*$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
    .slice(0, 200);
}

/**
 * Extracts Source objects from semantic_search tool output's sourcesMetadata.
 * These are ordered to match the [N] references the AI generates.
 */
export function extractSourcesFromSemanticSearch(
  sourcesMetadata: SemanticSourceMetadataEntry[],
): Source[] {
  return sourcesMetadata.map((entry) => {
    // Handle both nested metadata and flat format from the backend
    const meta = entry.metadata || entry;
    const score = entry.score ?? (meta as any).score;
    const title = ((meta.title || "") as string)
      .replace(/&#038;/g, "&")
      .replace(/&amp;/g, "&");
    // The backend's `source` field is overloaded: it can be either a URL
    // (for URL-based knowledge) or a chunked-file token like
    // "pageNumber:filename:knowledgeId" (for uploaded files). Treat it as
    // the source URL only when it actually looks like an http(s) URL.
    const rawSource = typeof meta.source === "string" ? meta.source : undefined;
    const isUrlSource = !!rawSource && /^https?:\/\//i.test(rawSource);
    const sourceFieldUrl = isUrlSource ? rawSource : undefined;
    const url = meta.sourceUrl || sourceFieldUrl || undefined;

    // When `source` is a chunked-file token (not a URL) it carries the real
    // filename, page number and knowledgeId of the underlying file. Without
    // this, semantic chunks render as a bare "Semantic" text snippet with no
    // file type, page, or download action. Parse the token so they surface as
    // proper downloadable files (PDF badge, page number, Open Document).
    const fileToken =
      rawSource && !isUrlSource && rawSource.includes(":")
        ? parseSourceString(rawSource)
        : undefined;
    const hasFile =
      !!fileToken?.filename?.includes(".") && !!fileToken?.knowledgeId;

    const knowledgeId =
      meta.knowledgeId ||
      entry.knowledgeId ||
      (hasFile ? fileToken!.knowledgeId : undefined) ||
      entry.id;

    // Semantic chunk text is often prefixed with "Filename: <f> Title: <t>",
    // which is redundant with the parsed metadata above. Drop it so the
    // preview shows the actual content.
    let snippet = meta.text ? stripHtml(meta.text as string) : undefined;
    if (snippet && hasFile) {
      snippet = snippet
        .replace(/^\s*Filename:\s*\S+\s*/i, "")
        .replace(/^\s*Title:\s*/i, "");
      if (title && snippet.startsWith(title)) {
        snippet = snippet.slice(title.length);
      }
      snippet = snippet.trim();
    }

    return {
      id: knowledgeId,
      type: "knowledge" as const,
      title,
      url,
      snippet,
      metadata: {
        knowledgeId,
        knowledgeType: meta.type,
        sourceType: meta.type,
        sourceUrl: url,
        similarity: score,
        ...(hasFile ? { filename: fileToken!.filename } : {}),
        ...(hasFile && fileToken!.pageNumber
          ? { pageNumber: fileToken!.pageNumber }
          : {}),
      },
    };
  });
}

/**
 * Extracts Source objects from search_knowledge tool output's results.
 */
export function extractSourcesFromSearchKnowledge(
  results: SearchKnowledgeResult[],
): Source[] {
  return results.map((result) => {
    const url = result.sourceUrl || undefined;
    return {
      id: result.id,
      type: "knowledge" as const,
      title: (result.title || "")
        .replace(/&#038;/g, "&")
        .replace(/&amp;/g, "&"),
      url,
      snippet: result.content ? stripHtml(result.content) : undefined,
      metadata: {
        knowledgeId: result.id,
        filename: result.filename || undefined,
        sourceType: result.type || undefined,
        sourceUrl: url,
      },
    };
  });
}

/**
 * Extracts a filename (which may contain spaces) from a chunk of text prefixed
 * like "Filename: <file>.ext Title: <title>". Returns undefined when the text
 * carries no such prefix.
 */
export function parseFilenameFromText(
  text: string | undefined,
): string | undefined {
  if (!text) return undefined;
  const m = text.match(/Filename:\s*(.+?\.[A-Za-z0-9]+)(?:\s+Title:|\s*$)/i);
  return m ? m[1].trim() : undefined;
}

interface ToolCallFileInfo {
  filename?: string;
  sourceUrl?: string;
  pageNumber?: number;
  preview?: string;
}

/**
 * Builds a knowledgeId → file-info lookup from a message's tool calls.
 *
 * The committed `sources[]` is often denormalized — file sources carry an
 * internal storage path as their snippet and no filename, so the UI can't show
 * a file-type badge, page number, or Open Document button. The real data still
 * lives in the tool output: `search_knowledge.results[]` expose `filename`
 * directly, and `semantic_search.sourcesMetadata[]` embed it in the chunk text
 * ("Filename: …") plus a page number in the "page:title:knowledgeId" token.
 * Recover all of it here so it can be merged back onto the sources.
 */
function buildToolCallFileInfo(
  toolCalls?: Array<{ name?: string; output?: unknown }>,
): Map<string, ToolCallFileInfo> {
  const map = new Map<string, ToolCallFileInfo>();
  if (!toolCalls) return map;

  const set = (id: string | undefined, info: ToolCallFileInfo) => {
    if (!id) return;
    const existing = map.get(id) || {};
    map.set(id, {
      filename: existing.filename || info.filename,
      sourceUrl: existing.sourceUrl || info.sourceUrl,
      pageNumber: existing.pageNumber || info.pageNumber,
      preview: existing.preview || info.preview,
    });
  };

  for (const call of toolCalls) {
    const output = call.output as any;
    if (!output || typeof output !== "object") continue;

    // search_knowledge → results[] with a direct `filename`.
    if (Array.isArray(output.results)) {
      for (const r of output.results) {
        if (r && typeof r === "object") {
          set(r.id, {
            filename: typeof r.filename === "string" ? r.filename : undefined,
            sourceUrl:
              typeof r.sourceUrl === "string" ? r.sourceUrl : undefined,
          });
        }
      }
    }

    // semantic_search → sourcesMetadata[] with filename in `text` and a
    // "page:title:knowledgeId" token in `source`.
    if (Array.isArray(output.sourcesMetadata)) {
      for (const s of output.sourcesMetadata) {
        if (!s || typeof s !== "object") continue;
        const text = typeof s.text === "string" ? s.text : undefined;
        const token = typeof s.source === "string" ? s.source : undefined;
        const page =
          token && !/^https?:\/\//i.test(token) && token.includes(":")
            ? parseSourceString(token).pageNumber
            : undefined;
        const hasFilenamePrefix = !!text && /^\s*Filename:/i.test(text);
        set(s.knowledgeId || s.id, {
          filename: parseFilenameFromText(text),
          sourceUrl: typeof s.sourceUrl === "string" ? s.sourceUrl : undefined,
          pageNumber: page && page > 0 ? page : undefined,
          // Only keep genuine content as preview — skip "Filename: …" markers.
          preview: text && !hasFilenamePrefix ? text : undefined,
        });
      }
    }
  }

  return map;
}

/** True when a snippet is an internal storage path rather than real preview
 *  text — e.g. "workspaces/<id>/knowledge/pdf/<file>.pdf.pdf". */
function isStoragePathSnippet(snippet: string | undefined): boolean {
  if (!snippet) return false;
  return /^workspaces\//i.test(snippet) || /\/knowledge\//i.test(snippet);
}

/** Removes the redundant "Filename: <f> Title: <t>" prefix semantic chunks
 *  carry and drops internal storage paths, leaving only real preview text. */
function cleanSourceSnippet(
  snippet: string | undefined,
  title: string | undefined,
): string | undefined {
  if (!snippet) return snippet;
  if (isStoragePathSnippet(snippet)) return undefined;

  let text = stripHtml(snippet);
  if (/^\s*Filename:/i.test(text)) {
    text = text
      .replace(/^\s*Filename:\s*.+?\.[A-Za-z0-9]+\s*/i, "")
      .replace(/^\s*Title:\s*/i, "");
    if (title && text.startsWith(title)) {
      text = text.slice(title.length);
    }
    text = text.trim();
  }
  return text || undefined;
}

/**
 * Processes a loaded AgentMessage's sources for display.
 *
 * The backend commits a single, positionally-indexed `sources[]` per message —
 * every `[N]` marker in `content` maps to `sources[N-1]`. But that committed
 * array is denormalized: file sources lose their filename/page and carry a raw
 * storage path or a "Filename: …" marker as their snippet. This function
 * re-enriches each source from the message's tool output (see
 * `buildToolCallFileInfo`) so the UI can render the file-type badge, page
 * number, Open Document button, and a clean preview; it also strips HTML,
 * resolves the best URL, and normalizes `metadata.knowledgeId`.
 */
export function processLoadedMessageSources(message: {
  sources?: Source[];
  toolCalls?: Array<{
    name?: string;
    output?: unknown;
  }>;
}): Source[] {
  const sources = message.sources || [];
  const fileInfo = buildToolCallFileInfo(message.toolCalls);

  return sources.map((source) => {
    const knowledgeId = source.metadata?.knowledgeId || source.id;
    const info = fileInfo.get(knowledgeId) || fileInfo.get(source.id);

    // Recover the filename from tool output first, then from a "Filename: …"
    // snippet prefix — this drives the file-type badge and Open Document button.
    const filename =
      source.metadata?.filename ||
      info?.filename ||
      parseFilenameFromText(source.snippet);

    // Clean the snippet; when it was only a storage path / filename marker,
    // fall back to the real description recovered from semantic tool output.
    let snippet = cleanSourceSnippet(source.snippet, source.title);
    if (!snippet && info?.preview) {
      snippet = stripHtml(info.preview);
    }

    return {
      ...source,
      snippet,
      url: resolveSourceUrl(source) ?? source.url ?? info?.sourceUrl,
      metadata: {
        ...source.metadata,
        knowledgeId,
        ...(filename ? { filename } : {}),
        ...(!getSourcePageNumber(source) && info?.pageNumber
          ? { pageNumber: info.pageNumber }
          : {}),
      },
    };
  });
}

/**
 * Processes an array of loaded messages to merge all sources with toolCalls data.
 * Use this when loading a thread from the database.
 */
export function processLoadedMessages<
  T extends {
    sources?: Source[];
    toolCalls?: Array<{
      name?: string;
      output?: unknown;
    }>;
  },
>(messages: T[]): T[] {
  return messages.map((message) => ({
    ...message,
    sources: processLoadedMessageSources(message),
  }));
}
