import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";

// --- Design tokens ---
const T = {
  primary: "#4443C7",
  foreground: "#1E2B3A",
  muted: "#6B7B8F",
  border: "#E0E7EF",
  surface: "#FFFFFF",
  gray50: "#F8FAFC",
};

// --- Inline SVG icons (16×16, strokeWidth 1.8) ---
const svgBase = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Icons = {
  layers: (
    <svg {...svgBase}>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  ),
  messageCircle: (
    <svg {...svgBase}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  search: (
    <svg {...svgBase}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  folderOpen: (
    <svg {...svgBase}>
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  bot: (
    <svg {...svgBase}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  ),
  palette: (
    <svg {...svgBase}>
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  code: (
    <svg {...svgBase}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

type IconName = keyof typeof Icons;

function SharelyMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle cx="16" cy="16" r="16" fill="#FAEDFF" />
      <path
        d="M23.9297 23.7663C23.9297 25.1394 22.2848 25.8187 21.3385 24.8362L16.0942 19.3909L10.7235 14.0737C9.75451 13.1144 10.4244 11.4466 11.7788 11.4466L22.4192 11.4466C23.2534 11.4466 23.9297 12.1322 23.9297 12.978L23.9297 23.7663Z"
        fill="#CB47FF"
      />
      <path
        d="M8 8.80599C8 7.43283 9.64494 6.75361 10.5911 7.73607L15.8355 13.1814L21.2062 18.4985C22.1752 19.4579 21.5053 21.1257 20.1509 21.1257H9.51045C8.67625 21.1257 8 20.44 8 19.5942V8.80599Z"
        fill="#4443C7"
      />
    </svg>
  );
}

const DEV_ITEMS: { to: string; label: string; icon: IconName }[] = [
  { to: "/custom-shell", label: "Custom shell", icon: "layers" },
  { to: "/chat-only", label: "Chat panel", icon: "messageCircle" },
  { to: "/search-only", label: "Search panel", icon: "search" },
  { to: "/browse-only", label: "Browse panel", icon: "folderOpen" },
  { to: "/agent-chat-only", label: "Agent chat", icon: "bot" },
  { to: "/ui-shared", label: "UI shared (theme)", icon: "palette" },
  { to: "/headless-demo", label: "Headless hooks", icon: "code" },
];

function DevDocsDropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isDevRoute = DEV_ITEMS.some((it) => location.pathname === it.to);

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close dropdown on route change
  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          border: `1px solid ${isDevRoute ? T.primary : T.border}`,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          color: isDevRoute ? T.primary : T.muted,
          background: isDevRoute ? "rgba(68, 67, 199, 0.08)" : "transparent",
          transition: "all 150ms",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            width: 16,
            height: 16,
          }}
        >
          {Icons.code}
        </span>
        Developer docs
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 200ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            marginLeft: 2,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 6,
            minWidth: 200,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
            zIndex: 100,
          }}
        >
          {DEV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? T.primary : T.foreground,
                  background: isActive
                    ? "rgba(68, 67, 199, 0.08)"
                    : "transparent",
                  transition: "background 120ms",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background =
                      T.gray50;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: 16,
                    height: 16,
                    color: isActive ? T.primary : T.muted,
                  }}
                >
                  {Icons[item.icon]}
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const isDevRoute = DEV_ITEMS.some((it) => location.pathname === it.to);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 56,
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          flexShrink: 0,
        }}
      >
        {/* Left: logo + back to playground */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <NavLink
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <SharelyMark size={32} />
            <span
              style={{ fontWeight: 700, fontSize: 14, color: T.foreground }}
            >
              Sharely WebControl
            </span>
          </NavLink>

          {isDevRoute && (
            <NavLink
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                color: T.muted,
                textDecoration: "none",
                border: `1px solid ${T.border}`,
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.primary;
                e.currentTarget.style.borderColor = T.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.muted;
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Playground
            </NavLink>
          )}
        </div>

        {/* Right: dev docs dropdown */}
        <DevDocsDropdown />
      </header>

      {/* Content */}
      <main style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
