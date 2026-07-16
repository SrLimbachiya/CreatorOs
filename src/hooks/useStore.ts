import { create } from "zustand";
import { ipc, Project, Idea, AnalyticsRecord, Settings } from "../lib/ipc";

interface AppState {
  activeView: string;
  projects: Project[];
  activeProject: Project | null;
  activeIdea: Idea | null;
  ideas: Idea[];
  analytics: AnalyticsRecord | null;
  settings: Settings | null;
  loadingIdeas: boolean;
  loadingProjects: boolean;
  
  setActiveView: (view: string) => void;
  loadAll: () => Promise<void>;
  
  // Project operations
  createProject: (name: string, description: string | null) => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Idea operations
  setActiveIdea: (idea: Idea | null) => void;
  createIdea: (idea: Omit<Idea, "id" | "projectId" | "createdAt" | "updatedAt" | "recordingChecklist" | "editingChecklist" | "durationBadge" | "progressPercent" | "thumbnailStartColor" | "thumbnailEndColor" | "thumbnailText" | "actualViews" | "actualCtr" | "actualRetention" | "actualSubscribers" | "actualWatchTime" | "actualRpm" | "publishedAt">) => Promise<void>;
  updateIdea: (id: string, fields: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  
  // Settings operations
  updateSettings: (fields: Partial<Settings>) => Promise<void>;
  
  // Analytics operations
  updateAnalytics: (record: Omit<AnalyticsRecord, "id">) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  activeView: "dashboard",
  projects: [],
  activeProject: null,
  activeIdea: null,
  ideas: [],
  analytics: null,
  settings: null,
  loadingIdeas: false,
  loadingProjects: false,

  setActiveView: (view) => set({ activeView: view }),

  loadAll: async () => {
    set({ loadingIdeas: true, loadingProjects: true });
    try {
      // 1. Fetch projects, settings, and analytics first
      const [projectsList, analyticsList, settingsData] = await Promise.all([
        ipc.projects.list(),
        ipc.analytics.get(),
        ipc.settings.get(),
      ]);

      // 2. Resolve active project
      let currentProject = get().activeProject;
      if (projectsList.length > 0) {
        if (!currentProject || !projectsList.some(p => p.id === currentProject!.id)) {
          currentProject = projectsList[0];
        }
      } else {
        currentProject = null;
      }

      // 3. Fetch ideas for the active project
      let ideasList: Idea[] = [];
      if (currentProject) {
        ideasList = await ipc.ideas.list(currentProject.id);
      }

      // 4. Resolve active idea
      let currentIdea = get().activeIdea;
      if (currentIdea && ideasList.length > 0) {
        const found = ideasList.find(i => i.id === currentIdea!.id);
        currentIdea = found || null;
      } else {
        currentIdea = null;
      }

      set({
        projects: projectsList,
        activeProject: currentProject,
        activeIdea: currentIdea,
        ideas: ideasList,
        analytics: analyticsList[0] || null,
        settings: settingsData,
        loadingIdeas: false,
        loadingProjects: false,
      });
    } catch (error) {
      console.error("[Zustand] Failed to load data from IPC:", error);
      set({ loadingIdeas: false, loadingProjects: false });
    }
  },

  createProject: async (name, description) => {
    const id = Math.random().toString(36).substring(2, 11);
    await ipc.projects.create({
      id,
      name,
      description,
    });
    // Set activeProject immediately to the newly created project
    const projectsList = await ipc.projects.list();
    const newProj = projectsList.find(p => p.id === id) || projectsList[0];
    set({ activeProject: newProj, activeIdea: null });
    await get().loadAll();
  },

  selectProject: async (id) => {
    const proj = get().projects.find(p => p.id === id) || null;
    set({ activeProject: proj, activeIdea: null });
    await get().loadAll();
  },

  deleteProject: async (id) => {
    await ipc.projects.delete(id);
    const current = get().activeProject;
    if (current && current.id === id) {
      set({ activeProject: null, activeIdea: null });
    }
    await get().loadAll();
  },

  setActiveIdea: (idea) => set({ activeIdea: idea }),

  createIdea: async (idea) => {
    const activeProj = get().activeProject;
    if (!activeProj) {
      console.error("[Zustand] Cannot create idea: No active project selected.");
      return;
    }

    const id = Math.random().toString(36).substring(2, 11);
    const newIdea: Idea = {
      ...idea,
      id,
      projectId: activeProj.id,
      recordingChecklist: null,
      editingChecklist: null,
      durationBadge: null,
      progressPercent: 0,
      thumbnailStartColor: "#6366f1",
      thumbnailEndColor: "#312e81",
      thumbnailText: "NEW CONCEPT",
      actualViews: 0,
      actualCtr: 0,
      actualRetention: 0,
      actualSubscribers: 0,
      actualWatchTime: 0,
      actualRpm: 0,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await ipc.ideas.create(newIdea);
    await get().loadAll();
    
    // Automatically set the new idea as the active idea to streamline flow
    const updatedIdeas = get().ideas;
    const addedIdea = updatedIdeas.find(i => i.id === id);
    if (addedIdea) {
      set({ activeIdea: addedIdea });
    }
  },

  updateIdea: async (id, fields) => {
    await ipc.ideas.update(id, fields);
    await get().loadAll();
  },

  deleteIdea: async (id) => {
    await ipc.ideas.delete(id);
    const current = get().activeIdea;
    if (current && current.id === id) {
      set({ activeIdea: null });
    }
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
