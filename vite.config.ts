import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@popup": path.resolve(__dirname, "src/popup"),
      "@background": path.resolve(__dirname, "src/background"),
      "@content": path.resolve(__dirname, "src/content"),
      "@archive": path.resolve(__dirname, "src/archive"),
    },
  },
  build: {
    outDir: "dist",
  },
});
