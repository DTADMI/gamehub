import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "node_modules",
      "dist",
      "build",
      "e2e/**",
      "__e2e__/**",
      "tests-e2e/**",
      "playwright/**",
    ],
  },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, ".") },
      {
        find: "@gamehub/game-platform",
        replacement: path.resolve(__dirname, "packages/game-platform/src"),
      },
      {
        find: /^@gamehub\/game-platform\/(.*)$/,
        replacement: path.resolve(__dirname, "packages/game-platform/src") + "/$1",
      },
      {
        find: "@games/pointclick-engine",
        replacement: path.resolve(__dirname, "packages/pointclick-engine/src"),
      },
      {
        find: /^@games\/pointclick-engine\/(.*)$/,
        replacement: path.resolve(__dirname, "packages/pointclick-engine/src") + "/$1",
      },
      {
        find: /^@games\/_engine$/,
        replacement: path.resolve(__dirname, "packages/games/_engine"),
      },
      {
        find: /^@games\/([^/]+)$/,
        replacement: path.resolve(__dirname, "packages/games") + "/$1/src",
      },
      {
        find: /^@games\/([^/]+)\/(.*)$/,
        replacement: path.resolve(__dirname, "packages/games") + "/$1/src/$2",
      },
    ],
  },
});
