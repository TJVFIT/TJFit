import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" }
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
