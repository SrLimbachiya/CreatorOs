import { create } from "zustand";
import { ipc, Idea, AnalyticsRecord, Settings } from "../lib/ipc";

interface AppState {
  activeView: string;
  ideas: Idea[];
  analytics: AnalyticsRecord | null;
  settings: Settings | null;
  loadingIdeas: boolean;
  
  setActiveView: (view: string) => void;
  loadAll: () => Promise<void>;
  
  // Idea operations
  createIdea: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateIdea: (id: string, fields: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  
  // Settings operations
  updateSettings: (fields: Partial<Settings>) => Promise<void>;
  
  // Analytics operations
  updateAnalytics: (record: Omit<AnalyticsRecord, "id">) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  activeView: "dashboard",
  ideas: [],
  analytics: null,
  settings: null,
  loadingIdeas: false,

  setActiveView: (view) => set({ activeView: view }),

  loadAll: async () => {
    set({ loadingIdeas: true });
    try {
      const [ideasList, analyticsList, settingsData] = await Promise.all([
        ipc.ideas.list(),
        ipc.analytics.get(),
        ipc.settings.get(),
      ]);
      
      set({
        ideas: ideasList,
        analytics: analyticsList[0] || null,
        settings: settingsData,
        loadingIdeas: false,
      });
    } catch (error) {
      console.error("[Zustand] Failed to load data from IPC:", error);
      set({ loadingIdeas: false });
    }
  },

  createIdea: async (idea) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newIdea: Idea = {
      ...idea,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await ipc.ideas.create(newIdea);
    await get().loadAll();
  },

  updateIdea: async (id, fields) => {
    await ipc.ideas.update(id, fields);
    await get().loadAll();
  },

  deleteIdea: async (id) => {
    await ipc.ideas.delete(id);
    await get().loadAll();
  },

  updateSettings: async (fields) => {
    await ipc.settings.update(fields);
    await get().loadAll();
  },

  updateAnalytics: async (record) => {
    await ipc.analytics.update(record);
    await get().loadAll();
  },
}));
