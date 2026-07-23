import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: React.ErrorInfo | null;
}

// Catches render/runtime errors in the routed page and shows the exact message
// + stack in place, instead of blanking the whole app. Reset on navigation by
// keying this boundary on the current route (see Layout).
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info });
    // Also log it so it shows up in the console with the full stack.
    console.error("[demo] page error:", error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h2 style={{ color: "#b42318", marginTop: 0 }}>
          This page threw an error
        </h2>
        <p style={{ color: "#475467" }}>
          The message and stack are below (also in the browser console).
        </p>
        <pre
          style={{
            background: "#fff5f5",
            border: "1px solid #fda29b",
            borderRadius: 8,
            padding: 16,
            fontSize: 13,
            color: "#7a271a",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {String(error?.stack || error?.message || error)}
          {info?.componentStack
            ? `\n\nComponent stack:${info.componentStack}`
            : ""}
        </pre>
      </div>
    );
  }
}

export default ErrorBoundary;
