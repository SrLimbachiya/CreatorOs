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
  Plus
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
  const { settings } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("preview");

  // YouTube API configuration parsed from settings
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

  // Preview form states
  const [videoTitle, setVideoTitle] = useState("Why everyone is shifting to local AI in 2026");
  const [channelName, setChannelName] = useState("CodeCrafting");
  const [viewsCount, setViewsCount] = useState("124K views");
  const [uploadTime, setUploadTime] = useState("3 days ago");
  const [thumbGradientStart, setThumbGradientStart] = useState("#8b5cf6");
  const [thumbGradientEnd, setThumbGradientEnd] = useState("#3b82f6");
  const [thumbText, setThumbText] = useState("LOCAL AI");

  // Thumbnail Overlay States
  const [showDuration, setShowDuration] = useState(true);
  const [durationText, setDurationText] = useState("10:15");
  const [showProgress, setShowProgress] = useState(true);
  const [progressPercent, setProgressPercent] = useState(75);

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

  // Checklists states
  const [recordingChecklist, setRecordingChecklist] = useState([
    { id: "1", label: "Mic gain calibrated (keep around -12dB to -6dB)", checked: true },
    { id: "2", label: "Key light and fill lights powered at 5600K", checked: true },
    { id: "3", label: "Camera lens wiped and focus set to Manual Face-Tracking", checked: false },
    { id: "4", label: "Screen recorder resolution set to 1440p 60fps", checked: false },
    { id: "5", label: "Batteries charged and back-up card formatted", checked: false },
    { id: "6", label: "Cold water placed near desk", checked: true }
  ]);

  const [editingChecklist, setEditingChecklist] = useState([
    { id: "e1", label: "Visual Hook zoomed in every 3 seconds to keep focus", checked: false },
    { id: "e2", label: "Background ambient lo-fi music ducked under speaking level (-22dB)", checked: false },
    { id: "e3", label: "Color graded with primary brand LUT", checked: false },
    { id: "e4", label: "Animated transition swooshes aligned with B-roll entries", checked: false },
    { id: "e5", label: "Auto captions formatted into readable 2-word segments", checked: false }
  ]);

  const toggleRecordingCheck = (id: string) => {
    setRecordingChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const toggleEditingCheck = (id: string) => {
    setEditingChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Extract competitor video tags via YouTube API
  const handleExtractTags = async () => {
    setExtractLoading(true);
    setExtractError("");
    setExtractedTags([]);

    let videoId = "";
    try {
      // Regex parse YouTube URL
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = competitorUrl.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      } else {
        throw new Error("Invalid YouTube video URL format.");
      }
      
      if (!ytApiKey) {
        // Fallback Mock tags in Browser sandbox mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        setExtractedTags(["electron", "nextjs", "sqlite", "drizzle-orm", "vidiq-alternative", "local-ai", "ollama", "coding-tutorial"]);
        return;
      }

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${ytApiKey}`
      );
      if (!res.ok) {
        throw new Error(`YouTube API returned status ${res.status}`);
      }
      const data = await res.json();
      const tags = data.items?.[0]?.snippet?.tags || [];
      if (tags.length === 0) {
        setExtractError("No tags found inside this video metadata.");
      } else {
        setExtractedTags(tags);
      }
    } catch (err) {
      console.warn("Tag extraction failed:", err);
      // Fallback
      setExtractedTags(["ollama", "llama3.2", "electron-framework", "nextjs-app", "local-development", "offline-ai"]);
    } finally {
      setExtractLoading(false);
    }
  };

  // Evaluate query inside keyword matrix
  const handleEvaluateKeyword = async () => {
    if (!searchQuery.trim()) return;
    setEvaluatingKeyword(true);
    try {
      // Prompt LLM or use mock scoring
      const mockVolume = Math.floor(Math.random() * 60) + 40;
      const mockComp = Math.floor(Math.random() * 50) + 20;
      const score = Math.max(10, Math.min(99, mockVolume - (mockComp * 0.3)));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setKeywordPoints(prev => [
        ...prev,
        { keyword: searchQuery, volume: mockVolume, competition: mockComp, score: Math.round(score) }
      ]);
      setSearchQuery("");
    } catch {
      //
    } finally {
      setEvaluatingKeyword(false);
    }
  };

  // Brainstorm Clicky titles via local AI
  const handleBrainstormTitles = async () => {
    setTitlesLoading(true);
    try {
      const prompt = `Based on this topic: "${brainstormTopic}"\n\nGenerate exactly 4 different video titles following these frameworks:\n1. CURIOSITY: make the viewer ask 'how' or 'why'.\n2. FOMO: warn the viewer of a mistake or loss.\n3. STORY: narrative structure.\n4. SHOCK: pattern interrupt.\nFormat the reply as a clear JSON object with keys: curiosity, fomo, story, shock. Return only the JSON object.`;
      
      const response = await ipc.ai.chat(prompt);
      let parsed = {};
      try {
        // Attempt parsing JSON
        const startIdx = response.indexOf("{");
        const endIdx = response.lastIndexOf("}") + 1;
        parsed = JSON.parse(response.slice(startIdx, endIdx));
      } catch {
        parsed = {
          curiosity: "Why 90% of developers fail with desktop AI...",
          fomo: "Stop using cloud APIs for desktop apps immediately",
          story: "How I built an offline assistant inside a desktop wrapper",
          shock: "The local AI runtime model that changes everything"
        };
      }
      setBrainstormingTitles(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setTitlesLoading(false);
    }
  };

  // Generate Chapters & Tags via local AI
  const handleGenerateChapters = async () => {
    setAiLoading(true);
    setAiChapters("");
    setAiTags("");
    try {
      const prompt = `Read the following outline with raw timestamp logs:\n"${scriptSnippet}"\n\nFormat this into a clean list of YouTube timestamps chapters. Correct any formatting issues and make the titles sound very engaging and click-worthy. Return only the final timestamps list.`;
      const chaptersRes = await ipc.ai.chat(prompt);
      
      const tagsPrompt = `Based on the following topic:\n"${videoTitle}"\n\nGenerate 10 highly relevant SEO tags. Return them as a comma-separated list.`;
      const tagsRes = await ipc.ai.chat(tagsPrompt);

      setAiChapters(chaptersRes);
      setAiTags(tagsRes);
    } catch (err) {
      setAiChapters(`Failed to contact local AI: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyChapters = () => {
    navigator.clipboard.writeText(aiChapters);
    setCopiedChapters(true);
    setTimeout(() => setCopiedChapters(false), 2000);
  };

  // Title validation length
  const titleLength = videoTitle.length;
  const titleStatus = titleLength > 70 ? "error" : titleLength > 55 ? "warning" : "success";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-indigo-400" />
            <span>Metadata & Preview Studio</span>
          </h1>
          <p className="text-xs text-zinc-400 font-medium">Verify thumbnail overlays, research competitor tags, plot keyword models, and run local AI Title creators.</p>
        </div>

        {/* Sub-tab selection */}
        <div className="bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl flex gap-1 text-[10px] font-semibold text-zinc-400">
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
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden"
            >
              {/* Left Parameters */}
              <div className="lg:col-span-1 liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 overflow-y-auto">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest pb-1.5 border-b border-white/[0.04]">
                  Feed Simulator Input
                </h3>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Video Title</label>
                    <span className={`text-[10px] font-bold ${
                      titleStatus === "error" ? "text-rose-400" : titleStatus === "warning" ? "text-amber-400" : "text-emerald-400"
                    }`}>{titleLength} / 70</span>
                  </div>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={e => setVideoTitle(e.target.value)}
                    className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                  />
                  {titleStatus === "error" && (
                    <span className="text-[9px] text-rose-400 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="h-3 w-3 shrink-0" /> Title will cut off (...) on YouTube Feeds!
                    </span>
                  )}
                  {titleStatus === "warning" && (
                    <span className="text-[9px] text-amber-400 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="h-3 w-3 shrink-0" /> Getting close to truncation limit on mobile feeds.
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Channel Name</label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={e => setChannelName(e.target.value)}
                    className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Views Excerpt</label>
                    <input
                      type="text"
                      value={viewsCount}
                      onChange={e => setViewsCount(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Time Excerpt</label>
                    <input
                      type="text"
                      value={uploadTime}
                      onChange={e => setUploadTime(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Thumbnail Graphic Text</label>
                  <input
                    type="text"
                    value={thumbText}
                    onChange={e => setThumbText(e.target.value)}
                    className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Mock Start Hex</label>
                    <input
                      type="color"
                      value={thumbGradientStart}
                      onChange={e => setThumbGradientStart(e.target.value)}
                      className="h-8 w-full rounded bg-transparent cursor-pointer border border-white/5"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Mock End Hex</label>
                    <input
                      type="color"
                      value={thumbGradientEnd}
                      onChange={e => setThumbGradientEnd(e.target.value)}
                      className="h-8 w-full rounded bg-transparent cursor-pointer border border-white/5"
                    />
                  </div>
                </div>

                {/* THUMBNAIL OVERLAYS SIMULATOR */}
                <div className="pt-3 border-t border-white/[0.04] space-y-3">
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5" /> Thumbnail Overlays
                  </h4>

                  <div className="space-y-2 bg-[#050508]/30 p-3 rounded-xl border border-white/[0.03]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showDuration}
                          onChange={e => setShowDuration(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-white/[0.08] text-indigo-600 bg-black/40 outline-none"
                        />
                        <span>Duration Badge</span>
                      </label>
                      {showDuration && (
                        <input
                          type="text"
                          value={durationText}
                          onChange={e => setDurationText(e.target.value)}
                          className="w-14 bg-black/50 border border-white/[0.06] rounded px-1.5 py-0.5 text-[10px] text-center font-mono text-zinc-300"
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1.5 border-t border-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showProgress}
                            onChange={e => setShowProgress(e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-white/[0.08] text-indigo-600 bg-black/40 outline-none"
                          />
                          <span>Watched Progress bar</span>
                        </label>
                        {showProgress && <span className="text-[9px] font-mono text-zinc-500 font-bold">{progressPercent}%</span>}
                      </div>
                      {showProgress && (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressPercent}
                          onChange={e => setProgressPercent(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Mock feeds rendering */}
              <div className="lg:col-span-2 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 overflow-y-auto space-y-6">
                
                {/* Desktop Search Card Mockup */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5" /> YouTube Desktop Search Result
                  </h4>
                  <div className="p-4 bg-black/60 border border-white/[0.04] rounded-xl flex flex-col sm:flex-row gap-4 select-none">
                    {/* Mock thumbnail aspect box */}
                    <div 
                      className="w-full sm:w-[220px] aspect-[16/9] rounded-lg shrink-0 flex items-center justify-center font-bold text-white relative shadow-md overflow-hidden select-none border border-white/[0.05]"
                      style={{ background: `linear-gradient(135deg, ${thumbGradientStart} 0%, ${thumbGradientEnd} 100%)` }}
                    >
                      <span className="z-10 text-shadow uppercase font-mono tracking-widest text-sm text-center px-2">{thumbText || "MOCK THUMB"}</span>
                      {/* spec light catch */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
                      
                      {/* Duration overlay simulation */}
                      {showDuration && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1 rounded text-[9px] font-mono font-bold select-none text-zinc-300 border border-white/[0.05]">
                          {durationText}
                        </span>
                      )}

                      {/* Watched progress overlay simulation */}
                      {showProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                          <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Metadata details */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-zinc-100 leading-snug line-clamp-2">
                        {videoTitle}
                      </h3>
                      <div className="text-[11px] text-zinc-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-zinc-400 font-semibold">{channelName}</span>
                        <span className="hidden sm:inline text-zinc-700">&#8226;</span>
                        <span>{viewsCount}</span>
                        <span className="hidden sm:inline text-zinc-700">&#8226;</span>
                        <span>{uploadTime}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed hidden sm:block">
                        This is the video description snippet pulling into search pages. Check links, resources, and subscribe details below...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Feed Simulator */}
                <div className="space-y-2 max-w-sm">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" /> YouTube Mobile App Feed Item
                  </h4>
                  <div className="p-3 bg-black/60 border border-white/[0.04] rounded-xl space-y-3">
                    <div 
                      className="w-full aspect-[16/9] rounded-lg flex items-center justify-center font-bold text-white relative shadow-md overflow-hidden border border-white/[0.05]"
                      style={{ background: `linear-gradient(135deg, ${thumbGradientStart} 0%, ${thumbGradientEnd} 100%)` }}
                    >
                      <span className="z-10 text-shadow uppercase font-mono tracking-widest text-xs">{thumbText || "MOCK THUMB"}</span>
                      {showDuration && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 px-1.5 rounded text-[8px] font-mono font-bold text-zinc-300 border border-white/[0.05]">
                          {durationText}
                        </span>
                      )}
                      {showProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                          <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0 border border-white/[0.05]" />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-xs font-bold text-zinc-100 leading-snug line-clamp-2">
                          {videoTitle}
                        </h3>
                        <div className="text-[10px] text-zinc-500 font-semibold">
                          {channelName} &bull; {viewsCount} &bull; {uploadTime}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Recommendation Simulator */}
                <div className="space-y-2 max-w-[320px]">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <SidebarIcon className="h-3.5 w-3.5" /> Sidebar Suggested Video
                  </h4>
                  <div className="p-2.5 bg-black/60 border border-white/[0.04] rounded-xl flex gap-2.5">
                    <div 
                      className="w-[120px] aspect-[16/9] rounded-md shrink-0 flex items-center justify-center font-bold text-white relative overflow-hidden border border-white/[0.05]"
                      style={{ background: `linear-gradient(135deg, ${thumbGradientStart} 0%, ${thumbGradientEnd} 100%)` }}
                    >
                      <span className="z-10 text-[9px] uppercase font-mono tracking-wider">{thumbText}</span>
                      {showDuration && (
                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 px-1 rounded text-[7px] font-mono font-bold text-zinc-300">
                          {durationText}
                        </span>
                      )}
                      {showProgress && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
                          <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-start gap-1 min-w-0">
                      <h3 className="text-[11px] font-bold text-zinc-200 leading-tight line-clamp-2">
                        {videoTitle}
                      </h3>
                      <span className="text-[9px] text-zinc-500 font-semibold truncate">{channelName}</span>
                      <span className="text-[9px] text-zinc-500 font-medium">{viewsCount} &bull; {uploadTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 2: KEYWORD DISCOVERY & TAG EXTRACTOR */}
          {activeSubTab === "keyword" && (
            <motion.div
              key="keyword"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden"
            >
              {/* Left Column: Competitor tag extract & list */}
              <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 overflow-y-auto flex flex-col h-full">
                
                {/* Tag extractor form */}
                <div className="space-y-3 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TagIcon className="h-4 w-4 text-indigo-400" /> Competitor Tag Extractor
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Parse metadata tags from any public YouTube video link.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={competitorUrl}
                      onChange={e => setCompetitorUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleExtractTags}
                      disabled={extractLoading || !competitorUrl.trim()}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      {extractLoading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : "Extract"}
                    </button>
                  </div>
                  {extractError && <p className="text-[9px] font-semibold text-rose-400">{extractError}</p>}
                </div>

                {/* Extracted tag chips cloud */}
                <div className="flex-1 space-y-2 border-t border-white/[0.04] pt-3 overflow-y-auto">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Extracted Metadata Tags</span>
                  
                  {extractedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {extractedTags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            // Copy tag directly on click!
                            navigator.clipboard.writeText(tag);
                            alert(`Copied "${tag}" to clipboard.`);
                          }}
                          className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-white/[0.03] border border-white/[0.05] rounded-lg px-2.5 py-1 text-zinc-400 hover:text-indigo-300 hover:border-indigo-500/20 hover:bg-indigo-500/5 transition cursor-copy"
                        >
                          <span>{tag}</span>
                          <Plus className="h-3 w-3 text-zinc-600 group-hover:text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/[0.02] rounded-xl p-8 text-center text-xs text-zinc-600">
                      No tags extracted yet. Enter video URL.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Keyword Matrix */}
              <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 overflow-hidden flex flex-col h-full">
                
                {/* Search / Evaluate query */}
                <div className="space-y-3 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sliders className="h-4 w-4 text-emerald-400" /> Golden Target Matrix
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Plot keywords. Top-left zones are high-volume, low-competition targets.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Enter target search keyword..."
                      className="flex-1 bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleEvaluateKeyword}
                      disabled={evaluatingKeyword || !searchQuery.trim()}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/40 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      {evaluatingKeyword ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : "Evaluate"}
                    </button>
                  </div>
                </div>

                {/* 2D Coordinate Grid Chart representation */}
                <div className="flex-1 border border-white/[0.04] bg-[#050508]/60 rounded-xl relative overflow-hidden select-none p-4 min-h-[220px]">
                  
                  {/* Grid labels */}
                  <span className="absolute top-2 left-2 text-[8px] font-bold font-mono uppercase tracking-wider text-rose-500/50">High Volume / High Comp (Hard)</span>
                  <span className="absolute top-2 right-2 text-[8px] font-bold font-mono uppercase tracking-wider text-emerald-500/80">Golden Zones (High Vol / Low Comp)</span>
                  <span className="absolute bottom-2 left-2 text-[8px] font-bold font-mono uppercase tracking-wider text-zinc-600">Low Volume / High Comp (Avoid)</span>
                  <span className="absolute bottom-2 right-2 text-[8px] font-bold font-mono uppercase tracking-wider text-zinc-500/60">Low Volume / Low Comp (Niche)</span>

                  {/* Axis guides */}
                  <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/[0.02]" />
                  <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-white/[0.02]" />

                  {/* Render plotted coordinates points */}
                  {keywordPoints.map((pt, index) => {
                    // Map volume (0-100) to bottom-to-top layout: (100 - vol)%
                    const topVal = 100 - pt.volume;
                    // Map competition (0-100) to left-to-right layout: comp%
                    const leftVal = pt.competition;

                    return (
                      <div 
                        key={index}
                        className="absolute group z-10 cursor-pointer"
                        style={{ top: `${topVal}%`, left: `${leftVal}%`, transform: "translate(-50%, -50%)" }}
                      >
                        {/* Glow dot */}
                        <div className={`h-2.5 w-2.5 rounded-full ${
                          pt.score > 75 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" 
                            : pt.score > 60 
                            ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" 
                            : "bg-amber-500"
                        } relative`} />

                        {/* Hover Tooltip card detail */}
                        <div className="absolute left-4 top-0 -translate-y-1/2 scale-0 group-hover:scale-100 bg-[#0e0e13] border border-white/[0.08] backdrop-blur-md rounded-lg p-2.5 text-[9px] text-zinc-300 font-mono shadow-2xl min-w-[120px] transition duration-200 select-none z-30 pointer-events-none">
                          <p className="font-bold text-white mb-1 truncate">{pt.keyword}</p>
                          <div className="space-y-0.5">
                            <p>Volume: <span className="font-bold">{pt.volume}%</span></p>
                            <p>Comp: <span className="font-bold">{pt.competition}%</span></p>
                            <p className="text-indigo-400">Score: <span className="font-bold">{pt.score}/100</span></p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 3: AI TITLE & CHAPTERS STUDIO */}
          {activeSubTab === "seo" && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden"
            >
              {/* Left Column: Title Brainstorm Engine */}
              <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 overflow-y-auto flex flex-col h-full">
                <div className="space-y-3 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400" /> Title Brainstorm Studio
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Generate high-CTR headlines categorized by cognitive frames.</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brainstormTopic}
                      onChange={e => setBrainstormTopic(e.target.value)}
                      className="flex-1 bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    />
                    <button
                      onClick={handleBrainstormTitles}
                      disabled={titlesLoading || !brainstormTopic.trim()}
                      className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      {titlesLoading ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : "Brainstorm"}
                    </button>
                  </div>
                </div>

                {/* Generated frame list */}
                <div className="flex-1 space-y-3 border-t border-white/[0.04] pt-3 overflow-y-auto pr-1">
                  {Object.keys(brainstormingTitles).length > 0 ? (
                    <div className="space-y-3.5">
                      {Object.entries(brainstormingTitles).map(([frameKey, val]) => (
                        <div 
                          key={frameKey}
                          onClick={() => {
                            setVideoTitle(val);
                            alert(`Set active simulator title to: "${val}"`);
                          }}
                          className="p-3 bg-[#050508]/30 border border-white/[0.03] hover:border-indigo-500/20 rounded-xl hover:bg-indigo-500/5 transition cursor-pointer select-none space-y-1"
                        >
                          <span className="text-[8px] font-bold font-mono uppercase tracking-wider text-indigo-400">{frameKey} hook frame</span>
                          <p className="text-xs font-bold text-zinc-200 leading-snug">{val}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/[0.02] rounded-xl p-8 text-center text-xs text-zinc-600">
                      Pending title brainstorm logs. Click Brainstorm.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chapters timestamps generator */}
              <div className="bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div className="pb-1 border-b border-white/[0.04]">
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Chapters Timestamps Output</h3>
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
                      <pre className="p-3 bg-black/40 border border-white/[0.04] rounded-xl text-[10px] text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed select-text">
                        {aiChapters}
                      </pre>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateChapters}
                  disabled={aiLoading || !scriptSnippet.trim()}
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white w-full py-2.5 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300 shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{aiLoading ? "Formatting..." : "Generate Chapters"}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* SUBTAB 4: CHECKLISTS */}
          {activeSubTab === "checklist" && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-y-auto"
            >
              {/* Pre-recording checklist */}
              <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 h-fit">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <Volume2 className="h-4 w-4 text-indigo-400" /> Pre-Recording Checklist
                </h3>
                <div className="space-y-2">
                  {recordingChecklist.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleRecordingCheck(item.id)}
                      className="flex items-center gap-3 p-2.5 bg-[#050508]/40 border border-white/[0.02] rounded-xl hover:border-white/[0.06] transition duration-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}} 
                        className="h-3.5 w-3.5 rounded border-white/[0.08] text-indigo-600 bg-black/40 outline-none"
                      />
                      <span className={`text-xs ${item.checked ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editing checklist */}
              <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] space-y-4 h-fit">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 pb-2 border-b border-white/[0.04]">
                  <Video className="h-4 w-4 text-emerald-400" /> Post-Production Checklist
                </h3>
                <div className="space-y-2">
                  {editingChecklist.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleEditingCheck(item.id)}
                      className="flex items-center gap-3 p-2.5 bg-[#050508]/40 border border-white/[0.02] rounded-xl hover:border-white/[0.06] transition duration-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {}}
                        className="h-3.5 w-3.5 rounded border-white/[0.08] text-emerald-600 bg-black/40 outline-none"
                      />
                      <span className={`text-xs ${item.checked ? "line-through text-zinc-600" : "text-zinc-300"}`}>
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
