# `@sharelyai/widget-services`

The foundation layer: **API client + React hooks + Zustand store**. No UI. Use this
when you want Sharely's data layer but are building your own interface.

**Runnable:** [`/headless-demo`](../apps/demo/src/pages/HeadlessDemo.tsx) in the demo app.

## Minimal implementation

Wrap your app in `SharelyProvider`, then call hooks and read the store:

```tsx
import {
  SharelyProvider,
  useWorkspace,
  useGlobalStore,
} from "@sharelyai/widget-services";

function DataInspector() {
  const { isLoading } = useWorkspace(); // triggers a fetch → fills the store
  const { config, workspace } = useGlobalStore();

  if (isLoading) return <p>Loading…</p>;
  return <pre>{JSON.stringify({ config, workspace }, null, 2)}</pre>;
}

export default function App() {
  return (
    <SharelyProvider config={{ workspaceId: "YOUR_WORKSPACE_ID" }}>
      <DataInspector />
    </SharelyProvider>
  );
}
```

Building a custom chat UI with no Sharely components? Combine `useSpaceMessages`
and `useSendMessage` — that's exactly what the `/headless-demo` route does.

## Key APIs

| Import                                                           | Purpose                                                  |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `SharelyProvider`                                                | Provides the API client + config via React context       |
| `useGlobalStore`                                                 | Zustand store — config, token, current space, view state |
| `useWorkspace`, `useSpace`, `useSpaceMessages`, `useSendMessage` | Data hooks (React Query under the hood)                  |
| `createApiClient`                                                | Build the API client directly if you skip the provider   |

See [`../README.md`](../README.md#key-patterns) for the broader architecture.
