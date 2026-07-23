// Client-side sorting for search results and browse listings.
//
// Sorting is applied in the widget over the in-memory result set (search is
// capped at topK; browse loads a category's resources at once), so no backend
// support is required. When a workspace does not enable sort, callers simply
// skip this helper and render the native API order.

export type SortKey =
  "relevance" | "title-asc" | "title-desc" | "date-desc" | "date-asc";

export interface SortOption {
  key: SortKey;
  /** i18n key resolved by the consumer via `t()`. */
  labelKey: string;
}

// Search has a relevance score; browse does not.
export const SEARCH_SORT_OPTIONS: SortOption[] = [
  { key: "relevance", labelKey: "SortRelevance" },
  { key: "title-asc", labelKey: "SortTitleAsc" },
  { key: "title-desc", labelKey: "SortTitleDesc" },
  { key: "date-desc", labelKey: "SortNewest" },
  { key: "date-asc", labelKey: "SortOldest" },
];

export const BROWSE_SORT_OPTIONS: SortOption[] = [
  { key: "title-asc", labelKey: "SortTitleAsc" },
  { key: "title-desc", labelKey: "SortTitleDesc" },
  { key: "date-desc", labelKey: "SortNewest" },
  { key: "date-asc", labelKey: "SortOldest" },
];

export const SEARCH_DEFAULT_SORT: SortKey = "relevance";
export const BROWSE_DEFAULT_SORT: SortKey = "title-asc";

const getTitle = (item: any): string =>
  (item?.title ?? item?.metadata?.title ?? item?.newTitle ?? "").toString();

// Result shapes are untyped; read `createdAt` defensively across known paths.
// `revisionDate` is intentionally not handled yet — it is not synced into the
// metadata import. Add a "revision" option + path here once it is available.
const getCreatedAt = (item: any): number => {
  const raw =
    item?.createdAt ??
    item?.coreKnowledge?.createdAt ??
    item?.metadata?.createdAt;
  const time = raw ? new Date(raw).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

/**
 * Returns a new, sorted array (never mutates the input). `relevance` preserves
 * the native API order — the backend already returns results in relevance
 * order, so re-ranking by raw score could disturb intentional ordering.
 */
export function sortResults<T>(items: T[], key: SortKey): T[] {
  if (!Array.isArray(items)) return items;
  if (key === "relevance") return items;

  const sorted = [...items];
  switch (key) {
    case "title-asc":
      return sorted.sort((a, b) =>
        getTitle(a).localeCompare(getTitle(b), undefined, {
          sensitivity: "base",
        }),
      );
    case "title-desc":
      return sorted.sort((a, b) =>
        getTitle(b).localeCompare(getTitle(a), undefined, {
          sensitivity: "base",
        }),
      );
    case "date-desc":
      return sorted.sort((a, b) => getCreatedAt(b) - getCreatedAt(a));
    case "date-asc":
      return sorted.sort((a, b) => getCreatedAt(a) - getCreatedAt(b));
    default:
      return items;
  }
}
