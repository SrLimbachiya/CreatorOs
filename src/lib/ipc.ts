export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  category: string | null;
  tags: string | null; // JSON array of string
  priority: "Low" | "Medium" | "High";
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedViews: number | null;
  inspiration: string | null;
  referencesText: string | null;
  links: string | null; // JSON array of {title, url}
  notes: string | null;
  status: "Idea" | "Research" | "Scripting" | "Recording" | "Editing" | "Thumbnail" | "Scheduled" | "Published" | "Archived";
  
  // Production metadata (from MetadataStudio checklists & layout)
  recordingChecklist: string | null; // JSON list of strings
  editingChecklist: string | null; // JSON list of strings
  durationBadge: string | null;
  progressPercent: number;
  thumbnailStartColor: string | null;
  thumbnailEndColor: string | null;
  thumbnailText: string | null;

  // Actual published analytics
  actualViews: number;
  actualCtr: number;
  actualRetention: number;
  actualSubscribers: number;
  actualWatchTime: number;
  actualRpm: number;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  ideaId: string;
  title: string;
  content: string | null;
  durationEstimated: number | null;
  readingTime: number | null;
  status: "Draft" | "Review" | "Completed";
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsRecord {
  id: string;
  views: number;
  ctr: number;
  retention: number;
  subscribers: number;
  rpm: number;
  watchTime: number;
  createdAt: string;
}

export interface Settings {
  id: string;
  theme: string;
  aiProvider: string;
  aiModel: string;
  apiEndpoint: string | null;
  apiKey: string | null;
  defaultDescription: string | null;
  brandColors: string | null; // JSON color array
  brandFonts: string | null; // JSON font array
  updatedAt: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "main-channel-workspace",
    name: "Main Channel Workspace",
    description: "Default workspace channel content project.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    projectId: "main-channel-workspace",
    title: "Building an operating system for YouTubers (CreatorOS)",
    description: "A deep dive into Electron + Next.js architecture, SQLite local database, and Ollama integration.",
    category: "Coding",
    tags: JSON.stringify(["coding", "electron", "nextjs", "tutorial"]),
    priority: "High",
    difficulty: "Hard",
    estimatedViews: 15000,
    inspiration: "Tired of using 5 different apps to manage my YouTube channel",
    referencesText: "Electron docs, Drizzle ORM docs, shadcn UI designs",
    links: JSON.stringify([{ title: "Electron Docs", url: "https://electronjs.org" }]),
    notes: "Must detail the IPC connection mechanism so viewers understand main vs renderer.",
    status: "Scripting",
    recordingChecklist: JSON.stringify(["Setup screen recorder", "Clean desktop icons", "Test voice microphone level"]),
    editingChecklist: JSON.stringify(["Add zooming code zooms", "Add smooth custom overlays", "Apply color preset"]),
    durationBadge: "14:20",
    progressPercent: 45,
    thumbnailStartColor: "#a855f7",
    thumbnailEndColor: "#6366f1",
    thumbnailText: "BUILD AN APP IN 24H",
    actualViews: 0,
    actualCtr: 0,
    actualRetention: 0,
    actualSubscribers: 0,
    actualWatchTime: 0,
    actualRpm: 0,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    projectId: "main-channel-workspace",
    title: "10 CSS Tricks I wish I knew earlier",
    description: "Highlighting anchor positioning, container queries, subgrid, and modern scroll-driven animations.",
    category: "Tutorial",
    tags: JSON.stringify(["css", "webdev", "design"]),
    priority: "Medium",
    difficulty: "Easy",
    estimatedViews: 45000,
    inspiration: "Chrome DevTools plugin guidelines",
    referencesText: "web.dev CSS articles",
    links: null,
    notes: "Make the visuals very clean. Zoom in on CSS panel in chrome.",
    status: "Research",
    recordingChecklist: null,
    editingChecklist: null,
    durationBadge: null,
    progressPercent: 15,
    thumbnailStartColor: "#06b6d4",
    thumbnailEndColor: "#3b82f6",
    thumbnailText: "10 CSS TRICKS",
    actualViews: 0,
    actualCtr: 0,
    actualRetention: 0,
    actualSubscribers: 0,
    actualWatchTime: 0,
    actualRpm: 0,
    publishedAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

const MOCK_SCRIPTS: Script[] = [
  {
    id: "script-1",
    ideaId: "1",
    title: "Script: Building CreatorOS",
    content: "# Introduction\nWelcome back to the channel! Today we are looking at the core design rules of desktop software...\n\n# Hook\nDid you know that 85% of developers abandon desktop projects before compiling their first build? Today, I'm showing you the toolchain that bypasses this problem entirely.\n\n# Body\nFirst, we outline how Electron manages background node runtimes while Next.js coordinates clientside UI rendering...",
    durationEstimated: 860,
    readingTime: 340,
    status: "Draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_ANALYTICS: AnalyticsRecord[] = [
  {
    id: "1",
    views: 124500,
    ctr: 6.4,
    retention: 48.2,
    subscribers: 2840,
    rpm: 4.80,
    watchTime: 8200.5,
    createdAt: "2026-06",
  }
];

const MOCK_SETTINGS: Settings = {
  id: "global",
  theme: "dark",
  aiProvider: "ollama",
  aiModel: "llama3.2",
  apiEndpoint: "http://127.0.0.1:11434",
  apiKey: null,
  defaultDescription: "Subscribe for more coding and tech content!",
  brandColors: JSON.stringify(["#6366f1", "#09090b", "#1f1f23"]),
  brandFonts: JSON.stringify({ channelId: "UCmockChannel123", apiKey: "AIzaSyMockKey" }),
  updatedAt: new Date().toISOString(),
};

const isElectron = typeof window !== "undefined" && "electron" in window;

export const ipc = {
  projects: {
    list: async (): Promise<Project[]> => {
      if (isElectron) return (window as any).electron.projects.list();
      return MOCK_PROJECTS;
    },
    create: async (project: Omit<Project, "createdAt" | "updatedAt">): Promise<void> => {
      const fullProject = {
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (isElectron) return (window as any).electron.projects.create(fullProject);
      MOCK_PROJECTS.unshift(fullProject as Project);
    },
    delete: async (id: string): Promise<void> => {
      if (isElectron) return (window as any).electron.projects.delete(id);
      const index = MOCK_PROJECTS.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PROJECTS.splice(index, 1);
      }
    }
  },
  ideas: {
    list: async (projectId?: string): Promise<Idea[]> => {
      if (isElectron) return (window as any).electron.ideas.list(projectId);
      if (projectId) return MOCK_IDEAS.filter(i => i.projectId === projectId);
      return MOCK_IDEAS;
    },
    get: async (id: string): Promise<Idea | null> => {
      if (isElectron) return (window as any).electron.ideas.get(id);
      return MOCK_IDEAS.find(i => i.id === id) || null;
    },
    create: async (idea: Omit<Idea, "createdAt" | "updatedAt">): Promise<void> => {
      const fullIdea = {
        ...idea,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (isElectron) return (window as any).electron.ideas.create(fullIdea);
      MOCK_IDEAS.unshift(fullIdea as Idea);
    },
    update: async (id: string, idea: Partial<Idea>): Promise<void> => {
      if (isElectron) return (window as any).electron.ideas.update(id, idea);
      const index = MOCK_IDEAS.findIndex(i => i.id === id);
      if (index !== -1) {
        MOCK_IDEAS[index] = { ...MOCK_IDEAS[index], ...idea, updatedAt: new Date().toISOString() };
      }
    },
    delete: async (id: string): Promise<void> => {
      if (isElectron) return (window as any).electron.ideas.delete(id);
      const index = MOCK_IDEAS.findIndex(i => i.id === id);
      if (index !== -1) {
        MOCK_IDEAS.splice(index, 1);
      }
    }
  },
  scripts: {
    getByIdea: async (ideaId: string): Promise<Script | null> => {
      if (isElectron) return (window as any).electron.scripts.getByIdea(ideaId);
      return MOCK_SCRIPTS.find(s => s.ideaId === ideaId) || null;
    },
    update: async (script: Omit<Script, "createdAt" | "updatedAt">): Promise<void> => {
      const fullScript = {
        ...script,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Script;
      if (isElectron) return (window as any).electron.scripts.update(fullScript);
      const index = MOCK_SCRIPTS.findIndex(s => s.id === script.id);
      if (index !== -1) {
        MOCK_SCRIPTS[index] = fullScript;
      } else {
        MOCK_SCRIPTS.push(fullScript);
      }
    }
  },
  analytics: {
    get: async (): Promise<AnalyticsRecord[]> => {
      if (isElectron) return (window as any).electron.analytics.get();
      return MOCK_ANALYTICS;
    },
    update: async (record: Omit<AnalyticsRecord, "id"> & { id?: string }): Promise<void> => {
      const fullRecord = { ...record, id: record.id || "1" } as AnalyticsRecord;
      if (isElectron) return (window as any).electron.analytics.update(fullRecord);
      const index = MOCK_ANALYTICS.findIndex(a => a.id === fullRecord.id);
      if (index !== -1) {
        MOCK_ANALYTICS[index] = fullRecord;
      } else {
        MOCK_ANALYTICS.push(fullRecord);
      }
    }
  },
  settings: {
    get: async (): Promise<Settings> => {
      if (isElectron) return (window as any).electron.settings.get();
      return MOCK_SETTINGS;
    },
    update: async (records: Partial<Settings>): Promise<void> => {
      if (isElectron) return (window as any).electron.settings.update(records);
      Object.assign(MOCK_SETTINGS, records, { updatedAt: new Date().toISOString() });
    }
  },
  ai: {
    chat: async (prompt: string): Promise<string> => {
      if (isElectron) return (window as any).electron.ai.chat(prompt);
      await new Promise(resolve => setTimeout(resolve, 800));
      return `Offline Mode Prompt reply: Yes, I heard your prompt: "${prompt}". To get dynamic local AI results, please run this inside the built CreatorOS desktop app with Ollama running.`;
    },
    testConnection: async (config: { provider: string; endpoint: string; model: string; key: string }): Promise<{ success: boolean; message: string }> => {
      if (isElectron) return (window as any).electron.ai.testConnection(config);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: `Connected successfully! Target model '${config.model}' mock loaded inside Browser Mode.` };
    }
  },
  db: {
    path: async (): Promise<string> => {
      if (isElectron) return (window as any).electron.db.path();
      return "browser-localstorage.db";
    },
    backup: async (): Promise<any> => {
      if (isElectron) return (window as any).electron.db.backup();
      return {
        ideas: MOCK_IDEAS,
        scripts: MOCK_SCRIPTS,
        settings: [MOCK_SETTINGS],
        analytics: MOCK_ANALYTICS
      };
    },
    restore: async (data: any): Promise<{ success: boolean }> => {
      if (isElectron) return (window as any).electron.db.restore(data);
      if (data.ideas) {
        MOCK_IDEAS.length = 0;
        MOCK_IDEAS.push(...data.ideas);
      }
      return { success: true };
    },
    clear: async (): Promise<{ success: boolean }> => {
      if (isElectron) return (window as any).electron.db.clear();
      MOCK_IDEAS.length = 0;
      return { success: true };
    }
  },
  isElectron: () => isElectron,
  platform: isElectron ? (window as any).electron.platform : "web",
};
