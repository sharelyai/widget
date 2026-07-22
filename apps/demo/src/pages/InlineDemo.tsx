import { WebControl } from "@sharelyai/widget";

function InlineDemo() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Inline Mode Demo</h2>
      <p>
        Uses <code>mode="placed-inline"</code>. The widget is embedded directly
        in the page flow, no floating launcher, no close button.
      </p>
      <div
        style={{
          height: "600px",
          width: "100%",
          maxWidth: "800px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          margin: "20px auto",
          overflow: "hidden",
        }}
      >
        <WebControl
          mode="placed-inline"
          displayMode={{
            OPEN_BY_DEFAULT: true,
            MODE: "PUBLIC",
            VIEWS: {
              CHAT: { SHOW: true },
              SEARCH: { SHOW: true, SHOW_TAGS: true },
              BROWSE: { SHOW: true },
            },
          }}
        />
      </div>
    </div>
  );
}

export default InlineDemo;
