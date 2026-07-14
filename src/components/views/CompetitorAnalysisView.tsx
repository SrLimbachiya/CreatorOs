"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  Plus, 
  Trash2, 
  ExternalLink,
  Award,
  Video,
  Smile,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Competitor {
  id: string;
  channelName: string;
  subscribers: string;
  strengths: string;
  weaknesses: string;
  thumbnailStyle: string;
  editingStyle: string;
  hookStyle: string;
  notes: string;
}

export default function CompetitorAnalysisView() {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: "1",
      channelName: "DesignCode",
      subscribers: "1.2M",
      strengths: "Incredibly polished Framer motion animations, high production value overlays, very clear educational structure.",
      weaknesses: "Infrequent uploads, sometimes pacing feels slow during raw coding sections.",
      thumbnailStyle: "Vibrant neon purple mesh, clean 3D typography, subtle floating assets.",
      editingStyle: "Pacing is fluid, zooming onto code snippets, smooth slide transition sheets.",
      hookStyle: "Begins with a fully rendered beautiful final application demo to capture interest.",
      notes: "Incorporate their B-roll style for code zoom-ins."
    },
    {
      id: "2",
      channelName: "TechMinimalist",
      subscribers: "450K",
      strengths: "Minimalist ambient audio design, premium cinematic desk setups lighting B-rolls, concise storytelling.",
      weaknesses: "Fewer details on code logic, focuses heavily on setup aesthetics.",
      thumbnailStyle: "Sleek low-contrast photo of clean workspace, tiny subtle white sans-serif subtitle.",
      editingStyle: "Slow panning camera, relaxing lo-fi background beats, high contrast white text overlays.",
      hookStyle: "Starts with a silent 3-second coffee pour/room ambiance shot before talking.",
      notes: "Hook structure is worth testing on vlog reviews."
    }
  ]);

  // Form states
  const [channelName, setChannelName] = useState("");
  const [subscribers, setSubscribers] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [thumbnailStyle, setThumbnailStyle] = useState("");
  const [editingStyle, setEditingStyle] = useState("");
  const [hookStyle, setHookStyle] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    const newComp: Competitor = {
      id: Math.random().toString(36).substring(2, 9),
      channelName,
      subscribers: subscribers || "N/A",
      strengths: strengths || "N/A",
      weaknesses: weaknesses || "N/A",
      thumbnailStyle: thumbnailStyle || "N/A",
      editingStyle: editingStyle || "N/A",
      hookStyle: hookStyle || "N/A",
      notes: notes || "N/A"
    };

    setCompetitors(prev => [newComp, ...prev]);
    setChannelName("");
    setSubscribers("");
    setStrengths("");
    setWeaknesses("");
    setThumbnailStyle("");
    setEditingStyle("");
    setHookStyle("");
    setNotes("");
    setShowAddForm(false);
  };

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <span>Competitor Analysis</span>
          </h1>
          <p className="text-xs text-zinc-400">Track and study channels in your niche. Benchmark strengths, editing pacing, and thumbnail branding styles.</p>
        </div>

        <button
          onClick={() => setShowAddForm(prev => !prev)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition duration-300"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Channel</span>
        </button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-card rounded-2xl p-5 border border-white/[0.04] max-w-3xl space-y-4"
        >
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Register Competitor Channel</h3>
          <form onSubmit={handleAddCompetitor} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Channel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DesignCourse"
                  value={channelName}
                  onChange={e => setChannelName(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Subscriber count</label>
                <input
                  type="text"
                  placeholder="e.g. 250K"
                  value={subscribers}
                  onChange={e => setSubscribers(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Strengths</label>
                <textarea
                  placeholder="What do they do best? Pacing, animations..."
                  value={strengths}
                  onChange={e => setStrengths(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-16 resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Weaknesses</label>
                <textarea
                  placeholder="Where are they lacking? Engagement, logic details..."
                  value={weaknesses}
                  onChange={e => setWeaknesses(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-16 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Thumbnail Style</label>
                <input
                  type="text"
                  placeholder="e.g. Neon text overlays"
                  value={thumbnailStyle}
                  onChange={e => setThumbnailStyle(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Editing pacing</label>
                <input
                  type="text"
                  placeholder="e.g. Fast zooms, cinematic B-roll"
                  value={editingStyle}
                  onChange={e => setEditingStyle(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Hook Pacing</label>
                <input
                  type="text"
                  placeholder="e.g. Asks question in 5s"
                  value={hookStyle}
                  onChange={e => setHookStyle(e.target.value)}
                  className="w-full bg-[#050508]/80 border border-white/[0.05] rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Internal Takeaways / Notes</label>
              <textarea
                placeholder="Specific ideas you can copy or apply..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-[#050508]/60 border border-white/[0.04] rounded-xl p-3 text-xs outline-none text-zinc-300 h-16 resize-none"
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
                Save Analysis
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Grid of Competitors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
        {competitors.length === 0 ? (
          <div className="liquid-card col-span-2 rounded-2xl p-8 border border-white/[0.03] text-center text-xs text-zinc-500">
            No competitor channels registered. Press Add Channel above.
          </div>
        ) : (
          competitors.map((comp) => (
            <motion.div
              layout
              key={comp.id}
              className="liquid-card rounded-2xl p-5 border border-white/[0.03] flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between pb-3 border-b border-white/[0.04]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{comp.channelName}</h3>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-semibold font-mono">
                      {comp.subscribers} Subs
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCompetitor(comp.id)}
                  className="text-zinc-600 hover:text-rose-400 p-1 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Award className="h-3 w-3 text-emerald-400" /> Strengths & Positioning
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">{comp.strengths}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Video className="h-3 w-3 text-indigo-400" /> Editing & Branding Pacing
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">{comp.editingStyle}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Smile className="h-3 w-3 text-amber-400" /> Hook Structure Style
                  </span>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">{comp.hookStyle}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-3 w-3 text-zinc-400" /> Takeaway Notes
                  </span>
                  <p className="text-zinc-400 leading-relaxed text-[11px] font-mono italic">{comp.notes}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
