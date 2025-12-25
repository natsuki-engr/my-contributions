import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: ".client-build",
    emptyOutDir: true,
    lib: {
      entry: "src/client.tsx",
      formats: ["es"],
      fileName: "client",
    },
    rollupOptions: {
      output: {
        entryFileNames: "client.js",
      },
    },
  },
});