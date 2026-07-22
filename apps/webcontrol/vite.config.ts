import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "babel-plugin-styled-components",
            {
              namespace: "sharelyai-webcontroller",
            },
          ],
        ],
      },
    }),
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    conditions: command === "serve" ? ["development", "browser"] : ["browser"],
  },
  envDir: path.resolve(__dirname, "../../"),
  server: {
    port: 5174,
    cors: true,
    hmr: false,
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: "assets/sharelyai.[extname]",
        chunkFileNames: "assets/sharelyai.js",
        entryFileNames: "assets/sharelyai.js",
      },
    },
  },
}));
