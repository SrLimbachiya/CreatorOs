import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/db/schema.ts",
  out: "./src/main/db/migrations",
  driver: "turso",
  dbCredentials: {
    url: "file:sqlite.db",
  },
} satisfies Config;
