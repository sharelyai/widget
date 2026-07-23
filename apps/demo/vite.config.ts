import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3000,
  },
  envDir: path.resolve(__dirname, "../../"),
  resolve: {
    // Enable HMR for workspace packages in dev only
    conditions: command === "serve" ? ["development", "browser"] : ["browser"],
  },
}));
