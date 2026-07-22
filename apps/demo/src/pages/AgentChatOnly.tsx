import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";
import { AgentChatPanel } from "@sharelyai/widget-ui-agent-chat";

// Standalone @sharelyai/widget-ui-agent-chat: SSE-streamed agent responses with
// thinking steps, tool-call cards, and source citations. Like every feature
// package it needs SharelyProvider (data) + ThemeProvider (theme) around it.
function AgentChatOnly() {
  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ padding: "20px" }}>
          <h2>Agent Chat Only Demo</h2>
          <p>This demo shows only the AgentChatPanel component.</p>
          <div
            style={{
              height: "600px",
              width: "440px",
              border: "1px solid #ccc",
              margin: "20px auto",
            }}
          >
            {/* spaceId comes from your own flow; '' renders the empty state */}
            <AgentChatPanel
              spaceId=""
              botName="Sharely Agent"
              placeholder="Ask the agent…"
            />
          </div>
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}

export default AgentChatOnly;
