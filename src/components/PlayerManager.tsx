import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Trash2, Users, Zap } from "lucide-react";
import { useStore } from "../store/useStore";
import { Level, LEVEL_COLORS } from "../types";

const LEVELS: Level[] = ["Newbie", "Middle", "Pro"];

const levelStyle: Record<Level, string> = {
  Newbie:
    "border-emerald-400/40 text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20",
  Middle:
    "border-yellow-400/40 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20",
  Pro: "border-red-400/40  text-red-400  bg-red-400/10  hover:bg-red-400/20",
};

const levelActiveStyle: Record<Level, string> = {
  Newbie:
    "border-emerald-400 text-emerald-400 bg-emerald-400/25 ring-2 ring-emerald-400/50",
  Middle:
    "border-yellow-400 text-yellow-400 bg-yellow-400/25 ring-2 ring-yellow-400/50",
  Pro: "border-red-400  text-red-400  bg-red-400/25  ring-2 ring-red-400/50",
};

export default function PlayerManager() {
  const {
    players,
    selectedLevel,
    addPlayer,
    removePlayer,
    clearPlayers,
    setLevel,
  } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Masukkan nama pemain.");
      return;
    }
    const exists = players.some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setError("Nama sudah ada!");
      return;
    }
    addPlayer(trimmed, selectedLevel);
    setName("");
    setError("");
    inputRef.current?.focus();
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
  }

  const counts = { Newbie: 0, Middle: 0, Pro: 0 };
  players.forEach((p) => counts[p.level]++);
  const totalPower = players.reduce((s, p) => s + p.power, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Add Player Card */}
      <div className="card">
        <h2 className="card-title">Tambah Pemain</h2>

        {/* Level selector */}
        <div className="flex gap-2 mb-3">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all font-montserrat tracking-wide
                ${selectedLevel === l ? levelActiveStyle[l] : levelStyle[l]}`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={handleKey}
            placeholder="Nama pemain..."
            className="input flex-1"
          />
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus size={16} /> Add
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* Stats */}
      {players.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {(
            [
              { label: "Total", value: players.length, color: "text-blue-300" },
              {
                label: "Newbie",
                value: counts.Newbie,
                color: "text-emerald-400",
              },
              {
                label: "Middle",
                value: counts.Middle,
                color: "text-yellow-400",
              },
              { label: "Pro", value: counts.Pro, color: "text-red-400" },
              {
                label: "Power",
                value: `⚡${totalPower}`,
                color: "text-cyan-400",
              },
            ] as const
          ).map((s) => (
            <div key={s.label} className="stat-chip">
              {s.label}{" "}
              <span className={`font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Player List Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="card-title mb-0 flex items-center gap-2">
            <Users size={14} /> Daftar Pemain
          </h2>
          {players.length > 0 && (
            <button
              onClick={clearPlayers}
              className="text-red-400/70 hover:text-red-400 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> Hapus semua
            </button>
          )}
        </div>

        {players.length === 0 ? (
          <div className="empty-state">
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p>Belum ada pemain. Tambahkan di atas!</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
            <AnimatePresence initial={false}>
              {players.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="player-item"
                >
                  {/* Number */}
                  <span className="w-6 h-6 rounded-full grad flex items-center justify-center text-[10px] font-bold text-black flex-shrink-0">
                    {i + 1}
                  </span>

                  {/* Name */}
                  <span className="flex-1 text-sm font-medium">{p.name}</span>

                  {/* Level badge */}
                  <span
                    className="badge text-xs px-2 py-0.5 rounded-full font-bold border"
                    style={{
                      color: LEVEL_COLORS[p.level],
                      borderColor: `${LEVEL_COLORS[p.level]}55`,
                      backgroundColor: `${LEVEL_COLORS[p.level]}18`,
                    }}
                  >
                    {p.level}
                  </span>

                  {/* Power */}
                  <span className="text-xs text-muted flex items-center gap-0.5">
                    <Zap size={10} />
                    {p.power}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removePlayer(p.id)}
                    className="text-red-400/50 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
