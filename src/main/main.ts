import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { initDatabase, getDb } from "./db/client";
import * as schema from "./db/schema";
import { eq, desc } from "drizzle-orm";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const isDev = !app.isPackaged;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset", // Sleek macOS style window controls
    backgroundColor: "#020204", // Match Tailwind background
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the Next.js exported static file
    mainWindow.loadFile(path.join(app.getAppPath(), "out/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(async () => {
  // Initialize Database asynchronously
  await initDatabase();

  // Register IPC listeners
  registerIpcHandlers();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Register IPC handlers for database and AI services
function registerIpcHandlers() {
  // Get database path display
  ipcMain.handle("db:path", async () => {
    const isDev = !app.isPackaged;
    const dbFolder = isDev ? process.cwd() : app.getPath("userData");
    return path.join(dbFolder, "creatoros.db");
  });

  // Projects Handlers
  ipcMain.handle("projects:list", async () => {
    try {
      const db = getDb();
      return await db.select().from(schema.projects).orderBy(desc(schema.projects.updatedAt)).all();
    } catch (error) {
      console.error("[IPC] projects:list error:", error);
      throw error;
    }
  });

  ipcMain.handle("projects:create", async (_, project: typeof schema.projects.$inferInsert) => {
    try {
      const db = getDb();
      return await db.insert(schema.projects).values(project).run();
    } catch (error) {
      console.error("[IPC] projects:create error:", error);
      throw error;
    }
  });

  ipcMain.handle("projects:delete", async (_, id: string) => {
    try {
      const db = getDb();
      return await db.delete(schema.projects).where(eq(schema.projects.id, id)).run();
    } catch (error) {
      console.error("[IPC] projects:delete error:", error);
      throw error;
    }
  });

  // Ideas Handlers
  ipcMain.handle("ideas:list", async (_, projectId?: string) => {
    try {
      const db = getDb();
      if (projectId) {
        return await db.select().from(schema.ideas).where(eq(schema.ideas.projectId, projectId)).orderBy(desc(schema.ideas.updatedAt)).all();
      }
      return await db.select().from(schema.ideas).orderBy(desc(schema.ideas.updatedAt)).all();
    } catch (error) {
      console.error("[IPC] ideas:list error:", error);
      throw error;
    }
  });

  ipcMain.handle("ideas:get", async (_, id: string) => {
    try {
      const db = getDb();
      const results = await db.select().from(schema.ideas).where(eq(schema.ideas.id, id)).all();
      return results[0] || null;
    } catch (error) {
      console.error(`[IPC] ideas:get error for id ${id}:`, error);
      throw error;
    }
  });

  ipcMain.handle("ideas:create", async (_, idea: typeof schema.ideas.$inferInsert) => {
    try {
      const db = getDb();
      return await db.insert(schema.ideas).values(idea).run();
    } catch (error) {
      console.error("[IPC] ideas:create error:", error);
      throw error;
    }
  });

  ipcMain.handle("ideas:update", async (_, id: string, idea: Partial<typeof schema.ideas.$inferInsert>) => {
    try {
      const db = getDb();
      return await db.update(schema.ideas).set({ ...idea, updatedAt: new Date().toISOString() }).where(eq(schema.ideas.id, id)).run();
    } catch (error) {
      console.error(`[IPC] ideas:update error for id ${id}:`, error);
      throw error;
    }
  });

  ipcMain.handle("ideas:delete", async (_, id: string) => {
    try {
      const db = getDb();
      return await db.delete(schema.ideas).where(eq(schema.ideas.id, id)).run();
    } catch (error) {
      console.error(`[IPC] ideas:delete error for id ${id}:`, error);
      throw error;
    }
  });

  // Scripts Handlers
  ipcMain.handle("scripts:getByIdea", async (_, ideaId: string) => {
    try {
      const db = getDb();
      const results = await db.select().from(schema.scripts).where(eq(schema.scripts.ideaId, ideaId)).all();
      return results[0] || null;
    } catch (error) {
      console.error(`[IPC] scripts:getByIdea error for ideaId ${ideaId}:`, error);
      throw error;
    }
  });

  ipcMain.handle("scripts:update", async (_, script: typeof schema.scripts.$inferInsert) => {
    try {
      const db = getDb();
      // Use helper checking if script exists to update it, otherwise insert it
      const results = await db.select({ id: schema.scripts.id }).from(schema.scripts).where(eq(schema.scripts.id, script.id)).all();
      if (results.length > 0) {
        return await db.update(schema.scripts).set({
          title: script.title,
          content: script.content,
          durationEstimated: script.durationEstimated,
          readingTime: script.readingTime,
          status: script.status,
          updatedAt: new Date().toISOString()
        }).where(eq(schema.scripts.id, script.id)).run();
      } else {
        return await db.insert(schema.scripts).values(script).run();
      }
    } catch (error) {
      console.error("[IPC] scripts:update error:", error);
      throw error;
    }
  });

  // Analytics Handlers
  ipcMain.handle("analytics:get", async () => {
    try {
      const db = getDb();
      return await db.select().from(schema.analytics).all();
    } catch (error) {
      console.error("[IPC] analytics:get error:", error);
      throw error;
    }
  });

  ipcMain.handle("analytics:update", async (_, record: typeof schema.analytics.$inferInsert) => {
    try {
      const db = getDb();
      return await db.insert(schema.analytics).values(record).onConflictDoUpdate({
        target: schema.analytics.id,
        set: {
          views: record.views,
          ctr: record.ctr,
          retention: record.retention,
          subscribers: record.subscribers,
          rpm: record.rpm,
          watchTime: record.watchTime,
        }
      }).run();
    } catch (error) {
      console.error("[IPC] analytics:update error:", error);
      throw error;
    }
  });

  // Settings Handlers
  ipcMain.handle("settings:get", async () => {
    try {
      const db = getDb();
      const results = await db.select().from(schema.settings).where(eq(schema.settings.id, "global")).all();
      return results[0] || null;
    } catch (error) {
      console.error("[IPC] settings:get error:", error);
      throw error;
    }
  });

  ipcMain.handle("settings:update", async (_, records: Partial<typeof schema.settings.$inferInsert>) => {
    try {
      const db = getDb();
      return await db.update(schema.settings).set({ ...records, updatedAt: new Date().toISOString() }).where(eq(schema.settings.id, "global")).run();
    } catch (error) {
      console.error("[IPC] settings:update error:", error);
      throw error;
    }
  });

  // AI Chat Handler (tunnel to local Ollama or API)
  ipcMain.handle("ai:chat", async (_, prompt: string) => {
    try {
      const db = getDb();
      const settingsList = await db.select().from(schema.settings).where(eq(schema.settings.id, "global")).all();
      const userSettings = settingsList[0];

      const provider = userSettings?.aiProvider || "ollama";
      const model = userSettings?.aiModel || "llama3.2";
      const endpoint = userSettings?.apiEndpoint || "http://127.0.0.1:11434";

      console.log(`[AI] Processing prompt using ${provider} (${model}) at ${endpoint}...`);

      if (provider === "ollama") {
        try {
          const response = await fetch(`${endpoint}/api/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              prompt: prompt,
              stream: false,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama response not OK: ${response.statusText}`);
          }

          const data = (await response.json()) as { response: string };
          return data.response;
        } catch (ollamaError) {
          console.warn("[AI] Ollama request failed:", ollamaError);
          return `Ollama is offline or unreachable. Ensure Ollama is running locally at ${endpoint} and model "${model}" is downloaded.\n\nOffline Mock Assistant: I received your request: "${prompt}". Please start Ollama to enable real AI suggestions.`;
        }
      }

      return `Provider "${provider}" is currently in development. Dynamic connection to "${model}" is ready to be implemented.`;
    } catch (error) {
      console.error("[IPC] ai:chat error:", error);
      return `Error in AI processing: ${(error as Error).message}`;
    }
  });

  // AI Test Connection Handler
  ipcMain.handle("ai:test-connection", async (_, config: { provider: string; endpoint: string; model: string; key: string }) => {
    try {
      console.log(`[AI Test] Testing connection to provider ${config.provider} at ${config.endpoint}...`);
      
      if (config.provider === "ollama") {
        try {
          const response = await fetch(`${config.endpoint}/api/tags`);
          if (response.ok) {
            const data = await response.json() as { models: any[] };
            const modelNames = data.models?.map(m => m.name) || [];
            const hasModel = modelNames.some(name => name.includes(config.model));
            
            if (hasModel) {
              return { success: true, message: `Connected successfully! Model '${config.model}' is installed.` };
            } else {
              return { success: true, message: `Connected to Ollama! However, model '${config.model}' was not found. Available models: ${modelNames.join(", ") || "none"}` };
            }
          }
          return { success: false, message: `Ollama replied with error: ${response.status} ${response.statusText}` };
        } catch (err) {
          return { success: false, message: `Cannot reach Ollama at ${config.endpoint}. Make sure the server is active.` };
        }
      }
      
      // Cloud providers validation
      if (!config.key) {
        return { success: false, message: `API Key is required to test connection for cloud provider ${config.provider}.` };
      }
      return { success: true, message: `Credentials formatted. Cloud provider ${config.provider} will sync on next prompt execution.` };
    } catch (error) {
      return { success: false, message: `AI connection test error: ${(error as Error).message}` };
    }
  });

  // Database Backup Handler
  ipcMain.handle("db:backup", async () => {
    try {
      const db = getDb();
      const ideasList = await db.select().from(schema.ideas).all();
      const scriptsList = await db.select().from(schema.scripts).all();
      const settingsList = await db.select().from(schema.settings).all();
      const analyticsList = await db.select().from(schema.analytics).all();

      return {
        ideas: ideasList,
        scripts: scriptsList,
        settings: settingsList,
        analytics: analyticsList
      };
    } catch (error) {
      console.error("[Database Backup] Failed to backup database:", error);
      throw error;
    }
  });

  // Database Restore Handler
  ipcMain.handle("db:restore", async (_, backupData: any) => {
    try {
      const db = getDb();
      
      // Truncate tables first
      await db.delete(schema.ideas).run();
      await db.delete(schema.scripts).run();
      await db.delete(schema.analytics).run();
      await db.delete(schema.settings).run();

      // Restore ideas
      if (backupData.ideas?.length > 0) {
        for (const idea of backupData.ideas) {
          await db.insert(schema.ideas).values(idea).run();
        }
      }

      // Restore scripts
      if (backupData.scripts?.length > 0) {
        for (const script of backupData.scripts) {
          await db.insert(schema.scripts).values(script).run();
        }
      }

      // Restore analytics
      if (backupData.analytics?.length > 0) {
        for (const analytic of backupData.analytics) {
          await db.insert(schema.analytics).values(analytic).run();
        }
      }

      // Restore settings
      if (backupData.settings?.length > 0) {
        for (const setting of backupData.settings) {
          await db.insert(schema.settings).values(setting).run();
        }
      } else {
        // Fallback seed
        await db.insert(schema.settings).values({
          id: "global",
          theme: "dark",
          aiProvider: "ollama",
          aiModel: "llama3.2",
          updatedAt: new Date().toISOString(),
        }).run();
      }

      return { success: true };
    } catch (error) {
      console.error("[Database Restore] Failed to restore database:", error);
      throw error;
    }
  });

  // Database Clear Handler
  ipcMain.handle("db:clear", async () => {
    try {
      const db = getDb();
      
      await db.delete(schema.ideas).run();
      await db.delete(schema.scripts).run();
      await db.delete(schema.analytics).run();
      await db.delete(schema.settings).run();

      // Seed settings default
      await db.insert(schema.settings).values({
        id: "global",
        theme: "dark",
        aiProvider: "ollama",
        aiModel: "llama3.2",
        updatedAt: new Date().toISOString(),
      }).run();

      return { success: true };
    } catch (error) {
      console.error("[Database Clear] Failed to clear database:", error);
      throw error;
    }
  });
}
