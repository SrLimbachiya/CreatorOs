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
  ListTodo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../../lib/ipc";

export default function ScriptStudioView() {
  const [scriptTitle, setScriptTitle] = useState("Unfinished Script Concept");
  const [scriptContent, setScriptContent] = useState(
    "# Introduction\nWelcome back to the channel! Today we are looking at the core design rules of desktop software...\n\n# Hook\nDid you know that 85% of developers abandon desktop projects before compiling their first build? Today, I'm showing you the toolchain that bypasses this problem entirely.\n\n# Body\nFirst, we outline how Electron manages background node runtimes while Next.js coordinates clientside UI rendering..."
  );

  // Statistics
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0); // in seconds
  
  // AI sidebar states
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);

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
    // Standard reading speed: ~150 words per minute (2.5 words per second)
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
          fullPrompt = `Analyze this script section and suggest 3 highly engaging B-roll video clips or animations to overlay to prevent viewer dropoff:\n\n"${scriptContent.slice(0, 1000)}"`;
          break;
        case "cta":
          fullPrompt = `Generate a compelling Call To Action (CTA) pointing users to subscribe and check other coding links based on this script:\n\n"${scriptContent.slice(0, 800)}"`;
          break;
        default:
          fullPrompt = `${prompt}\n\nReference script context:\n"${scriptContent.slice(0, 1000)}"`;
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PenTool className="h-5 w-5 text-indigo-400" />
            <span>Script Studio</span>
          </h1>
          <p className="text-xs text-zinc-400">Rich text editor with dynamic duration calculations and embedded AI rewrite helper sidebars.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mock stats badge */}
          <div className="flex items-center gap-1 text-[10px] bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 rounded-xl text-zinc-400 font-medium">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Est. Duration: {formatDuration(readingTime)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] select-none">
        {/* Left: Text editor panel */}
        <div className="lg:col-span-2 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 flex flex-col h-full overflow-hidden space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] shrink-0">
            <input
              type="text"
              value={scriptTitle}
              onChange={e => setScriptTitle(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm font-bold text-white w-[80%] focus:border-b focus:border-white/10"
            />
            <div className="text-[10px] text-zinc-500 font-bold font-mono">
              {wordCount} words
            </div>
          </div>

          <textarea
            value={scriptContent}
            onChange={e => setScriptContent(e.target.value)}
            placeholder="Start drafting your YouTube script..."
            className="flex-1 w-full bg-transparent outline-none border-0 text-xs text-zinc-200 leading-relaxed font-mono resize-none overflow-y-auto pr-2"
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
                <p className="text-[10px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {aiResult}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2 border border-dashed border-white/[0.02] rounded-xl">
              <ListTodo className="h-8 w-8 text-zinc-700" />
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
