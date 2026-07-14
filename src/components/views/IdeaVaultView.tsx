"use client";

import React, { useState } from "react";
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
  CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Idea } from "../../lib/ipc";

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

export default function IdeaVaultView() {
  const { ideas, createIdea, updateIdea, deleteIdea } = useStore();
  const [viewType, setViewType] = useState<"board" | "list">("board");
  
  // Modal state
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Idea Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tutorial");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [estimatedViews, setEstimatedViews] = useState("");
  const [notes, setNotes] = useState("");

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            <span>Idea Vault & Content Board</span>
          </h1>
          <p className="text-xs text-zinc-400">Map, prioritize, and monitor the lifecycle stages of your YouTube videos.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
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
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-210px)] select-none">
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
                    <span className="text-[10px] bg-white/[0.04] border border-white/[0.05] rounded-full px-2 py-0.5 text-zinc-500 font-bold">
                      {statusIdeas.length}
                    </span>
                  </div>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {statusIdeas.length === 0 ? (
                    <div className="border border-dashed border-white/[0.02] rounded-xl p-4 text-center text-[10px] text-zinc-600">
                      Empty stage
                    </div>
                  ) : (
                    statusIdeas.map((idea) => (
                      <motion.div
                        layoutId={idea.id}
                        key={idea.id}
                        onClick={() => setSelectedIdea(idea)}
                        className="liquid-card rounded-xl p-3.5 border border-white/[0.03] cursor-pointer flex flex-col gap-2 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 transition duration-300 leading-tight">
                            {idea.title}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {idea.description || "No description logged."}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.03] text-[9px]">
                          <span className="font-semibold text-zinc-500 font-mono">
                            {idea.category}
                          </span>
                          
                          <div className="flex items-center gap-1.5 titlebar-no-drag onClick-stop" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleMoveStatus(idea, "prev")}
                              className="p-1 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMoveStatus(idea, "next")}
                              className="p-1 rounded bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="liquid-card rounded-2xl border border-white/[0.03] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] uppercase font-bold tracking-widest text-zinc-500 bg-white/[0.01]">
                <th className="p-4">Title</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ideas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-zinc-500">
                    Vault is empty. Add ideas above.
                  </td>
                </tr>
              ) : (
                ideas.map((idea) => (
                  <tr 
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all text-xs cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-zinc-200 group-hover:text-indigo-300 transition duration-300">
                      {idea.title}
                    </td>
                    <td className="p-4">
                      <span className="border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-zinc-400">
                        {idea.status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{idea.category}</td>
                    <td className="p-4 text-zinc-400 font-mono">{idea.priority}</td>
                    <td className="p-4 text-zinc-400 font-mono">{idea.difficulty}</td>
                    <td className="p-4" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Detail Modal overlay */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdea(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-[#0e0e13]/90 border border-white/[0.06] backdrop-blur-2xl rounded-2xl shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Video Concept</span>
                </h3>
                <button 
                  onClick={() => setSelectedIdea(null)}
                  className="text-zinc-500 hover:text-zinc-200 text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Video Title</label>
                    <input
                      type="text"
                      value={selectedIdea.title}
                      onChange={e => handleUpdateField(selectedIdea.id, "title", e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/30 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Stage Status</label>
                    <select
                      value={selectedIdea.status}
                      onChange={e => handleUpdateField(selectedIdea.id, "status", e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500/30 transition-all duration-300"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Concept Description</label>
                    <textarea
                      value={selectedIdea.description || ""}
                      onChange={e => handleUpdateField(selectedIdea.id, "description", e.target.value)}
                      className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 focus:border-indigo-500/30 transition-all h-24 resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Category</label>
                      <input
                        type="text"
                        value={selectedIdea.category || ""}
                        onChange={e => handleUpdateField(selectedIdea.id, "category", e.target.value)}
                        className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Est. Views</label>
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
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Priority</label>
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
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Difficulty</label>
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
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Notes & Hooks</label>
                    <textarea
                      value={selectedIdea.notes || ""}
                      onChange={e => handleUpdateField(selectedIdea.id, "notes", e.target.value)}
                      className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 focus:border-indigo-500/30 transition-all h-24 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <button
                  onClick={() => {
                    deleteIdea(selectedIdea.id);
                    setSelectedIdea(null);
                  }}
                  className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Idea</span>
                </button>
                <button
                  onClick={() => setSelectedIdea(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
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
                <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FolderPlus className="h-4 w-4" />
                  <span>Log New Video Concept</span>
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
                    placeholder="e.g. 5 advanced Tailwind features you should master..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-indigo-500/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Coding, Tutorial, Vlog"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Est. Target Views</label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={estimatedViews}
                      onChange={e => setEstimatedViews(e.target.value)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value as any)}
                      className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3 py-2 text-xs text-zinc-300"
                    >
                      <option value="Easy">Easy Production</option>
                      <option value="Medium">Medium Production</option>
                      <option value="Hard">Complex Production</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Concept Description</label>
                  <textarea
                    placeholder="Outlines, angles, summary..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 focus:border-indigo-500/30 transition-all h-20 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/[0.03] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    Save Concept
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
