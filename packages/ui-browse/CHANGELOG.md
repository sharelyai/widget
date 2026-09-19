# @sharelyai/widget-ui-browse

## 0.1.0

### Minor Changes

- Add lexical (content keyword) search to the search view. `SearchPanel` now runs a third call, `POST /workspaces/:id/knowledge/query-lexical`, alongside the title and semantic searches and merges the three lists once — title, then lexical, then semantic — deduplicated by knowledge `id` and tagged with `source`. Lexical hits render the stored title and a `<mark>`-highlighted snippet (new `Snippet` component; the string is split into text segments, never injected as HTML) and hide the relevance score, which only applies to semantic results. Workspaces without the feature answer 404 and fall back to today's title + semantic list; any other lexical failure is also swallowed so it never blanks the results.

  New config flag `lexicalSearch` (default `true`) disables the call per embed. New helpers in `@sharelyai/widget-services`: `mergeSearchResults`, `snippetToSegments` / `sanitizeSnippet`, and `toLexicalLanguage` (the index only covers `en`/`es`; other knowledge languages skip the lexical call).

  The remaining packages are bumped only to keep the linked `@sharelyai/widget-*` set on one version.

### Patch Changes

- Updated dependencies
  - @sharelyai/widget-services@0.1.0
  - @sharelyai/widget-ui-search@0.1.0
  - @sharelyai/widget-ui-shared@0.1.0

## 0.0.2

### Patch Changes

- Updated dependencies
  - @sharelyai/widget-services@0.0.2
  - @sharelyai/widget-ui-search@0.0.2
  - @sharelyai/widget-ui-shared@0.0.2
