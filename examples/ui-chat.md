# `@sharelyai/widget-ui-chat`

The standard **chat feature** — `ChatPanel`, message bubbles, workflow
progress.

**Runnable:** [`/chat-only`](../apps/demo/src/pages/ChatOnly.tsx) in the demo app.

## Minimal implementation

A feature panel needs the two standard wraps — `SharelyProvider` (data) then
`ThemeProvider` (theme):

```tsx
import { useState } from "react";
import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";
import { ChatPanel } from "@sharelyai/widget-ui-chat";

export default function App() {
  const [status, setStatus] = useState("idle");

  return (
    <SharelyProvider config={{ workspaceId: "YOUR_WORKSPACE_ID" }}>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ height: 560, width: 420 }}>
          {/* spaceId comes from your own flow; '' renders the empty state */}
          <ChatPanel
            spaceId=""
            status={status}
            isLoading={status === "pending"}
            setStatus={setStatus}
          />
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}
```

## Key APIs

| Import                         | From                          | Purpose             |
| ------------------------------ | ----------------------------- | ------------------- |
| `SharelyProvider`              | `@sharelyai/widget-services`  | API client + config |
| `ThemeProvider`, `GlobalStyle` | `@sharelyai/widget-ui-shared` | theme               |
| `ChatPanel`                    | `@sharelyai/widget-ui-chat`   | the chat feature UI |
