import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // TODO: Migrate to schema: "./drizzle/schema.ts",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.NELLO_DB_PATH || "file:./nello.db",
  },
});
