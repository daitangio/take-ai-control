import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Event streams must be enabled to test the relevant functions
    env: { NELLO_EVENTS_ENABLED: "true" },
    // Tests mock the db module per-file; isolate files so each gets a fresh
    // in-memory database and vi.mock scope.
    pool: "threads",
    fileParallelism: true,
  },
});