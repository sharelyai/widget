import { useState } from "react";
import {
  useSpaceMessages,
  useSendMessage,
  SharelyProvider,
} from "@sharelyai/widget-services";
import {
  Button,
  Input,
  ThemeProvider,
  GlobalStyle,
} from "@sharelyai/widget-ui-shared";

function HeadlessDemo() {
  const [spaceId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [status, setStatus] = useState("idle");

  return (
    <SharelyProvider>
      <ThemeProvider>
        <GlobalStyle />
        <HeadlessDemoInner
          spaceId={spaceId}
          groupId={groupId}
          setGroupId={setGroupId}
          messageContent={messageContent}
          setMessageContent={setMessageContent}
          status={status}
          setStatus={setStatus}
        />
      </ThemeProvider>
    </SharelyProvider>
  );
}

interface HeadlessDemoInnerProps {
  spaceId: string;
  groupId: string;
  setGroupId: (id: string) => void;
  messageContent: string;
  setMessageContent: (content: string) => void;
  status: string;
  setStatus: (status: string) => void;
}

function HeadlessDemoInner({
  spaceId,
  groupId,
  setGroupId,
  messageContent,
  setMessageContent,
  status,
  setStatus,
}: HeadlessDemoInnerProps) {
  const { messages } = useSpaceMessages({
    spaceId,
    groupId,
    enabled: !!groupId,
  });
  const { sendMessageAction } = useSendMessage();

  const handleSendMessage = () => {
    sendMessageAction({
      message: messageContent,
      spaceId,
      currentGroupId: groupId,
      setCurrentGroupId: setGroupId,
      setMessage: setMessageContent,
      setStatusMessage: setStatus,
    });
    setMessageContent("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Headless Hooks Demo</h2>
      <p>
        This demo uses only the headless hooks from{" "}
        <code>@sharelyai/widget-services</code> to build a custom UI.
      </p>
      <div
        style={{
          height: "500px",
          width: "400px",
          border: "1px solid #ccc",
          margin: "20px auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          {messages.map((msg: any, index: number) => (
            <div
              key={index}
              style={{
                textAlign: msg.type === "USER" ? "right" : "left",
                margin: "5px 0",
              }}
            >
              <span
                style={{
                  background: msg.type === "USER" ? "#e0f7fa" : "#f0f0f0",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  display: "inline-block",
                }}
              >
                {msg.message}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px",
            borderTop: "1px solid #eee",
          }}
        >
          <Input
            value={messageContent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessageContent(e.target.value)
            }
            placeholder="Type a message..."
            disabled={status === "pending"}
          />
          <Button
            onClick={handleSendMessage}
            disabled={status === "pending" || !messageContent.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HeadlessDemo;
