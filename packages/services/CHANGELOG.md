# @sharelyai/widget-services

## 0.1.0

### Minor Changes

- Add lexical (content keyword) search to the search view. `SearchPanel` now runs a third call, `POST /workspaces/:id/knowledge/query-lexical`, alongside the title and semantic searches and merges the three lists once — title, then lexical, then semantic — deduplicated by knowledge `id` and tagged with `source`. Lexical hits render the stored title and a `<mark>`-highlighted snippet (new `Snippet` component; the string is split into text segments, never injected as HTML) and hide the relevance score, which only applies to semantic results. Workspaces without the feature answer 404 and fall back to today's title + semantic list; any other lexical failure is also swallowed so it never blanks the results.

  New config flag `lexicalSearch` (default `true`) disables the call per embed. New helpers in `@sharelyai/widget-services`: `mergeSearchResults`, `snippetToSegments` / `sanitizeSnippet`, and `toLexicalLanguage` (the index only covers `en`/`es`; other knowledge languages skip the lexical call).

  The remaining packages are bumped only to keep the linked `@sharelyai/widget-*` set on one version.

## 0.0.2

### Patch Changes

- Recover the agent answer when the SSE stream ends without a "done" event.

  A dropped stream tail used to commit an empty message as if it had
  succeeded, rendering a blank "Completed N steps" chip with no error and no
  retry. The client now re-fetches the thread and renders the persisted
  answer, and only reports an error -- with a working retry -- when the
  answer genuinely is not there.
