# `@sharelyai/widget-ui-search`

The **search feature** — `SearchPanel`, results, tag filtering.

**Runnable:** [`/search-only`](../apps/demo/src/pages/SearchOnly.tsx) in the demo app.

## Minimal implementation

Same two wraps as the other feature packages. `SearchPanel` takes no props — it
reads everything from context/store:

```tsx
import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";
import { SearchPanel } from "@sharelyai/widget-ui-search";

export default function App() {
  return (
    <SharelyProvider config={{ workspaceId: "YOUR_WORKSPACE_ID" }}>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ minHeight: 520 }}>
          <SearchPanel />
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}
```

## Key APIs

| Import                         | From                          | Purpose               |
| ------------------------------ | ----------------------------- | --------------------- |
| `SharelyProvider`              | `@sharelyai/widget-services`  | API client + config   |
| `ThemeProvider`, `GlobalStyle` | `@sharelyai/widget-ui-shared` | theme                 |
| `SearchPanel`                  | `@sharelyai/widget-ui-search` | the search feature UI |
