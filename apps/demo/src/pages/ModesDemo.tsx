import { useState } from "react";
import { WebControl } from "@sharelyai/widget";

const MODES = [
  {
    value: "top-center-floating",
    label: "Top Center Floating",
    description: "Fixed at top-center of viewport",
  },
  {
    value: "bottom-center-floating",
    label: "Bottom Center Floating",
    description: "Fixed at bottom-center of viewport",
  },
  {
    value: "bottom-right-floating",
    label: "Bottom Right Floating",
    description: "Fixed at bottom-right of viewport",
  },
  {
    value: "placed-floating",
    label: "Placed Floating",
    description: "Appears in page flow, opens as centered modal",
  },
  {
    value: "placed-inline",
    label: "Placed Inline",
    description: "Embedded inline in a container",
  },
];

function ModesDemo() {
  const [activeMode, setActiveMode] = useState("top-center-floating");
  const [avatarMode, setAvatarMode] = useState("expanded");
  const [key, setKey] = useState(0);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setKey((k) => k + 1); // Force remount to reset state
  };

  const handleAvatarChange = (avatar: string) => {
    setAvatarMode(avatar);
    setKey((k) => k + 1);
  };

  const isInline = activeMode === "placed-inline";

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Position Modes Demo</h2>
      <p>
        Select a position mode to see how the widget renders. Click the launcher
        to open.
      </p>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {MODES.map((m) => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border:
                activeMode === m.value ? "2px solid #4443C7" : "1px solid #ccc",
              background: activeMode === m.value ? "#F4F3FF" : "#fff",
              cursor: "pointer",
              fontWeight: activeMode === m.value ? 600 : 400,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <span style={{ lineHeight: "36px", fontWeight: 600 }}>Avatar:</span>
        <button
          onClick={() => handleAvatarChange("expanded")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border:
              avatarMode === "expanded"
                ? "2px solid #4443C7"
                : "1px solid #ccc",
            background: avatarMode === "expanded" ? "#F4F3FF" : "#fff",
            cursor: "pointer",
          }}
        >
          Expanded (pill)
        </button>
        <button
          onClick={() => handleAvatarChange("circle")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border:
              avatarMode === "circle" ? "2px solid #4443C7" : "1px solid #ccc",
            background: avatarMode === "circle" ? "#F4F3FF" : "#fff",
            cursor: "pointer",
          }}
        >
          Compact (circle)
        </button>
      </div>

      <div
        style={{
          padding: "12px",
          background: "#f9f9f9",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "14px",
        }}
      >
        <strong>Active:</strong> <code>{activeMode}</code>
        {" — "}
        {MODES.find((m) => m.value === activeMode)?.description}
        {avatarMode === "circle" && " | Avatar: compact circle"}
      </div>

      {isInline ? (
        <div
          style={{
            height: "600px",
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <WebControl
            key={key}
            mode={activeMode}
            avatarmodeDesktop={avatarMode}
            avatarmodeMobile={avatarMode}
            displayMode={{
              OPEN_BY_DEFAULT: true,
              MODE: "PUBLIC",
              VIEWS: {
                CHAT: { SHOW: true },
                SEARCH: { SHOW: true },
                BROWSE: { SHOW: true },
              },
            }}
          />
        </div>
      ) : (
        <WebControl
          key={key}
          mode={activeMode}
          avatarmodeDesktop={avatarMode}
          avatarmodeMobile={avatarMode}
        />
      )}
    </div>
  );
}

export default ModesDemo;
