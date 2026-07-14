import { contextBridge, ipcRenderer } from "electron";

// Define the API exposed to the renderer process
contextBridge.exposeInMainWorld("electron", {
  ideas: {
    list: () => ipcRenderer.invoke("ideas:list"),
    get: (id: string) => ipcRenderer.invoke("ideas:get", id),
    create: (idea: any) => ipcRenderer.invoke("ideas:create", idea),
    update: (id: string, idea: any) => ipcRenderer.invoke("ideas:update", id, idea),
    delete: (id: string) => ipcRenderer.invoke("ideas:delete", id),
  },
  analytics: {
    get: () => ipcRenderer.invoke("analytics:get"),
    update: (data: any) => ipcRenderer.invoke("analytics:update", data),
  },
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    update: (data: any) => ipcRenderer.invoke("settings:update", data),
  },
  ai: {
    chat: (prompt: string) => ipcRenderer.invoke("ai:chat", prompt),
    testConnection: (config: any) => ipcRenderer.invoke("ai:test-connection", config),
  },
  db: {
    path: () => ipcRenderer.invoke("db:path"),
    backup: () => ipcRenderer.invoke("db:backup"),
    restore: (data: any) => ipcRenderer.invoke("db:restore", data),
    clear: () => ipcRenderer.invoke("db:clear"),
  },
  platform: process.platform,
});
