import { ChatPanel } from "@sharelyai/widget-ui-chat";
import { SharelyProvider } from "@sharelyai/widget-services";
import { ThemeProvider, GlobalStyle } from "@sharelyai/widget-ui-shared";

function ChatOnly() {
  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <div style={{ padding: "20px" }}>
          <h2>Chat Only Demo</h2>
          <p>This demo shows only the ChatPanel component.</p>
          <div
            style={{
              height: "500px",
              width: "400px",
              border: "1px solid #ccc",
              margin: "20px auto",
            }}
          >
            <ChatPanel
              spaceId=""
              status="idle"
              isLoading={false}
              setStatus={() => {}}
            />
          </div>
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}

export default ChatOnly;
