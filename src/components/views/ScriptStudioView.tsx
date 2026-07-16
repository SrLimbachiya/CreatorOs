"use client";

import React, { useState, useEffect } from "react";
import { 
  PenTool, 
  Sparkles, 
  BookOpen, 
  Clock, 
  RefreshCw, 
  HelpCircle,
  Copy,
  CheckCircle2,
  ListTodo,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../hooks/useStore";
import { ipc } from "../../lib/ipc";

export default function ScriptStudioView() {
  const { activeIdea, ideas, setActiveIdea } = useStore();

  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0); // in seconds
  
  // AI sidebar states
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch script draft from database on activeIdea context change
  useEffect(() => {
    if (!activeIdea) return;
    
    const loadScriptDraft = async () => {
      try {
        const draft = await ipc.scripts.getByIdea(activeIdea.id);
        if (draft) {
          setScriptTitle(draft.title);
          setScriptContent(draft.content || "");
        } else {
          // Initialize a default starter script template
          const newId = `script-${activeIdea.id}`;
          const blankTemplate = {
            id: newId,
            ideaId: activeIdea.id,
            title: `Draft: ${activeIdea.title}`,
            content: `# Introduction\nWelcome back to the channel! Today we are looking at...\n\n# Hook\nDid you know that...\n\n# Body\nFirst, let's detail the core concepts...\n\n# Conclusion\nThanks for watching, make sure to subscribe!`,
            durationEstimated: 0,
            readingTime: 0,
            status: "Draft" as const,
          };
          await ipc.scripts.update(blankTemplate);
          setScriptTitle(blankTemplate.title);
          setScriptContent(blankTemplate.content);
        }
      } catch (err) {
        console.error("Failed to load script draft:", err);
      }
    };

    loadScriptDraft();
  }, [activeIdea?.id]);

  // 2. Autosave script draft to database with 1 second typing debounce
  useEffect(() => {
    if (!activeIdea || !scriptTitle) return;

    setIsSaving(true);
    const saveTimeout = setTimeout(async () => {
      try {
        const words = scriptContent.trim() ? scriptContent.trim().split(/\s+/).length : 0;
        const durationSeconds = Math.round(words / 2.5); // ~150 WPM

        await ipc.scripts.update({
          id: `script-${activeIdea.id}`,
          ideaId: activeIdea.id,
          title: scriptTitle,
          content: scriptContent,
          durationEstimated: durationSeconds,
          readingTime: durationSeconds,
          status: "Draft",
        });
      } catch (err) {
        console.error("Failed to autosave script:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [scriptContent, scriptTitle, activeIdea?.id]);

  // Calculate statistics dynamically
  useEffect(() => {
    const cleanContent = scriptContent.trim();
    if (!cleanContent) {
      setWordCount(0);
      setReadingTime(0);
      return;
    }
    const words = cleanContent.split(/\s+/).length;
    setWordCount(words);
    const durationSeconds = Math.round(words / 2.5);
    setReadingTime(durationSeconds);
  }, [scriptContent]);

  const handleAiAction = async (actionType: string) => {
    setAiLoading(true);
    setAiResult("");
    try {
      let fullPrompt = "";
      switch (actionType) {
        case "rewrite":
          fullPrompt = `You are a script doctor for YouTube. Rewrite the following script snippet to make it sound more engaging, conversational, and energetic:\n\n"${scriptContent.slice(0, 1000)}"`;
          break;
        case "hook":
          fullPrompt = `Write 3 alternative YouTube hooks (under 15 seconds reading time) using Curiosity and Pattern Interrupt structures based on this script concept:\n\n"${scriptContent.slice(0, 800)}"`;
          break;
        case "broll":
          fullPrompt = `Suggest specific cinematic B-Roll overlays and visual graphics to accompany this segment of the script:\n\n"${scriptContent.slice(0, 800)}"`;
          break;
        case "cta":
          fullPrompt = `Draft an engaging, high-conversion Call-To-Action (CTA) prompting viewers to subscribe or check out a link based on this video script:\n\n"${scriptContent.slice(0, 800)}"`;
          break;
        case "custom":
          fullPrompt = `${prompt}\n\nTarget Script Reference:\n"${scriptContent.slice(0, 1200)}"`;
          break;
      }
      
      const response = await ipc.ai.chat(fullPrompt);
      setAiResult(response);
    } catch (err) {
      setAiResult(`Failed to connect to local AI: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Render selection prompt if no active video scope is select
  if (!activeIdea) {
    return (
      <div className="h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.04] text-zinc-500 mb-4 animate-pulse">
          <PenTool className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">No Active Video Scope</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
          Script drafting workspace is tied contextually to individual videos. Select a video from the active project list below to open the editor:
        </p>

        <div className="mt-6 w-full max-w-md space-y-2">
          {ideas.length === 0 ? (
            <p className="text-[10px] text-zinc-600 font-mono">Create an idea in the Idea Vault to start drafting.</p>
          ) : (
            ideas.slice(0, 4).map((idea) => (
              <button
                key={idea.id}
                onClick={() => setActiveIdea(idea)}
                className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.04] hover:border-indigo-500/30 rounded-xl text-left text-xs font-semibold text-zinc-300 hover:text-white transition group"
              >
                <span className="truncate pr-2">🎬 {idea.title}</span>
                <span className="text-[9px] uppercase font-mono text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                  Open Editor <ArrowRight className="h-3 w-3" />
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
              <PenTool className="h-5 w-5 text-indigo-400" />
              <span>Script Writing Studio</span>
            </h1>
            <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              Scope: {activeIdea.title}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Draft outlines, hooks, and body details. Leverage AI rewriting options, and autosave script progress.</p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <div className="text-[9px] uppercase tracking-wider font-mono font-bold text-zinc-500 bg-white/[0.01] border border-white/[0.04] px-3 py-1.5 rounded-xl">
            {isSaving ? "Autosaving..." : "All changes saved"}
          </div>

          {/* Duration estimated */}
          <div className="flex items-center gap-1 text-[10px] bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-xl text-zinc-400 font-medium">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Est. Duration: {formatDuration(readingTime)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)] select-none">
        {/* Left: Text editor panel */}
        <div className="lg:col-span-2 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] shrink-0">
            <input
              type="text"
              value={scriptTitle}
              onChange={e => setScriptTitle(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm font-bold text-white w-[80%] focus:border-b focus:border-white/10"
              placeholder="Script Title..."
            />
            <div className="text-[10px] text-zinc-500 font-bold font-mono">
              {wordCount} words
            </div>
          </div>

          <textarea
            value={scriptContent}
            onChange={e => setScriptContent(e.target.value)}
            placeholder="Start drafting your YouTube script..."
            className="flex-1 w-full bg-transparent outline-none border-0 text-xs text-zinc-200 leading-relaxed font-mono resize-none overflow-y-auto pr-2 select-text"
          />
        </div>

        {/* Right: AI helper pane */}
        <div className="lg:col-span-1 border border-white/[0.03] bg-zinc-950/20 backdrop-blur-sm rounded-2xl p-5 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center gap-1.5 pb-3 border-b border-white/[0.04] shrink-0">
            <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-sans">Script Editor AI</span>
          </div>

          {/* AI options presets */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Preset Scripts Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleAiAction("rewrite")}
                className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl transition duration-300"
              >
                🪄 Rewrite Conversational
              </button>
              <button 
                onClick={() => handleAiAction("hook")}
                className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl transition duration-300"
              >
                🪝 Suggest Hooks
              </button>
              <button 
                onClick={() => handleAiAction("broll")}
                className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl transition duration-300"
              >
                🎬 Visual B-Roll Suggest
              </button>
              <button 
                onClick={() => handleAiAction("cta")}
                className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl transition duration-300"
              >
                📣 Generate CTA Hook
              </button>
            </div>
          </div>

          {/* Custom prompt */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Custom scripting Prompt</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI e.g. Suggest joke, explain grid..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="flex-1 bg-[#050508]/60 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none"
              />
              <button
                onClick={() => handleAiAction("custom")}
                disabled={aiLoading || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl px-3 py-1.5 text-xs font-semibold shadow-[0_4px_10px_rgba(99,102,241,0.2)] transition"
              >
                Ask
              </button>
            </div>
          </div>

          {/* AI Result */}
          {aiLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-zinc-500 gap-2 border border-dashed border-white/[0.02] rounded-xl">
              <RefreshCw className="h-6 w-6 text-indigo-500 animate-spin" />
              <span className="text-[10px] font-mono">Running local LLM doctor...</span>
            </div>
          ) : aiResult ? (
            <div className="flex-1 border border-white/5 bg-[#050508]/40 rounded-xl p-3 flex flex-col justify-between overflow-y-auto space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">AI Suggestion</span>
                  <button
                    onClick={handleCopyResult}
                    className="flex items-center gap-1 text-[9px] text-zinc-400 hover:text-zinc-200 transition"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                  {aiResult}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2 border border-dashed border-white/[0.02] rounded-xl">
              <ListTodo className="h-8 w-8 text-zinc-700 animate-pulse" />
              <span className="text-[10px] leading-normal font-sans">
                Choose a preset action or run a custom prompt. The AI parses the active editor viewport text and generates custom additions.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
