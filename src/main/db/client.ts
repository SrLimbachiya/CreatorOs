import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { app } from "electron";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let clientConnection: Client | null = null;

export async function initDatabase() {
  if (dbInstance) return { db: dbInstance, client: clientConnection! };

  const isDev = !app.isPackaged;
  const dbFolder = isDev
    ? process.cwd() // Root of the project in dev
    : app.getPath("userData");

  const dbPath = path.join(dbFolder, "creatoros.db");
  console.log(`[Database] Connecting SQLite/LibSQL database at: ${dbPath}`);

  // Create database file connection using @libsql/client
  clientConnection = createClient({
    url: `file:${dbPath}`,
  });
  dbInstance = drizzle(clientConnection, { schema });

  // Run migrations
  try {
    const migrationsFolder = isDev
      ? path.join(process.cwd(), "src/main/db/migrations")
      : path.join(app.getAppPath(), "dist/main/migrations");

    console.log(`[Database] Running migrations from: ${migrationsFolder}`);
    // LibSQL migration runner is asynchronous
    await migrate(dbInstance, { migrationsFolder });
    console.log("[Database] Migrations applied successfully.");
  } catch (error) {
    console.error("[Database] Migration application error:", error);
  }

  // Seed default settings if empty
  try {
    const settingsList = await dbInstance
      .select({ id: schema.settings.id })
      .from(schema.settings)
      .all();

    if (settingsList.length === 0) {
      await dbInstance.insert(schema.settings).values({
        id: "global",
        theme: "dark",
        aiProvider: "ollama",
        aiModel: "llama3.2",
        updatedAt: new Date().toISOString(),
      }).run();
      console.log("[Database] Seeded default global settings.");
    }
  } catch (seedError) {
    console.error("[Database] Seeding default settings failed:", seedError);
  }

  return { db: dbInstance, client: clientConnection };
}

export function getDb() {
  if (!dbInstance) {
    throw new Error("[Database] Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}
