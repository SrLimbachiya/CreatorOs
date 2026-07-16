"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { 
  Plus, 
  Trash2, 
  Lightbulb, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Tag, 
  AlertTriangle,
  FolderPlus,
  Edit3,
  CalendarDays,
  CheckCircle,
  Link2,
  FileText,
  Activity,
  Clapperboard,
  Award,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Idea, Script, ipc } from "../../lib/ipc";

const STATUSES = [
  "Idea",
  "Research",
  "Scripting",
  "Recording",
  "Editing",
  "Thumbnail",
  "Scheduled",
  "Published"
] as const;

type InspectorTab = "concept" | "research" | "script" | "packaging" | "analytics";

export default function IdeaVaultView() {
  const { 
    ideas, 
    createIdea, 
    updateIdea, 
    deleteIdea, 
    activeIdea, 
    setActiveIdea,
    setActiveView 
  } = useStore();

  const [viewType, setViewType] = useState<"board" | "list">("board");
  
  // Inspector Overlay states
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("concept");
  const [loadedScript, setLoadedScript] = useState<Script | null>(null);

  // New Idea Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tutorial");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [estimatedViews, setEstimatedViews] = useState("");
  const [notes, setNotes] = useState("");

  // Load script when selectedIdea or active tab changes
  useEffect(() => {
    if (selectedIdea && inspectorTab === "script") {
      ipc.scripts.getByIdea(selectedIdea.id).then((res) => {
        setLoadedScript(res);
      }).catch(() => {
        setLoadedScript(null);
      });
    }
  }, [selectedIdea, inspectorTab]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createIdea({
      title,
      description: description || null,
      category: category || "General",
      tags: JSON.stringify(["video"]),
      priority,
      difficulty,
      estimatedViews: estimatedViews ? parseInt(estimatedViews) : null,
      inspiration: null,
      referencesText: null,
      links: null,
      notes: notes || null,
      status: "Idea",
    });

    setTitle("");
    setDescription("");
    setNotes("");
    setEstimatedViews("");
    setShowCreateModal(false);
  };

  const handleMoveStatus = async (idea: Idea, direction: "prev" | "next") => {
    const currentIndex = STATUSES.indexOf(idea.status as any);
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    if (direction === "prev" && currentIndex > 0) nextIndex--;
    if (direction === "next" && currentIndex < STATUSES.length - 1) nextIndex++;
    
    if (nextIndex !== currentIndex) {
      await updateIdea(idea.id, { status: STATUSES[nextIndex] });
    }
  };

  const handleUpdateField = async (id: string, field: keyof Idea, value: any) => {
    await updateIdea(id, { [field]: value });
    if (selectedIdea && selectedIdea.id === id) {
      setSelectedIdea(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <span>Idea Vault & Content Board</span>
          </h1>
          <p className="text-xs text-zinc-400">Map, prioritize, and monitor the lifecycle stages of your YouTube videos.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/[0.02] border border-white/[0.04] p-1 rounded-xl flex gap-1 text-[10px] font-semibold text-zinc-400">
            <button
              onClick={() => setViewType("board")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewType === "board" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
            >
              Content Board
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`px-3 py-1.5 rounded-lg transition-all ${viewType === "list" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Idea</span>
          </button>
        </div>
      </div>

      {/* Board View (Kanban Board) */}
      {viewType === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-150px)] select-none">
          {STATUSES.map((status) => {
            const statusIdeas = ideas.filter((idea) => idea.status === status);
            return (
              <div
                key={status}
                className="w-72 shrink-0 flex flex-col h-full bg-zinc-950/20 border border-white/[0.03] rounded-2xl p-3 overflow-hidden backdrop-blur-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{status}</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded font-bold">
                      {statusIdeas.length}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5">
                  {statusIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => {
                        setSelectedIdea(idea);
                        setInspectorTab("concept");
                      }}
                      className={`liquid-card rounded-2xl p-4.5 border border-white/[0.03] hover:border-white/[0.08] flex flex-col gap-3.5 cursor-pointer relative group transition-all duration-300 ${
                        activeIdea?.id === idea.id ? "border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)] bg-indigo-500/[0.02]" : ""
                      }`}
                    >
                      {activeIdea?.id === idea.id && (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                          <span>{idea.category || "General"}</span>
                          <span className={
                            idea.priority === "High" ? "text-rose-400" : idea.priority === "Medium" ? "text-amber-400" : "text-emerald-400"
                          }>
                            {idea.priority} Priority
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-200 leading-snug group-hover:text-white transition">
                          {idea.title}
                        </h4>
                      </div>

                      {idea.description && (
                        <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {idea.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
                        {/* Move state triggers */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(idea, "prev");
                            }}
                            className="p-1 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] text-zinc-400 transition"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStatus(idea, "next");
                            }}
                            className="p-1 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] text-zinc-400 transition"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Forecast views or actual performance badge */}
                        <span className="text-[9px] font-mono text-zinc-500 font-bold bg-white/[0.01] border border-white/[0.03] px-2 py-0.5 rounded">
                          {idea.status === "Published" && idea.actualViews > 0 
                            ? `📈 ${(idea.actualViews/1000).toFixed(0)}K views`
                            : `🔮 ${idea.estimatedViews ? `${(idea.estimatedViews/1000).toFixed(0)}K` : "10K"} target`
                          }
                        </span>
                      </div>
                    </div>
                  ))}

                  {statusIdeas.length === 0 && (
                    <div className="text-center py-8 border border-dashed border-white/[0.02] rounded-xl text-[10px] text-zinc-600 font-medium">
                      Drag cards here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="liquid-card rounded-2xl border border-white/[0.03] p-4 select-none">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.04] text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="pb-3 pl-2">Title</th>
                <th className="pb-3">Stage Status</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Views Performance</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.01]">
              {ideas.map((idea) => (
                <tr 
                  key={idea.id} 
                  onClick={() => {
                    setSelectedIdea(idea);
                    setInspectorTab("concept");
                  }}
                  className={`hover:bg-white/[0.02] cursor-pointer group transition ${
                    activeIdea?.id === idea.id ? "bg-indigo-500/[0.01]" : ""
                  }`}
                >
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-2">
                      {activeIdea?.id === idea.id && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate max-w-sm block">
                        {idea.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white/[0.02] border border-white/[0.04] text-zinc-400">
                      {idea.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs text-zinc-400">{idea.category || "General"}</td>
                  <td className="py-3.5 text-xs">
                    <span className={idea.priority === "High" ? "text-rose-400" : idea.priority === "Medium" ? "text-amber-400" : "text-emerald-400 font-semibold"}>
                      {idea.priority}
                    </span>
                  </td>
                  <td className="py-3.5 text-xs font-mono text-zinc-300">
                    {idea.status === "Published" && idea.actualViews > 0 
                      ? `${idea.actualViews.toLocaleString()} views (Actual)`
                      : `${idea.estimatedViews?.toLocaleString() || "10,000"} views (Target)`
                    }
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIdea(idea.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-rose-400 text-zinc-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LIFECYCLE INSPECTOR OVERLAY PANEL */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdea(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#0e0e13]/90 border border-white/[0.06] backdrop-blur-2xl rounded-2xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] p-6 space-y-5"
            >
              {/* Header section with Active selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-white/[0.04] gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                    <Lightbulb className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{selectedIdea.title}</h3>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Stage Status: {selectedIdea.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveIdea(selectedIdea);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                      activeIdea?.id === selectedIdea.id
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] text-zinc-300"
                    }`}
                  >
                    <CheckCircle className={`h-4 w-4 ${activeIdea?.id === selectedIdea.id ? "text-indigo-400" : "text-zinc-500"}`} />
                    <span>{activeIdea?.id === selectedIdea.id ? "Active working context" : "Set Active Context"}</span>
                  </button>

                  <button 
                    onClick={() => setSelectedIdea(null)}
                    className="text-zinc-400 hover:text-zinc-100 text-xs font-bold border border-white/[0.04] hover:bg-white/[0.02] px-3 py-1.5 rounded-xl transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Navigation Tabs inside the Inspector */}
              <div className="flex gap-1.5 text-[10px] font-bold text-zinc-500 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-lg w-fit">
                <button 
                  onClick={() => setInspectorTab("concept")}
                  className={`px-3 py-1.5 rounded-md transition ${inspectorTab === "concept" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
                >
                  Concept Specs
                </button>
                <button 
                  onClick={() => setInspectorTab("research")}
                  className={`px-3 py-1.5 rounded-md transition ${inspectorTab === "research" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
                >
                  Research Logs
                </button>
                <button 
                  onClick={() => setInspectorTab("script")}
                  className={`px-3 py-1.5 rounded-md transition ${inspectorTab === "script" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
                >
                  Script Draft
                </button>
                <button 
                  onClick={() => setInspectorTab("packaging")}
                  className={`px-3 py-1.5 rounded-md transition ${inspectorTab === "packaging" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
                >
                  Thumbnail & Packaging
                </button>
                <button 
                  onClick={() => setInspectorTab("analytics")}
                  className={`px-3 py-1.5 rounded-md transition ${inspectorTab === "analytics" ? "bg-indigo-600 text-white" : "hover:text-zinc-200"}`}
                >
                  Post-Upload Metrics
                </button>
              </div>

              {/* Inspector Content Panes */}
              <div className="min-h-[280px] max-h-[380px] overflow-y-auto pr-1">
                {/* 1. CONCEPT DETAILS TAB */}
                {inspectorTab === "concept" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">Video Title</label>
                        <input
                          type="text"
                          value={selectedIdea.title}
                          onChange={e => handleUpdateField(selectedIdea.id, "title", e.target.value)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/30"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">Video Concept Description</label>
                        <textarea
                          value={selectedIdea.description || ""}
                          onChange={e => handleUpdateField(selectedIdea.id, "description", e.target.value)}
                          className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-28 resize-none focus:border-indigo-500/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500">Category</label>
                          <input
                            type="text"
                            value={selectedIdea.category || ""}
                            onChange={e => handleUpdateField(selectedIdea.id, "category", e.target.value)}
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500">Forecast Views Target</label>
                          <input
                            type="number"
                            value={selectedIdea.estimatedViews || ""}
                            onChange={e => handleUpdateField(selectedIdea.id, "estimatedViews", e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500">Priority Level</label>
                          <select
                            value={selectedIdea.priority}
                            onChange={e => handleUpdateField(selectedIdea.id, "priority", e.target.value)}
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-zinc-500">Difficulty Grade</label>
                          <select
                            value={selectedIdea.difficulty}
                            onChange={e => handleUpdateField(selectedIdea.id, "difficulty", e.target.value)}
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">Raw Notes & Hooks</label>
                        <textarea
                          value={selectedIdea.notes || ""}
                          onChange={e => handleUpdateField(selectedIdea.id, "notes", e.target.value)}
                          className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-16 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RESEARCH REPOSITORY TAB */}
                {inspectorTab === "research" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Research & references Text Notes</label>
                      <textarea
                        value={selectedIdea.referencesText || ""}
                        onChange={e => handleUpdateField(selectedIdea.id, "referencesText", e.target.value)}
                        placeholder="Paste research outlines, documentation findings, and brainstorm snippets here..."
                        className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-4 text-xs outline-none text-zinc-300 h-32 resize-none font-sans leading-relaxed focus:border-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-zinc-500">Reference Links (Format: Link Title | URL, one per line)</label>
                      <textarea
                        value={selectedIdea.links || ""}
                        onChange={e => handleUpdateField(selectedIdea.id, "links", e.target.value)}
                        placeholder="e.g. Electron API docs | https://electronjs.org"
                        className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-4 text-xs outline-none text-zinc-300 h-20 resize-none font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 3. SCRIPT PREVIEW TAB */}
                {inspectorTab === "script" && (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold border-b border-white/[0.04] pb-2">
                      <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-zinc-400" /> SCRIPT EDITOR SYNC</span>
                      <span>{loadedScript ? `${loadedScript.content?.split(/\s+/).length || 0} words` : "No Draft Started"}</span>
                    </div>

                    {loadedScript ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-extrabold text-zinc-200 uppercase font-mono">{loadedScript.title}</h4>
                        <div className="h-56 overflow-y-auto bg-[#050508]/60 border border-white/[0.04] rounded-xl p-4 text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">
                          {loadedScript.content || "Script content is empty."}
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center border border-dashed border-white/[0.03] rounded-xl flex flex-col items-center gap-2 select-none">
                        <BookOpen className="h-8 w-8 text-zinc-700 animate-pulse" />
                        <p className="text-xs text-zinc-500">No script has been created for this concept yet.</p>
                        <button 
                          onClick={() => {
                            setActiveIdea(selectedIdea);
                            setActiveView("scripts");
                          }}
                          className="mt-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold transition"
                        >
                          Start Script Draft Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. THUMBNAIL & PACKAGING TAB */}
                {inspectorTab === "packaging" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
                    {/* Live mockup frame */}
                    <div className="space-y-3">
                      <span className="text-[9px] uppercase font-bold text-zinc-500">Feed Simulation Mockup</span>
                      
                      <div 
                        className="w-full aspect-video rounded-xl border border-white/[0.06] relative overflow-hidden flex flex-col justify-between p-4 shadow-xl select-none"
                        style={{
                          background: `linear-gradient(135deg, ${selectedIdea.thumbnailStartColor || "#6366f1"}, ${selectedIdea.thumbnailEndColor || "#312e81"})`
                        }}
                      >
                        <div className="w-12 h-3.5 rounded bg-black/40 border border-white/5 flex items-center justify-center text-[7px] text-zinc-300 font-bold uppercase tracking-widest font-mono">
                          HD 1080P
                        </div>
                        <h3 className="text-base font-extrabold text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] uppercase font-mono tracking-tight text-center max-w-[90%] mx-auto">
                          {selectedIdea.thumbnailText || "THUMBNAIL HOOK"}
                        </h3>
                        <div className="self-end px-1.5 py-0.5 rounded bg-black/85 text-[8px] font-mono text-zinc-200 font-bold">
                          {selectedIdea.durationBadge || "10:15"}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-zinc-500">Gradient Start</label>
                          <input
                            type="text"
                            value={selectedIdea.thumbnailStartColor || ""}
                            onChange={e => handleUpdateField(selectedIdea.id, "thumbnailStartColor", e.target.value)}
                            placeholder="#6366f1"
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-lg px-2 py-1 text-[10px] text-zinc-200 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-zinc-500">Gradient End</label>
                          <input
                            type="text"
                            value={selectedIdea.thumbnailEndColor || ""}
                            onChange={e => handleUpdateField(selectedIdea.id, "thumbnailEndColor", e.target.value)}
                            placeholder="#312e81"
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-lg px-2 py-1 text-[10px] text-zinc-200 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-zinc-500">Duration</label>
                          <input
                            type="text"
                            value={selectedIdea.durationBadge || ""}
                            onChange={e => handleUpdateField(selectedIdea.id, "durationBadge", e.target.value)}
                            placeholder="12:30"
                            className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-lg px-2 py-1 text-[10px] text-zinc-200 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Packaging checks and titles */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-zinc-500">Thumbnail Big Text</label>
                        <input
                          type="text"
                          value={selectedIdea.thumbnailText || ""}
                          onChange={e => handleUpdateField(selectedIdea.id, "thumbnailText", e.target.value)}
                          placeholder="e.g. EXPLAINED IN 5 MIN"
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 flex items-center gap-1"><Clapperboard className="h-3.5 w-3.5 text-zinc-400" /> Checklist Status</span>
                        <div className="text-[10px] text-zinc-400 leading-relaxed font-sans space-y-1 bg-white/[0.01] p-3 border border-white/[0.03] rounded-xl">
                          <div className="flex items-center justify-between">
                            <span>Pre-shoot Checklist</span>
                            <span className="font-mono text-zinc-300 font-bold">
                              {selectedIdea.recordingChecklist ? JSON.parse(selectedIdea.recordingChecklist).length : 0} registered tasks
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Editing Checklist</span>
                            <span className="font-mono text-zinc-300 font-bold">
                              {selectedIdea.editingChecklist ? JSON.parse(selectedIdea.editingChecklist).length : 0} registered tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. POST-UPLOAD ANALYTICS TAB */}
                {inspectorTab === "analytics" && (
                  <div className="space-y-4 font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200 uppercase flex items-center gap-1.5"><Activity className="h-4 w-4 text-emerald-400" /> Post-Upload Performance Vault</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Toggle publication state and key performance statistics of the active video.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 cursor-pointer">Published State</label>
                        <input
                          type="checkbox"
                          checked={selectedIdea.status === "Published"}
                          onChange={(e) => {
                            handleUpdateField(selectedIdea.id, "status", e.target.checked ? "Published" : "Scheduled");
                            if (e.target.checked) {
                              handleUpdateField(selectedIdea.id, "publishedAt", new Date().toISOString().split("T")[0]);
                            }
                          }}
                          className="h-3.5 w-3.5 accent-indigo-600 rounded bg-[#050508] border border-white/[0.08]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Actual Views Count</label>
                        <input
                          type="number"
                          value={selectedIdea.actualViews || 0}
                          onChange={e => handleUpdateField(selectedIdea.id, "actualViews", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Actual CTR (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedIdea.actualCtr || 0}
                          onChange={e => handleUpdateField(selectedIdea.id, "actualCtr", parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Viewer Retention (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedIdea.actualRetention || 0}
                          onChange={e => handleUpdateField(selectedIdea.id, "actualRetention", parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Subscribers Gain</label>
                        <input
                          type="number"
                          value={selectedIdea.actualSubscribers || 0}
                          onChange={e => handleUpdateField(selectedIdea.id, "actualSubscribers", parseInt(e.target.value) || 0)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Watch Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          value={selectedIdea.actualWatchTime || 0}
                          onChange={e => handleUpdateField(selectedIdea.id, "actualWatchTime", parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-zinc-500">Publish Date</label>
                        <input
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={selectedIdea.publishedAt || ""}
                          onChange={e => handleUpdateField(selectedIdea.id, "publishedAt", e.target.value)}
                          className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-1.5 text-xs text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <button
                  onClick={() => {
                    deleteIdea(selectedIdea.id);
                    setSelectedIdea(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 font-bold transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Idea</span>
                </button>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition"
                >
                  Finish Editing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Idea Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-[#0e0e13]/90 border border-white/[0.06] backdrop-blur-2xl rounded-2xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FolderPlus className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Create Video Idea</span>
                </h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-zinc-200 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Video Concept Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 CSS Tips for Widescreen Layouts"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/20 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Brief Overview Description</label>
                  <textarea
                    placeholder="Describe hook, target audience interest factor..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Category Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Tutorial"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Est. Views Target</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={estimatedViews}
                      onChange={e => setEstimatedViews(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Priority Level</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Difficulty Grade</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value as any)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Raw Notes / Inspiration</label>
                  <textarea
                    placeholder="Any notes..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-16 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/[0.03] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition"
                  >
                    Create Concept
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
