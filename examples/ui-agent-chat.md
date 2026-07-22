# `@sharelyai/widget-ui-agent-chat`

The **agent chat feature**: SSE-streamed AI responses with thinking steps,
tool-call cards, and source citations.

**Runnable:** [`/agent-chat-only`](../apps/demo/src/pages/AgentChatOnly.tsx) in the demo app.

## Minimal implementation

Same two wraps as the other feature packages. `AgentChatPanel` requires only
`spaceId`; the streaming itself (via `useAgentChat` in services) is internal:

```tsx
import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";
import { AgentChatPanel } from "@sharelyai/widget-ui-agent-chat";

export default function App() {
  return (
    <SharelyProvider config={{ workspaceId: "YOUR_WORKSPACE_ID" }}>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ height: 600, width: 440 }}>
          {/* spaceId comes from your own flow; '' renders the empty state */}
          <AgentChatPanel
            spaceId=""
            botName="Sharely Agent"
            placeholder="Ask the agent…"
          />
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}
```

Optional props: `initialThreadId`, `disclaimer`, `emptyTitle`/`emptyDescription`,
`showHistory`, `showHeader`, and callbacks `onThreadChange` / `onSourceClick` /
`onFeedback`.

## Key APIs

| Import                         | From                              | Purpose                     |
| ------------------------------ | --------------------------------- | --------------------------- |
| `SharelyProvider`              | `@sharelyai/widget-services`      | API client + config         |
| `ThemeProvider`, `GlobalStyle` | `@sharelyai/widget-ui-shared`     | theme                       |
| `AgentChatPanel`               | `@sharelyai/widget-ui-agent-chat` | the streaming agent chat UI |

The package also exports smaller building blocks (`StreamingContent`,
`ThinkingIndicator`, `ToolCallCard`, `SourcesList`, `CitationRenderer`, …) if you
want to compose your own agent UI instead of the full panel.
