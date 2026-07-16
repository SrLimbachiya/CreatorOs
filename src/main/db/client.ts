import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client";
import path from "path";
import fs from "fs";
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
  const migrationsFolder = isDev
    ? path.join(process.cwd(), "src/main/db/migrations")
    : path.join(app.getAppPath(), "dist/main/migrations");

  const runManualMigrations = async () => {
    // Create __drizzle_migrations table
    await clientConnection!.execute(`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hash TEXT NOT NULL,
        created_at INTEGER
      );
    `);

    // Fetch applied list
    const appliedRows = await clientConnection!.execute('SELECT hash FROM "__drizzle_migrations";');
    const appliedHashes = new Set(appliedRows.rows.map(r => String(r.hash)));

    const migrationFiles = [
      { hash: "0000_loving_black_panther", filename: "0000_loving_black_panther.sql" },
      { hash: "0001_uneven_grim_reaper", filename: "0001_uneven_grim_reaper.sql" }
    ];

    for (const m of migrationFiles) {
      if (appliedHashes.has(m.hash)) {
        continue;
      }

      console.log(`[Database] Custom migration applying: ${m.filename}`);
      const filePath = path.join(migrationsFolder, m.filename);
      const sqlContent = fs.readFileSync(filePath, "utf-8");
      const statements = sqlContent.split("--> statement-breakpoint");

      for (let stmt of statements) {
        stmt = stmt.trim();
        stmt = stmt.replace(/\/\*[\s\S]*?\*\//g, ""); // Remove comments
        if (!stmt || stmt.startsWith("-->")) continue;
        await clientConnection!.execute(stmt);
      }

      // Mark applied
      await clientConnection!.execute({
        sql: 'INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES (?, ?);',
        args: [m.hash, Date.now()]
      });
    }
  };

  try {
    console.log(`[Database] Running custom migrations from: ${migrationsFolder}`);
    await runManualMigrations();
    console.log("[Database] Migrations applied successfully.");
  } catch (error) {
    console.error("[Database] Migration application error, rebuilding schema...", error);
    try {
      // Self-healing: Force drop and rebuild on schema mismatch to avoid boot freezes
      await clientConnection!.execute("DROP TABLE IF EXISTS __drizzle_migrations;");
      await clientConnection!.execute("DROP TABLE IF EXISTS scripts;");
      await clientConnection!.execute("DROP TABLE IF EXISTS ideas;");
      await clientConnection!.execute("DROP TABLE IF EXISTS projects;");
      await clientConnection!.execute("DROP TABLE IF EXISTS analytics;");
      await clientConnection!.execute("DROP TABLE IF EXISTS settings;");
      console.log("[Database] Outdated schema tables dropped successfully.");
      
      // Re-run migration
      await runManualMigrations();
      console.log("[Database] Migrations completed after fresh build.");
    } catch (rebuildError) {
      console.error("[Database] Failed to rebuild database schema:", rebuildError);
    }
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

  // Seed default project if empty
  try {
    const projectsList = await dbInstance
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .all();

    if (projectsList.length === 0) {
      const defaultProjectId = "main-channel-workspace";
      await dbInstance.insert(schema.projects).values({
        id: defaultProjectId,
        name: "Main Channel Workspace",
        description: "Default workspace channel content project.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).run();
      console.log("[Database] Seeded default project.");

      // For backwards compatibility: update old ideas to refer to this default project
      try {
        await clientConnection.execute(`UPDATE ideas SET project_id = '${defaultProjectId}' WHERE project_id IS NULL;`);
        console.log("[Database] Backwards compatibility: linked orphan ideas to default project.");
      } catch (e) {
        // Ignored if ideas table didn't exist yet
      }
    }
  } catch (projectSeedError) {
    console.error("[Database] Seeding default project failed:", projectSeedError);
  }

  return { db: dbInstance, client: clientConnection };
}

export function getDb() {
  if (!dbInstance) {
    throw new Error("[Database] Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}
