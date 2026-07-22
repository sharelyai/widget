import { describe, it, expect } from "vitest";
import {
  parseSourceString,
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  stripHtml,
  processLoadedMessageSources,
  processLoadedMessages,
  isLikelyUrl,
  resolveSourceUrl,
  getSourcePageNumber,
  getSourceBlobType,
  getSourceFileLabel,
  isPdfSource,
  isPreviewOnlySource,
  extractSourcesFromSemanticSearch,
} from "./sourceParser";
import type { Source } from "../types/agent";

describe("parseSourceString", () => {
  it("parses standard pageNumber:filename:knowledgeId format", () => {
    const result = parseSourceString("3:report.pdf:abc-123");
    expect(result).toEqual({
      pageNumber: 3,
      filename: "report.pdf",
      knowledgeId: "abc-123",
    });
  });

  it("handles filename with colons", () => {
    const result = parseSourceString("0:file:with:colons.html:uuid-456");
    expect(result).toEqual({
      pageNumber: 1,
      filename: "file:with:colons.html",
      knowledgeId: "uuid-456",
    });
  });

  it("defaults pageNumber to 1 for non-numeric first part", () => {
    const result = parseSourceString("abc:file.pdf:uuid");
    expect(result.pageNumber).toBe(1);
  });
});

describe("transformRawSourcesToMap", () => {
  it("creates a map from raw source items", () => {
    const raw = [
      { text: "content1", source: "1:file1.pdf:id1" },
      { text: "content2", source: "2:file2.pdf:id2" },
    ];
    const map = transformRawSourcesToMap(raw);
    expect(map.size).toBe(2);
    expect(map.get("id1")).toEqual({
      pageNumber: 1,
      filename: "file1.pdf",
      text: "content1",
    });
  });
});

describe("mergeSourcesWithRawData", () => {
  it("merges sources with matching raw data", () => {
    const sources: Source[] = [
      { id: "id1", type: "knowledge", title: "Source 1" },
    ];
    const rawMap = new Map([
      ["id1", { pageNumber: 5, filename: "doc.pdf", text: "text" }],
    ]);
    const result = mergeSourcesWithRawData(sources, rawMap);
    expect(result[0].metadata).toEqual({
      pageNumber: 5,
      filename: "doc.pdf",
      knowledgeId: "id1",
    });
  });

  it("sets knowledgeId even when no raw data matches", () => {
    const sources: Source[] = [
      { id: "id2", type: "document", title: "Source 2" },
    ];
    const rawMap = new Map();
    const result = mergeSourcesWithRawData(sources, rawMap);
    expect(result[0].metadata).toEqual({ knowledgeId: "id2" });
  });
});

describe("stripHtml", () => {
  it("removes HTML tags and trims", () => {
    expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
  });

  it("truncates to 200 characters", () => {
    const long = "<p>" + "a".repeat(300) + "</p>";
    expect(stripHtml(long).length).toBe(200);
  });
});

describe("processLoadedMessageSources", () => {
  it("returns empty array when no sources", () => {
    expect(processLoadedMessageSources({})).toEqual([]);
  });

  it("sets knowledgeId when no toolCalls raw data", () => {
    const msg = {
      sources: [{ id: "s1", type: "knowledge" as const, title: "T" }],
    };
    const result = processLoadedMessageSources(msg);
    expect(result[0].metadata?.knowledgeId).toBe("s1");
  });
});

describe("processLoadedMessages", () => {
  it("processes an array of messages", () => {
    const messages = [
      {
        id: "1",
        sources: [{ id: "s1", type: "knowledge" as const, title: "T" }],
      },
    ];
    const result = processLoadedMessages(messages);
    expect(result[0].sources[0].metadata?.knowledgeId).toBe("s1");
  });
});

describe("isLikelyUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isLikelyUrl("http://example.com")).toBe(true);
    expect(isLikelyUrl("https://example.com/path?q=1")).toBe(true);
    expect(isLikelyUrl("  https://leading-space.io  ")).toBe(true);
  });

  it("rejects non-URL strings and non-strings", () => {
    expect(isLikelyUrl("ftp://example.com")).toBe(false);
    expect(isLikelyUrl("just some preview text")).toBe(false);
    expect(isLikelyUrl("")).toBe(false);
    expect(isLikelyUrl(undefined)).toBe(false);
    expect(isLikelyUrl(null)).toBe(false);
    expect(isLikelyUrl(123 as any)).toBe(false);
  });
});

describe("resolveSourceUrl", () => {
  it("prefers source.url over everything", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      url: "https://primary.com",
      snippet: "https://snippet.com",
      metadata: { sourceUrl: "https://meta.com", source: "https://other.com" },
    };
    expect(resolveSourceUrl(source)).toBe("https://primary.com");
  });

  it("falls through to metadata.sourceUrl when source.url is missing", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { sourceUrl: "https://meta.com", source: "https://other.com" },
    };
    expect(resolveSourceUrl(source)).toBe("https://meta.com");
  });

  it("falls through to metadata.source when sourceUrl is missing", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      snippet: "https://snippet.com",
      metadata: { source: "https://meta-source.com" },
    };
    expect(resolveSourceUrl(source)).toBe("https://meta-source.com");
  });

  it("uses snippet as the LAST resort, only when it is a URL", () => {
    const sourceWithUrlSnippet: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      snippet: "https://snippet.com",
    };
    expect(resolveSourceUrl(sourceWithUrlSnippet)).toBe("https://snippet.com");

    const sourceWithProseSnippet: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      snippet: "This is just preview text, not a URL.",
    };
    expect(resolveSourceUrl(sourceWithProseSnippet)).toBeUndefined();
  });

  it("ignores metadata.source when it is a chunked file token, not a URL", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { source: "0:report.pdf:abc-123" },
      snippet: "https://snippet-fallback.com",
    };
    expect(resolveSourceUrl(source)).toBe("https://snippet-fallback.com");
  });

  it("returns undefined for null/undefined source", () => {
    expect(resolveSourceUrl(undefined)).toBeUndefined();
    expect(resolveSourceUrl(null)).toBeUndefined();
  });
});

describe("processLoadedMessageSources pass-through", () => {
  it("strips HTML from snippet and resolves URL via priority chain", () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: "kid-1",
          type: "knowledge",
          title: "T",
          snippet: "<p>Some <b>preview</b></p>",
          metadata: { sourceUrl: "https://meta.example.com" },
        },
      ],
    });
    expect(result[0].snippet).toBe("Some preview");
    expect(result[0].url).toBe("https://meta.example.com");
    expect(result[0].metadata?.knowledgeId).toBe("kid-1");
  });

  it("preserves an existing source.url and does not invoke any merge logic", () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: "a",
          type: "knowledge",
          title: "A",
          url: "https://a.example.com",
        },
        {
          id: "b",
          type: "knowledge",
          title: "B",
          url: "https://b.example.com",
        },
      ],
      // toolCalls is now ignored — backend already merged sources
      toolCalls: [
        {
          name: "semantic_search",
          output: { sourcesMetadata: [{ id: "x", knowledgeId: "a" }] },
        },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe("https://a.example.com");
    expect(result[1].url).toBe("https://b.example.com");
  });

  it("snippet-as-URL still wins as the last-resort fallback", () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: "kid-1",
          type: "knowledge",
          title: "T",
          snippet: "https://snippet-only.com",
        },
      ],
    });
    expect(result[0].url).toBe("https://snippet-only.com");
  });

  // Regression: backend ships a single
  // positional sources[] array. All URLs must come through untouched.
  it("passes through the unified sources[] with URLs intact (positional)", () => {
    const result = processLoadedMessageSources({
      sources: [
        {
          id: "aaaa1111-bbbb-4222-8333-cccc44445555",
          type: "knowledge",
          title: "Workplace Safety Updates",
          url: "https://support.example.org/articles/workplace-safety-updates/",
          snippet: "The organization remains deeply committed...",
        },
        // Position 10 in the original payload — the [11] Field Staff Bulletin
        {
          id: "dddd6666-eeee-4777-8888-ffff99990000",
          type: "semantic",
          title: "Field Staff Bulletin",
          snippet:
            "Link: https://lead.example.org/bulletin/ Title: Field Staff Bulletin",
        },
      ],
    });
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe(
      "https://support.example.org/articles/workplace-safety-updates/",
    );
    // Bulletin entry has no url/sourceUrl and snippet is prose-with-URL — the
    // priority chain rejects "Link: …" snippets. URL stays undefined.
    expect(result[1].url).toBeUndefined();
    expect(result[0].title).toBe("Workplace Safety Updates");
    expect(result[1].title).toBe("Field Staff Bulletin");
  });
});

describe("extractSourcesFromSemanticSearch", () => {
  it("parses a chunked-file token into filename, page and knowledgeId", () => {
    const [source] = extractSourcesFromSemanticSearch([
      {
        id: "entry-1",
        score: 0.87,
        type: "Semantic",
        title: "Guía de Incorporación del Equipo",
        source: "7:Team-Onboarding-Guide-es.pdf:kb-123",
        text: "Filename: Team-Onboarding-Guide-es.pdf Title: Guía de Incorporación del Equipo Welcome overview, in-depth training classes.",
      },
    ]);

    expect(source.metadata?.filename).toBe(
      "Team-Onboarding-Guide-es.pdf",
    );
    expect(source.metadata?.pageNumber).toBe(7);
    expect(source.metadata?.knowledgeId).toBe("kb-123");
    // With a filename, the popover shows a PDF badge + Open Document button.
    expect(getSourceFileLabel(source)).toBe("PDF");
    expect(isPdfSource(source)).toBe(true);
    // Redundant "Filename: … Title: …" prefix stripped from the preview.
    expect(source.snippet?.startsWith("Welcome overview")).toBe(true);
  });

  it("leaves URL-based knowledge as a link, not a file", () => {
    const [source] = extractSourcesFromSemanticSearch([
      {
        id: "entry-2",
        type: "Semantic",
        title: "Some Article",
        source: "https://example.com/article",
        text: "Some preview content.",
      },
    ]);

    expect(source.url).toBe("https://example.com/article");
    expect(source.metadata?.filename).toBeUndefined();
    expect(source.metadata?.pageNumber).toBeUndefined();
    expect(source.snippet).toBe("Some preview content.");
  });

  it("leaves text-only chunks (no file token) untouched", () => {
    const [source] = extractSourcesFromSemanticSearch([
      {
        id: "entry-3",
        type: "Semantic",
        title: "Field Staff Bulletin",
        text: "A plain text chunk with no file metadata.",
      },
    ]);

    expect(source.metadata?.filename).toBeUndefined();
    expect(source.metadata?.knowledgeId).toBe("entry-3");
    expect(source.snippet).toBe("A plain text chunk with no file metadata.");
  });
});

describe("processLoadedMessageSources enrichment from toolCalls", () => {
  const toolCalls = [
    {
      name: "search_knowledge",
      output: {
        results: [
          {
            id: "bb22bb22",
            type: "FILE",
            title: "The Orientation Guide",
            content: "workspaces/w/knowledge/pdf/the-orientation-guide-x.pdf.pdf",
            filename: "The Orientation Guide.pdf",
            sourceUrl: null,
          },
        ],
      },
    },
    {
      name: "semantic_search",
      output: {
        sourcesMetadata: [
          {
            id: "m1",
            knowledgeId: "aa11aa11",
            source: "0:UNITS 1 AND 2 (CORE):aa11aa11",
            text: "UNITS 1 AND 2 (CORE) Study: Core Description: The unit offers encouragement.",
          },
          {
            id: "m2",
            knowledgeId: "cc33cc33",
            source: "0:Team Handbook (Core):cc33cc33",
            text: "Filename: Team-Handbook-course-470.txt Title: Team Handbook (Core)",
          },
        ],
      },
    },
  ];

  it("recovers filename + type badge + download for a FILE source whose snippet is a storage path", () => {
    const [source] = processLoadedMessageSources({
      sources: [
        {
          id: "bb22bb22",
          type: "knowledge",
          title: "The Orientation Guide",
          snippet: "workspaces/w/knowledge/pdf/the-orientation-guide-x.pdf.pdf",
        },
      ],
      toolCalls,
    });

    expect(source.metadata?.filename).toBe("The Orientation Guide.pdf");
    expect(getSourceFileLabel(source)).toBe("PDF");
    expect(isPdfSource(source)).toBe(true);
    // Storage-path snippet is dropped rather than shown as "preview".
    expect(source.snippet).toBeUndefined();
    expect(source.metadata?.knowledgeId).toBe("bb22bb22");
  });

  it("uses the semantic description as preview for a FILE source that has none", () => {
    const [source] = processLoadedMessageSources({
      sources: [
        {
          id: "aa11aa11",
          type: "knowledge",
          title: "UNITS 1 AND 2 (CORE)",
          snippet: "workspaces/w/knowledge/txt/units-1-and-2-x.txt.txt",
        },
      ],
      toolCalls,
    });

    expect(source.snippet?.startsWith("UNITS 1 AND 2 (CORE)")).toBe(true);
  });

  it("recovers filename from a 'Filename: …' snippet even without toolCalls", () => {
    const [source] = processLoadedMessageSources({
      sources: [
        {
          id: "cc33cc33",
          type: "semantic",
          title: "Team Handbook (Core)",
          snippet:
            "Filename: Team-Handbook-course-470.txt Title: Team Handbook (Core)",
        },
      ],
    });

    expect(source.metadata?.filename).toBe(
      "Team-Handbook-course-470.txt",
    );
    expect(getSourceFileLabel(source)).toBe("TXT");
    // The redundant "Filename: … Title: …" marker leaves no real preview text.
    expect(source.snippet).toBeUndefined();
  });
});

describe("getSourcePageNumber", () => {
  it("reads from new shape: metadata.loc.pageNumber", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { loc: { pageNumber: 9, lines: { from: 1, to: 18 } } } as any,
    };
    expect(getSourcePageNumber(source)).toBe(9);
  });

  it('falls back to flat-key metadata["loc.pageNumber"]', () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { "loc.pageNumber": 5 } as any,
    };
    expect(getSourcePageNumber(source)).toBe(5);
  });

  it("falls back to direct metadata.pageNumber", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { pageNumber: 3 },
    };
    expect(getSourcePageNumber(source)).toBe(3);
  });

  it("returns undefined when no page number field present", () => {
    const source: Source = { id: "1", type: "knowledge", title: "T" };
    expect(getSourcePageNumber(source)).toBeUndefined();
    expect(getSourcePageNumber(undefined)).toBeUndefined();
  });
});

describe("getSourceBlobType + isPdfSource", () => {
  it("reads metadata.blobType", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { blobType: "application/pdf" } as any,
    };
    expect(getSourceBlobType(source)).toBe("application/pdf");
    expect(isPdfSource(source)).toBe(true);
  });

  it("detects PDF via .pdf in title when blobType missing", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "My Manual_062025.pdf",
    };
    expect(isPdfSource(source)).toBe(true);
  });

  it("detects PDF via filename extension", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { filename: "doc.PDF" },
    };
    expect(isPdfSource(source)).toBe(true);
  });

  it("returns false for non-PDFs", () => {
    expect(isPdfSource({ id: "1", type: "knowledge", title: "Article" })).toBe(
      false,
    );
    expect(isPdfSource(undefined)).toBe(false);
  });
});

describe("getSourceFileLabel", () => {
  it("uses filename extension first", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      metadata: { filename: "doc.pdf" },
    };
    expect(getSourceFileLabel(source)).toBe("PDF");
  });

  it("falls back to title extension", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "Manual_062025.pdf",
    };
    expect(getSourceFileLabel(source)).toBe("PDF");
  });

  it("maps blobType to a friendly label when no extension is available", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "No ext title",
      metadata: { blobType: "application/pdf" } as any,
    };
    expect(getSourceFileLabel(source)).toBe("PDF");
  });

  it("returns null for URL-style sources without file metadata", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "Article About Things",
      url: "https://example.com/article",
    };
    expect(getSourceFileLabel(source)).toBeNull();
  });
});

describe("isPreviewOnlySource", () => {
  it("returns true for the Field Staff Bulletin shape: no url, no file, snippet describes content", () => {
    const source: Source = {
      id: "dddd6666",
      type: "semantic",
      title: "Field Staff Bulletin",
      snippet:
        "Link: https://lead.example.org/bulletin/ Title: Field Staff Bulletin",
      metadata: { loc: { lines: { from: 1, to: 1 } } } as any,
    };
    expect(isPreviewOnlySource(source)).toBe(true);
  });

  it("returns false when source has a URL", () => {
    const source: Source = {
      id: "1",
      type: "knowledge",
      title: "T",
      url: "https://example.com",
    };
    expect(isPreviewOnlySource(source)).toBe(false);
  });

  it("returns false when source has a file label (PDF blobType)", () => {
    const source: Source = {
      id: "1",
      type: "semantic",
      title: "Manual",
      metadata: { blobType: "application/pdf" } as any,
    };
    expect(isPreviewOnlySource(source)).toBe(false);
  });

  it("returns false when source has a .pdf-suffixed title", () => {
    const source: Source = { id: "1", type: "semantic", title: "Doc.pdf" };
    expect(isPreviewOnlySource(source)).toBe(false);
  });
});
