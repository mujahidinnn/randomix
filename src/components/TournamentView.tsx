import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Swords,
  Zap,
  ChevronRight,
  CheckCircle2,
  Image,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { Team, Match, Group } from "../types";
import { downloadImage, downloadPDF, downloadExcel } from "../lib/export";

// ============================================================
// Scoped Export Bar — reusable inside any sub-view
// ============================================================

interface ScopedExportBarProps {
  captureId: string;
  label: string;
}

function ScopedExportBar({ captureId, label }: ScopedExportBarProps) {
  const { teams, tournament } = useStore();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      console.error(e);
    }
    setBusy(null);
  }

  const slug = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-muted font-medium uppercase tracking-wider mr-1">
        Export:
      </span>
      <button
        onClick={() =>
          run("img", () => downloadImage(captureId, `randomix-${slug}`))
        }
        disabled={!!busy}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-[11px] text-muted hover:border-pink-400/50 hover:text-pink-400 transition-all disabled:opacity-40"
      >
        <Image size={11} /> {busy === "img" ? "..." : "PNG"}
      </button>
      <button
        onClick={() =>
          run("pdf", () => downloadPDF({ tournament, scope: "tournament" }))
        }
        disabled={!!busy}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-[11px] text-muted hover:border-orange-400/50 hover:text-orange-400 transition-all disabled:opacity-40"
      >
        <FileText size={11} /> {busy === "pdf" ? "..." : "PDF"}
      </button>
      <button
        onClick={() =>
          run("xlsx", () =>
            downloadExcel({ teams, tournament, scope: "tournament" }),
          )
        }
        disabled={!!busy}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-[11px] text-muted hover:border-purple-400/50 hover:text-purple-400 transition-all disabled:opacity-40"
      >
        <FileSpreadsheet size={11} /> {busy === "xlsx" ? "..." : "Excel"}
      </button>
    </div>
  );
}

// ============================================================
// Root dispatcher
// ============================================================

export default function TournamentView() {
  const { tournament, teams, config, buildTournament } = useStore();

  if (!teams.length) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Trophy size={48} className="opacity-20 mb-3" />
        <p className="text-muted">Generate tim terlebih dahulu.</p>
      </div>
    );
  }

  if (config.tournamentType === "none") {
    return (
      <div className="card flex flex-col items-center justify-center py-16 text-center">
        <Swords size={48} className="opacity-20 mb-3" />
        <p className="text-muted">
          Pilih mode turnamen di tab Config, lalu klik Generate Teams.
        </p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="card flex flex-col items-center justify-center py-12 text-center gap-3">
        <p className="text-muted text-sm">Bracket belum dibuat.</p>
        <button
          onClick={buildTournament}
          className="btn-primary text-base px-8 py-3 rounded-2xl"
        >
          🏆 Buat Bracket
        </button>
      </div>
    );
  }

  if (tournament.type === "elimination") return <EliminationView />;
  if (tournament.type === "roundrobin") return <RoundRobinView />;
  if (tournament.type === "group") return <GroupView />;
  return null;
}

// ============================================================
// 1. SINGLE ELIMINATION
// ============================================================

function EliminationView() {
  const { tournament, advanceWinner } = useStore();
  if (tournament?.type !== "elimination") return null;
  const { rounds } = tournament;

  const champion = rounds[rounds.length - 1]?.matches[0]?.winner ?? null;

  return (
    <div className="flex flex-col gap-4">
      {champion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-5 py-4 rounded-2xl border"
          style={{
            background: `${champion.color}18`,
            borderColor: `${champion.color}55`,
          }}
        >
          <Trophy size={20} style={{ color: champion.color }} />
          <div>
            <p className="text-xs text-muted">🏆 Juara Turnamen</p>
            <p
              className="font-montserrat font-black text-lg"
              style={{ color: champion.color }}
            >
              {champion.name}
            </p>
          </div>
        </motion.div>
      )}

      <div className="card" id="capture-elimination">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="card-title mb-0 flex items-center gap-2">
            <Trophy size={14} /> Single Elimination
          </h2>
          <ScopedExportBar captureId="capture-elimination" label="Bracket" />
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {rounds.map((round, ri) => (
              <div key={round.id} className="flex flex-col gap-3 w-44">
                <div className="text-[10px] font-bold font-montserrat text-muted uppercase tracking-widest text-center mb-1">
                  {round.name}
                </div>
                {round.matches.map((match, mi) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPickWinner={(t) => {
                      if (!t || t.id === "bye") return;
                      advanceWinner(ri, mi, t);
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  onPickWinner,
}: {
  match: Match;
  onPickWinner: (t: Team) => void;
}) {
  return (
    <div className="bg-surface2 border border-border rounded-xl overflow-hidden">
      <div className="text-[10px] text-muted text-center py-1 bg-surface font-medium">
        Match {match.matchNumber}
      </div>
      {([match.team1, match.team2] as (Team | null)[]).map((team, i) => (
        <div key={i}>
          {i === 1 && <div className="h-px bg-border" />}
          <button
            onClick={() => team && onPickWinner(team)}
            disabled={!team || team.id === "bye"}
            className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-all
              ${
                match.winner?.id === team?.id
                  ? "bg-gradient-to-r from-cyan-400/20 to-green-400/10"
                  : team && team.id !== "bye"
                    ? "hover:bg-surface3"
                    : "cursor-default opacity-40"
              }`}
            style={{
              color:
                match.winner?.id === team?.id
                  ? "#00ff88"
                  : team?.id !== "bye"
                    ? team?.color
                    : "#555",
            }}
          >
            <span className="flex items-center gap-2">
              {match.winner?.id === team?.id && <CheckCircle2 size={12} />}
              {team?.name ?? "?"}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 2. ROUND ROBIN
// ============================================================

function RoundRobinView() {
  const { tournament, submitRRScore } = useStore();
  if (tournament?.type !== "roundrobin") return null;
  const { fixtures, standings } = tournament;
  const [scores, setScores] = useState<Record<string, [string, string]>>({});

  const played = fixtures.filter((f) => f.played).length;
  const total = fixtures.length;
  const pct = total > 0 ? Math.round((played / total) * 100) : 0;

  function handleSubmit(fixtureId: string) {
    const [s1, s2] = scores[fixtureId] ?? ["0", "0"];
    submitRRScore(fixtureId, Number(s1), Number(s2));
    setScores((s) => {
      const n = { ...s };
      delete n[fixtureId];
      return n;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted">Progress pertandingan</span>
          <span className="text-xs font-bold text-cyan-400">
            {played}/{total}
          </span>
        </div>
        <div className="h-2 bg-surface3 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#00c6ff,#00ff88)" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {played === total && total > 0 && (
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <CheckCircle2 size={12} /> Semua pertandingan selesai!
          </p>
        )}
      </div>

      {/* Standings */}
      <div className="card" id="capture-roundrobin">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="card-title mb-0">Klasemen Liga</h2>
          <ScopedExportBar captureId="capture-roundrobin" label="Liga" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-[10px] font-bold font-montserrat uppercase tracking-wider border-b border-border">
                {["#", "Tim", "M", "W", "D", "L", "Pts"].map((h) => (
                  <th key={h} className="py-2 px-2 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <motion.tr
                  key={s.team.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-border/40 hover:bg-surface2 transition-colors"
                >
                  <td className="py-2 px-2 text-center font-bold font-montserrat text-cyan-400">
                    {i + 1}
                  </td>
                  <td
                    className="py-2 px-2 font-semibold"
                    style={{ color: s.team.color }}
                  >
                    {s.team.name}
                  </td>
                  <td className="py-2 px-2 text-center text-muted">
                    {s.played}
                  </td>
                  <td className="py-2 px-2 text-center text-green-400">
                    {s.won}
                  </td>
                  <td className="py-2 px-2 text-center text-yellow-400">
                    {s.drawn}
                  </td>
                  <td className="py-2 px-2 text-center text-red-400">
                    {s.lost}
                  </td>
                  <td className="py-2 px-2 text-center font-black font-montserrat text-cyan-400">
                    {s.points}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures */}
      <div className="card">
        <h2 className="card-title mb-3">Jadwal Pertandingan</h2>
        <div className="flex flex-col gap-2">
          {fixtures.map((f) => (
            <FixtureRow
              key={f.id}
              team1Name={f.team1.name}
              team1Color={f.team1.color}
              team2Name={f.team2.name}
              team2Color={f.team2.color}
              played={f.played}
              score1={f.score1}
              score2={f.score2}
              localScore={scores[f.id]}
              onChangeScore={(s1, s2) =>
                setScores((s) => ({ ...s, [f.id]: [s1, s2] }))
              }
              onSubmit={() => handleSubmit(f.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 3. GROUP STAGE — full interactive
// ============================================================

function GroupView() {
  const { tournament, submitGroupScore, promoteToKnockout, advanceWinner } =
    useStore();
  if (tournament?.type !== "group") return null;
  const { groups, isComplete, knockoutBracket } = tournament;

  const [scores, setScores] = useState<Record<string, [string, string]>>({});
  const [activeGroup, setActiveGroup] = useState<string>(groups[0]?.id ?? "");
  const [advancers, setAdvancers] = useState<1 | 2>(2);

  const totalFixtures = groups.reduce((s, g) => s + g.fixtures.length, 0);
  const playedFixtures = groups.reduce(
    (s, g) => s + g.fixtures.filter((f) => f.played).length,
    0,
  );
  const pct =
    totalFixtures > 0 ? Math.round((playedFixtures / totalFixtures) * 100) : 0;

  function handleGroupScore(fixtureId: string) {
    const [s1, s2] = scores[fixtureId] ?? ["0", "0"];
    submitGroupScore(fixtureId, Number(s1), Number(s2));
    setScores((s) => {
      const n = { ...s };
      delete n[fixtureId];
      return n;
    });
  }

  const activeG = groups.find((g) => g.id === activeGroup) ?? groups[0];

  return (
    <div className="flex flex-col gap-4">
      {/* Header + progress */}
      <div className="card" id="capture-group">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 className="card-title mb-0 flex items-center gap-2">
              <Trophy size={14} /> Grup Stage
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {playedFixtures}/{totalFixtures} pertandingan selesai
            </p>
          </div>
          <ScopedExportBar captureId="capture-group" label="Group Stage" />
        </div>
        <div className="h-2 bg-surface3 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#00c6ff,#00ff88)" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Completion banner + promote CTA */}
        <AnimatePresence>
          {isComplete && !knockoutBracket && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 rounded-xl border border-green-400/40 bg-green-400/10 flex flex-col gap-3"
            >
              <p className="text-green-400 font-bold font-montserrat text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> Group Stage selesai!
              </p>
              <p className="text-xs text-muted">
                Berapa tim per grup yang lolos ke fase gugur?
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setAdvancers(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                      ${
                        advancers === n
                          ? "bg-green-400/20 border-green-400 text-green-400"
                          : "bg-surface2 border-border text-muted hover:border-green-400/30"
                      }`}
                  >
                    Top {n} per grup
                  </button>
                ))}
                <button
                  onClick={() => promoteToKnockout(advancers)}
                  className="btn-primary ml-auto flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl"
                >
                  Lanjut Knockout <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          )}
          {knockoutBracket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 text-cyan-400 text-xs"
            >
              <CheckCircle2 size={14} />
              <span>Fase Knockout sudah dibuat — lihat di bawah.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Group tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g) => {
          const done = g.fixtures.every((f) => f.played);
          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-montserrat whitespace-nowrap border transition-all flex-shrink-0
                ${
                  activeGroup === g.id
                    ? "text-black border-transparent"
                    : "text-muted border-border bg-surface2 hover:border-opacity-60"
                }`}
              style={
                activeGroup === g.id
                  ? {
                      background: `linear-gradient(135deg, ${g.color}, ${g.color}77)`,
                    }
                  : {}
              }
            >
              {g.name}
              {done && (
                <CheckCircle2
                  size={11}
                  className={
                    activeGroup === g.id ? "text-black/60" : "text-green-400"
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active group content */}
      {activeG && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeG.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            <GroupStandingsTable group={activeG} />
            <GroupFixturesList
              group={activeG}
              scores={scores}
              onChangeScore={(id, s1, s2) =>
                setScores((s) => ({ ...s, [id]: [s1, s2] }))
              }
              onSubmit={handleGroupScore}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Knockout bracket after promotion */}
      {knockoutBracket && (
        <div className="flex flex-col gap-2">
          <h2 className="font-montserrat font-black text-sm text-cyan-400 px-1 flex items-center gap-2">
            <Zap size={14} /> Fase Knockout
          </h2>
          <div className="card" id="capture-knockout">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="card-title mb-0">Bracket Knockout</span>
              <ScopedExportBar captureId="capture-knockout" label="Knockout" />
            </div>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {knockoutBracket.rounds.map((round, ri) => (
                  <div key={round.id} className="flex flex-col gap-3 w-44">
                    <div className="text-[10px] font-bold font-montserrat text-muted uppercase tracking-widest text-center mb-1">
                      {round.name}
                    </div>
                    {round.matches.map((match, mi) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onPickWinner={(t) => {
                          if (!t || t.id === "bye") return;
                          // Advance in knockout bracket nested inside GroupBracket
                          const cur = useStore.getState().tournament;
                          if (cur?.type !== "group" || !cur.knockoutBracket)
                            return;
                          // We need setMatchWinner from tournament lib
                          // Import is at top level – use the store action for elimination
                          // but that acts on root tournament; so we patch state directly:
                          const { setMatchWinnerInGroup } =
                            useStore.getState() as any;
                          if (setMatchWinnerInGroup) {
                            setMatchWinnerInGroup(ri, mi, t);
                          }
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Group standings table ─────────────────────────────────

function GroupStandingsTable({ group }: { group: Group }) {
  return (
    <div className="card">
      <div
        className="inline-block px-3 py-1 rounded-lg text-black text-xs font-montserrat font-black mb-3"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}77)`,
        }}
      >
        {group.name} — Klasemen
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-[10px] font-bold font-montserrat uppercase tracking-wider border-b border-border">
              {["#", "Tim", "M", "W", "D", "L", "GF", "GA", "GD", "Pts"].map(
                (h) => (
                  <th key={h} className="py-2 px-1.5 text-center">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {group.standings.map((s, i) => (
              <motion.tr
                key={s.team.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border/40 hover:bg-surface2 transition-colors"
              >
                <td
                  className="py-2 px-1.5 text-center font-bold font-montserrat"
                  style={{ color: group.color }}
                >
                  {i + 1}
                </td>
                <td
                  className="py-2 px-1.5 font-semibold text-xs"
                  style={{ color: s.team.color }}
                >
                  {s.team.name}
                </td>
                <td className="py-2 px-1.5 text-center text-muted text-xs">
                  {s.played}
                </td>
                <td className="py-2 px-1.5 text-center text-green-400 text-xs">
                  {s.won}
                </td>
                <td className="py-2 px-1.5 text-center text-yellow-400 text-xs">
                  {s.drawn}
                </td>
                <td className="py-2 px-1.5 text-center text-red-400 text-xs">
                  {s.lost}
                </td>
                <td className="py-2 px-1.5 text-center text-muted text-xs">
                  {s.gf}
                </td>
                <td className="py-2 px-1.5 text-center text-muted text-xs">
                  {s.ga}
                </td>
                <td
                  className={`py-2 px-1.5 text-center text-xs font-bold ${s.gd >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {s.gd > 0 ? `+${s.gd}` : s.gd}
                </td>
                <td className="py-2 px-1.5 text-center font-black font-montserrat text-cyan-400 text-sm">
                  {s.points}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Group fixture list ────────────────────────────────────

interface GroupFixturesListProps {
  group: Group;
  scores: Record<string, [string, string]>;
  onChangeScore: (id: string, s1: string, s2: string) => void;
  onSubmit: (id: string) => void;
}

function GroupFixturesList({
  group,
  scores,
  onChangeScore,
  onSubmit,
}: GroupFixturesListProps) {
  const unplayed = group.fixtures.filter((f) => !f.played);
  const played = group.fixtures.filter((f) => f.played);

  return (
    <div className="card">
      <div
        className="inline-block px-3 py-1 rounded-lg text-black text-xs font-montserrat font-black mb-3"
        style={{
          background: `linear-gradient(135deg, ${group.color}, ${group.color}77)`,
        }}
      >
        {group.name} — Pertandingan
      </div>

      {unplayed.length === 0 && (
        <p className="text-xs text-green-400 flex items-center gap-1 mb-3">
          <CheckCircle2 size={12} /> Semua pertandingan di grup ini selesai!
        </p>
      )}

      <div className="flex flex-col gap-2">
        {unplayed.map((f) => (
          <FixtureRow
            key={f.id}
            team1Name={f.team1.name}
            team1Color={f.team1.color}
            team2Name={f.team2.name}
            team2Color={f.team2.color}
            played={false}
            score1={null}
            score2={null}
            localScore={scores[f.id]}
            onChangeScore={(s1, s2) => onChangeScore(f.id, s1, s2)}
            onSubmit={() => onSubmit(f.id)}
          />
        ))}

        {played.length > 0 && (
          <>
            <div className="text-[10px] text-muted font-bold uppercase tracking-wider pt-2 pb-1 border-t border-border mt-1">
              Hasil
            </div>
            {played.map((f) => (
              <FixtureRow
                key={f.id}
                team1Name={f.team1.name}
                team1Color={f.team1.color}
                team2Name={f.team2.name}
                team2Color={f.team2.color}
                played
                score1={f.score1}
                score2={f.score2}
                localScore={undefined}
                onChangeScore={() => {}}
                onSubmit={() => {}}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared fixture row (RR + Group) ──────────────────────

interface FixtureRowProps {
  team1Name: string;
  team1Color: string;
  team2Name: string;
  team2Color: string;
  played: boolean;
  score1: number | null;
  score2: number | null;
  localScore?: [string, string];
  onChangeScore: (s1: string, s2: string) => void;
  onSubmit: () => void;
}

function FixtureRow({
  team1Name,
  team1Color,
  team2Name,
  team2Color,
  played,
  score1,
  score2,
  localScore,
  onChangeScore,
  onSubmit,
}: FixtureRowProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors
      ${played ? "bg-surface2/50 border-border/30 opacity-80" : "bg-surface2 border-border"}`}
    >
      <span
        className="flex-1 font-semibold text-xs text-right truncate"
        style={{ color: team1Color }}
      >
        {team1Name}
      </span>

      {played ? (
        <span className="flex items-center gap-1 px-3 py-1 bg-surface3 rounded-lg text-xs font-bold font-montserrat flex-shrink-0">
          <span style={{ color: team1Color }}>{score1}</span>
          <span className="text-muted mx-0.5">:</span>
          <span style={{ color: team2Color }}>{score2}</span>
          <CheckCircle2 size={10} className="text-green-400 ml-1.5" />
        </span>
      ) : (
        <div className="flex items-center gap-1 flex-shrink-0">
          <input
            type="number"
            min={0}
            max={99}
            value={localScore?.[0] ?? ""}
            onChange={(e) =>
              onChangeScore(e.target.value, localScore?.[1] ?? "0")
            }
            className="w-9 text-center bg-surface3 border border-border rounded-lg py-1 text-sm text-text outline-none focus:border-cyan-400/60"
            placeholder="0"
          />
          <span className="text-muted text-xs">:</span>
          <input
            type="number"
            min={0}
            max={99}
            value={localScore?.[1] ?? ""}
            onChange={(e) =>
              onChangeScore(localScore?.[0] ?? "0", e.target.value)
            }
            className="w-9 text-center bg-surface3 border border-border rounded-lg py-1 text-sm text-text outline-none focus:border-cyan-400/60"
            placeholder="0"
          />
          <button
            onClick={onSubmit}
            className="btn-primary text-[11px] px-2.5 py-1 rounded-lg ml-0.5"
          >
            OK
          </button>
        </div>
      )}

      <span
        className="flex-1 font-semibold text-xs truncate"
        style={{ color: team2Color }}
      >
        {team2Name}
      </span>
    </div>
  );
}
