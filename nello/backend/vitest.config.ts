import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Tests mock the db module per-file; isolate files so each gets a fresh
    // in-memory database and vi.mock scope.
    pool: "threads",
    fileParallelism: true,
  },
});