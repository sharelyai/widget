// Merges the three search calls (title, lexical, semantic) into the single list
// rendered by the search view.
//
// Items are deduplicated by knowledge `id`: a page appears once, in the
// earliest list that returned it (title → lexical → semantic). Each item is
// tagged with its `source` so the row can decide what to render (snippet for
// lexical hits, description + relevance score for semantic ones).

export type SearchResultSource = "title" | "lexical" | "semantic";

export interface MergeSearchResultsInput {
  title?: unknown;
  lexical?: unknown;
  semantic?: unknown;
}

// Some clients resolve non-2xx responses to their JSON body instead of
// throwing, so a call may hand us `{ code: "LEXICAL_SEARCH_DISABLED" }`
// rather than a list. Treat anything that is not an array as no results.
const asArray = (value: unknown): any[] =>
  Array.isArray(value) ? value : [];

const getKey = (item: any): string | undefined => {
  const id = item?.id ?? item?.coreKnowledge?.id;
  if (id != null) return `id:${id}`;
  // Legacy rows without an id fall back to the previous title-based dedupe.
  const title = item?.title ?? item?.metadata?.title;
  return title != null ? `title:${title}` : undefined;
};

export function mergeSearchResults(input: MergeSearchResultsInput): any[] {
  const seen = new Set<string>();
  const merged: any[] = [];

  const append = (items: unknown, source: SearchResultSource) => {
    for (const item of asArray(items)) {
      const key = getKey(item);
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      merged.push({ ...item, source });
    }
  };

  append(input.title, "title");
  append(input.lexical, "lexical");
  append(input.semantic, "semantic");

  return merged;
}
