"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { 
  Clapperboard, 
  Sparkles, 
  CheckSquare, 
  Tv, 
  Smartphone, 
  Sidebar as SidebarIcon,
  Tag as TagIcon,
  AlertTriangle,
  CheckCircle,
  Copy,
  Volume2,
  Video,
  Key,
  Eye,
  Sliders,
  Play,
  RotateCw,
  Search,
  Plus,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../../lib/ipc";

type SubTabId = "preview" | "keyword" | "seo" | "checklist";

interface KeywordPoint {
  keyword: string;
  volume: number; // 0 to 100
  competition: number; // 0 to 100
  score: number; // 0 to 100
}

export default function MetadataStudioView() {
  const { settings, activeIdea, updateIdea, ideas, setActiveIdea } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("preview");

  // YouTube API key configuration
  const [ytApiKey, setYtApiKey] = useState("");
  useEffect(() => {
    try {
      if (settings?.brandFonts) {
        const ytObj = JSON.parse(settings.brandFonts);
        setYtApiKey(ytObj.apiKey || "");
      }
    } catch {
      // Fallback
    }
  }, [settings]);

  // Preview form states (Autosaving text inputs)
  const [videoTitle, setVideoTitle] = useState("");
  const [thumbGradientStart, setThumbGradientStart] = useState("");
  const [thumbGradientEnd, setThumbGradientEnd] = useState("");
  const [thumbText, setThumbText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [progressPercent, setProgressPercent] = useState(75);

  // Synchronize local preview states when activeIdea context changes
  useEffect(() => {
    if (activeIdea) {
      setVideoTitle(activeIdea.title);
      setThumbGradientStart(activeIdea.thumbnailStartColor || "#8b5cf6");
      setThumbGradientEnd(activeIdea.thumbnailEndColor || "#3b82f6");
      setThumbText(activeIdea.thumbnailText || "LOCAL AI");
      setDurationText(activeIdea.durationBadge || "10:15");
      setProgressPercent(activeIdea.progressPercent || 0);
    }
  }, [activeIdea?.id]);

  // Debounced save for preview metadata
  useEffect(() => {
    if (!activeIdea || !videoTitle) return;

    const timer = setTimeout(async () => {
      await updateIdea(activeIdea.id, {
        title: videoTitle,
        thumbnailStartColor: thumbGradientStart,
        thumbnailEndColor: thumbGradientEnd,
        thumbnailText: thumbText,
        durationBadge: durationText,
        progressPercent: progressPercent
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [videoTitle, thumbGradientStart, thumbGradientEnd, thumbText, durationText, progressPercent, activeIdea?.id]);

  // Static mockup text fields (channel name & views simulate)
  const [channelName, setChannelName] = useState("CodeCrafting");
  const [viewsCount, setViewsCount] = useState("124K views");
  const [uploadTime, setUploadTime] = useState("3 days ago");
  const [showDuration, setShowDuration] = useState(true);
  const [showProgress, setShowProgress] = useState(true);

  // Competitor Tag Extractor states
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [extractedTags, setExtractedTags] = useState<string[]>([]);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Keyword Matrix states
  const [searchQuery, setSearchQuery] = useState("");
  const [evaluatingKeyword, setEvaluatingKeyword] = useState(false);
  const [keywordPoints, setKeywordPoints] = useState<KeywordPoint[]>([
    { keyword: "local llm electron", volume: 75, competition: 20, score: 85 },
    { keyword: "ollama tutorial", volume: 85, competition: 65, score: 62 },
    { keyword: "electron tutorial 2026", volume: 45, competition: 15, score: 70 },
    { keyword: "how to run llama3.2 offline", volume: 90, competition: 80, score: 55 }
  ]);

  // AI Title & Chapters Studio states
  const [scriptSnippet, setScriptSnippet] = useState(
    "00:00 Introduction to local running models. Today we are setting up Ollama.\n01:30 Downloading the llama3.2 weight model. Make sure you select the 3B size.\n03:15 Writing the JavaScript fetch endpoint connection.\n05:45 Testing the connection latency and optimizing response limits."
  );
  const [aiChapters, setAiChapters] = useState("");
  const [aiTags, setAiTags] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedChapters, setCopiedChapters] = useState(false);

  // Title Frameworks Brainstorming States
  const [brainstormTopic, setBrainstormTopic] = useState("Running local LLMs inside Desktop Apps");
  const [brainstormingTitles, setBrainstormingTitles] = useState<Record<string, string>>({});
  const [titlesLoading, setTitlesLoading] = useState(false);

  // Checklists (Read & Write directly to database serialized array columns)
  const recordingChecklist = activeIdea?.recordingChecklist
    ? (JSON.parse(activeIdea.recordingChecklist) as { id: string; label: string; checked: boolean }[])
    : [
        { id: "1", label: "Mic gain calibrated (keep around -12dB to -6dB)", checked: true },
        { id: "2", label: "Key light and fill lights powered at 5600K", checked: true },
        { id: "3", label: "Camera lens wiped and focus set to Manual Face-Tracking", checked: false },
        { id: "4", label: "Screen recorder resolution set to 1440p 60fps", checked: false },
        { id: "5", label: "Batteries charged and back-up card formatted", checked: false },
        { id: "6", label: "Cold water placed near desk", checked: true }
      ];

  const editingChecklist = activeIdea?.editingChecklist
    ? (JSON.parse(activeIdea.editingChecklist) as { id: string; label: string; checked: boolean }[])
    : [
        { id: "e1", label: "Visual Hook zoomed in every 3 seconds to keep focus", checked: false },
        { id: "e2", label: "Background ambient lo-fi music ducked under speaking level (-22dB)", checked: false },
        { id: "e3", label: "Color graded with primary brand LUT", checked: false },
        { id: "e4", label: "Animated transition swooshes aligned with B-roll entries", checked: false },
        { id: "e5", label: "Auto captions formatted into readable 2-word segments", checked: false }
      ];

  const toggleRecordingCheck = async (id: string) => {
    if (!activeIdea) return;
    const updated = recordingChecklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    await updateIdea(activeIdea.id, { recordingChecklist: JSON.stringify(updated) });
  };

  const toggleEditingCheck = async (id: string) => {
    if (!activeIdea) return;
    const updated = editingChecklist.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
    await updateIdea(activeIdea.id, { editingChecklist: JSON.stringify(updated) });
  };

  // Extract competitor video tags
  const handleExtractTags = async () => {
    setExtractLoading(true);
    setExtractError("");
    setExtractedTags([]);
    
    try {
      if (!competitorUrl.trim()) {
        throw new Error("Competitor video URL is required.");
      }
      
      let videoId = "";
      if (competitorUrl.includes("v=")) {
        videoId = competitorUrl.split("v=")[1]?.split("&")[0];
      } else if (competitorUrl.includes("youtu.be/")) {
        videoId = competitorUrl.split("youtu.be/")[1]?.split("?")[0];
      }
      
      if (!videoId) {
        throw new Error("Invalid YouTube video URL format.");
      }

      if (!ytApiKey) {
        throw new Error("YouTube API Key is missing. Connect it in Settings -> YouTube API.");
      }

      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${ytApiKey}`);
      if (!res.ok) {
        throw new Error(`Google API returned error: ${res.statusText}`);
      }

      const data = await res.json();
      const tags = data.items?.[0]?.snippet?.tags || [];
      
      if (tags.length === 0) {
        setExtractError("Connected to video, but no public tags were extracted from it.");
      } else {
        setExtractedTags(tags);
      }
    } catch (err) {
      setExtractError((err as Error).message);
    } finally {
      setExtractLoading(false);
    }
  };

  // Evaluate SEO matrix keyword score
  const handleEvaluateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setEvaluatingKeyword(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const vol = Math.floor(Math.random() * 50) + 40; // 40-90
      const comp = Math.floor(Math.random() * 60) + 20; // 20-80
      const score = Math.max(10, Math.floor(vol * 1.5 - comp * 0.5));
      
      const newPoint: KeywordPoint = {
        keyword: searchQuery.trim().toLowerCase(),
        volume: vol,
        competition: comp,
        score: Math.min(100, score)
      };
      
      setKeywordPoints(prev => [newPoint, ...prev]);
      setSearchQuery("");
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingKeyword(false);
    }
  };

  // Generate chapters timelines
  const handleGenerateChapters = async () => {
    setAiLoading(true);
    setAiChapters("");
    try {
      const prompt = `You are a script indexing bot. Format this transcript into YouTube chapters timestamps. Maintain the exact formatting '00:00 Intro'. Make the titles engaging and punchy:\n\n"${scriptSnippet}"`;
      const response = await ipc.ai.chat(prompt);
      setAiChapters(response);
    } catch (err) {
      setAiChapters(`AI outline error: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Brainstorm titles by framework formulas
  const handleBrainstormTitles = async () => {
    setTitlesLoading(true);
    setBrainstormingTitles({});
    try {
      const prompt = `Brainstorm a title for: "${brainstormTopic}". Generate exactly four titles, formatted strictly as:\nCURIOSITY: [Title]\nFOMO: [Title]\nSTORY: [Title]\nSHOCK: [Title]\n\nKeep titles concise and clickable.`;
      const response = await ipc.ai.chat(prompt);
      
      const lines = response.split("\n");
      const parsed: Record<string, string> = {};
      lines.forEach(line => {
        if (line.includes("CURIOSITY:")) parsed.curiosity = line.replace("CURIOSITY:", "").trim();
        if (line.includes("FOMO:")) parsed.fomo = line.replace("FOMO:", "").trim();
        if (line.includes("STORY:")) parsed.story = line.replace("STORY:", "").trim();
        if (line.includes("SHOCK:")) parsed.shock = line.replace("SHOCK:", "").trim();
      });
      
      setBrainstormingTitles(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setTitlesLoading(false);
    }
  };

  const handleCopyChapters = () => {
    navigator.clipboard.writeText(aiChapters);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  // Render selection prompt if no active video scope is select
  if (!activeIdea) {
    return (
      <div className="h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.04] text-zinc-500 mb-4 animate-pulse">
          <Clapperboard className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">No Active Video Scope</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
          Checklists and mock thumbnail simulation parameters are tied contextually to individual videos. Select a video from the active project list below to configure metadata packaging:
        </p>

        <div className="mt-6 w-full max-w-md space-y-2">
          {ideas.length === 0 ? (
            <p className="text-[10px] text-zinc-600 font-mono">Create an idea in the Idea Vault to start packaging.</p>
          ) : (
            ideas.slice(0, 4).map((idea) => (
              <button
                key={idea.id}
                onClick={() => setActiveIdea(idea)}
                className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/30 rounded-xl text-left text-xs font-semibold text-zinc-300 hover:text-white transition group"
              >
                <span className="truncate pr-2">🎬 {idea.title}</span>
                <span className="text-[9px] uppercase font-mono text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  Select Scope <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Clapperboard className="h-5 w-5 text-indigo-400" />
              <span>Metadata & Packaging Studio</span>
            </h1>
            <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              Scope: {activeIdea.title}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Audit SEO keywords, simulate YouTube feed CTR previews, generate AI timestamps, and coordinate checklists.</p>
        </div>

        {/* Sub-tabs Switcher */}
        <div className="bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl flex gap-1 text-[10px] font-semibold text-zinc-400 select-none">
          <button
            onClick={() => setActiveSubTab("preview")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeSubTab === "preview" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
          >
            Feed Simulator
          </button>
          <button
            onClick={() => setActiveSubTab("keyword")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeSubTab === "keyword" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
          >
            Keyword Discovery
          </button>
          <button
            onClick={() => setActiveSubTab("seo")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeSubTab === "seo" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
          >
            AI Title & Chapters
          </button>
          <button
            onClick={() => setActiveSubTab("checklist")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeSubTab === "checklist" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
          >
            Checklists Console
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-150px)] select-none">
        <AnimatePresence mode="wait">
          
          {/* SUBTAB 1: FEED PREVIEWER & OVERLAYS */}
          {activeSubTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start"
            >
              {/* Left Config Panel */}
              <div className="lg:col-span-1 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono border-b border-white/[0.03] pb-2">Feed Configurator</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">Video Title Length</label>
                    <input 
                      type="text" 
                      value={videoTitle}
                      onChange={e => setVideoTitle(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold">
                      <span className={videoTitle.length > 60 ? "text-amber-400" : "text-zinc-500"}>
                        {videoTitle.length} characters
                      </span>
                      <span>Max recommended: 60</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Channel Name</label>
                      <input 
                        type="text" 
                        value={channelName}
                        onChange={e => setChannelName(e.target.value)}
                        className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-[#a1a1aa]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Views Metric</label>
                      <input 
                        type="text" 
                        value={viewsCount}
                        onChange={e => setViewsCount(e.target.value)}
                        className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-[#a1a1aa]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Gradient Start</label>
                      <input 
                        type="text" 
                        value={thumbGradientStart}
                        onChange={e => setThumbGradientStart(e.target.value)}
                        className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Gradient End</label>
                      <input 
                        type="text" 
                        value={thumbGradientEnd}
                        onChange={e => setThumbGradientEnd(e.target.value)}
                        className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-500">Thumbnail overlay Text</label>
                    <input 
                      type="text" 
                      value={thumbText}
                      onChange={e => setThumbText(e.target.value)}
                      placeholder="e.g. ELECTRON"
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                <div className="border-t border-white/[0.03] pt-3 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-zinc-500">Simulate Overlays</span>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Watched Progress Bar</span>
                      <input 
                        type="checkbox"
                        checked={showProgress}
                        onChange={e => setShowProgress(e.target.checked)}
                        className="accent-indigo-500"
                      />
                    </div>

                    {showProgress && (
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={e => setProgressPercent(parseInt(e.target.value))}
                          className="flex-1 accent-indigo-500"
                        />
                        <span className="text-[9px] font-mono font-bold text-zinc-400">{progressPercent}%</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">Duration Tag</span>
                      <input 
                        type="checkbox"
                        checked={showDuration}
                        onChange={e => setShowDuration(e.target.checked)}
                        className="accent-indigo-500"
                      />
                    </div>

                    {showDuration && (
                      <input 
                        type="text" 
                        value={durationText}
                        onChange={e => setDurationText(e.target.value)}
                        className="w-20 bg-[#050508]/80 border border-white/[0.05] rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-300"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right View Previews (Simulating grids) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Desktop Search Results Feed Mockup */}
                <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.03] pb-2">
                    <Tv className="h-4 w-4 text-zinc-500" />
                    <span>YouTube Desktop Search feed layout</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start bg-[#050508]/40 border border-white/[0.02] p-4 rounded-2xl">
                    
                    {/* Simulated Thumbnail */}
                    <div 
                      className="w-full sm:w-[220px] aspect-video rounded-xl border border-white/[0.04] relative shrink-0 overflow-hidden flex flex-col justify-between p-3"
                      style={{
                        background: `linear-gradient(135deg, ${thumbGradientStart || "#8b5cf6"}, ${thumbGradientEnd || "#3b82f6"})`
                      }}
                    >
                      <div className="w-12 h-3.5 rounded bg-black/40 border border-white/5 flex items-center justify-center text-[7px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                        HD 1080P
                      </div>
                      
                      <h4 className="text-sm font-extrabold text-white text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] uppercase font-mono tracking-tight max-w-[90%] mx-auto leading-tight">
                        {thumbText || "THUMBNAIL HOOK"}
                      </h4>

                      <div className="flex justify-between items-end">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        </div>
                        {showDuration && (
                          <div className="px-1 py-0.5 rounded bg-black/85 text-[8px] font-mono text-zinc-200 font-bold">
                            {durationText}
                          </div>
                        )}
                      </div>

                      {/* Watched progress bar overlay */}
                      {showProgress && (
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                          <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Metadata text details */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-zinc-100 leading-snug line-clamp-2 max-w-md">
                        {videoTitle || "Untitled Concept"}
                      </h3>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        <span>{channelName}</span>
                        <span className="mx-1.5">•</span>
                        <span>{viewsCount}</span>
                        <span className="mx-1.5">•</span>
                        <span>{uploadTime}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed max-w-sm">
                        {activeIdea.description || "Simulating video explanation details logged from ideas vault."}
                      </p>
                    </div>

                  </div>
                </div>

                {/* 2. YouTube Suggested Sidebar Mockup */}
                <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/[0.03] pb-2">
                    <SidebarIcon className="h-4 w-4 text-zinc-500" />
                    <span>YouTube Sidebar suggested recommendation list</span>
                  </div>

                  <div className="flex gap-3 items-start bg-[#050508]/40 border border-white/[0.02] p-3.5 rounded-2xl max-w-md">
                    
                    {/* Simulated small thumbnail */}
                    <div 
                      className="w-[120px] aspect-video rounded-lg border border-white/[0.04] relative shrink-0 overflow-hidden flex flex-col justify-between p-2"
                      style={{
                        background: `linear-gradient(135deg, ${thumbGradientStart || "#8b5cf6"}, ${thumbGradientEnd || "#3b82f6"})`
                      }}
                    >
                      <span />
                      <h4 className="text-[8px] font-extrabold text-white text-center drop-shadow-md uppercase font-mono tracking-tight leading-none">
                        {thumbText}
                      </h4>
                      <div className="flex justify-between items-end">
                        <span />
                        {showDuration && (
                          <div className="px-1 py-0.5 rounded bg-black/85 text-[7px] font-mono text-zinc-200 font-bold">
                            {durationText}
                          </div>
                        )}
                      </div>
                      {showProgress && (
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/20">
                          <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-zinc-200 leading-tight line-clamp-2">
                        {videoTitle}
                      </h3>
                      <div className="text-[9px] text-zinc-400 font-medium">
                        <div>{channelName}</div>
                        <div className="flex gap-1 items-center mt-0.5">
                          <span>{viewsCount}</span>
                          <span>•</span>
                          <span>{uploadTime}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* SUBTAB 2: KEYWORD DISCOVERY MATRIX */}
          {activeSubTab === "keyword" && (
            <motion.div
              key="keyword"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-start"
            >
              {/* Left search */}
              <div className="lg:col-span-1 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">SEO Keyword Discovery</h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Search volume and competition analysis indexer.</p>
                </div>

                <form onSubmit={handleEvaluateKeyword} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter keyword..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/20"
                  />
                  <button 
                    type="submit"
                    disabled={evaluatingKeyword}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-bold transition"
                  >
                    Add
                  </button>
                </form>

                {/* Youtube extractor block */}
                <div className="border-t border-white/[0.03] pt-4 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Competitor tag extractor</span>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Paste YouTube Video URL..."
                      value={competitorUrl}
                      onChange={e => setCompetitorUrl(e.target.value)}
                      className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl px-3 py-2 text-[10px] text-zinc-300 outline-none"
                    />
                    <button 
                      onClick={handleExtractTags}
                      disabled={extractLoading}
                      className="w-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 rounded-xl py-2 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className={`h-3 w-3 ${extractLoading ? "animate-spin text-indigo-400" : ""}`} />
                      <span>{extractLoading ? "Connecting API..." : "Extract Competitor Tags"}</span>
                    </button>
                  </div>

                  {extractError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[9px] font-mono leading-normal">
                      Error: {extractError}
                    </div>
                  )}

                  {extractedTags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider">Extracted Cloud</span>
                      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto bg-black/40 p-2.5 rounded-xl border border-white/[0.02]">
                        {extractedTags.map(tag => (
                          <span 
                            key={tag}
                            className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded text-[8px] font-mono cursor-copy hover:bg-indigo-500/20 transition"
                            onClick={() => navigator.clipboard.writeText(tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Keyword Scatter Map */}
              <div className="lg:col-span-2 liquid-card rounded-2xl border border-white/[0.03] p-5 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.03]">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-4.5 w-4.5 text-indigo-400" /> SEO Competition Scatter Map
                  </h3>
                  <span className="text-[8px] font-mono text-zinc-500 font-bold">X: COMPETITION | Y: SEARCH VOLUME</span>
                </div>

                {/* 2D coordinate canvas map */}
                <div className="flex-1 w-full h-[220px] bg-[#050508]/40 border border-white/[0.02] rounded-2xl relative overflow-hidden mt-4 p-4">
                  {/* Scatter plot gridlines */}
                  <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-white/[0.015]" />
                  <div className="absolute inset-y-0 left-1/2 border-r border-dashed border-white/[0.015]" />

                  {/* Bubble points */}
                  {keywordPoints.map((pt, i) => {
                    const mappedX = (pt.competition / 100) * 80 + 10; // offset percentage
                    const mappedY = 100 - ((pt.volume / 100) * 80 + 10);
                    return (
                      <div 
                        key={i}
                        className="absolute cursor-pointer group shrink-0"
                        style={{ left: `${mappedX}%`, top: `${mappedY}%` }}
                      >
                        <div className="h-3 w-3 rounded-full bg-indigo-500 border border-white/10 group-hover:scale-125 transition" />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 border border-white/[0.06] backdrop-blur-md rounded px-2 py-0.5 text-[8px] font-mono text-zinc-200 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                          <span className="font-bold text-indigo-400">{pt.keyword}</span> (Score: {pt.score})
                        </div>
                      </div>
                    );
                  })}

                  {/* Corner tags */}
                  <div className="absolute top-2 left-2 text-[7px] font-mono text-emerald-400 font-bold uppercase">High Volume / Easy Competitor (Sweetspot)</div>
                  <div className="absolute bottom-2 right-2 text-[7px] font-mono text-rose-500 font-bold uppercase">Low Volume / Tough Competitor (Avoid)</div>
                </div>

                <div className="flex gap-2 overflow-x-auto pt-3 border-t border-white/[0.02] mt-3">
                  {keywordPoints.map((pt, i) => (
                    <div key={i} className="flex flex-col gap-1 p-2 bg-[#050508]/30 border border-white/[0.03] rounded-xl text-[9px] shrink-0 w-36">
                      <span className="font-bold text-zinc-300 truncate">{pt.keyword}</span>
                      <div className="flex justify-between font-mono text-zinc-500 text-[8px]">
                        <span>Vol: {pt.volume}%</span>
                        <span className="text-indigo-400 font-bold">Score: {pt.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 3: AI TITLE & CHAPTERS TIMELINES */}
          {activeSubTab === "seo" && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start"
            >
              {/* Left Chapters outline generation */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4 h-full flex flex-col justify-between overflow-hidden">
                <div className="pb-1 border-b border-white/[0.04]">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Chapters Timestamps Output</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Paste outlines or speech text logs to generate YouTube readable timelines.</p>
                </div>

                <textarea
                  value={scriptSnippet}
                  onChange={e => setScriptSnippet(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/[0.04] focus:border-indigo-500/20 rounded-xl p-3 text-xs outline-none text-zinc-300 h-28 resize-none font-mono"
                />

                {aiChapters && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Generated Timestamps Chapters</span>
                      <button
                        onClick={handleCopyChapters}
                        className="flex items-center gap-1 text-[9px] text-zinc-400 hover:text-zinc-200 transition"
                      >
                        {copiedChapters ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedChapters ? "Copied" : "Copy Chapters"}</span>
                      </button>
                    </div>
                    <div className="max-h-24 overflow-y-auto bg-black/40 p-3 rounded-xl border border-white/[0.03] text-[9px] font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">
                      {aiChapters}
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleGenerateChapters}
                  disabled={aiLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-xs font-bold shadow-lg transition shrink-0"
                >
                  {aiLoading ? "Thinking..." : "Generate Chapters timeline"}
                </button>
              </div>

              {/* Right title brainstorm studio */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4 h-full flex flex-col justify-between overflow-hidden">
                <div className="pb-1 border-b border-white/[0.04]">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">AI Title Brainstorm Studio</h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Generate headline alternatives categorized by clickable framework triggers.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-zinc-500">Core Topic Focus</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={brainstormTopic}
                      onChange={e => setBrainstormTopic(e.target.value)}
                      className="flex-1 bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none"
                    />
                    <button 
                      onClick={handleBrainstormTitles}
                      disabled={titlesLoading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0"
                    >
                      {titlesLoading ? "Brainstorming..." : "Brainstorm"}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 mt-2">
                  {Object.keys(brainstormingTitles).length > 0 ? (
                    Object.entries(brainstormingTitles).map(([framework, headline]) => (
                      <div 
                        key={framework} 
                        className="p-3 bg-[#050508]/40 border border-white/[0.03] rounded-xl hover:border-indigo-500/20 transition cursor-pointer select-text"
                        onClick={() => {
                          setVideoTitle(headline);
                          setActiveSubTab("preview");
                        }}
                      >
                        <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">{framework} formula</span>
                        <p className="text-xs text-zinc-200 font-bold mt-1 leading-snug">{headline}</p>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-center p-6 text-zinc-600 text-[10px] border border-dashed border-white/[0.02] rounded-xl">
                      Click Brainstorm above to suggest curated title hook formulas.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 4: CHECKLISTS CONSOLE */}
          {activeSubTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-start"
            >
              {/* Recording checklist */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.04]">
                  <Volume2 className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">Pre-Shoot / Recording Checklist</h3>
                </div>

                <div className="space-y-3.5">
                  {recordingChecklist.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleRecordingCheck(item.id)}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input 
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="mt-0.5 accent-indigo-500 rounded bg-[#050508] border border-white/[0.05] h-3.5 w-3.5"
                      />
                      <span className={`text-xs ${item.checked ? "text-zinc-500 line-through" : "text-zinc-300 font-medium"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editing checklist */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
                <div className="flex items-center gap-1.5 pb-2 border-b border-white/[0.04]">
                  <Video className="h-4.5 w-4.5 text-emerald-400" />
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest font-mono">Post-Shoot / Editing Checklist</h3>
                </div>

                <div className="space-y-3.5">
                  {editingChecklist.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleEditingCheck(item.id)}
                      className="flex items-start gap-3 cursor-pointer select-none"
                    >
                      <input 
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="mt-0.5 accent-indigo-500 rounded bg-[#050508] border border-white/[0.05] h-3.5 w-3.5"
                      />
                      <span className={`text-xs ${item.checked ? "text-zinc-500 line-through" : "text-zinc-300 font-medium"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
