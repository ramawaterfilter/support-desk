import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Foundation tests run under `node --test`; vitest covers app/package tests only.
    include: ["apps/**/*.test.{ts,tsx}", "packages/**/*.test.ts"],
  },
});
