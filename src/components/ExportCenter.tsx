import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  FileText,
  FileSpreadsheet,
  Copy,
  MessageCircle,
  CheckCircle2,
  Users,
  Trophy,
  LayoutGrid,
  X,
  Download,
  Zap,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  downloadImage,
  downloadPDF,
  downloadExcel,
  copyPlainText,
  copyWhatsApp,
} from "../lib/export";
import { LEVEL_COLORS } from "../types";

// ── Single export button ────────────────────────

interface ExportBtnProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  hoverColor: string;
  isCopy?: boolean;
  onRun: () => Promise<void>;
}

function ExportBtn({
  icon,
  label,
  sublabel,
  hoverColor,
  isCopy,
  onRun,
}: ExportBtnProps) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function handle() {
    if (state !== "idle") return;
    setState("busy");
    try {
      await onRun();
    } catch (e) {
      console.error(e);
    }
    setState("done");
    setTimeout(() => setState("idle"), 2200);
  }

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={handle}
      disabled={state !== "idle"}
      className={`flex flex-col gap-3 p-4 rounded-2xl border border-border bg-surface2 text-left
        cursor-pointer transition-all disabled:opacity-60 ${hoverColor}`}
    >
      <span className="text-muted">{icon}</span>
      <div>
        <div className="font-montserrat font-bold text-sm text-text">
          {label}
        </div>
        {sublabel && (
          <div className="text-[11px] text-muted mt-0.5">{sublabel}</div>
        )}
      </div>
      <div className="text-[11px] font-semibold text-muted">
        {state === "busy" ? (
          "⏳ Memproses..."
        ) : state === "done" ? (
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={11} /> {isCopy ? "Disalin!" : "Selesai!"}
          </span>
        ) : (
          `${isCopy ? "Salin" : "Download"} →`
        )}
      </div>
    </motion.button>
  );
}

// ── Section wrapper ───────────────────────────

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}

function Section({ icon, title, subtitle, color, children }: SectionProps) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {icon}
        </div>
        <div>
          <h2 className="font-montserrat font-black text-sm text-text">
            {title}
          </h2>
          <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export default function ExportCenter() {
  const { teams, tournament } = useStore();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const hasTeams = teams.length > 0;
  const hasTournament = tournament !== null;

  if (!hasTeams) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <LayoutGrid size={48} className="opacity-20 mb-3" />
        <p className="text-muted">
          Generate tim terlebih dahulu untuk mengakses Export.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Modal Preview PNG ── */}
      <AnimatePresence>
        {previewId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface1 border border-border w-full max-w-sm sm:max-w-6xl rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-4 border-b border-border flex justify-between items-center bg-surface2">
                <span className="font-bold text-sm font-montserrat uppercase tracking-wider">
                  Preview Download{" "}
                  {previewId === "all" ? "Full Summary" : previewId}
                </span>
                <button
                  onClick={() => setPreviewId(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Area */}
              <div className="p-6 bg-surface3 flex justify-center overflow-auto max-h-[80vh]">
                <div
                  id="preview-area"
                  className="bg-slate-900 p-6 sm:p-8 rounded-xl border border-white/10 w-full min-w-[320px] sm:min-w-[600px] h-full mx-auto flex flex-col gap-8"
                >
                  {/* Brand Header */}
                  <div className="flex justify-between items-center gap-2 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg grad flex items-center justify-center font-montserrat font-black text-lg text-black flex-shrink-0">
                        <img
                          src="/randomix__2.png"
                          alt="logo"
                          className="h-6"
                        />
                      </div>
                      <h1 className="font-randomix text-lowercase font-black text-3xl grad-text tracking-tight">
                        randomix
                      </h1>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest text-right">
                      Official Result
                      <br />
                      Generated: {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {/* --- SECTION 1: TEAMS --- */}
                  {(previewId === "teams" || previewId === "all") && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400" /> Team
                        Rosters
                      </h3>
                      <div
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(min(100%, 220px), 1fr))",
                        }}
                      >
                        {teams.map((team) => {
                          return (
                            <div
                              key={team.id}
                              className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden"
                            >
                              <div
                                className="flex items-center justify-between px-4 py-2.5 border-b"
                                style={{
                                  background: `${team.color}15`,
                                  borderColor: `${team.color}33`,
                                }}
                              >
                                <span
                                  className="font-montserrat font-black text-[11px] uppercase"
                                  style={{ color: team.color }}
                                >
                                  {team.name}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">
                                  PWR: {team.power}
                                </span>
                              </div>
                              <div className="p-3 flex flex-col gap-1">
                                {team.players.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex items-center justify-between text-[10px]"
                                  >
                                    <span className="text-slate-300 flex items-center gap-1.5">
                                      <span
                                        className="w-1 h-1 rounded-full"
                                        style={{
                                          background: LEVEL_COLORS[p.level],
                                        }}
                                      />
                                      {p.name}
                                    </span>
                                    <span className="text-slate-600 font-bold uppercase">
                                      {p.level}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* --- SECTION 2: TOURNAMENT --- */}
                  {(previewId === "tournament" || previewId === "all") &&
                    tournament && (
                      <div className="space-y-4 pt-4 border-t border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Trophy size={14} className="text-cyan-400" />
                          {tournament.type === "elimination"
                            ? "Tournament Bracket"
                            : "League Standings"}
                        </h3>

                        {tournament.type === "elimination" ? (
                          <div className="flex gap-6 justify-start overflow-x-auto pb-4">
                            {tournament.rounds.map((round) => (
                              <div
                                key={round.id}
                                className="flex flex-col gap-3 w-40 flex-shrink-0"
                              >
                                <div className="text-[9px] font-black text-slate-600 uppercase text-center">
                                  {round.name}
                                </div>
                                {round.matches.map((match) => (
                                  <div
                                    key={match.id}
                                    className="bg-slate-800/80 rounded border border-white/10 overflow-hidden shadow-xl"
                                  >
                                    {[match.team1, match.team2].map(
                                      (t, idx) => (
                                        <div
                                          key={idx}
                                          className={`px-2 py-1.5 text-[10px] flex justify-between ${match.winner?.id === t?.id ? "bg-cyan-500/10" : ""}`}
                                        >
                                          <span
                                            style={{
                                              color: t?.color || "#9ca3af",
                                            }}
                                            className="font-bold truncate"
                                          >
                                            {t?.name || "..."}
                                          </span>
                                          {match.winner?.id === t?.id && (
                                            <CheckCircle2
                                              size={8}
                                              className="text-cyan-400"
                                            />
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                            {(tournament.type === "group"
                              ? tournament.groups
                              : [
                                  {
                                    standings: tournament.standings,
                                    name: "Final Standings",
                                    color: "#22d3ee",
                                  },
                                ]
                            ).map((g, gi) => (
                              <div
                                key={gi}
                                className="bg-slate-800/30 rounded-xl border border-white/5 p-4"
                              >
                                <div
                                  className="text-[10px] font-black mb-3 uppercase tracking-widest text-slate-400 border-l-2 pl-2"
                                  style={{ borderColor: g.color }}
                                >
                                  {g.name}
                                </div>
                                <table className="w-full text-[10px]">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-white/5 text-left">
                                      <th className="pb-1 px-1">#</th>
                                      <th className="pb-1">Team</th>
                                      <th className="pb-1 text-center">Pts</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {g.standings.map((s, si) => (
                                      <tr
                                        key={si}
                                        className="border-b border-white/5 last:border-0"
                                      >
                                        <td className="py-1.5 px-1 text-slate-600 font-mono">
                                          {si + 1}
                                        </td>
                                        <td
                                          className="py-1.5 font-bold"
                                          style={{ color: s.team.color }}
                                        >
                                          {s.team.name}
                                        </td>
                                        <td className="py-1.5 text-center font-black text-cyan-400">
                                          {s.points}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <p className="text-[9px] text-slate-600 font-bold tracking-[0.3em] uppercase">
                      Fair Play • Randomix
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface2 border-t border-border flex gap-2">
                <button
                  onClick={() => setPreviewId(null)}
                  className="flex-1 py-2 text-sm font-bold bg-surface3 rounded-lg hover:bg-surface2 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    await downloadImage(
                      "preview-area",
                      `randomix-full-summary`,
                    );
                    setPreviewId(null);
                  }}
                  className="flex-[2] py-2 text-sm font-bold bg-cyan-500 text-black rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-400"
                >
                  <Download size={16} /> Download PNG
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Section 1: Teams ── */}
      <Section
        icon={<Users size={18} />}
        title="Export Tim"
        subtitle="Hanya daftar tim dan anggotanya"
        color="#00c6ff"
      >
        <ExportBtn
          icon={<Image size={20} />}
          label="PNG"
          sublabel="Preview Screenshot"
          hoverColor="hover:border-pink-400/50"
          onRun={async () => setPreviewId("teams")}
        />
        <ExportBtn
          icon={<FileText size={20} />}
          label="PDF"
          sublabel="Dokumen cetak"
          hoverColor="hover:border-orange-400/50"
          onRun={() => downloadPDF({ teams, scope: "teams" })}
        />
        <ExportBtn
          icon={<FileSpreadsheet size={20} />}
          label="Excel"
          sublabel="Spreadsheet tim"
          hoverColor="hover:border-purple-400/50"
          onRun={() => downloadExcel({ teams, scope: "teams" })}
        />
        <ExportBtn
          icon={<Copy size={20} />}
          label="Plain Text"
          sublabel="Salin ke clipboard"
          hoverColor="hover:border-cyan-400/50"
          isCopy
          onRun={() => copyPlainText(teams)}
        />
        <ExportBtn
          icon={<MessageCircle size={20} />}
          label="WhatsApp"
          sublabel="Format bold WA"
          hoverColor="hover:border-emerald-400/50"
          isCopy
          onRun={() => copyWhatsApp(teams)}
        />
      </Section>

      {/* ── Section 2: Tournament ── */}
      <Section
        icon={<Trophy size={18} />}
        title="Export Turnamen"
        subtitle={
          hasTournament
            ? "Bracket / klasemen / grup beserta skor"
            : "Belum ada turnamen"
        }
        color="#00ff88"
      >
        {hasTournament ? (
          <>
            <ExportBtn
              icon={<Image size={20} />}
              label="PNG"
              sublabel="Preview Screenshot"
              hoverColor="hover:border-pink-400/50"
              onRun={async () => setPreviewId("tournament")}
            />
            <ExportBtn
              icon={<FileText size={20} />}
              label="PDF"
              sublabel="Laporan turnamen"
              hoverColor="hover:border-orange-400/50"
              onRun={() => downloadPDF({ tournament, scope: "tournament" })}
            />
            <ExportBtn
              icon={<FileSpreadsheet size={20} />}
              label="Excel"
              sublabel="Data pertandingan"
              hoverColor="hover:border-purple-400/50"
              onRun={() =>
                downloadExcel({ teams, tournament, scope: "tournament" })
              }
            />
            <ExportBtn
              icon={<Copy size={20} />}
              label="Plain Text"
              sublabel="Hasil turnamen"
              hoverColor="hover:border-cyan-400/50"
              isCopy
              onRun={() => copyPlainText([], tournament)}
            />
            <ExportBtn
              icon={<MessageCircle size={20} />}
              label="WhatsApp"
              sublabel="Hasil format WA"
              hoverColor="hover:border-emerald-400/50"
              isCopy
              onRun={() => copyWhatsApp([], tournament)}
            />
          </>
        ) : (
          <div className="col-span-full text-xs text-muted py-4 text-center">
            Buat turnamen di tab Tournament terlebih dahulu.
          </div>
        )}
      </Section>

      {/* ── Section 3: Full Combined ── */}
      <Section
        icon={<LayoutGrid size={18} />}
        title="Laporan Lengkap"
        subtitle="Gabungan tim + hasil turnamen dalam satu file"
        color="#a78bfa"
      >
        <ExportBtn
          icon={<Image size={20} />}
          label="PNG"
          sublabel="Preview Screenshot"
          hoverColor="hover:border-pink-400/50"
          onRun={async () => setPreviewId("all")}
        />
        <ExportBtn
          icon={<FileText size={20} />}
          label="PDF Lengkap"
          sublabel="Tim + turnamen"
          hoverColor="hover:border-orange-400/50"
          onRun={() => downloadPDF({ teams, tournament, scope: "full" })}
        />
        <ExportBtn
          icon={<FileSpreadsheet size={20} />}
          label="Excel Lengkap"
          sublabel="Multi-sheet"
          hoverColor="hover:border-purple-400/50"
          onRun={() => downloadExcel({ teams, tournament, scope: "full" })}
        />
        <ExportBtn
          icon={<Copy size={20} />}
          label="Text Lengkap"
          sublabel="Tim + hasil"
          hoverColor="hover:border-cyan-400/50"
          isCopy
          onRun={() => copyPlainText(teams, tournament)}
        />
        <ExportBtn
          icon={<MessageCircle size={20} />}
          label="WA Lengkap"
          sublabel="Siap share grup"
          hoverColor="hover:border-emerald-400/50"
          isCopy
          onRun={() => copyWhatsApp(teams, tournament)}
        />
      </Section>
    </div>
  );
}
