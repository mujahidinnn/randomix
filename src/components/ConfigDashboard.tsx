import { motion } from "framer-motion";
import { Zap, AlertCircle, Lightbulb } from "lucide-react";
import { useStore } from "../store/useStore";
import { TournamentType } from "../types";

const TOURNEY_OPTIONS: {
  value: TournamentType;
  label: string;
  desc: string;
}[] = [
  { value: "none", label: "Tidak Ada", desc: "Hanya bagi tim" },
  { value: "elimination", label: "Single Elimination", desc: "Sistem gugur" },
  { value: "roundrobin", label: "Round Robin", desc: "Liga penuh" },
  { value: "group", label: "Grup Stage", desc: "Fase grup" },
];

export default function ConfigDashboard({
  onGenerate,
}: {
  onGenerate?: () => void;
}) {
  const { config, players, updateConfig, generateTeams, buildTournament } =
    useStore();

  function handleGenerate() {
    const result = generateTeams();
    if (!result.success) {
      alert(result.error);
      return;
    }
    if (config.tournamentType !== "none") buildTournament();
    onGenerate?.();
  }

  const minPlayers = config.teamCount;
  const canGenerate = players.length >= minPlayers;

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="card-title">Konfigurasi Tim</h2>

        {/* Team Count Slider */}
        <div className="mb-6">
          {(() => {
            const min = 2;
            const max = Math.min(players.length, 12);
            const playerCount = players.length;

            const steps = Array.from(
              { length: Math.max(0, max - min + 1) },
              (_, i) => min + i,
            );

            return (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400 text-sm font-medium w-24 flex-shrink-0">
                    Jumlah Tim
                  </span>

                  <div className="relative flex-1 flex flex-col group py-4">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={1}
                      value={config.teamCount}
                      onChange={(e) =>
                        updateConfig({ teamCount: Number(e.target.value) })
                      }
                      className="w-full bg-slate-700 rounded-lg cursor-pointer accent-cyan-400 z-10"
                    />

                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-[2px] pointer-events-none">
                      {steps.map((step) => {
                        const isPerfectFit = playerCount % step === 0;
                        const isActive = config.teamCount === step;

                        return (
                          <div
                            key={step}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              isActive
                                ? "bg-cyan-400 scale-150 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                                : isPerfectFit
                                  ? "bg-emerald-500/60"
                                  : "bg-slate-600"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <div className="flex justify-between mt-3">
                      {steps.map((step) => {
                        const isPerfectFit = playerCount % step === 0;
                        return (
                          <div
                            key={`label-${step}`}
                            className="flex flex-col items-center"
                          >
                            <span
                              className={`text-[10px] font-bold transition-colors ${
                                config.teamCount === step
                                  ? "text-cyan-400"
                                  : isPerfectFit
                                    ? "text-emerald-500/50"
                                    : "text-slate-600"
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`border rounded-md p-1 min-w-[40px] text-center transition-colors focus-within:ring-1 focus-within:ring-cyan-500/50 ${
                      playerCount % config.teamCount === 0
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-cyan-950 border-cyan-500/30"
                    }`}
                  >
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={config.teamCount}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > max) val = max;
                        updateConfig({ teamCount: val });
                      }}
                      onBlur={(e) => {
                        let val = Number(e.target.value);
                        if (val < min || isNaN(val))
                          updateConfig({ teamCount: min });
                      }}
                      className={`w-full bg-transparent text-center outline-none font-bold font-montserrat text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                        playerCount % config.teamCount === 0
                          ? "text-emerald-400"
                          : "text-cyan-400"
                      }`}
                    />
                  </div>
                </div>

                {playerCount > 0 && (
                  <div className="ml-28 text-[11px]">
                    {playerCount % config.teamCount === 0 ? (
                      <span className="text-emerald-400/80 flex items-center gap-1">
                        <Zap size={10} /> Tiap tim berisi{" "}
                        {playerCount / config.teamCount} pemain (Pas!)
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">
                        Akan ada {Math.floor(playerCount / config.teamCount)}{" "}
                        pemain per tim, sisa {playerCount % config.teamCount}{" "}
                        orang.
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Use Level Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-muted text-sm w-28 flex-shrink-0">
            Gunakan Level
          </span>
          <button
            onClick={() => updateConfig({ useLevel: !config.useLevel })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
              ${config.useLevel ? "bg-gradient-to-r from-cyan-400 to-green-400" : "bg-surface3"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
              ${config.useLevel ? "translate-x-0" : "-translate-x-5"}`}
            />
          </button>
          <span className="text-xs text-muted">
            Smart balancing berdasarkan skill level
          </span>
        </div>

        {/* Tournament Type */}
        <div className="mb-2">
          <span className="text-muted text-sm block mb-2">Mode Turnamen</span>
          <div className="grid grid-cols-2 gap-2">
            {TOURNEY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateConfig({ tournamentType: opt.value })}
                className={`p-3 rounded-xl border text-left transition-all
                  ${
                    config.tournamentType === opt.value
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300"
                      : "border-border text-muted hover:border-cyan-400/30 hover:text-text bg-surface2"
                  }`}
              >
                <div className="font-bold font-montserrat text-xs">
                  {opt.label}
                </div>
                <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player count warning */}
      {!canGenerate && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3"
        >
          <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-300 text-sm">
            Butuh minimal <strong>{minPlayers}</strong> pemain. Saat ini:{" "}
            <strong>{players.length}</strong>
          </span>
        </motion.div>
      )}
      <div className="flex items-start gap-2.5 px-1 py-1">
        <Lightbulb size={14} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed italic">
          <strong>Note:</strong> Jika Anda melakukan perubahan konfigurasi,
          harap tekan tombol <strong>GENERATE TEAMS</strong> kembali untuk
          memperbarui hasil pembagian tim dan turnamen.
        </p>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className={`btn-primary w-full justify-center py-3.5 text-base font-montserrat font-black tracking-wide rounded-2xl
          ${!canGenerate ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <Zap size={18} />
        GENERATE TEAMS
      </motion.button>
    </div>
  );
}
