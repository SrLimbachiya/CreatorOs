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
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../lib/ipc";

interface SidebarItemProps {
  viewId: string;
  label: string;
  icon: React.ComponentType<any>;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { activeView, setActiveView, settings, updateSettings, loadAll } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOnline, setAiOnline] = useState<boolean | null>(null);

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
    <div className="flex h-screen w-screen overflow-hidden text-zinc-100 relative" style={customStyles}>
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
        <div className="px-6 py-5 flex items-center justify-between shrink-0">
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

        {/* Bottom AI Status bar with Light Mode Toggle */}
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

        {/* View container */}
        <div className="flex-1 overflow-y-auto px-8 py-6 mt-4">
          {children}
        </div>
      </main>
    </div>
  );
}
