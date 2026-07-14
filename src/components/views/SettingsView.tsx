"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../../hooks/useStore";
import { 
  Settings as SettingsIcon, 
  Bot, 
  Youtube, 
  Save, 
  CheckCircle,
  AlertCircle,
  Database,
  HelpCircle,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2,
  Palette,
  RefreshCw,
  Type,
  Layout,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../../lib/ipc";

type TabId = "ai" | "youtube" | "database" | "appearance";

interface PresetPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export default function SettingsView() {
  const { settings, updateSettings, loadAll } = useStore();
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<TabId>("ai");

  // Form fields
  const [aiProvider, setAiProvider] = useState("ollama");
  const [aiModel, setAiModel] = useState("llama3.2");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [defaultDescription, setDefaultDescription] = useState("");
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [youtubeApiKey, setYoutubeApiKey] = useState("");

  // Appearance & Styling configurations
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#020204");
  const [fontSize, setFontSize] = useState("14px");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [glassBlur, setGlassBlur] = useState("40px");
  const [glassOpacity, setGlassOpacity] = useState("0.35");
  const [glowIntensity, setGlowIntensity] = useState("0.25");
  const [borderWidth, setBorderWidth] = useState("1px");

  // Masking toggles
  const [showApiKey, setShowApiKey] = useState(false);
  const [showYtKey, setShowYtKey] = useState(false);

  // States
  const [dbPath, setDbPath] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [aiTestStatus, setAiTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [aiTestMessage, setAiTestMessage] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Dribbble-inspired theme palettes
  const colorPresets: PresetPalette[] = [
    { id: "amethyst", name: "Amethyst Purple", primary: "#a855f7", secondary: "#080710" },
    { id: "emerald", name: "Emerald Tech", primary: "#10b981", secondary: "#040b08" },
    { id: "aurora", name: "Aurora Cyan", primary: "#06b6d4", secondary: "#02080c" },
    { id: "rose", name: "Luminous Rose", primary: "#f43f5e", secondary: "#0c0205" },
    { id: "amber", name: "Amber Glint", primary: "#f59e0b", secondary: "#0d0a02" },
    { id: "classic", name: "Creator Indigo", primary: "#6366f1", secondary: "#020204" }
  ];

  // Load database path and sync state
  useEffect(() => {
    loadAll();
    const fetchDbPath = async () => {
      try {
        const pathStr = await ipc.db.path();
        setDbPath(pathStr);
      } catch {
        setDbPath("creatoros.db");
      }
    };
    fetchDbPath();
  }, [loadAll]);

  // Load database values into local forms
  useEffect(() => {
    if (settings) {
      setAiProvider(settings.aiProvider || "ollama");
      setAiModel(settings.aiModel || "llama3.2");
      setApiEndpoint(settings.apiEndpoint || "http://127.0.0.1:11434");
      setApiKey(settings.apiKey || "");
      setDefaultDescription(settings.defaultDescription || "");
      
      // Parse Youtube credentials
      try {
        if (settings.brandFonts) {
          const ytObj = JSON.parse(settings.brandFonts);
          setYoutubeChannelId(ytObj.channelId || "");
          setYoutubeApiKey(ytObj.apiKey || "");
        }
      } catch {
        // Fallback
      }

      // Parse Brand & Appearance variables
      try {
        if (settings.brandColors) {
          const appObj = JSON.parse(settings.brandColors);
          setPrimaryColor(appObj.primary || "#6366f1");
          setSecondaryColor(appObj.secondary || "#020204");
          setFontSize(appObj.fontSize || "14px");
          setFontFamily(appObj.fontFamily || "Inter");
          setGlassBlur(appObj.glassBlur || "40px");
          setGlassOpacity(appObj.glassOpacity || "0.35");
          setGlowIntensity(appObj.glowIntensity || "0.25");
          setBorderWidth(appObj.borderWidth || "1px");
        }
      } catch {
        // Fallback
      }
    }
  }, [settings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus("saving");

    try {
      const youtubeInfoJson = JSON.stringify({
        channelId: youtubeChannelId,
        apiKey: youtubeApiKey
      });

      const appearanceJson = JSON.stringify({
        primary: primaryColor,
        secondary: secondaryColor,
        fontSize,
        fontFamily,
        glassBlur,
        glassOpacity,
        glowIntensity,
        borderWidth
      });

      await updateSettings({
        aiProvider,
        aiModel,
        apiEndpoint,
        apiKey: apiKey || null,
        defaultDescription,
        brandFonts: youtubeInfoJson,
        brandColors: appearanceJson,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (err) {
      console.error("Save settings error:", err);
      setSaveStatus("idle");
    }
  };

  const handleApplyPreset = (preset: PresetPalette) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  const handleTestConnection = async () => {
    setAiTestStatus("testing");
    setAiTestMessage("");
    try {
      const res = await ipc.ai.testConnection({
        provider: aiProvider,
        endpoint: apiEndpoint,
        model: aiModel,
        key: apiKey
      });

      if (res.success) {
        setAiTestStatus("success");
        setAiTestMessage(res.message);
      } else {
        setAiTestStatus("error");
        setAiTestMessage(res.message);
      }
    } catch (err) {
      setAiTestStatus("error");
      setAiTestMessage(`Test failed: ${(err as Error).message}`);
    }
  };

  const handleBackup = async () => {
    try {
      const backupData = await ipc.db.backup();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(backupData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `creatoros_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (error) {
      alert(`Database backup failed: ${(error as Error).message}`);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = async (event) => {
      try {
        const fileContent = event.target?.result as string;
        const backupData = JSON.parse(fileContent);
        const res = await ipc.db.restore(backupData);
        if (res.success) {
          alert("Database restored successfully! Reloading...");
          window.location.reload();
        }
      } catch (err) {
        alert(`Failed to parse and restore backup: ${(err as Error).message}`);
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleClearDatabase = async () => {
    try {
      const res = await ipc.db.clear();
      if (res.success) {
        setShowClearConfirm(false);
        alert("Database has been reset completely. Reloading...");
        window.location.reload();
      }
    } catch (err) {
      alert(`Failed to clear database: ${(err as Error).message}`);
    }
  };

  const tabs = [
    { id: "ai", label: "AI Models Setup", icon: Bot },
    { id: "youtube", label: "YouTube Studio API", icon: Youtube },
    { id: "database", label: "Database Console", icon: Database },
    { id: "appearance", label: "Appearance & Themes", icon: Palette },
  ];

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-indigo-400" />
            <span>Settings Engine</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">Configure credentials parameters, database files, and dynamic custom themes.</p>
        </div>
        
        <button
          onClick={() => handleSave()}
          disabled={saveStatus === "saving"}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300"
        >
          {saveStatus === "saved" ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-emerald-200">Settings Saved</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>{saveStatus === "saving" ? "Saving..." : "Save Settings"}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-210px)] select-none">
        {/* Left tabs selector panel */}
        <div className="md:col-span-1 border border-white/[0.03] bg-zinc-950/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col gap-1 shrink-0 h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition duration-300 ${
                  isActive 
                    ? "liquid-tab-active text-indigo-300 border-white/[0.05]" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-400" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Tab View - Liquid Glass */}
        <div className="md:col-span-3 h-full overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="liquid-card rounded-2xl p-6 border border-white/[0.03] space-y-5 h-full overflow-y-auto"
            >
              {/* TAB 1: AI MODELS SETUP */}
              {activeTab === "ai" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/[0.04]">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Bot className="h-4 w-4 text-indigo-400" />
                      <span>Local / Cloud LLM Setup</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">AI Provider</label>
                      <select
                        value={aiProvider}
                        onChange={e => setAiProvider(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="ollama">Ollama (Local Offline LLM)</option>
                        <option value="openai">OpenAI (GPT API Cloud)</option>
                        <option value="gemini">Google Gemini API Cloud</option>
                        <option value="anthropic">Anthropic Claude API Cloud</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Target Model Name</label>
                      <input
                        type="text"
                        value={aiModel}
                        onChange={e => setAiModel(e.target.value)}
                        placeholder="e.g. llama3.2, gpt-4o, gemini-1.5-flash"
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">API Endpoint Port</label>
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={e => setApiEndpoint(e.target.value)}
                      placeholder="http://127.0.0.1:11434"
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>

                  {aiProvider !== "ollama" && (
                    <div className="space-y-1 relative">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">API Credentials secret Key</label>
                      <div className="relative">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={apiKey}
                          onChange={e => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-black/40 border border-white/[0.05] rounded-xl pl-3.5 pr-10 py-2 text-xs text-zinc-200 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Testing Connection controls */}
                  <div className="pt-4 border-t border-white/[0.04] space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Validate Setup Connection</span>
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={aiTestStatus === "testing"}
                        className="flex items-center gap-1.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.07] text-zinc-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                      >
                        {aiTestStatus === "testing" && <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />}
                        <span>{aiTestStatus === "testing" ? "Testing Connection..." : "Test AI Connection"}</span>
                      </button>
                    </div>

                    {aiTestStatus !== "idle" && (
                      <div className={`p-3 rounded-xl text-xs flex gap-2 border ${
                        aiTestStatus === "success" 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : aiTestStatus === "error" 
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                          : "bg-white/[0.01] border-white/[0.03] text-zinc-400"
                      }`}>
                        {aiTestStatus === "success" ? (
                          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        )}
                        <p className="font-mono text-[10px] leading-relaxed">{aiTestMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: YOUTUBE STUDIO API */}
              {activeTab === "youtube" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/[0.04]">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-rose-400" />
                      <span>YouTube Integration Configuration</span>
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Channel ID</label>
                    <input
                      type="text"
                      value={youtubeChannelId}
                      onChange={e => setYoutubeChannelId(e.target.value)}
                      placeholder="e.g. UCXyYyZzZ..."
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>

                  <div className="space-y-1 relative">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">YouTube Data API Key</label>
                    <div className="relative">
                      <input
                        type={showYtKey ? "text" : "password"}
                        value={youtubeApiKey}
                        onChange={e => setYoutubeApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl pl-3.5 pr-10 py-2 text-xs text-zinc-200 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowYtKey(!showYtKey)}
                        className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                      >
                        {showYtKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Default Upload Description Template</label>
                    <textarea
                      value={defaultDescription}
                      onChange={e => setDefaultDescription(e.target.value)}
                      placeholder="Links, social profiles, affiliate info, default brand text..."
                      className="w-full bg-black/30 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-28 resize-none focus:border-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: DATABASE CONSOLE */}
              {activeTab === "database" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/[0.04]">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>Local SQLite Database Console</span>
                    </h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Database filepath</label>
                    <div className="p-3 bg-black/40 border border-white/[0.05] rounded-xl font-mono text-[9px] text-zinc-400 select-all leading-relaxed">
                      {dbPath || "resolving..."}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/[0.04] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">Data Backup / Export</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Save all logged ideas, scripts, and parameters to a JSON file.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBackup}
                        className="flex items-center gap-1.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Export Backup JSON</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">Data Recovery / Restore</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Overwrite tables using a previously generated JSON backup file.</p>
                      </div>
                      <label className="flex items-center gap-1.5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload JSON File</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreFile}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
                      <div>
                        <h4 className="text-xs font-bold text-rose-400">Database Wipe Reset</h4>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Wipe all schemas completely. Action cannot be undone.</p>
                      </div>
                      
                      {showClearConfirm ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleClearDatabase}
                            className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                          >
                            Yes, Reset Database
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="border border-white/5 text-zinc-400 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-white/[0.03]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(true)}
                          className="flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Clear Tables Data</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: APPEARANCE & THEMES */}
              {activeTab === "appearance" && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/[0.04]">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Palette className="h-4 w-4 text-indigo-400" />
                      <span>Appearance & Typography Model</span>
                    </h3>
                  </div>

                  {/* PREMIUM COLOR PRESETS */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Premium Dribbble-inspired Color Palettes</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {colorPresets.map((preset) => {
                        const isSelected = primaryColor === preset.primary && secondaryColor === preset.secondary;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className={`p-2.5 rounded-xl border flex flex-col gap-1.5 transition text-left cursor-pointer ${
                              isSelected 
                                ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-300" 
                                : "bg-black/30 border-white/[0.03] text-zinc-400 hover:border-white/[0.08]"
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px] font-bold truncate leading-none">{preset.name}</span>
                              {isSelected && <Check className="h-3 w-3 text-indigo-400 shrink-0" />}
                            </div>
                            <div className="flex gap-1 items-center">
                              {/* Color chips preview */}
                              <div className="h-3.5 w-3.5 rounded-full border border-white/10" style={{ backgroundColor: preset.primary }} />
                              <div className="h-3.5 w-3.5 rounded-full border border-white/10" style={{ backgroundColor: preset.secondary }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom color picker overrides */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.03]">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Custom Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="h-8 w-8 rounded-lg border border-white/[0.05] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={e => setPrimaryColor(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/[0.05] rounded-xl px-3.5 py-1.5 text-xs text-zinc-200 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Custom Background Canvas</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="h-8 w-8 rounded-lg border border-white/[0.05] bg-transparent cursor-pointer shrink-0"
                        />
                        <input
                          type="text"
                          value={secondaryColor}
                          onChange={e => setSecondaryColor(e.target.value)}
                          className="flex-1 bg-black/40 border border-white/[0.05] rounded-xl px-3.5 py-1.5 text-xs text-zinc-200 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fonts and Sizes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/[0.03]">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5" /> Font Family
                      </span>
                      <select
                        value={fontFamily}
                        onChange={e => setFontFamily(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="Inter">Inter (Sleek Clean Sans)</option>
                        <option value="Outfit">Outfit (Rounded Modern Geometric)</option>
                        <option value="Mono">JetBrains Mono (Developer Console)</option>
                        <option value="Serif">Playfair Display (Luxury Serif)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
                        <Layout className="h-3.5 w-3.5" /> Font Size Scale
                      </span>
                      <select
                        value={fontSize}
                        onChange={e => setFontSize(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="12px">Compact Ultra (12px)</option>
                        <option value="14px">Sleek Medium (14px - Default)</option>
                        <option value="15px">Comfortable (15px)</option>
                        <option value="16px">Large Scale (16px)</option>
                      </select>
                    </div>
                  </div>

                  {/* Liquid Glass settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Glass Backdrop Opacity</label>
                      <select
                        value={glassOpacity}
                        onChange={e => setGlassOpacity(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="0.15">High Transparency (15%)</option>
                        <option value="0.25">Medium Transparency (25%)</option>
                        <option value="0.35">Standard Frosted Glass (35%)</option>
                        <option value="0.45">Dense Acrylic Glass (45%)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Backdrop Blur Strength</label>
                      <select
                        value={glassBlur}
                        onChange={e => setGlassBlur(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="15px">Soft Glow (15px)</option>
                        <option value="30px">Medium Refraction (30px)</option>
                        <option value="40px">Heavy Frosted Blur (40px)</option>
                        <option value="60px">Deep Liquid Distortion (60px)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Card Border Stroke</label>
                      <select
                        value={borderWidth}
                        onChange={e => setBorderWidth(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="0px">Border-Free Panels (0px)</option>
                        <option value="1px">Hairline Saturated (1px)</option>
                        <option value="2px">Vibrant Outline (2px)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Liquid Gradient Mesh Glow</label>
                      <select
                        value={glowIntensity}
                        onChange={e => setGlowIntensity(e.target.value)}
                        className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                      >
                        <option value="0.0">No Backdrop Glow (0%)</option>
                        <option value="0.12">Dim Ambient Glow (12%)</option>
                        <option value="0.25">Standard Ambient Glow (25%)</option>
                        <option value="0.45">Bright Liquid Mesh (45%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-white/[0.01] border border-white/[0.02] rounded-xl text-[10px] text-zinc-500 flex gap-2">
                    <HelpCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                    <p>Appearance settings update CSS custom properties globally. Scaling applies immediately upon clicking **Save Settings**.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
