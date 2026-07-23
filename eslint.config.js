// Flat ESLint config for this TypeScript + React (18/19) monorepo.
// Pragmatic by design: this is an existing codebase, so most stylistic checks
// are warnings, not errors. Run with `pnpm lint`.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
// Must be last: turns off ESLint rules that conflict with Prettier so
// formatting is owned entirely by Prettier (`pnpm format`).
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  // Never lint build output, deps, coverage, or config files.
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.{js,ts,mjs,cjs}",
      "**/vite-env.d.ts",
    ],
  },

  // Base JS + TypeScript recommendations (non-type-checked: fast, no project
  // service needed across the workspace).
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React (flat recommended + new JSX runtime), applied to TS/TSX source.
  {
    files: ["**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
  },

  // React Hooks — the v7 preset ships `plugins` as an array (legacy shape that
  // flat config rejects), so register the plugin explicitly and pull its rules.
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: { ...reactHooks.configs["recommended-latest"].rules },
  },

  // Project rule tweaks — keep the existing code green without papering over
  // genuinely risky patterns.
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      ...react.configs.flat["jsx-runtime"].rules, // new JSX transform: no React import needed
      "react/prop-types": "off", // types come from TypeScript
      "react/no-unescaped-entities": "off", // apostrophes/quotes in copy are fine

      // Enforced: dead code (unused imports/vars/args) fails CI. Prefix an
      // intentionally-unused binding with `_` to opt out.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      // Deliberately off: this codebase leans on `any` at the theme / SSE / AI-adapter
      // boundaries. Hundreds of perpetual warnings would just train people to ignore
      // them. Ratchet this up to 'warn' once those boundaries are typed.
      "@typescript-eslint/no-explicit-any": "off",

      // Pragmatic adjustments for existing intentional patterns.
      "no-useless-escape": "error", // redundant regex escapes are not allowed
      "no-constant-binary-expression": "warn", // intentional `{false && (...)}` toggles
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
      "@typescript-eslint/triple-slash-reference": "off", // ambient d.ts include in the embed build
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "with-single-extends" }, // styled-components theme augmentation
      ],
    },
  },

  // Test files run under Vitest globals.
  {
    files: ["**/*.{test,spec}.{ts,tsx}"],
    languageOptions: { globals: { ...globals.node } },
  },

  // Keep last — disables ESLint formatting rules that would fight Prettier.
  eslintConfigPrettier,
);
