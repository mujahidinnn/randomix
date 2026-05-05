import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  FileSpreadsheet,
  FileText,
  Image,
  MessageCircle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { powerStdDev } from "../lib/balancing";
import {
  copyPlainText,
  copyWhatsApp,
  downloadExcel,
  downloadImage,
  downloadPDF,
} from "../lib/export";
import { useStore } from "../store/useStore";
import { LEVEL_COLORS } from "../types";

// ── Scoped export toolbar ─────────────────────────────────

function TeamsExportBar() {
  const { teams } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      console.error(e);
    }
    setBusy(null);
  }

  async function runCopy(key: string, fn: () => Promise<void>) {
    await run(key, fn);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const opts = [
    {
      key: "img",
      icon: <Image size={12} />,
      label: "PNG",
      color: "hover:border-pink-400/50 hover:text-pink-400",
      action: () => downloadImage("teams-result-grid", "randomix-teams"),
      copy: false,
    },
    {
      key: "pdf",
      icon: <FileText size={12} />,
      label: "PDF",
      color: "hover:border-orange-400/50 hover:text-orange-400",
      action: () => downloadPDF({ teams, scope: "teams" }),
      copy: false,
    },
    {
      key: "xlsx",
      icon: <FileSpreadsheet size={12} />,
      label: "Excel",
      color: "hover:border-purple-400/50 hover:text-purple-400",
      action: () => downloadExcel({ teams, scope: "teams" }),
      copy: false,
    },
    {
      key: "text",
      icon: <Copy size={12} />,
      label: "Text",
      color: "hover:border-cyan-400/50 hover:text-cyan-400",
      action: () => copyPlainText(teams),
      copy: true,
    },
    {
      key: "wa",
      icon: <MessageCircle size={12} />,
      label: "WhatsApp",
      color: "hover:border-emerald-400/50 hover:text-emerald-400",
      action: () => copyWhatsApp(teams),
      copy: true,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-muted font-medium uppercase tracking-wider mr-1">
        Export:
      </span>
      {opts.map((opt) => (
        <button
          key={opt.key}
          onClick={() =>
            opt.copy ? runCopy(opt.key, opt.action) : run(opt.key, opt.action)
          }
          disabled={!!busy}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface2 border border-border
            text-[11px] text-muted transition-all disabled:opacity-40 ${opt.color}`}
        >
          {copied === opt.key ? (
            <>
              <CheckCircle2 size={11} className="text-emerald-400" /> Disalin!
            </>
          ) : busy === opt.key ? (
            "..."
          ) : (
            <>
              {opt.icon} {opt.label}
            </>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export default function ResultArena() {
  const { teams, generateTeams, buildTournament, config } = useStore();

  if (!teams.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Zap size={48} className="opacity-20 mb-3" />
        <p className="text-muted">Belum ada tim. Generate dari tab Config.</p>
      </div>
    );
  }

  function handleRegenerate() {
    generateTeams();
    if (config.tournamentType !== "none") buildTournament();
  }

  const maxPower = Math.max(...teams.map((t) => t.power));
  const stdDev = powerStdDev(teams).toFixed(2);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-montserrat font-black text-lg grad-text">
            RESULT ARENA
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Balance σ = {stdDev} — semakin kecil semakin seimbang
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TeamsExportBar />
          <button
            onClick={handleRegenerate}
            className="btn-outline flex items-center gap-2 text-xs px-3 py-1.5 ml-2"
          >
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
      </div>

      {/* Teams grid — this element is captured for PNG export */}
      <div
        id="teams-result-grid"
        className="grid gap-3 p-1"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {teams.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="team-card"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{
                background: `${team.color}18`,
                borderColor: `${team.color}44`,
              }}
            >
              <span
                className="font-montserrat font-black text-base"
                style={{ color: team.color }}
              >
                {team.name}
              </span>
              <span className="text-xs bg-surface3 rounded-md px-2 py-0.5 text-muted flex items-center gap-1">
                <Zap size={10} /> {team.power}
              </span>
            </div>

            {/* Power bar */}
            <div className="h-1 bg-surface3 mx-4 my-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((team.power / maxPower) * 100)}%`,
                  background: `linear-gradient(90deg, ${team.color}, #00ff88)`,
                }}
              />
            </div>

            {/* Players */}
            <div className="px-4 pb-4 flex flex-col gap-1">
              {team.players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: LEVEL_COLORS[p.level] }}
                  />
                  <span className="text-sm flex-1">{p.name}</span>
                  <span className="text-[10px] text-muted font-medium">
                    {p.level}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
