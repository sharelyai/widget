import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: [
    "react",
    "react-dom",
    "styled-components",
    "@sharelyai/widget-services",
    "@sharelyai/widget-ui-shared",
  ],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
