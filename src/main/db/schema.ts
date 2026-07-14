import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Ideas table
export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // e.g. "Coding", "Vlog", "Tutorial"
  tags: text("tags"), // JSON array of strings
  priority: text("priority"), // "Low", "Medium", "High"
  difficulty: text("difficulty"), // "Easy", "Medium", "Hard"
  estimatedViews: integer("estimated_views"),
  inspiration: text("inspiration"),
  referencesText: text("references_text"),
  links: text("links"), // JSON array of { title, url }
  notes: text("notes"),
  status: text("status").notNull().default("Idea"), // "Idea", "Research", "Scripting", "Recording", "Editing", "Thumbnail", "Scheduled", "Published", "Archived"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Scripts table
export const scripts = sqliteTable("scripts", {
  id: text("id").primaryKey(),
  ideaId: text("idea_id").references(() => ideas.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content"), // Rich text JSON or HTML
  durationEstimated: integer("duration_estimated"), // in seconds
  readingTime: integer("reading_time"), // in seconds
  status: text("status").notNull().default("Draft"), // "Draft", "Review", "Completed"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Analytics table (for snapshots)
export const analytics = sqliteTable("analytics", {
  id: text("id").primaryKey(),
  views: integer("views").notNull().default(0),
  ctr: real("ctr").notNull().default(0.0), // Click-through rate in %
  retention: real("retention").notNull().default(0.0), // Average percentage watched
  subscribers: integer("subscribers").notNull().default(0),
  rpm: real("rpm").notNull().default(0.0), // Revenue per mille
  watchTime: real("watch_time").notNull().default(0.0), // in hours
  createdAt: text("created_at").notNull(), // date string e.g. "2026-07"
});

// Settings table
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(), // "global"
  theme: text("theme").notNull().default("dark"),
  aiProvider: text("ai_provider").notNull().default("ollama"), // "ollama", "openai", "anthropic", "gemini"
  aiModel: text("ai_model").notNull().default("llama3.2"),
  apiEndpoint: text("api_endpoint"), // Custom endpoint (e.g. for Ollama or Local AI)
  apiKey: text("api_key"),
  defaultDescription: text("default_description"),
  brandColors: text("brand_colors"), // JSON array of colors
  brandFonts: text("brand_fonts"), // JSON array of fonts
  updatedAt: text("updated_at").notNull(),
});
