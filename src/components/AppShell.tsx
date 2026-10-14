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
  Plus,
  Command
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
  const [searchQuery, setSearchQuery] = useState("");
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

  // Custom project modal state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const isLight = settings?.theme === "light";

  // Synchronize <html> root class with active theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (isLight) {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [isLight]);

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
    const nextTheme = isLight ? "dark" : "light";
    await updateSettings({ theme: nextTheme });
  };

  // Parse appearance attributes from brandColors json string
  const appearance = {
    primary: isLight ? "#4f46e5" : "#6366f1",
    secondary: isLight ? "#f8fafc" : "#030307",
    fontSize: "14px",
    fontFamily: "Inter",
    glassBlur: "24px",
    glassOpacity: isLight ? "0.85" : "0.65",
    glowIntensity: isLight ? "0.18" : "0.35",
    borderWidth: "1px"
  };

  try {
    if (settings?.brandColors) {
      const parsed = JSON.parse(settings.brandColors);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        Object.assign(appearance, parsed);
      }
    }
  } catch (err) {
    // Fallback
  }

  // Adjust theme variables dynamically
  const themeBg = isLight ? "#f8fafc" : (appearance.secondary || "#030307");
  const themeText = isLight ? "#0f172a" : "#f8fafc";
  const themeTextMuted = isLight ? "#64748b" : "#94a3b8";
  const themeGlassBg = isLight ? `rgba(255, 255, 255, ${appearance.glassOpacity})` : `rgba(14, 14, 25, ${appearance.glassOpacity})`;
  const themeGlassBorder = isLight ? `rgba(15, 23, 42, 0.08)` : `rgba(255, 255, 255, 0.08)`;
  const themeShadow = isLight ? `0 12px 32px -4px rgba(15, 23, 42, 0.06), 0 2px 8px -2px rgba(15, 23, 42, 0.04)` : `0 16px 40px -8px rgba(0, 0, 0, 0.65), 0 4px 12px -2px rgba(0, 0, 0, 0.4)`;
  const themeShadowInset = isLight ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.95)` : `inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`;

  // Resolve font-family styling variables loaded in layout.tsx
  let fontVar = "var(--font-sans)";
  if (appearance.fontFamily === "Outfit") fontVar = "var(--font-outfit)";
  if (appearance.fontFamily === "Mono") fontVar = "var(--font-mono)";
  if (appearance.fontFamily === "Serif") fontVar = "var(--font-serif)";

  // Filter ideas for quick search in Cmd+K
  const searchResults = searchQuery.trim()
    ? ideas.filter(i => 
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

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
    <div 
      className={`flex h-screen w-screen overflow-hidden relative bg-[var(--bg-canvas)] transition-colors duration-300 ${isLight ? "light-theme" : "dark-theme"}`} 
      style={customStyles}
    >
      {/* ===================================================================
          Hardware-Accelerated Liquid Aurora Meshes (60/120 FPS GPU Composited)
          Zero CPU rasterization lag, silky smooth floating depth
          =================================================================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Orb 1: Violet / Indigo Ambient Mesh */}
        <div 
          className="absolute top-[-15%] left-[-10%] w-[680px] h-[680px] rounded-full blur-[100px] pointer-events-none animate-liquid-1 transition-all duration-700" 
          style={{
            background: isLight 
              ? "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.14) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(147, 51, 234, 0.35) 45%, transparent 75%)",
            opacity: appearance.glowIntensity || 0.35,
          }}
        />

        {/* Orb 2: Cyan / Teal Liquid Aurora */}
        <div 
          className="absolute bottom-[-15%] right-[-10%] w-[720px] h-[720px] rounded-full blur-[110px] pointer-events-none animate-liquid-2 transition-all duration-700" 
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(20, 184, 166, 0.12) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, rgba(13, 148, 136, 0.3) 50%, transparent 75%)",
            opacity: appearance.glowIntensity || 0.35,
          }}
        />

        {/* Orb 3: Luminous Magenta Accent */}
        <div 
          className="absolute top-[28%] left-[26%] w-[500px] h-[500px] rounded-full blur-[95px] pointer-events-none animate-liquid-3 transition-all duration-700" 
          style={{
            background: isLight
              ? "radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 75%)"
              : "radial-gradient(circle, rgba(236, 72, 153, 0.28) 0%, rgba(124, 58, 237, 0.22) 50%, transparent 75%)",
            opacity: appearance.glowIntensity || 0.35,
          }}
        />

        {/* Tactile micro-grain overlay for realistic frosted glass refraction */}
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-20 dark:opacity-30" />
      </div>

      {/* Electron Titlebar Drag Area */}
      <div className="titlebar-drag absolute top-0 left-0 right-0 h-9 z-50 pointer-events-none" />

      {/* Sidebar - Heavy Frosty Glass with Clean High-Contrast Hierarchy */}
      <aside className="w-64 border-r border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl flex flex-col h-full z-40 select-none transition-colors duration-300">
        {/* Top titlebar spacer */}
        <div className="h-9 w-full shrink-0" />

        {/* Logo Section */}
        <div className="px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
              <div className="absolute inset-0 h-4 w-4 rounded-full bg-indigo-400 blur-[2px] opacity-45 animate-pulse" />
            </div>
            <span className="font-extrabold tracking-tight text-sm text-zinc-900 dark:text-white">
              CreatorOS
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono border border-[var(--glass-border)] rounded-full bg-black/[0.03] dark:bg-white/[0.04] px-2 py-0.5 select-none font-bold">
            v0.1.0
          </span>
        </div>

        {/* Project Selector */}
        <div className="px-4 mb-3.5 shrink-0 titlebar-no-drag">
          <div className="flex flex-col gap-2 border-b border-[var(--glass-border)] pb-3.5">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-400 px-1 flex items-center gap-1.5">
              <FolderOpen className="h-3 w-3 text-indigo-500 dark:text-indigo-400" /> Workspace Channel
            </span>
            <select
              value={activeProject?.id || ""}
              onChange={(e) => selectProject(e.target.value)}
              className="w-full h-8 bg-white/80 dark:bg-black/50 border border-[var(--glass-border)] rounded-xl px-2.5 py-0 text-xs font-semibold text-zinc-800 dark:text-zinc-200 outline-none hover:border-indigo-500/40 transition shadow-sm"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-white dark:bg-[#0e0e13] text-zinc-800 dark:text-zinc-200">
                  📁 {proj.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="w-full h-7 flex items-center justify-center gap-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 rounded-xl text-[10px] font-bold tracking-wider uppercase transition"
              title="Create New Project"
            >
              <Plus className="h-3 w-3" />
              <span>New Workspace</span>
            </button>
          </div>
        </div>

        {/* Global Search Button */}
        <div className="px-4 mb-3 shrink-0 titlebar-no-drag">
          <button 
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-all duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              <span className="font-medium">Search Commands</span>
            </div>
            <kbd className="text-[9px] font-mono bg-black/[0.05] dark:bg-white/[0.08] border border-[var(--glass-border)] rounded px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400 shadow-sm flex items-center gap-0.5">
              <Command className="h-2.5 w-2.5" />K
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 relative group ${
                  isActive 
                    ? "text-indigo-600 dark:text-indigo-300 bg-indigo-500/12 border border-indigo-500/20 shadow-sm font-bold" 
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                }`}
              >
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom AI Status Bar with Sun/Moon Theme Toggle */}
        <div className="p-3.5 border-t border-[var(--glass-border)] bg-black/[0.02] dark:bg-black/[0.2] flex items-center justify-between text-xs shrink-0 select-none titlebar-no-drag">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold">
            <Sparkles className={`h-3.5 w-3.5 ${aiOnline ? "text-indigo-500 dark:text-indigo-400 animate-pulse" : "text-zinc-400 dark:text-zinc-600"}`} />
            <span className="text-[11px]">Local AI</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sun / Moon Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded-xl border border-[var(--glass-border)] bg-white/80 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 transition shadow-sm"
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? <Moon className="h-3.5 w-3.5 text-indigo-600" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
            </button>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-[var(--glass-border)]">
              <span className={`w-2 h-2 rounded-full ${
                aiOnline === null ? "bg-amber-500" : aiOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" : "bg-rose-500"
              }`} />
              <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {aiOnline === null ? "Check" : aiOnline ? "Ready" : "Standby"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel View Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-transparent">
        {/* Top Navbar Header */}
        <header className="h-14 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl flex items-center justify-between px-8 shrink-0 select-none titlebar-no-drag mt-9 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
              {menuItems.find((item) => item.viewId === activeView)?.label || "Workspace"}
            </span>
          </div>

          {/* Active Video Context Selector */}
          {activeProject && (
            <div className="flex items-center gap-2 bg-white/70 dark:bg-white/[0.03] border border-[var(--glass-border)] px-3 py-1 rounded-xl shadow-sm">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 font-mono">Active Scope:</span>
              <select
                value={activeIdea?.id || ""}
                onChange={(e) => {
                  const idea = ideas.find(i => i.id === e.target.value) || null;
                  setActiveIdea(idea);
                }}
                className="bg-transparent text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 outline-none hover:text-indigo-700 dark:hover:text-indigo-200 transition cursor-pointer max-w-xs truncate"
              >
                <option value="" className="bg-white dark:bg-[#0e0e13] text-zinc-500">
                  Select a video context...
                </option>
                {ideas.map((idea) => (
                  <option key={idea.id} value={idea.id} className="bg-white dark:bg-[#0e0e13] text-zinc-800 dark:text-zinc-200">
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
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-24"
            >
              <motion.div 
                initial={{ scale: 0.95, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white/95 dark:bg-[#0e0e13]/90 border border-[var(--glass-border)] backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--glass-border)]">
                  <Search className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search anything (ideas, scripts, notes)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
                    autoFocus
                  />
                  <button 
                    onClick={() => setSearchOpen(false)}
                    className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-white/[0.08] border border-[var(--glass-border)] rounded px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  >
                    ESC
                  </button>
                </div>
                
                <div className="p-3 max-h-72 overflow-y-auto divide-y divide-[var(--glass-border)]">
                  {searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <div 
                        key={res.id}
                        onClick={() => {
                          setActiveIdea(res);
                          setActiveView("ideas");
                          setSearchOpen(false);
                        }}
                        className="p-2.5 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{res.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{res.description || "Video idea concept"}</p>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold shrink-0">
                          {res.status}
                        </span>
                      </div>
                    ))
                  ) : searchQuery ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      No matching ideas or scripts found for "{searchQuery}".
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      Type to search ideas, concepts, and studio scripts...
                    </div>
                  )}
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
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 titlebar-no-drag"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white dark:bg-[#0e0e13]/95 border border-[var(--glass-border)] backdrop-blur-2xl rounded-2xl p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FolderOpen className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
                    <span>Create Workspace Channel</span>
                  </h3>
                  <button 
                    onClick={() => setIsNewProjectModalOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
                  >
                    Close
                  </button>
                </div>

                <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Workspace Channel Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design & Tech Vlog"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-[var(--glass-border)] rounded-xl px-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-200 outline-none focus:border-indigo-500/40"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Channel Overview Description</label>
                    <textarea
                      placeholder="Describe target content, channel goals, or niche..."
                      value={newProjectDesc}
                      onChange={e => setNewProjectDesc(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-black/40 border border-[var(--glass-border)] rounded-xl p-3 text-xs outline-none text-zinc-800 dark:text-zinc-200 h-20 resize-none focus:border-indigo-500/40"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsNewProjectModalOpen(false)}
                      className="border border-[var(--glass-border)] text-zinc-600 dark:text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition"
                    >
                      Create Channel
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
