import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Settings,
  LayoutGrid,
  Trophy,
  Download,
  AudioWaveform,
} from "lucide-react";
import PlayerManager from "./components/PlayerManager";
import ConfigDashboard from "./components/ConfigDashboard";
import ResultArena from "./components/ResultArena";
import TournamentView from "./components/TournamentView";
import ExportCenter from "./components/ExportCenter";

type Tab = "players" | "config" | "teams" | "tournament" | "export";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "players", label: "Players", icon: <Users size={15} /> },
  { id: "config", label: "Config", icon: <Settings size={15} /> },
  { id: "teams", label: "Teams", icon: <LayoutGrid size={15} /> },
  { id: "tournament", label: "Tournament", icon: <Trophy size={15} /> },
  { id: "export", label: "Export", icon: <Download size={15} /> },
];

export default function App() {
  const [active, setActive] = useState<Tab>("players");

  const content: Record<Tab, React.ReactNode> = {
    players: <PlayerManager />,
    config: <ConfigDashboard onGenerate={() => setActive("teams")} />,
    teams: <ResultArena />,
    tournament: <TournamentView />,
    export: <ExportCenter />,
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <header className="px-6 pt-5 pb-0 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl grad flex items-center justify-center font-montserrat font-black text-lg text-black flex-shrink-0">
            <img src="/randomix__2.png" alt="randomix" className="h-8" />
          </div>
          <h1 className="font-randomix text-lowercase font-black text-4xl grad-text tracking-tight">
            randomix
          </h1>
          <span className="ml-auto text-[10px] bg-surface2 border border-border rounded-full px-3 py-1 text-muted font-medium">
            v2.0 randomix
          </span>
        </header>

        {/* Tab Bar */}
        <nav className="px-4 pt-4 flex gap-1 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-montserrat whitespace-nowrap transition-colors
              ${
                active === tab.id
                  ? "text-black"
                  : "text-muted hover:text-text hover:bg-surface2"
              }`}
            >
              {active === tab.id && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl grad"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon}{" "}
                <p
                  className={`${active === tab.id ? "block" : "hidden"} sm:block`}
                >
                  {tab.label}
                </p>
              </span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="px-4 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {content[active]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <footer className="py-6 flex flex-col items-center gap-1 shrink-0">
        <p className="text-[10px] text-slate-500 font-black italic tracking-[0.25em]">
          Game on, Teams set
        </p>
        <p className="text-[11px] text-slate-500 font-medium flex gap-2">
          with grit:{" "}
          <a
            href="https://mujahidin.vercel.app"
            target="_blank"
            className="text-cyan-500/80 hover:text-cyan-400 transition-colors font-bold underline underline-offset-4 decoration-slate-800 flex"
          >
            <AudioWaveform size={14} /> mjh
          </a>
        </p>
      </footer>
    </div>
  );
}
