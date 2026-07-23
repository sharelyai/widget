# Sharely WebControl

**Sharely WebControl is the embeddable end-user surface of the Sharely.ai
platform — the fastest way to give your organization's users a role-governed,
agentic AI experience inside an application they already use.**

You embed a single, authenticated web component into your portal or web app, and
your end users get AI-powered search, chat, and agent interactions that are
scoped to who they are. WebControl is a thin, API-driven client; the intelligence
and governance live in the three Sharely.ai services behind it:

- **Sharely.ai Knowledge** — structures an organization's content into
  role-scoped taxonomies, so every answer is grounded in the documents a given
  user is actually permitted to see.
- **Sharely.ai Agents** — designs, evaluates, and operationalizes governed
  agentic workflows (tool use, retrieval, multi-step reasoning) that WebControl
  renders with streaming responses, thinking steps, tool-call cards, and
  citations.
- **Sharely.ai Backend** — provides authentication, workspace isolation, and the
  role-based access control (RBAC) that enforces what each user can retrieve and
  do, on every request.

The result is an end-to-end stack where governance is enforced at the source, not
bolted onto the UI: WebControl streams only role-filtered knowledge and agent
output (over SSE), so the same embedded widget safely serves an admin, a sales
rep, and an external partner — each seeing only what their role allows.

Drop it onto a page with two `<script>` tags, point it at your workspace, and
your end users have a governed agentic experience — without you building chat,
retrieval, RBAC, or streaming yourself. WebControl talks to any
Sharely-compatible backend.

---

Built as a **pnpm + Turborepo** monorepo. The widget ships as a single
`<script>`-ready bundle you can drop on any page, and as a set of layered
`@sharelyai/*` packages you can consume individually in a React app. This README
is the source of truth for how the repo is organized and how to work in it.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sharelyai/webcontrol&env=VITE_API_DEFAULT_URL,VITE_WORKSPACE_ID&envDescription=Backend%20API%20URL%20and%20workspace%20ID%20the%20widget%20talks%20to&envLink=https://github.com/sharelyai/webcontrol#environment)

Deploys `apps/webcontrol` (the embeddable bundle) — the default Vercel target. See
[Distribution](#distribution) for what gets built and [Environment](#environment)
for the variables it prompts for.

## Contents

- [Prerequisites](#prerequisites)
- [Quick start (embed the widget)](#quick-start-embed-the-widget)
- [Local development](#local-development)
- [Commands](#commands)
- [Environment](#environment)
- [Architecture](#architecture)
- [Packages](#packages)
- [Key patterns](#key-patterns)
- [The WebControl component](#the-webcontrol-component)
- [The embed API](#the-embed-api)
- [Examples](#examples)
- [Demo app](#demo-app)
- [Distribution](#distribution)
- [For maintainers](#for-maintainers)

## Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (the repo pins `packageManager: pnpm@9.0.0`; Corepack picks it up automatically)

## Quick start (embed the widget)

The shipped widget mounts itself into a known element id and is driven by a small
global API. Drop two scripts on any page:

```html
<div id="sharelyai-webcontroller-id"></div>

<script src="https://your-deployment.example.com/assets/sharelyai.js"></script>
<script>
  window.sharelyai.initialize({
    workspaceId: "YOUR_WORKSPACE_ID",
    baseUrl: "https://api.sharely.ai",
  });
  window.sharelyai.render();
</script>
```

See [The embed API](#the-embed-api) for the full surface (`initialize`, `render`,
`updateConfig`, `config`, `destroy`). To build the bundle yourself, see
[Distribution](#distribution).

## Local development

```bash
# Install all workspace dependencies
pnpm install

# Configure environment (see Environment below)
cp .env.example .env

# Start dev mode for all packages (Turbo, persistent)
pnpm dev
```

The demo app runs on `http://localhost:3000` and exposes every integration mode.
For deeper local-dev and fork-deployment guidance, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Commands

| Command        | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `pnpm install` | Install all workspace dependencies                            |
| `pnpm dev`     | Start dev mode for all packages (Turbo, persistent, uncached) |
| `pnpm build`   | Build all packages in dependency order (`^build`)             |
| `pnpm lint`    | Lint all packages                                             |
| `pnpm test`    | Run tests (vitest) across packages                            |
| `pnpm clean`   | Remove all `dist/` and `node_modules/`                        |

Filter to a specific package or example:

```bash
pnpm --filter @sharelyai/widget-services build      # one package
pnpm --filter @sharelyai/demo dev            # the demo app
pnpm --filter @sharelyai/widget-ui-shared... build  # a package + everything that depends on it
```

Turbo handles the build graph: packages build in dependency order (`^build`), and
the `dev` task is persistent and uncached.

## Environment

Copy `.env.example` to `.env` at the repo root. The widget and demos read these
Vite-prefixed variables:

| Variable               | Description                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| `VITE_API_DEFAULT_URL` | Backend API the widget talks to. Defaults to `https://api.sharely.ai` if unset. |
| `VITE_WORKSPACE_ID`    | Workspace identifier issued by your backend.                                    |

## Architecture

This is a **pnpm + Turborepo monorepo** building an embeddable web control widget.
Packages are organized in a strict dependency layer — **do not introduce upward or
circular dependencies between layers**:

```
@sharelyai/widget-services          ← Foundation: API client, hooks, Zustand store, types, auth, i18n
    ↓
@sharelyai/widget-ui-shared         ← Shared UI: base components, theme system, icons
    ↓
@sharelyai/widget-ui-chat           ← Chat feature: ChatPanel, MessageBubble, WorkflowProgress
@sharelyai/widget-ui-search         ← Search feature: SearchPanel, SearchResults, TagFilter
@sharelyai/widget-ui-browse         ← Browse feature: BrowsePanel, CategoryTree, ContentView (also depends on ui-search)
@sharelyai/widget-ui-agent-chat     ← Agent chat: SSE-streamed responses, thinking steps, tool calls, citations
    ↓
@sharelyai/widget        ← Shell (apps/webcontrol): composes all features into the WebControl component
    ↓
@sharelyai/demo              ← Demo app (apps/demo): every integration pattern, for local exploration
```

The shell (`apps/webcontrol`) and demo (`apps/demo`) live under `apps/`. The six
publishable libraries live under `packages/`. Per-package usage examples live under
[`examples/`](#examples).

## Packages

| Package                           | Location                 | Description                                                                                  |
| --------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `@sharelyai/widget-services`      | `packages/services`      | Foundation — API client, React hooks, Zustand store, types, auth, i18n                       |
| `@sharelyai/widget-ui-shared`     | `packages/ui-shared`     | Shared UI primitives — theme, base components, icons                                         |
| `@sharelyai/widget-ui-chat`       | `packages/ui-chat`       | Standard chat panel with messages and workflow progress                                      |
| `@sharelyai/widget-ui-search`     | `packages/ui-search`     | Search panel with results and tag filtering                                                  |
| `@sharelyai/widget-ui-browse`     | `packages/ui-browse`     | Browse panel with category tree and content view (depends on ui-search)                      |
| `@sharelyai/widget-ui-agent-chat` | `packages/ui-agent-chat` | Agent chat — SSE-streamed responses with thinking indicators, tool-call cards, and citations |
| `@sharelyai/widget`               | `apps/webcontrol`        | Shell that composes all feature packages into the `WebControl` component + embed bundle      |
| `@sharelyai/demo`                 | `apps/demo`              | Vite demo app with integration examples                                                      |

## Key patterns

- **API client** — Factory pattern via `createApiClient` in
  `packages/services/src/api/client.ts`. Endpoints are composed functions (spaces,
  knowledge, workspaces).
- **State management** — Zustand (`packages/services/src/stores/globalStore.ts`)
  for global app state (token, current space, view state, config). React Query
  (`@tanstack/react-query`) for all server state / data fetching.
- **Provider** — `SharelyProvider` in `packages/services/src/provider.tsx` supplies
  the `apiClient` and config via React context. Every UI feature needs it.
- **Styling** — styled-components v6 with CSS variables for theming. Each feature
  package owns its styled components. `ThemeProvider` + `GlobalStyle` come from
  `@sharelyai/widget-ui-shared`; pass a partial `theme` to override tokens.
- **Build** — Library packages use **tsup** (CJS + ESM dual output). Apps and the
  embed bundle use **Vite** with `vite-plugin-css-injected-by-js` for single-file
  output.
- **Agent mode** — The agent chat feature (`@sharelyai/widget-ui-agent-chat`) renders
  SSE-streamed responses; the shell swaps it in when the agent view is active.

## The WebControl component

`apps/webcontrol/src/WebControl.tsx` is the main exported component. It renders a
floating launcher with a toggleable drawer containing the chat, search, browse, and
agent views. It accepts (all props optional):

| Prop                | Type                     | Description                                                                    |
| ------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| `workspaceId`       | `string`                 | Workspace identifier                                                           |
| `baseUrl`           | `string`                 | API base URL (falls back to the default API)                                   |
| `externalUserId`    | `string`                 | External user identifier (only asserted alongside a host token)                |
| `lang`              | `string`                 | Language code (also sets `langKnowledge`)                                      |
| `theme`             | `object`                 | Partial theme override passed to `ThemeProvider`                               |
| `displayMode`       | `DisplayModeConfig`      | Display configuration (width, height, z-index, open-by-default, private mode)  |
| `mode`              | `string`                 | Launcher position — must be one of `constants.POSITIONS` (floating, inline, …) |
| `justChat`          | `boolean`                | Initialize immediately in a chat-only flow                                     |
| `closedText`        | `string`                 | Text shown on the collapsed launcher                                           |
| `avatarmodeDesktop` | `string`                 | Desktop avatar mode (e.g. compact)                                             |
| `avatarmodeMobile`  | `string`                 | Mobile avatar mode                                                             |
| `onError`           | `(error: Error) => void` | Error callback                                                                 |

> The `WebControlProps` type also declares `defaultView` and `onReady`. These are
> currently part of the type surface but not yet wired into the component — treat
> them as reserved.

## The embed API

The bundle exposes a `window.sharelyai` global (also exported as `sharelyai` from
`@sharelyai/widget`). It mounts into the element with id
`sharelyai-webcontroller-id`.

| Method                  | Description                                                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialize(config)`    | Set the config in the global store. Accepts `SharelyConfig` plus optional `externalToken` / `spaceId`. Maps legacy `api` → `baseUrl`. Destroys any previous instance first. |
| `render()`              | Mount the `WebControl` into `#sharelyai-webcontroller-id`                                                                                                                   |
| `updateConfig(partial)` | Shallow-merge new config into the store at runtime                                                                                                                          |
| `config()`              | Read the current config (including resolved `env`)                                                                                                                          |
| `destroy()`             | Unmount and clean up the instance                                                                                                                                           |

## Examples

[`examples/`](./examples) contains one markdown doc per package, each with the
minimal implementation snippet and a link to the live demo route that runs it.
**Examples teach the parts; the demo app shows the whole.**

| Doc                                             | Package                           | Shows                                                             | Runnable route     |
| ----------------------------------------------- | --------------------------------- | ----------------------------------------------------------------- | ------------------ |
| [services.md](./examples/services.md)           | `@sharelyai/widget-services`      | Data layer only — API client, hooks, store, no UI                 | `/headless-demo`   |
| [ui-shared.md](./examples/ui-shared.md)         | `@sharelyai/widget-ui-shared`     | Theme system + base components + icons, no data                   | `/ui-shared`       |
| [ui-chat.md](./examples/ui-chat.md)             | `@sharelyai/widget-ui-chat`       | `ChatPanel`                                                       | `/chat-only`       |
| [ui-search.md](./examples/ui-search.md)         | `@sharelyai/widget-ui-search`     | `SearchPanel`                                                     | `/search-only`     |
| [ui-browse.md](./examples/ui-browse.md)         | `@sharelyai/widget-ui-browse`     | `BrowsePanel` (depends on ui-search)                              | `/browse-only`     |
| [ui-agent-chat.md](./examples/ui-agent-chat.md) | `@sharelyai/widget-ui-agent-chat` | `AgentChatPanel` — SSE streaming, thinking, tool calls, citations | `/agent-chat-only` |

Every feature package needs the same two wraps — `SharelyProvider` (from services)
then `ThemeProvider` (from ui-shared) — around its panel. The runnable code lives in
the [demo app](#demo-app); start it with `pnpm --filter @sharelyai/demo dev` and open
the route. See [`examples/README.md`](./examples/README.md) for the full index.

## Demo app

`apps/demo` is a Vite SPA that exercises every integration pattern, composing all
packages together. It's for local exploration and understanding the API surface
before embedding — not a deploy target.

```bash
pnpm --filter @sharelyai/demo dev   # http://localhost:3000
```

The app is a single shell: a persistent **sidebar** swaps each demo into the main
area. The landing page (`/`) is an interactive **playground** — configure the widget
with live form controls (workspace/base URL, mode, views, theme, language, sizing, …),
preview it in place, and copy the generated config / `<script>` embed / React snippet.

Routes (all reachable from the sidebar):

- `/` — **playground** (live config + preview + copyable snippets)
- `/full-demo` — all features enabled
- `/modes-demo` — launcher position modes
- `/inline-demo` — inline (non-floating) mode
- `/chat-only` — chat panel only
- `/search-only` — search panel only
- `/browse-only` — browse panel only
- `/agent-chat-only` — agent chat panel only (SSE streaming)
- `/ui-shared` — theme + base components (no data layer)
- `/custom-shell` — custom shell composition
- `/headless-demo` — headless hooks (build your own UI on `@sharelyai/widget-services`)

## Distribution

`apps/webcontrol` builds a single embeddable JS file under the namespace
`sharelyai-webcontroller`, enabling `<script>`-tag embedding (see
[Quick start](#quick-start-embed-the-widget)). Build it locally:

```bash
pnpm --filter @sharelyai/widget build
```

Output lands in `apps/webcontrol/dist/assets/sharelyai.js`. This is the default
Vercel target (`vercel.json` builds `@sharelyai/widget` and its dependencies).

Forks build entirely from local sources — no `@sharelyai/*` packages are fetched
from npm. Each library package exposes a `development` export condition that
resolves to TypeScript source (instant HMR in `pnpm dev`) plus `import`/`require`
conditions that resolve to `dist` (used by `pnpm build`).

## For maintainers

### Versioning & publishing

Uses [Changesets](https://github.com/changesets/changesets). The six library
packages under the `@sharelyai` scope are **linked** (versioned together) and
**private** (`publishConfig.access: "restricted"`) — only Sharely AI maintainers
can publish. The apps (`demo`, `webcontrol`) are ignored from versioning.

```bash
pnpm changeset            # Create a changeset
pnpm version-packages     # Apply version bumps
pnpm release              # Build and publish
```

## License

Sharely WebControl is licensed under the [Apache License 2.0](LICENSE) — © 2026
Sharely.ai, Inc. You are free to use, modify, and deploy your own fork under its
terms.

While the source is open, the published `@sharelyai/*` npm packages remain
publish-restricted — only Sharely AI maintainers can publish to that scope (see
[For maintainers](#for-maintainers)).
