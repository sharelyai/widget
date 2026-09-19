// The lexical endpoint only indexes `en` and `es` (see the Postgres
// `sharely_ts_config` function); every other `languageId` is rejected with a
// 400. The widget's `langKnowledge` accepts the full backend language list,
// so map it here and skip the lexical call when there is no matching index.

export type LexicalLanguage = "en" | "es";

/**
 * Returns the `languageId` to send to `/knowledge/query-lexical`, or `null`
 * when lexical search must be skipped for this language.
 *
 * No language (e.g. `searchAllLanguages`) falls back to `en`, which also
 * covers the chunks with no language in their metadata.
 */
export function toLexicalLanguage(
  langKnowledge?: string | null,
): LexicalLanguage | null {
  if (!langKnowledge) return "en";
  const base = langKnowledge.trim().toLowerCase().split(/[-_]/)[0];
  return base === "en" || base === "es" ? base : null;
}
