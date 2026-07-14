export interface Idea {
  id: string;
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
  brandFonts: string | null; // JSON font array (used for YouTube credentials config JSON)
  updatedAt: string;
}

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
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
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "My $1000/mo desk setup tour",
    description: "Going through my minimalist workspace layout, monitor arm, and mechanical keyboard.",
    category: "Vlog",
    tags: JSON.stringify(["setup", "tech", "minimalist"]),
    priority: "Low",
    difficulty: "Medium",
    estimatedViews: 8000,
    inspiration: "Minimalist setup channels on YouTube",
    referencesText: "Product links and descriptions ready",
    links: null,
    notes: "Ensure B-roll has nice lighting and shadows.",
    status: "Idea",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
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
  ideas: {
    list: async (): Promise<Idea[]> => {
      if (isElectron) return (window as any).electron.ideas.list();
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
        scripts: [],
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
