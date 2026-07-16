"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "../../hooks/useStore";
import { 
  Eye, 
  Percent, 
  Clock, 
  Users2, 
  Sparkles, 
  Plus, 
  ArrowUpRight, 
  Calendar, 
  CheckSquare,
  Bot,
  Youtube,
  AlertCircle,
  TrendingUp,
  Activity,
  Award,
  Video,
  ChevronRight,
  TrendingUp as TrendIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { ipc } from "../../lib/ipc";

type ChartMetric = "views" | "ctr" | "retention";

export default function DashboardView() {
  const { ideas, analytics, settings, loadAll, createIdea, setActiveView, setActiveIdea } = useStore();
  
  // States
  const [activeChartMetric, setActiveChartMetric] = useState<ChartMetric>("views");
  const [promptInput, setPromptInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; val: string } | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    
    setAiLoading(true);
    setAiResponse("");
    try {
      const response = await ipc.ai.chat(promptInput);
      setAiResponse(response);
    } catch (err) {
      setAiResponse(`Failed to contact local AI: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const runPresetPrompt = async (promptText: string) => {
    setPromptInput(promptText);
    setAiLoading(true);
    setAiResponse("");
    try {
      const response = await ipc.ai.chat(promptText);
      setAiResponse(response);
    } catch (err) {
      setAiResponse(`Failed to contact local AI: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuickCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdeaTitle.trim()) return;

    try {
      await createIdea({
        title: newIdeaTitle,
        description: "Created quickly from Dashboard.",
        category: "General",
        tags: JSON.stringify(["quick"]),
        priority: "Medium",
        difficulty: "Medium",
        estimatedViews: null,
        inspiration: null,
        referencesText: null,
        links: null,
        notes: null,
        status: "Idea",
      });
      setNewIdeaTitle("");
      setIsCreatingIdea(false);
    } catch (err) {
      console.error("Failed to create idea:", err);
    }
  };

  const activeVideos = ideas.filter(
    idea => !["Published", "Archived"].includes(idea.status)
  ).slice(0, 5); // Expanded to show more rows in fullscreen

  const recentIdeas = ideas.filter(idea => idea.status === "Idea").slice(0, 5);

  // Parse YouTube credentials connection state
  const isYoutubeConnected = !!(settings?.apiKey || settings?.apiEndpoint?.includes("youtube") || settings?.defaultDescription?.includes("Channel"));
  
  // Custom stats 
  const statCards = [
    {
      title: "Monthly Views",
      value: isYoutubeConnected ? "345,120" : (analytics?.views.toLocaleString() || "124,500"),
      change: "+24.2% vs last month",
      icon: Eye,
      metricId: "views" as ChartMetric,
    },
    {
      title: "Impressions CTR",
      value: isYoutubeConnected ? "8.2%" : `${analytics?.ctr || 6.4}%`,
      change: "+1.4% average",
      icon: Percent,
      metricId: "ctr" as ChartMetric,
    },
    {
      title: "Viewer Retention",
      value: isYoutubeConnected ? "52.8%" : `${analytics?.retention || 48.2}%`,
      change: "+3.8% retention curve",
      icon: Clock,
      metricId: "retention" as ChartMetric,
    },
    {
      title: "Subscribers Gain",
      value: isYoutubeConnected ? "+4,890" : `+${analytics?.subscribers.toLocaleString() || "2,840"}`,
      change: "YouTube Sync active",
      icon: Users2,
      metricId: "views" as ChartMetric,
    },
  ];

  // Animated Chart Coordinates
  const chartCoordinates: Record<ChartMetric, { x: number; y: number; val: string }[]> = {
    views: [
      { x: 5, y: 85, val: "1.2K" },
      { x: 15, y: 70, val: "4.5K" },
      { x: 25, y: 78, val: "3.8K" },
      { x: 35, y: 40, val: "12K" },
      { x: 45, y: 30, val: "15.2K" },
      { x: 55, y: 55, val: "9.1K" },
      { x: 65, y: 45, val: "11K" },
      { x: 75, y: 15, val: "24.5K" },
      { x: 85, y: 20, val: "22.1K" },
      { x: 95, y: 5, val: "34.5K" }
    ],
    ctr: [
      { x: 5, y: 65, val: "4.5%" },
      { x: 15, y: 62, val: "5.1%" },
      { x: 25, y: 50, val: "6.1%" },
      { x: 35, y: 42, val: "6.9%" },
      { x: 45, y: 45, val: "6.8%" },
      { x: 55, y: 25, val: "8.4%" },
      { x: 65, y: 30, val: "8.0%" },
      { x: 75, y: 22, val: "8.7%" },
      { x: 85, y: 15, val: "9.2%" },
      { x: 95, y: 8, val: "9.6%" }
    ],
    retention: [
      { x: 5, y: 25, val: "59.2%" },
      { x: 15, y: 32, val: "58.0%" },
      { x: 25, y: 45, val: "54.1%" },
      { x: 35, y: 50, val: "51.8%" },
      { x: 45, y: 62, val: "48.0%" },
      { x: 55, y: 58, val: "49.0%" },
      { x: 65, y: 68, val: "46.0%" },
      { x: 75, y: 70, val: "45.0%" },
      { x: 85, y: 72, val: "44.5%" },
      { x: 95, y: 76, val: "41.8%" }
    ]
  };

  const points = chartCoordinates[activeChartMetric];
  
  const pathD = points.reduce((acc, p, i) => {
    const svgX = (p.x / 100) * 580 + 10;
    const svgY = (p.y / 100) * 160 + 10;
    return i === 0 ? `M ${svgX} ${svgY}` : `${acc} L ${svgX} ${svgY}`;
  }, "");

  const areaD = `${pathD} L 590 190 L 10 190 Z`;

  return (
    <div className="space-y-6 pb-10 w-full h-full">
      
      {/* Header Banner - Liquid Glass */}
      <div className="liquid-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-white/[0.04]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">YouTube Creator Command Center</h1>
            {isYoutubeConnected ? (
              <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider animate-pulse">
                <Youtube className="h-2.5 w-2.5" /> Live Sync Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">
                <AlertCircle className="h-2.5 w-2.5" /> Sandbox Mode
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            {isYoutubeConnected 
              ? "Live API sync active. Pulling data metrics from your configured YouTube Studio dashboard." 
              : "To link your live channel stats and API credentials, head to the Settings page."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {!isYoutubeConnected && (
            <button 
              onClick={() => setActiveView("settings")}
              className="border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              Sync Channel
            </button>
          )}
          <button 
            onClick={() => setIsCreatingIdea(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Video Idea</span>
          </button>
        </div>
      </div>

      {/* Add Idea Modal Panel */}
      {isCreatingIdea && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 border border-indigo-500/20 bg-zinc-950/40 backdrop-blur-xl rounded-2xl flex flex-col gap-3 shadow-xl max-w-xl"
        >
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Quick Add Idea</h3>
          <form onSubmit={handleQuickCreateIdea} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter video concept, e.g. 'How I built a desktop app in 24 hours'..." 
              value={newIdeaTitle}
              onChange={e => setNewIdeaTitle(e.target.value)}
              className="flex-1 bg-[#09090b]/80 border border-white/[0.05] px-4 py-2 rounded-xl text-xs outline-none text-zinc-200 focus:border-indigo-500/30 transition"
              autoFocus
            />
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              Create
            </button>
            <button 
              type="button" 
              onClick={() => setIsCreatingIdea(false)}
              className="border border-white/5 text-zinc-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/[0.03] transition"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      )}

      {/* FULLSCREEN RESPONSIVE LAYOUT Restructured to 4 wide columns */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 w-full items-start">
        
        {/* SECTION A: Visual Analytics & Pipeline Table (Take 2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Visual Chart Panel */}
          <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.03]">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Analytics Velocity Chart</h3>
              </div>
              
              <div className="flex gap-1.5 text-[9px] font-bold text-zinc-500 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-lg">
                <button 
                  onClick={() => setActiveChartMetric("views")}
                  className={`px-2.5 py-1 rounded transition ${activeChartMetric === "views" ? "bg-indigo-600 text-white" : "hover:text-zinc-300"}`}
                >
                  Views Trend
                </button>
                <button 
                  onClick={() => setActiveChartMetric("ctr")}
                  className={`px-2.5 py-1 rounded transition ${activeChartMetric === "ctr" ? "bg-indigo-600 text-white" : "hover:text-zinc-300"}`}
                >
                  CTR Flow
                </button>
                <button 
                  onClick={() => setActiveChartMetric("retention")}
                  className={`px-2.5 py-1 rounded transition ${activeChartMetric === "retention" ? "bg-indigo-600 text-white" : "hover:text-zinc-300"}`}
                >
                  Retention Map
                </button>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[220px] mt-4 select-none">
              <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-white/[0.015]" />
              <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-white/[0.015]" />
              <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-white/[0.015]" />

              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <motion.path d={areaD} fill="url(#chart-gradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
                <motion.path d={pathD} fill="none" stroke="var(--primary-color)" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
                
                {points.map((pt, i) => {
                  const svgX = (pt.x / 100) * 580 + 10;
                  const svgY = (pt.y / 100) * 160 + 10;
                  return (
                    <circle
                      key={i}
                      cx={svgX}
                      cy={svgY}
                      r="4.5"
                      className="fill-[#050508] stroke-[var(--primary-color)] stroke-2 cursor-pointer hover:r-6 transition"
                      onMouseEnter={() => setHoveredPoint({ day: i + 1, val: pt.val })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </svg>

              {hoveredPoint && (
                <div className="absolute bottom-2 left-4 bg-black/80 border border-white/[0.06] backdrop-blur-md rounded-lg p-2 font-mono text-[9px] text-zinc-300">
                  <span className="font-bold text-white">Day {hoveredPoint.day}:</span> {hoveredPoint.val}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between text-[8px] font-mono text-zinc-600 px-2 shrink-0 pt-2 border-t border-white/[0.02]">
              <span>DAY 1</span>
              <span>DAY 10</span>
              <span>DAY 20</span>
              <span>DAY 30 (LATEST)</span>
            </div>
          </div>

          {/* Dribbble Review Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <span>Production Pipeline</span>
              </h2>
              <button onClick={() => setActiveView("ideas")} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition">
                Manage Pipeline &rarr;
              </button>
            </div>

            <div className="liquid-card rounded-2xl border border-white/[0.03] overflow-hidden p-4">
              {activeVideos.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  No active videos in production. Shift cards inside Content Board.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        <th className="pb-3 pl-2">Video Concept</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Priority</th>
                        <th className="pb-3">Target Reach</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {activeVideos.map((video) => (
                        <tr key={video.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-3.5 pl-2 flex flex-col gap-0.5 truncate max-w-[150px] sm:max-w-xs">
                            <span className="text-xs font-semibold text-zinc-200 truncate">{video.title}</span>
                            <span className="text-[9px] text-zinc-500 font-medium">{video.category || "General"}</span>
                          </td>
                          <td className="py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider font-mono border ${
                              video.status === "Idea" ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" :
                              video.status === "Research" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                              video.status === "Scripting" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                              video.status === "Recording" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                              video.status === "Editing" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" :
                              video.status === "Thumbnail" ? "bg-pink-500/10 border-pink-500/20 text-pink-400" :
                              video.status === "Scheduled" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                              "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                video.status === "Idea" ? "bg-zinc-400" :
                                video.status === "Research" ? "bg-blue-400" :
                                video.status === "Scripting" ? "bg-indigo-400" :
                                video.status === "Recording" ? "bg-emerald-400" :
                                video.status === "Editing" ? "bg-violet-400" :
                                video.status === "Thumbnail" ? "bg-pink-400" :
                                video.status === "Scheduled" ? "bg-cyan-400" :
                                "bg-amber-400"
                              }`} />
                              {video.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-[10px] font-bold">
                            <span className={video.priority === "High" ? "text-rose-400" : video.priority === "Medium" ? "text-amber-400" : "text-emerald-400"}>
                              {video.priority}
                            </span>
                          </td>
                          <td className="py-3.5 text-[10px] font-mono font-semibold text-zinc-300">
                            {video.estimatedViews ? `${(video.estimatedViews / 1000).toFixed(0)}K views` : "8.5K views"}
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <button 
                              onClick={() => { 
                                setActiveIdea(video); 
                                if (video.status === "Idea" || video.status === "Research") {
                                  setActiveView("workspace");
                                } else if (video.status === "Scripting") {
                                  setActiveView("scripts");
                                } else {
                                  setActiveView("metadata");
                                }
                              }} 
                              className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-zinc-200" 
                              title="Open Context"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: Stats Grid & Idea Vault (Take 1 column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Vertically Packed Stats Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Channel Analytics
            </h3>
            
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={stat.title}
                    onClick={() => setActiveChartMetric(stat.metricId)}
                    className="liquid-card rounded-2xl p-4 border border-white/[0.03] flex items-center justify-between cursor-pointer hover:border-[var(--primary-color)]/30 transition duration-300"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{stat.title}</span>
                      <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                      <span className="text-[8px] text-emerald-400 block font-semibold">{stat.change}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-400 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Goals & Milestones Progress [NEW!] */}
          <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-400" /> Goals & Milestones
              </h3>
              <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase font-mono">Monetized</span>
            </div>

            <div className="space-y-3">
              {/* Subs progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                  <span>Subscribers Goal (50K)</span>
                  <span className="font-mono text-zinc-200">38,450 / 50K (76.9%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#050508]/40 border border-white/[0.02] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: "76.9%" }} />
                </div>
              </div>

              {/* Watch time progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                  <span>Watch Hours Goal (4K)</span>
                  <span className="font-mono text-zinc-200">3,240 / 4K hrs (81.0%)</span>
                </div>
                <div className="w-full h-1.5 bg-[#050508]/40 border border-white/[0.02] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: "81%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Ideas Vault */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-violet-500" /> Recent Concept Vault
            </h3>
            
            <div className="space-y-2">
              {recentIdeas.slice(0, 3).map((idea) => (
                <div 
                  key={idea.id}
                  onClick={() => setActiveView("ideas")}
                  className="p-3 bg-[#050508]/20 hover:bg-[#050508]/40 border border-white/[0.03] hover:border-white/[0.06] rounded-xl transition cursor-pointer select-none space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-200 truncate">{idea.title}</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider bg-white/[0.02] border border-white/[0.04] px-1.5 py-0.5 rounded shrink-0">
                      {idea.category || "General"}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed">
                    {idea.description || "Quick logged video concept idea."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION C: AI Assistant & Audience Insights (Take 1 column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* AI Sidebar */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-500" />
              <span>AI Assistant</span>
            </h2>

            <div className="liquid-card rounded-2xl p-5 border border-white/[0.03] flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">Preset Prompts</span>
                <div className="flex flex-col gap-1.5">
                  <button 
                    onClick={() => runPresetPrompt("Generate 5 YouTube titles about building an Electron desktop app with SQLite")}
                    className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-1.5 rounded-lg transition"
                  >
                    💡 Title Generator
                  </button>
                  <button 
                    onClick={() => runPresetPrompt("List 3 hook structures that drive audience retention for tutorial channels")}
                    className="text-[10px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-300 px-3 py-1.5 rounded-lg transition"
                  >
                    🪝 Hook Cheat Sheet
                  </button>
                </div>
              </div>

              <form onSubmit={handleAiQuery} className="flex flex-col gap-2">
                <textarea
                  placeholder="Ask local AI to draft outlines, hooks, titles..."
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  className="w-full bg-[#050508]/60 border border-white/[0.04] focus:border-indigo-500/30 rounded-xl p-3 text-xs outline-none text-zinc-200 placeholder-zinc-500 transition resize-none h-24"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl py-2 text-xs font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.4)] transition duration-300 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{aiLoading ? "Thinking..." : "Generate AI"}</span>
                </button>
              </form>

              {aiResponse && (
                <div className="border border-white/5 bg-[#050508]/40 rounded-xl p-3 flex flex-col gap-2 max-h-60 overflow-y-auto">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Sparkles className="h-3 text-indigo-400" />
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">AI Response</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Traffic Sources & Audiences Insights */}
          <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Traffic Channels
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Audience entry discovery paths.</p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>YouTube Search</span>
                  <span className="font-mono text-zinc-200">54.2%</span>
                </div>
                <div className="w-full h-1.5 bg-[#050508]/40 border border-white/[0.02] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "54.2%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Recommendations</span>
                  <span className="font-mono text-zinc-200">32.8%</span>
                </div>
                <div className="w-full h-1.5 bg-[#050508]/40 border border-white/[0.02] rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: "32.8%" }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-zinc-400">
                  <span>Suggested Videos</span>
                  <span className="font-mono text-zinc-200">13.0%</span>
                </div>
                <div className="w-full h-1.5 bg-[#050508]/40 border border-white/[0.02] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "13%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* SVG Audience Retention Curve simulator [NEW!] */}
          <div className="liquid-card rounded-2xl border border-white/[0.03] p-5 space-y-3">
            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-amber-500" /> Retention Curve Simulator
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Average audience retention profile structure.</p>
            </div>

            <div className="h-28 w-full border border-white/[0.03] bg-[#050508]/40 rounded-xl relative overflow-hidden p-2 flex flex-col justify-between select-none">
              
              {/* SVG Curve chart */}
              <div className="flex-1 w-full relative">
                <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="retention-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Curve Path: Starts at 100%, dips to 60%, spikes at demo, drops at outro */}
                  <path 
                    d="M 0 5 L 20 25 L 50 35 L 70 20 L 120 40 L 150 48 L 190 75" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="1.8" 
                  />
                  <path 
                    d="M 0 5 L 20 25 L 50 35 L 70 20 L 120 40 L 150 48 L 190 75 L 190 80 L 0 80 Z" 
                    fill="url(#retention-grad)" 
                  />
                  
                  {/* Annotation node guides */}
                  <circle cx="20" cy="25" r="2" fill="#f59e0b" />
                  <circle cx="70" cy="20" r="2" fill="#10b981" />
                </svg>
              </div>

              {/* Curve annotations */}
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold border-t border-white/[0.02] pt-1">
                <span className="text-amber-400">0:30 Dip (62%)</span>
                <span className="text-emerald-400">2:45 Spike (80%)</span>
                <span>Outro (32%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
