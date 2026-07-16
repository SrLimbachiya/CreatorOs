"use client";

import React, { useState, useEffect } from "react";
import { 
  SearchCode, 
  Plus, 
  Trash2, 
  Link2, 
  Sparkles, 
  NotebookPen, 
  ExternalLink,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../../hooks/useStore";
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
  const { activeIdea, updateIdea, ideas, setActiveIdea } = useStore();

  // Parse resources from the active idea's referencesText column
  const resources: WebResource[] = activeIdea?.referencesText 
    ? JSON.parse(activeIdea.referencesText) 
    : [];

  // Form input states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"link" | "text" | "note">("link");
  const [showAddForm, setShowAddForm] = useState(false);

  // AI states
  const [selectedResource, setSelectedResource] = useState<WebResource | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Reset states on activeIdea context change
  useEffect(() => {
    if (resources.length > 0) {
      setSelectedResource(resources[0]);
    } else {
      setSelectedResource(null);
    }
    setAiSummary("");
  }, [activeIdea?.id]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIdea) return;
    if (!title.trim() || !content.trim()) return;

    const newRes: WebResource = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      url: type === "link" ? (url || null) : null,
      content,
      type,
      createdAt: new Date().toISOString()
    };

    const updatedResources = [newRes, ...resources];
    await updateIdea(activeIdea.id, { referencesText: JSON.stringify(updatedResources) });

    setSelectedResource(newRes);
    setTitle("");
    setUrl("");
    setContent("");
    setShowAddForm(false);
  };

  const handleDeleteResource = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeIdea) return;

    const updatedResources = resources.filter(r => r.id !== id);
    await updateIdea(activeIdea.id, { referencesText: JSON.stringify(updatedResources) });

    if (selectedResource?.id === id) {
      setSelectedResource(updatedResources[0] || null);
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

  // Render selection prompt if no active video scope is select
  if (!activeIdea) {
    return (
      <div className="h-[calc(100vh-150px)] flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="p-4 rounded-full bg-white/[0.02] border border-white/[0.04] text-zinc-500 mb-4 animate-pulse">
          <BookOpen className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">No Active Video Scope</h2>
        <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
          Research references and bookmarks are tied contextually to individual videos. Select a video from the active project list below to load its repository:
        </p>

        <div className="mt-6 w-full max-w-md space-y-2">
          {ideas.length === 0 ? (
            <p className="text-[10px] text-zinc-600 font-mono">Create an idea in the Idea Vault to start researching.</p>
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
              <SearchCode className="h-5 w-5 text-indigo-400" />
              <span>Research Workspace</span>
            </h1>
            <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
              Scope: {activeIdea.title}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Collect bookmarks, text snippets, and link notes. Leverage AI to summarize structures and extract insights.</p>
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
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Log Reference Source</h3>
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
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-zinc-200 line-clamp-1 group-hover:text-white transition">
                    {resource.title}
                  </span>
                  <button 
                    onClick={(e) => handleDeleteResource(resource.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {resource.content}
                </p>

                <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600 pt-1 font-bold">
                  <span className="uppercase text-indigo-400/80">{resource.type}</span>
                  <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 2/3: Resource Detail Inspector + AI Summarization */}
        <div className="md:col-span-2 flex flex-col gap-6 h-full overflow-y-auto">
          {selectedResource ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
              {/* Reference description */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.04] shrink-0">
                  <div className="flex items-center gap-2">
                    {selectedResource.type === "link" ? (
                      <Link2 className="h-4.5 w-4.5 text-emerald-400" />
                    ) : (
                      <NotebookPen className="h-4.5 w-4.5 text-indigo-400" />
                    )}
                    <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">{selectedResource.title}</h3>
                  </div>
                  {selectedResource.url && (
                    <a
                      href={selectedResource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold font-mono flex items-center gap-1"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto bg-black/40 border border-white/[0.03] rounded-xl p-4 text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                  {selectedResource.content}
                </div>

                <button
                  onClick={() => handleSummarize(selectedResource)}
                  disabled={aiLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl py-2.5 text-xs font-bold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300 shrink-0"
                >
                  {aiLoading ? "Consulting AI..." : "Summarize Insights with Local AI"}
                </button>
              </div>

              {/* AI summaries */}
              <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 h-full flex flex-col justify-between overflow-hidden">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04] shrink-0">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-sans">Research AI Summary</h3>
                </div>

                <div className="flex-1 overflow-y-auto py-4 select-text">
                  {aiLoading ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
                      Thinking... Parsing reference nodes...
                    </div>
                  ) : aiSummary ? (
                    <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {aiSummary}
                    </p>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 gap-2 border border-dashed border-white/[0.02] rounded-xl">
                      <Sparkles className="h-8 w-8 text-zinc-800" />
                      <p className="text-[10px] leading-normal font-sans">
                        Press the button on the left panel to summarize key insights and hooks automatically.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="liquid-card rounded-2xl border border-white/[0.03] p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2 h-full">
              <NotebookPen className="h-8 w-8 text-zinc-700 animate-bounce" />
              <span>Select a logged source from the repository list to audit details.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
