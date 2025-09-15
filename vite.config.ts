import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",            // copies manifest & icons as-is
  build: {
    outDir: "build",
    target: "es2020",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: "./content.ts",
        background: "./background.ts",
      },
      output: {
        // IMPORTANT: avoid shared chunks or dynamic imports for content scripts
        manualChunks: undefined,
        entryFileNames: (chunk) => {
          if (chunk.name === "content") return "content.js";
          if (chunk.name === "background") return "background.js";
          return "[name].js";
        },
        assetFileNames: "[name][extname]",
      },
    },
  },
});
