import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import { defaultTheme } from "@sharelyai/widget-ui-shared";
import { WebControl } from "@sharelyai/widget";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------
const ENV_WORKSPACE_ID = import.meta.env.VITE_WORKSPACE_ID || "";
const ENV_BASE_URL =
  import.meta.env.VITE_API_DEFAULT_URL || "https://api.sharely.ai";

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const T = {
  primary: "#4443C7",
  foreground: "#1E2B3A",
  muted: "#6B7B8F",
  border: "#E0E7EF",
  surface: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  success: "#10B981",
  error: "#EF4444",
  // Primary alpha variants
  primaryBg: "rgba(68, 67, 199, 0.08)",
  primaryBgHover: "rgba(68, 67, 199, 0.14)",
  primaryBgSubtle: "rgba(68, 67, 199, 0.04)",
  primaryBgActive: "rgba(68, 67, 199, 0.06)",
  primaryBorder: "rgba(68, 67, 199, 0.25)",
  primaryBorderHover: "rgba(68, 67, 199, 0.3)",
  primaryDark: "#3730A3",
  successBg: "rgba(16, 185, 129, 0.08)",
};

// ---------------------------------------------------------------------------
// Inline SVG icons
// ---------------------------------------------------------------------------
const svgBase = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const IconCode = () => (
  <svg {...svgBase} width={16} height={16}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
const IconX = () => (
  <svg {...svgBase} width={18} height={18}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const IconCheck = () => (
  <svg
    {...svgBase}
    width={11}
    height={8}
    viewBox="0 0 11 8"
    stroke="#fff"
    strokeWidth={1.8}
  >
    <path d="M1 3.5L4 6.5L10 1" />
  </svg>
);

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
const THEME_COLORS = [
  { value: "#A217D8", label: "Purple" },
  { value: "#4443C7", label: "Indigo" },
  { value: "#2563EB", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#EA580C", label: "Orange" },
  { value: "#1E2B3A", label: "Dark" },
];

const FLOATING_MODES = [
  { value: "top-center-floating", label: "Top center" },
  { value: "bottom-center-floating", label: "Bottom center" },
  { value: "bottom-right-floating", label: "Bottom right" },
  { value: "placed-floating", label: "Modal" },
];

const PRIVACY = [
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

const LANGS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "pt", label: "Portuguese" },
  { value: "pt-br", label: "Portuguese (Brazil)" },
  { value: "de", label: "German" },
  { value: "pl", label: "Polish" },
  { value: "zh-hans", label: "Chinese (Simplified)" },
  { value: "zh-hant", label: "Chinese (Traditional)" },
];

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------
type Views = {
  chat: boolean;
  search: boolean;
  searchTags: boolean;
  browse: boolean;
  agent: boolean;
};

type State = {
  workspaceId: string;
  baseUrl: string;
  mode: string;
  avatar: string;
  justChat: boolean;
  closedText: string;
  lang: string;
  openByDefault: boolean;
  privacy: string;
  views: Views;
  width: string;
  height: string;
  zIndex: string;
  themePrimary: string;
  themeSecondary: string;
};

const DEFAULTS: State = {
  workspaceId: ENV_WORKSPACE_ID,
  baseUrl: ENV_BASE_URL,
  mode: "top-center-floating",
  avatar: "expanded",
  justChat: false,
  closedText: "",
  lang: "en",
  openByDefault: false,
  privacy: "PUBLIC",
  views: {
    chat: true,
    search: false,
    searchTags: false,
    browse: false,
    agent: false,
  },
  width: "",
  height: "",
  zIndex: "",
  themePrimary: defaultTheme.colors.primary,
  themeSecondary: defaultTheme.colors.secondary,
};

const STORAGE_KEY = "sharely-playground-config";

function loadStored(): State | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...DEFAULTS,
      ...parsed,
      views: { ...DEFAULTS.views, ...(parsed.views ?? {}) },
    };
  } catch {
    return null;
  }
}

const PRESETS: { label: string; hint: string; state: Partial<State> }[] = [
  {
    label: "Floating",
    hint: "Chat button",
    state: {},
  },
  {
    label: "Inline",
    hint: "Full page",
    state: {
      mode: "placed-inline",
      openByDefault: true,
      views: {
        chat: true,
        search: true,
        searchTags: true,
        browse: true,
        agent: false,
      },
    },
  },
  {
    label: "Agent",
    hint: "AI assistant",
    state: {
      mode: "bottom-right-floating",
      openByDefault: true,
      views: {
        chat: false,
        search: false,
        searchTags: false,
        browse: false,
        agent: true,
      },
    },
  },
  {
    label: "Everything",
    hint: "Everything on",
    state: {
      mode: "bottom-right-floating",
      openByDefault: true,
      views: {
        chat: true,
        search: true,
        searchTags: true,
        browse: true,
        agent: true,
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
function useDebouncedState(initial: State, delay = 400) {
  const [live, setLive] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const update = useCallback(
    (next: State) => {
      setLive(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDebounced(next), delay);
    },
    [delay],
  );

  const applyNow = useCallback((next: State) => {
    setLive(next);
    setDebounced(next);
    clearTimeout(timer.current);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { live, debounced, update, applyNow };
}

// ---------------------------------------------------------------------------
// UI primitives — all text min 14px
// ---------------------------------------------------------------------------
const transitionSmooth =
  "color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms, opacity 150ms";

const inputBase: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  fontSize: 14,
  color: T.foreground,
  background: T.surface,
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms",
  fontFamily: "inherit",
};
const focusRing: React.CSSProperties = {
  borderColor: T.primary,
  boxShadow: `0 0 0 3px ${T.primaryBg}`,
};

function Input({
  id,
  value,
  onChange,
  placeholder,
  style: extra,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}) {
  const [f, setF] = useState(false);
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{ ...inputBase, ...(f ? focusRing : {}), ...extra }}
    />
  );
}

function Select({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value);

  const close = () => {
    setOpen(false);
    btnRef.current?.blur();
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} id={id} style={{ position: "relative" }}>
      <button
        ref={btnRef}
        onClick={() => (open ? close() : setOpen(true))}
        style={{
          ...inputBase,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          borderColor: open ? T.primary : T.border,
          boxShadow: open ? `0 0 0 3px ${T.primaryBg}` : "none",
        }}
      >
        <span>{selected?.label ?? ""}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: "transform 200ms",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 4,
            zIndex: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {options.map((o) => {
            const isActive = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  close();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 12px",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  textAlign: "left",
                  color: isActive ? T.primary : T.foreground,
                  background: isActive ? T.primaryBg : "transparent",
                  cursor: "pointer",
                  transition: "background 120ms",
                  fontFamily: "inherit",
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
                {isActive && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={T.primary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {!isActive && <span style={{ width: 14, flexShrink: 0 }} />}
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  id?: string;
}) {
  const [h, setH] = useState(false);
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 14,
        color: T.foreground,
        cursor: "pointer",
        padding: "5px 0",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          flexShrink: 0,
          border: `1.5px solid ${checked ? T.primary : T.border}`,
          background: checked ? T.primary : h ? T.gray50 : T.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: transitionSmooth,
        }}
      >
        {checked && <IconCheck />}
      </span>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      {label}
    </label>
  );
}

function ThemeSwatch({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      title={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        cursor: "pointer",
        background: color,
        border: `2px solid ${
          active ? T.foreground : h ? "rgba(0,0,0,0.15)" : "transparent"
        }`,
        outline: active ? `2px solid ${T.surface}` : "none",
        outlineOffset: -4,
        transition: transitionSmooth,
        position: "relative",
      }}
    >
      {active && (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.surface}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

function CustomColorSwatch({
  value,
  isCustom,
  onChange,
  id,
}: {
  value: string;
  isCustom: boolean;
  onChange: (v: string) => void;
  id: string;
}) {
  const [h, setH] = useState(false);
  return (
    <label
      htmlFor={id}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        cursor: "pointer",
        background: isCustom ? value : T.gray50,
        border: `2px solid ${
          isCustom ? T.foreground : h ? "rgba(0,0,0,0.15)" : T.border
        }`,
        outline: isCustom ? `2px solid ${T.surface}` : "none",
        outlineOffset: -4,
        transition: transitionSmooth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <input
        type="color"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          position: "absolute",
          opacity: 0,
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
      />
      {!isCustom && (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
      {isCustom && (
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.surface}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "none" }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </label>
  );
}

function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: T.muted,
          width: 72,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

const CategoryIcons = {
  widget: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  behavior: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="1" x2="7" y1="14" y2="14" />
      <line x1="9" x2="15" y1="8" y2="8" />
      <line x1="17" x2="23" y1="16" y2="16" />
    </svg>
  ),
  connection: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  layout: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
  ),
};

type CategoryIconName = keyof typeof CategoryIcons;

function SettingsCard({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: CategoryIconName;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [h, setH] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 24px",
          border: "none",
          background: h ? T.gray50 : "transparent",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: T.foreground,
          transition: "background 150ms",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            color: T.muted,
            flexShrink: 0,
          }}
        >
          {CategoryIcons[icon]}
        </span>
        <span style={{ flex: 1, textAlign: "left" }}>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 200ms",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            color: T.muted,
            flexShrink: 0,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div style={{ padding: "12px 24px 20px" }}>{children}</div>}
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [h, setH] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 24px",
          border: "none",
          borderTop: `1px solid ${T.border}`,
          background: h ? T.gray50 : "transparent",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          color: T.foreground,
          transition: "background 150ms",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span style={{ flex: 1, textAlign: "left" }}>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "transform 200ms",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            color: T.muted,
            flexShrink: 0,
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Code modal
// ---------------------------------------------------------------------------
function CodeModal({
  tabs,
  onClose,
}: {
  tabs: { id: string; label: string; code: string }[];
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [copied, setCopied] = useState(false);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  const handleCopy = () => {
    navigator.clipboard?.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          background: T.surface,
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 48px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 600, color: T.foreground }}>
            Export code
          </span>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: T.muted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.gray50;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconX />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: `1px solid ${T.border}`,
            background: T.gray50,
            padding: "0 20px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCopied(false);
              }}
              style={{
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: tab.id === activeTab ? 600 : 400,
                color: tab.id === activeTab ? T.primary : T.muted,
                background: "transparent",
                border: "none",
                borderBottom:
                  tab.id === activeTab
                    ? `2px solid ${T.primary}`
                    : "2px solid transparent",
                cursor: "pointer",
                transition: "color 150ms",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={handleCopy}
            style={{
              padding: "6px 14px",
              fontSize: 14,
              fontWeight: 500,
              color: copied ? T.success : T.primary,
              background: copied ? T.successBg : T.primaryBg,
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: transitionSmooth,
            }}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <pre
            style={{
              margin: 0,
              padding: 20,
              fontSize: 14,
              lineHeight: 1.6,
              color: T.foreground,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {active.code}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Connection status
// ---------------------------------------------------------------------------
function ConnectionStatus({
  workspaceId,
  onChange,
  inputId,
}: {
  workspaceId: string;
  onChange: (v: string) => void;
  inputId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [h, setH] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const connected = workspaceId.trim().length > 0;

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <div
        style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: T.muted,
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Workspace ID
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            id={inputId}
            value={workspaceId}
            onChange={(e) => onChange(e.target.value)}
            placeholder="your-workspace-id"
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditing(false);
            }}
            style={{
              ...inputBase,
              flex: 1,
              borderColor: T.primary,
              boxShadow: `0 0 0 3px ${T.primaryBg}`,
            }}
          />
          <button
            onClick={() => setEditing(false)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: T.surface,
              background: T.primary,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.primary;
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div
        style={{
          padding: "12px 24px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setEditing(true)}
          onMouseEnter={() => setH(true)}
          onMouseLeave={() => setH(false)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            border: `1.5px dashed ${h ? T.primary : T.border}`,
            borderRadius: 10,
            background: h ? T.primaryBgSubtle : T.gray50,
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#F59E0B",
              flexShrink: 0,
            }}
          />
          <span style={{ flex: 1, textAlign: "left" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: T.foreground,
                display: "block",
              }}
            >
              Not connected
            </span>
            <span style={{ fontSize: 13, color: T.muted }}>
              Add workspace ID to preview
            </span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke={T.muted}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "10px 24px",
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setEditing(true)}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          border: "none",
          borderRadius: 8,
          background: h ? T.gray50 : "transparent",
          cursor: "pointer",
          transition: "background 150ms",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: T.success,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: T.muted,
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Connected · <span style={{ color: T.foreground }}>{workspaceId}</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.muted}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------
export default function Playground() {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const {
    live: s,
    debounced: applied,
    update,
    applyNow,
  } = useDebouncedState(loadStored() ?? DEFAULTS);
  const [showCode, setShowCode] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const lastFloatingMode = useRef(
    s.mode !== "placed-inline" ? s.mode : "top-center-floating",
  );

  const set = <K extends keyof State>(key: K, value: State[K]) => {
    let next = { ...s, [key]: value };
    if (key === "mode") {
      const goingInline = value === "placed-inline";
      const wasInline = s.mode === "placed-inline";
      // Remember last floating position
      if (goingInline && !wasInline) {
        lastFloatingMode.current = s.mode;
      }
      if (goingInline !== wasInline) {
        next = { ...next, openByDefault: goingInline };
      }
    }
    if (
      typeof value === "string" &&
      [
        "workspaceId",
        "baseUrl",
        "closedText",
        "width",
        "height",
        "zIndex",
      ].includes(key)
    ) {
      update(next);
    } else {
      applyNow(next);
    }
  };

  const setView = <K extends keyof Views>(key: K, value: boolean) => {
    applyNow({ ...s, views: { ...s.views, [key]: value } });
  };

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(null), 2000);
  };

  const applyPreset = (partial: Partial<State>) => {
    applyNow({
      ...DEFAULTS,
      ...partial,
      workspaceId: s.workspaceId,
      baseUrl: s.baseUrl,
    });
  };

  const resetConfig = () => {
    applyNow(DEFAULTS);
    flash("Reset to defaults");
  };
  const saveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      flash("Saved");
    } catch {
      flash("Save failed");
    }
  };
  const removeConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      flash("Removed");
    } catch {
      flash("Remove failed");
    }
  };

  // Derived
  const isFloating = applied.mode !== "placed-inline";
  const isInline = !isFloating;
  const multipleViews =
    [s.views.chat, s.views.search, s.views.browse, s.views.agent].filter(
      Boolean,
    ).length > 1;

  const displayMode = useMemo(
    () => ({
      OPEN_BY_DEFAULT: applied.openByDefault,
      MODE: applied.privacy,
      ...(applied.width ? { WIDTH: applied.width } : {}),
      ...(applied.height ? { HEIGHT: applied.height } : {}),
      ...(applied.zIndex ? { Z_INDEX: applied.zIndex } : {}),
      VIEWS: {
        CHAT: { SHOW: applied.views.chat },
        SEARCH: {
          SHOW: applied.views.search,
          SHOW_TAGS: applied.views.searchTags,
        },
        BROWSE: { SHOW: applied.views.browse },
        AGENT: { SHOW: applied.views.agent },
      },
    }),
    [
      applied.openByDefault,
      applied.privacy,
      applied.width,
      applied.height,
      applied.zIndex,
      applied.views,
    ],
  );

  const theme = useMemo(
    () => ({
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary: applied.themePrimary,
        secondary: applied.themeSecondary,
      },
    }),
    [applied.themePrimary, applied.themeSecondary],
  );

  const previewKey = JSON.stringify({
    workspaceId: applied.workspaceId,
    baseUrl: applied.baseUrl,
    mode: applied.mode,
    avatar: applied.avatar,
    justChat: applied.justChat,
    openByDefault: applied.openByDefault,
    privacy: applied.privacy,
    views: applied.views,
    width: applied.width,
    height: applied.height,
    zIndex: applied.zIndex,
    lang: applied.lang,
  });

  const exportConfig = useMemo(() => {
    const cfg: Record<string, unknown> = {
      workspaceId: applied.workspaceId || "YOUR_WORKSPACE_ID",
      baseUrl: applied.baseUrl,
      mode: applied.mode,
      avatarmodeDesktop: applied.avatar,
      avatarmodeMobile: applied.avatar,
      lang: applied.lang,
      displayMode,
    };
    if (applied.justChat) cfg.justChat = true;
    if (applied.closedText) cfg.closedText = applied.closedText;
    return cfg;
  }, [
    applied.workspaceId,
    applied.baseUrl,
    applied.mode,
    applied.avatar,
    applied.lang,
    applied.justChat,
    applied.closedText,
    displayMode,
  ]);

  const configJson = JSON.stringify(exportConfig, null, 2);
  const themeChanged =
    applied.themePrimary !== defaultTheme.colors.primary ||
    applied.themeSecondary !== defaultTheme.colors.secondary;

  const embedSnippet = `<div id="sharelyai-webcontroller-id"></div>

<script src="https://your-deployment.example.com/assets/sharelyai.js"></script>
<script>
  window.sharelyai.initialize(${indent(configJson, 2)});
  window.sharelyai.render();
</script>`;

  const reactSnippet = `<WebControl
  mode="${applied.mode}"
  avatarmodeDesktop="${applied.avatar}"
  avatarmodeMobile="${applied.avatar}"
  lang="${applied.lang}"${applied.justChat ? "\n  justChat" : ""}${
    applied.closedText ? `\n  closedText="${applied.closedText}"` : ""
  }
  displayMode={${indent(JSON.stringify(displayMode, null, 2), 2)}}${
    themeChanged
      ? `\n  theme={{ colors: { primary: '${applied.themePrimary}', secondary: '${applied.themeSecondary}' } }}`
      : ""
  }
/>`;

  return (
    <div
      style={{
        height: "100%",
        boxSizing: "border-box",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* ── Preview (fills all available space, IS the background) ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          overflow: "hidden",
          transform: "translate(0, 0)",
          background: T.gray100,
        }}
      >
        {isInline ? (
          <div
            style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
          >
            <WebControl
              key={previewKey}
              workspaceId={applied.workspaceId || undefined}
              baseUrl={applied.baseUrl || undefined}
              mode={applied.mode}
              avatarmodeDesktop={applied.avatar}
              avatarmodeMobile={applied.avatar}
              justChat={applied.justChat}
              closedText={applied.closedText || undefined}
              lang={applied.lang}
              displayMode={displayMode}
              theme={theme}
            />
          </div>
        ) : (
          <WebControl
            key={previewKey}
            workspaceId={applied.workspaceId || undefined}
            baseUrl={applied.baseUrl || undefined}
            mode={applied.mode}
            avatarmodeDesktop={applied.avatar}
            avatarmodeMobile={applied.avatar}
            justChat={applied.justChat}
            closedText={applied.closedText || undefined}
            lang={applied.lang}
            displayMode={displayMode}
            theme={theme}
          />
        )}
      </div>

      {/* ── Right panel (always visible) ── */}
      <div
        style={{
          width: 384,
          flexShrink: 0,
          background: T.surface,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxShadow: "-6px 0 20px rgba(0,0,0,0.06), -1px 0 0 rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: T.foreground }}>
            Playground
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: T.muted }}>
            {isInline ? "Inline mode" : "Floating mode"}
          </p>
        </div>

        {/* Connection status — fixed, not scrollable */}
        <ConnectionStatus
          workspaceId={s.workspaceId}
          onChange={(v) => set("workspaceId", v)}
          inputId={fid("ws-top")}
        />

        {/* Controls — single scrollable surface */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {/* Presets + Theme — padded section */}
          <div style={{ padding: "24px 24px 0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {PRESETS.map((p) => (
                <PresetRow
                  key={p.label}
                  label={p.label}
                  hint={p.hint}
                  active={isPresetActive(p.state, s)}
                  onClick={() => applyPreset(p.state)}
                />
              ))}
            </div>

            {/* Theme color swatches */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.muted,
                  marginBottom: 10,
                }}
              >
                Theme
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {THEME_COLORS.map((tc) => {
                  const isActive =
                    s.themePrimary.toLowerCase() === tc.value.toLowerCase();
                  return (
                    <ThemeSwatch
                      key={tc.value}
                      color={tc.value}
                      label={tc.label}
                      active={isActive}
                      onClick={() => set("themePrimary", tc.value)}
                    />
                  );
                })}
                <CustomColorSwatch
                  value={s.themePrimary}
                  isCustom={
                    !THEME_COLORS.some(
                      (tc) =>
                        tc.value.toLowerCase() === s.themePrimary.toLowerCase(),
                    )
                  }
                  onChange={(v) => set("themePrimary", v)}
                  id={fid("c-pri")}
                />
              </div>
            </div>
          </div>

          {/* Advanced */}
          <Section title="Advanced" defaultOpen={false}>
            {/* ── Widget card ── */}
            {isFloating && (
              <SettingsCard title="Widget" icon="widget" defaultOpen>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <PropRow label="Position">
                    <Select
                      id={fid("pos")}
                      value={s.mode}
                      onChange={(v) => set("mode", v)}
                      options={FLOATING_MODES}
                    />
                  </PropRow>
                  <PropRow label="Launcher">
                    <Select
                      id={fid("avatar")}
                      value={s.avatar}
                      onChange={(v) => set("avatar", v)}
                      options={[
                        { value: "expanded", label: "Pill" },
                        { value: "circle", label: "Circle" },
                      ]}
                    />
                  </PropRow>
                  {s.avatar === "expanded" && (
                    <PropRow label="Text">
                      <Input
                        id={fid("closed")}
                        value={s.closedText}
                        onChange={(v) => set("closedText", v)}
                        placeholder="Ask AI anything"
                      />
                    </PropRow>
                  )}
                </div>
              </SettingsCard>
            )}

            {/* ── Behavior card ── */}
            <SettingsCard title="Behavior" icon="behavior" defaultOpen>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Checkbox
                  checked={s.openByDefault}
                  onChange={(v) => set("openByDefault", v)}
                  label={isInline ? "Start expanded" : "Open on page load"}
                  id={fid("open")}
                />
                {s.views.search && (
                  <Checkbox
                    checked={s.views.searchTags}
                    onChange={(v) => setView("searchTags", v)}
                    label="Search tag filtering"
                    id={fid("v-tags")}
                  />
                )}
                {multipleViews && (
                  <Checkbox
                    checked={s.justChat}
                    onChange={(v) => set("justChat", v)}
                    label="Skip view selector"
                    id={fid("just")}
                  />
                )}
                <PropRow label="Language">
                  <Select
                    id={fid("lang")}
                    value={s.lang}
                    onChange={(v) => set("lang", v)}
                    options={LANGS}
                  />
                </PropRow>
              </div>
            </SettingsCard>

            {/* ── Connection card ── */}
            <SettingsCard
              title="Connection"
              icon="connection"
              defaultOpen={false}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <PropRow label="Workspace">
                  <Input
                    id={fid("ws")}
                    value={s.workspaceId}
                    onChange={(v) => set("workspaceId", v)}
                    placeholder="your-workspace-id"
                  />
                </PropRow>
                <PropRow label="API URL">
                  <Input
                    id={fid("url")}
                    value={s.baseUrl}
                    onChange={(v) => set("baseUrl", v)}
                    placeholder="https://api.sharely.ai"
                  />
                </PropRow>
                <PropRow label="Privacy">
                  <Select
                    id={fid("privacy")}
                    value={s.privacy}
                    onChange={(v) => set("privacy", v)}
                    options={PRIVACY}
                  />
                </PropRow>
              </div>
            </SettingsCard>

            {/* ── Layout card ── */}
            <SettingsCard title="Layout" icon="layout" defaultOpen={false}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <PropRow label="Size">
                  <div style={{ display: "flex", gap: 4 }}>
                    <Input
                      id={fid("w")}
                      value={s.width}
                      onChange={(v) => set("width", v)}
                      placeholder="W"
                    />
                    <Input
                      id={fid("h")}
                      value={s.height}
                      onChange={(v) => set("height", v)}
                      placeholder="H"
                    />
                    <Input
                      id={fid("z")}
                      value={s.zIndex}
                      onChange={(v) => set("zIndex", v)}
                      placeholder="Z"
                    />
                  </div>
                </PropRow>
              </div>
            </SettingsCard>
          </Section>
        </div>

        {/* Footer — fixed */}
        <div
          style={{
            padding: "12px 24px 16px",
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setShowCode(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 14px",
              fontSize: 15,
              fontWeight: 600,
              color: T.surface,
              background: T.primary,
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background-color 150ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primaryDark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.primary;
            }}
          >
            <IconCode /> Get code
          </button>
          <div
            style={{
              display: "flex",
              gap: 4,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <SmallButton label="Reset" onClick={resetConfig} />
            <span style={{ color: T.border }}>·</span>
            <SmallButton label="Save" onClick={saveConfig} />
            <span style={{ color: T.border }}>·</span>
            <SmallButton
              label="Clear"
              onClick={removeConfig}
              variant="danger"
            />
            {status && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.success,
                  marginLeft: 4,
                }}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      </div>

      {showCode && (
        <CodeModal
          onClose={() => setShowCode(false)}
          tabs={[
            { id: "config", label: "Config (JSON)", code: configJson },
            { id: "embed", label: "Embed <script>", code: embedSnippet },
            { id: "react", label: "React component", code: reactSnippet },
          ]}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset card
// ---------------------------------------------------------------------------
function isPresetActive(
  presetPartial: Partial<State>,
  current: State,
): boolean {
  const full = { ...DEFAULTS, ...presetPartial };
  return (
    full.mode === current.mode &&
    full.openByDefault === current.openByDefault &&
    JSON.stringify(full.views) === JSON.stringify(current.views)
  );
}

function PresetRow({
  label,
  hint,
  active,
  onClick,
}: {
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "14px 16px",
        textAlign: "left",
        background: active ? T.primaryBgActive : h ? T.gray50 : T.surface,
        border: `1.5px solid ${
          active ? T.primary : h ? T.primaryBorderHover : T.border
        }`,
        borderRadius: 8,
        cursor: "pointer",
        transition: transitionSmooth,
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: active ? T.primary : T.foreground,
        }}
      >
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{hint}</div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Small secondary button
// ---------------------------------------------------------------------------
function SmallButton({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant?: "danger";
}) {
  const [h, setH] = useState(false);
  const isDanger = variant === "danger";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: "5px 10px",
        fontSize: 14,
        fontWeight: 500,
        color: isDanger ? (h ? T.error : T.muted) : h ? T.foreground : T.muted,
        background: h
          ? isDanger
            ? "rgba(239,68,68,0.05)"
            : T.gray50
          : "transparent",
        border: `1px solid ${h ? T.border : "transparent"}`,
        borderRadius: 6,
        cursor: "pointer",
        transition: transitionSmooth,
      }}
    >
      {label}
    </button>
  );
}

function indent(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line, i) => (i === 0 ? line : pad + line))
    .join("\n");
}
