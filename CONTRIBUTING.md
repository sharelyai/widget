# Contributing

Thanks for your interest in Sharely WebControl. This guide covers how to develop the project locally, how to deploy your own fork, and the rules around publishing.

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8 (this repo pins `packageManager: "pnpm@9.0.0"` — Corepack will pick it up automatically)
- A Sharely-compatible API for env vars (see [Environment](#environment))

## Local development

```bash
# Clone your fork and install
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL and workspace ID

# Start the demo app (recommended starting point)
pnpm dev
```

The demo runs on `http://localhost:3000` and exposes every integration mode under different routes.

### Useful filtered commands

```bash
# Run only the demo app
pnpm --filter @sharelyai/demo dev

# Run the widget shell app (single-file embeddable build)
pnpm --filter @sharelyai/widget dev

# Build one package
pnpm --filter @sharelyai/widget-services build

# Build a package and everything that depends on it
pnpm --filter @sharelyai/widget-ui-shared... build
```

### How workspace packages resolve

Internal packages are declared as `workspace:*` in `package.json`. pnpm symlinks them from `packages/*` into `node_modules` — **no `@sharelyai/*` artifact is ever fetched from npm**. This is the same on Vercel, Netlify, or any other host.

Each library package exposes a `development` export condition that resolves to its TypeScript source, plus `import`/`require` conditions that resolve to `dist`. The Vite configs in `apps/*` flip the condition automatically:

- `pnpm dev` → loads from `src/` (instant HMR, no build needed)
- `pnpm build` → loads from `dist/` (Turbo's `^build` builds upstream packages first)

## Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `VITE_API_DEFAULT_URL` | API endpoint that powers the widget (your Sharely-compatible backend) |
| `VITE_WORKSPACE_ID` | Workspace identifier issued by your backend |

## Project layout

```
apps/
  demo/         Vite SPA with integration examples (default Vercel target)
  webcontrol/   Single-file embeddable widget bundle (maintainer use)
packages/
  services/        Foundation: API client, hooks, Zustand store, types, auth, i18n
  ui-shared/       Shared UI primitives (theme, base components, icons)
  ui-chat/         Chat panel
  ui-search/       Search panel
  ui-browse/       Browse panel
  ui-agent-chat/   Agent chat panel (SSE-streamed)
```

Dependency rule: layers only depend **downward** (`ui-*` may depend on `services` and `ui-shared`; `webcontrol` may depend on any package; nothing depends on `webcontrol`). Don't introduce upward or circular dependencies.

## Deploying your own fork

The repo ships a Vercel-ready `vercel.json` that builds the embeddable widget bundle:

```json
{
  "buildCommand": "pnpm turbo run build --filter=@sharelyai/widget...",
  "outputDirectory": "apps/webcontrol/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

This produces a single JS file (`apps/webcontrol/dist/assets/sharelyai.js`) that you can `<script>`-embed on any page. Hosting it on Vercel gives you a stable URL for that bundle.

To deploy:

1. Push your fork to GitHub.
2. Import the repo into Vercel (or click the **Deploy with Vercel** button in `README.md`).
3. Set the env vars from [Environment](#environment) in the Vercel project settings.
4. Deploy. Embed `<script src="https://<your-vercel-url>/assets/sharelyai.js"></script>` on your site.

Vercel will run `pnpm install` (which resolves `workspace:*` locally) and `pnpm turbo run build --filter=@sharelyai/widget...` (which builds every dependency in order). Your build never reaches the npm registry for `@sharelyai/*` packages.

### Deploying the demo app instead

If you want to deploy the demo SPA (the `/full-demo`, `/chat-only`, etc. routes) — for example, as a public showcase — override the build command in the Vercel project settings or swap `vercel.json` for:

```json
{
  "buildCommand": "pnpm turbo run build --filter=@sharelyai/demo...",
  "outputDirectory": "apps/demo/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

## Publishing — maintainer only

**npm packages under the `@sharelyai` scope are private.** Every package declares `publishConfig.access: "restricted"`, and only Sharely AI maintainers are authorized to push to that scope.

If you've forked the repo, you can:

- ✅ Develop and modify the code freely
- ✅ Deploy from source to Vercel, Netlify, or anywhere else
- ✅ Use the workspace packages in your own apps via path imports or by cloning into a workspace
- ❌ **Not** publish under `@sharelyai/*` — that scope is reserved

This is enforced by both `publishConfig.access` in each package and `access: "restricted"` in `.changeset/config.json`. If you attempt `pnpm release`, npm will reject it unless you're authenticated as a Sharely AI maintainer.

## Rebranding your fork (optional)

Since `pnpm install` resolves `workspace:*` locally regardless of the scope name, you do **not** need to rename `@sharelyai/*` packages to deploy your own fork. If you do want to remove user-visible references to "Sharely" in your deployment, the surfaces worth touching are:

- **styled-components CSS class namespace** — `apps/webcontrol/vite.config.ts` (`namespace: "sharelyai-webcontroller"`). Generated class names appear in the DOM; change this to avoid collisions if you embed multiple widgets on one page.
- **Bundle filename** — `apps/webcontrol/vite.config.ts` (`assetFileNames` / `entryFileNames` use `sharelyai.*`). Visible in `<script src="...">`.
- **UI strings** — grep `Sharely` and `sharelyai` under `packages/**/src` and `apps/**/src`, then update as appropriate.

A full package rename (e.g. `@sharelyai/widget-services` → `@yourorg/services`) is not necessary for deployment and is not supported because the `@sharelyai` scope is private.

## Reporting issues

Please open an issue in this repo. Include:

- A minimal reproduction (a `/headless-demo` snippet works well)
- Your Node and pnpm versions
- The browser + version if it's a UI bug
