import { useState } from "react";
import { SharelyProvider } from "@sharelyai/widget-services";
import { ChatPanel } from "@sharelyai/widget-ui-chat";
import { SearchPanel } from "@sharelyai/widget-ui-search";
import { BrowsePanel } from "@sharelyai/widget-ui-browse";
import {
  Button,
  ThemeProvider,
  GlobalStyle,
} from "@sharelyai/widget-ui-shared";

function CustomShell() {
  const [activeView, setActiveView] = useState("chat");

  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <h2>Custom Shell Demo</h2>
          <p>
            This demo shows how to create a custom shell using the modular
            components.
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              onClick={() => setActiveView("chat")}
              variant={activeView === "chat" ? "primary" : "outline"}
            >
              Chat
            </Button>
            <Button
              onClick={() => setActiveView("search")}
              variant={activeView === "search" ? "primary" : "outline"}
            >
              Search
            </Button>
            <Button
              onClick={() => setActiveView("browse")}
              variant={activeView === "browse" ? "primary" : "outline"}
            >
              Browse
            </Button>
          </div>

          <div
            style={{
              height: "500px",
              width: "800px",
              border: "1px solid #ccc",
              margin: "0 auto",
              display: "flex",
            }}
          >
            {activeView === "chat" && (
              <ChatPanel
                spaceId=""
                status="idle"
                isLoading={false}
                setStatus={() => {}}
              />
            )}
            {activeView === "search" && <SearchPanel />}
            {activeView === "browse" && <BrowsePanel />}
          </div>
        </div>
      </ThemeProvider>
    </SharelyProvider>
  );
}

export default CustomShell;
