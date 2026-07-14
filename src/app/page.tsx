"use client";

import React from "react";
import AppShell from "../components/AppShell";
import { useStore } from "../hooks/useStore";
import DashboardView from "../components/views/DashboardView";
import IdeaVaultView from "../components/views/IdeaVaultView";
import ResearchWorkspaceView from "../components/views/ResearchWorkspaceView";
import ScriptStudioView from "../components/views/ScriptStudioView";
import CompetitorAnalysisView from "../components/views/CompetitorAnalysisView";
import MetadataStudioView from "../components/views/MetadataStudioView";
import SettingsView from "../components/views/SettingsView";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { activeView } = useStore();

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView />;
      case "ideas":
        return <IdeaVaultView />;
      case "workspace":
        return <ResearchWorkspaceView />;
      case "scripts":
        return <ScriptStudioView />;
      case "metadata":
        return <MetadataStudioView />;
      case "competitors":
        return <CompetitorAnalysisView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full w-full"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
