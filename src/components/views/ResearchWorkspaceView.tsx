"use client";

import React, { useState } from "react";
import { 
  SearchCode, 
  Plus, 
  Trash2, 
  Link2, 
  Sparkles, 
  NotebookPen, 
  ExternalLink,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ipc } from "../../lib/ipc";

interface WebResource {
  id: string;
  title: string;
  url: string | null;
  content: string;
  type: "link" | "text" | "note";
  createdAt: string;
}

export default function ResearchWorkspaceView() {
  const [resources, setResources] = useState<WebResource[]>([
    {
      id: "1",
      title: "Google UI guidelines for desktop layouts",
      url: "https://web.dev/css-layout",
      content: "Ensure standard grid containers declare size container queries before child calculations. Leverage flexboxes and keep margins fluid to lock visual ratios on wide and ultra-wide monitor screens.",
      type: "link",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Why video intros drop retention rates",
      url: null,
      content: "Intros that drag on for more than 5 seconds without showing the direct payoff of the video cause a massive dropoff. Keep hooks tight: show problem, state value, offer resolution direction, then roll logo in 3 seconds.",
      type: "text",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ]);

  // Form input states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"link" | "text" | "note">("link");
  const [showAddForm, setShowAddForm] = useState(false);

  // AI states
  const [selectedResource, setSelectedResource] = useState<WebResource | null>(resources[0]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newRes: WebResource = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      url: type === "link" ? (url || null) : null,
      content,
      type,
      createdAt: new Date().toISOString()
    };

    setResources(prev => [newRes, ...prev]);
    setSelectedResource(newRes);
    setTitle("");
    setUrl("");
    setContent("");
    setShowAddForm(false);
  };

  const handleDeleteResource = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResources(prev => prev.filter(r => r.id !== id));
    if (selectedResource?.id === id) {
      setSelectedResource(null);
      setAiSummary("");
    }
  };

  const handleSummarize = async (resource: WebResource) => {
    setAiLoading(true);
    setAiSummary("");
    try {
      const prompt = `You are an expert research analyst for YouTube scripts. Read the following reference content:\nTitle: ${resource.title}\nContent: ${resource.content}\n\nGenerate:\n1. Key Insights (3 bullet points)\n2. Common Mistakes to avoid in videos (2 bullet points)\n3. Unique Angles for a video hook. Keep the output very concise and formatting clean.`;
      
      const response = await ipc.ai.chat(prompt);
      setAiSummary(response);
    } catch (err) {
      setAiSummary(`Failed to connect to local AI: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <SearchCode className="h-5 w-5 text-indigo-400" />
            <span>Research Workspace</span>
          </h1>
          <p className="text-xs text-zinc-400">Collect bookmarks, text snippets, and link notes. Leverage AI to summarize structures and extract insights.</p>
        </div>

        <button
          onClick={() => setShowAddForm(prev => !prev)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Research Source</span>
        </button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-card rounded-2xl p-5 border border-white/[0.04] max-w-2xl space-y-4"
        >
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Log Reference Source</h3>
          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Source Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                >
                  <option value="link">Web Link Bookmark</option>
                  <option value="text">Copied Snippet Text</option>
                  <option value="note">My Brainstorm Note</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Title / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSS nesting standard guidelines"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            {type === "link" && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Resource URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500 font-sans">Content / Reference notes *</label>
              <textarea
                required
                placeholder="Paste reference text, copied posts, links summary, transcript excerpts..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3.5 text-xs outline-none text-zinc-300 focus:border-indigo-500/30 transition-all h-24 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/[0.03] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                Log Source
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-150px)] select-none">
        {/* Left: logged resources */}
        <div className="md:col-span-1 border border-white/[0.03] bg-zinc-950/20 backdrop-blur-sm rounded-2xl p-4 overflow-y-auto space-y-3">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Research Repository</h3>
          {resources.length === 0 ? (
            <div className="text-center text-xs text-zinc-600 p-8 border border-dashed border-white/[0.02] rounded-xl">
              No references logged. Press Add above.
            </div>
          ) : (
            resources.map((resource) => (
              <div
                key={resource.id}
                onClick={() => {
                  setSelectedResource(resource);
                  setAiSummary("");
                }}
                className={`p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col gap-2 relative group ${
                  selectedResource?.id === resource.id 
                    ? "bg-indigo-500/10 border-indigo-500/30" 
                    : "bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.03] hover:border-white/[0.05]"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    {resource.type === "link" ? (
                      <Link2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    ) : (
                      <NotebookPen className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="text-xs font-bold text-zinc-200 line-clamp-1">
                      {resource.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteResource(resource.id, e)}
                    className="text-zinc-600 hover:text-rose-400 p-0.5 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {resource.content}
                </p>

                <span className="text-[8px] text-zinc-600 font-semibold font-mono self-end">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Resource Content & AI Summary split pane */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4 h-full overflow-hidden">
          {selectedResource ? (
            <>
              {/* Reference Viewer */}
              <div className="flex-1 bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-white/[0.04]">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Source Material</h3>
                      <h2 className="text-sm font-bold text-white mt-1 leading-tight">{selectedResource.title}</h2>
                    </div>
                    {selectedResource.url && (
                      <a
                        href={selectedResource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] transition"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedResource.content}
                  </p>
                </div>

                <button
                  onClick={() => handleSummarize(selectedResource)}
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white w-full py-2.5 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300 shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{aiLoading ? "AI analyzing source..." : "Generate AI Insights"}</span>
                </button>
              </div>

              {/* AI summary pane */}
              <div className="flex-1 border border-white/[0.03] bg-zinc-950/20 backdrop-blur-sm rounded-2xl p-5 overflow-y-auto flex flex-col gap-3">
                <div className="flex items-center gap-1.5 pb-3 border-b border-white/[0.04] shrink-0">
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-sans">AI Workspace Insights</span>
                </div>

                {aiSummary ? (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {aiSummary}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 gap-2 border border-dashed border-white/[0.02] rounded-xl">
                    <BookOpen className="h-8 w-8 text-zinc-700" />
                    <span className="text-xs leading-normal">
                      Click the "Generate AI Insights" button to extract key summaries, angles, and video hook structures from this source.
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="col-span-2 flex-1 bg-zinc-950/10 border border-white/[0.03] rounded-2xl flex flex-col items-center justify-center text-center p-8 text-zinc-500">
              <SearchCode className="h-10 w-10 text-zinc-700 mb-2" />
              <p className="text-xs">Select a research resource from the repository to read content and prompt AI summaries.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
