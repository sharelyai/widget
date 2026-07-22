// Single source of truth for the webcontrol build version, surfaced on
// `window.sharelyai.version` and in the chat note. Imported from package.json
// so any bundler (Vite, webpack, tsup) resolves and inlines it — no build-time
// `define` magic globals that can leak as `undefined` in other build contexts.
import { version } from "../package.json";

export const SHARELY_VERSION: string = version;
