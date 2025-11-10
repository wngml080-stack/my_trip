import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    coverage: {
      reporter: ["text", "lcov"],
    },
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

