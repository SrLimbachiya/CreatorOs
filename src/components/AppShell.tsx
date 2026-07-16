"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../hooks/useStore";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Search, 
  PenTool, 
  TrendingUp, 
  Settings, 
  Sparkles,
  SearchCode,
  Clapperboard,
  Sun,
  Moon,
  FolderOpen,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../lib/ipc";

interface SidebarItemProps {
  viewId: string;
  label: string;
  icon: React.ComponentType<any>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { 
    activeView, 
    setActiveView, 
    settings, 
    updateSettings, 
    loadAll,
    projects,
    activeProject,
    selectProject,
    createProject,
    ideas,
    activeIdea,
    setActiveIdea
  } = useStore();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

  // Custom project modal state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    await createProject(newProjectName.trim(), newProjectDesc.trim() || null);
    setNewProjectName("");
    setNewProjectDesc("");
    setIsNewProjectModalOpen(false);
  };

  useEffect(() => {
    loadAll();
    
    const checkAiStatus = async () => {
      try {
        const settings = await ipc.settings.get();
        const endpoint = settings?.apiEndpoint || "http://127.0.0.1:11434";
        const res = await fetch(`${endpoint}/api/tags`).catch(() => null);
        setAiOnline(!!res && res.ok);
      } catch {
        setAiOnline(false);
      }
    };
    checkAiStatus();
    const interval = setInterval(checkAiStatus, 30000);
    return () => clearInterval(interval);
  }, [loadAll]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const menuItems: SidebarItemProps[] = [
    { viewId: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { viewId: "ideas", label: "Idea Vault", icon: Lightbulb },
    { viewId: "workspace", label: "Research", icon: SearchCode },
    { viewId: "scripts", label: "Script Studio", icon: PenTool },
    { viewId: "metadata", label: "Metadata Studio", icon: Clapperboard },
    { viewId: "competitors", label: "Competitor Analysis", icon: TrendingUp },
    { viewId: "settings", label: "Settings", icon: Settings },
  ];

  // Toggle dynamic theme state handler
  const handleToggleTheme = async () => {
    const nextTheme = settings?.theme === "light" ? "dark" : "light";
    await updateSettings({ theme: nextTheme });
  };

  const isLight = settings?.theme === "light";

  // Parse appearance attributes from brandColors json string
  const appearance = {
    primary: isLight ? "#4f46e5" : "#6366f1",
    secondary: isLight ? "#f8fafc" : "#020204",
    fontSize: "14px",
    fontFamily: "Inter",
    glassBlur: "40px",
    glassOpacity: isLight ? "0.75" : "0.35",
    glowIntensity: isLight ? "0.05" : "0.25",
    borderWidth: "1px"
  };

  try {
    if (settings?.brandColors) {
      Object.assign(appearance, JSON.parse(settings.brandColors));
    }
  } catch (err) {
    // Fallback
  }

  // Adjust theme variables dynamically
  const themeBg = isLight ? (appearance.secondary === "#020204" ? "#f8fafc" : appearance.secondary) : appearance.secondary;
  const themeText = isLight ? "#0f172a" : "#f4f4f5";
  const themeTextMuted = isLight ? "#475569" : "#a1a1aa";
  const themeGlassBg = isLight ? `rgba(255, 255, 255, ${appearance.glassOpacity})` : `rgba(15, 15, 25, ${appearance.glassOpacity})`;
  const themeGlassBorder = isLight ? `rgba(15, 23, 42, 0.08)` : `rgba(255, 255, 255, 0.08)`;
  const themeShadow = isLight ? `0 10px 30px -10px rgba(15, 23, 42, 0.08)` : `0 10px 40px 0 rgba(0, 0, 0, 0.6)`;
  const themeShadowInset = isLight ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.8)` : `inset 0 1px 0 0 rgba(255, 255, 255, 0.12)`;

  // Resolve font-family styling variables loaded in layout.tsx
  let fontVar = "var(--font-sans)";
  if (appearance.fontFamily === "Outfit") fontVar = "var(--font-outfit)";
  if (appearance.fontFamily === "Mono") fontVar = "var(--font-mono)";
  if (appearance.fontFamily === "Serif") fontVar = "var(--font-serif)";

  // CSS variables injected inline to allow real-time layout rendering adjustments
  const customStyles = {
    "--base-font-size": appearance.fontSize,
    "--glass-blur": appearance.glassBlur,
    "--glass-opacity": appearance.glassOpacity,
    "--glow-opacity": appearance.glowIntensity,
    "--glass-border-width": appearance.borderWidth,
    "--primary-color": appearance.primary,
    
    // Theme Variables mapping
    "--bg-canvas": themeBg,
    "--text-main": themeText,
    "--text-sub": themeTextMuted,
    "--glass-bg": themeGlassBg,
    "--glass-border": themeGlassBorder,
    "--card-shadow": themeShadow,
    "--card-shadow-inset": themeShadowInset,
    fontFamily: fontVar,
  } as React.CSSProperties;

  return (
    <div className={`flex h-screen w-screen overflow-hidden text-zinc-100 relative bg-[var(--bg-canvas)] transition-colors duration-300 ${isLight ? "light-theme" : "dark-theme"}`} style={customStyles}>
      {/* SVG Liquid Refraction Filter Primitive */}
      <svg className="absolute w-0 h-0 pointer-events-none select-none">
        <defs>
          <filter id="liquid-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Floating Background Meshes warped by SVG Liquid Refraction Filter */}
      <div 
        className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 opacity-[var(--glow-opacity)] pointer-events-none select-none animate-liquid-1" 
        style={{ filter: "url(#liquid-filter) blur(80px)" }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 opacity-[var(--glow-opacity)] pointer-events-none select-none animate-liquid-2" 
        style={{ filter: "url(#liquid-filter) blur(90px)" }}
      />
      <div 
        className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-rose-400 opacity-[var(--glow-opacity)] pointer-events-none select-none animate-liquid-3" 
        style={{ filter: "url(#liquid-filter) blur(85px)" }}
      />

      {/* Electron Titlebar Drag Area */}
      <div className="titlebar-drag absolute top-0 left-0 right-0 h-9 z-50 pointer-events-none" />

      {/* Sidebar - Heavy Frosty Glass */}
      <aside className="w-64 border-r border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-3xl flex flex-col h-full z-40 select-none">
        {/* Top titlebar spacer */}
        <div className="h-10 w-full shrink-0" />

        {/* Logo Section */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
              <div className="absolute inset-0 h-3.5 w-3.5 rounded-full bg-indigo-400 blur-[2px] opacity-45 animate-pulse" />
            </div>
            <span className="font-bold tracking-wider text-sm bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              CreatorOS
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono border border-[var(--glass-border)] rounded-full bg-white/[0.02] px-2 py-0.5 select-none font-bold">
            v0.1.0
          </span>
        </div>

        {/* Project Selector */}
        <div className="px-4 mb-4 shrink-0 titlebar-no-drag">
          <div className="flex flex-col gap-2 border-b border-white/[0.03] pb-3.5">
            <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-500 px-1 flex items-center gap-1">
              <FolderOpen className="h-2.5 w-2.5 text-indigo-400" /> Workspace Project
            </span>
            <select
              value={activeProject?.id || ""}
              onChange={(e) => selectProject(e.target.value)}
              className="w-full h-8 bg-black/40 border border-[var(--glass-border)] rounded-xl px-3 py-0 text-xs font-bold text-zinc-200 outline-none hover:bg-white/[0.03] transition"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-[#0e0e13] text-zinc-200 font-sans">
                  📁 {proj.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="w-full h-8 flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-300 rounded-xl text-[10px] font-bold tracking-wider uppercase transition"
              title="Create New Project"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Global Search Button */}
        <div className="px-4 mb-4 shrink-0 titlebar-no-drag">
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 text-zinc-400 hover:text-zinc-200 text-xs shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <span className="font-semibold">Search Command</span>
            </div>
            <kbd className="text-[9px] font-mono bg-white/[0.05] border border-[var(--glass-border)] rounded px-1.5 py-0.5 text-zinc-500 shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto titlebar-no-drag">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.viewId;
            return (
              <button
                key={item.viewId}
                onClick={() => setActiveView(item.viewId)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 relative group ${
                  isActive 
                    ? "text-indigo-300 bg-indigo-500/15 border-l-2 border-indigo-500 rounded-l-none" 
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                }`}
              >
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] blur-[1px]" />
                )}
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-105 ${isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Status bar */}
        <div className="p-4 border-t border-[var(--glass-border)] bg-black/[0.15] flex items-center justify-between text-xs shrink-0 select-none titlebar-no-drag">
          <div className="flex items-center gap-2 text-zinc-400 font-semibold">
            <Sparkles className={`h-3.5 w-3.5 ${aiOnline ? "text-indigo-400 animate-pulse" : "text-zinc-600"}`} />
            <span>Local AI Agent</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Sun / Moon Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-1 rounded-lg border border-[var(--glass-border)] bg-white/[0.02] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition"
              title={isLight ? "Dark Mode" : "Light Mode"}
            >
              {isLight ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>

            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                aiOnline === null ? "bg-amber-500/80" : aiOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              }`} />
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                {aiOnline === null ? "check" : aiOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel View Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-transparent">
        {/* Top Navbar Header */}
        <header className="h-14 border-b border-[var(--glass-border)] bg-black/[0.1] backdrop-blur-md flex items-center justify-between px-8 shrink-0 select-none titlebar-no-drag mt-9">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-400 font-mono">
              {menuItems.find((item) => item.viewId === activeView)?.label || "Workspace"}
            </span>
          </div>

          {/* Active Video Context Selector */}
          {activeProject && (
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-xl">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 font-mono">Scope:</span>
              <select
                value={activeIdea?.id || ""}
                onChange={(e) => {
                  const idea = ideas.find(i => i.id === e.target.value) || null;
                  setActiveIdea(idea);
                }}
                className="bg-transparent text-[10px] font-extrabold text-indigo-300 outline-none hover:text-indigo-200 transition cursor-pointer"
              >
                <option value="" className="bg-[#0e0e13] text-zinc-500">
                  Select a video context...
                </option>
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id} className="bg-[#0e0e13] text-zinc-200">
                    🎬 {idea.title} [{idea.status}]
                  </option>
                ))}
              </select>
            </div>
          )}
        </header>

        {/* Search Command Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start justify-center pt-24"
            >
              <motion.div 
                initial={{ scale: 0.95, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#0e0e13]/85 border border-[var(--glass-border)] backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04]">
                  <Search className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search anything (ideas, scripts, notes)..."
                    className="w-full bg-transparent border-0 outline-none text-sm text-zinc-200 placeholder-zinc-500"
                    autoFocus
                  />
                  <button 
                    onClick={() => setSearchOpen(false)}
                    className="text-[9px] font-mono font-bold bg-white/[0.05] border border-white/[0.06] rounded px-1.5 py-0.5 text-zinc-400 hover:text-zinc-200"
                  >
                    ESC
                  </button>
                </div>
                <div className="p-5 text-center text-xs text-zinc-500">
                  Global search indexing database...
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Project Modal */}
        <AnimatePresence>
          {isNewProjectModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewProjectModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 titlebar-no-drag"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-[#0e0e13]/90 border border-white/[0.06] backdrop-blur-2xl rounded-2xl p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                    <FolderOpen className="h-4.5 w-4.5 text-indigo-400" />
                    <span>Create Workspace Project</span>
                  </h3>
                  <button 
                    onClick={() => setIsNewProjectModalOpen(false)}
                    className="text-zinc-500 hover:text-zinc-200 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-sans">Project Channel Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design vlog channel"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/20 font-sans"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-sans">Overview Description</label>
                    <textarea
                      placeholder="Describe content target or channel category..."
                      value={newProjectDesc}
                      onChange={e => setNewProjectDesc(e.target.value)}
                      className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-20 resize-none font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewProjectModalOpen(false)}
                      className="border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/[0.03] transition font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition font-sans"
                    >
                      Create Project
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View container */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
