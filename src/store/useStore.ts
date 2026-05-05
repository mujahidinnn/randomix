import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AppState, Player, Team, Level, AppConfig, Tournament } from "../types";
import { balanceTeams } from "../lib/balancing";
import {
  generateElimination,
  generateRoundRobin,
  generateGroupStage,
  setMatchWinner,
  recordRRResult,
  recordGroupResult,
  buildKnockoutFromGroups,
} from "../lib/tournament";

const defaultConfig: AppConfig = {
  teamCount: 2,
  useLevel: true,
  tournamentType: "none",
};

const defaultState: AppState = {
  players: [],
  teams: [],
  config: defaultConfig,
  tournament: null,
  selectedLevel: "Newbie",
};

interface Actions {
  // Players
  addPlayer: (name: string, level: Level) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
  setLevel: (level: Level) => void;

  // Config
  updateConfig: (partial: Partial<AppConfig>) => void;

  // Team generation
  generateTeams: () => { success: boolean; error?: string };

  // Tournament — shared
  buildTournament: () => void;

  // Tournament — elimination
  advanceWinner: (roundIdx: number, matchIdx: number, winner: Team) => void;

  // Tournament — round robin
  submitRRScore: (fixtureId: string, score1: number, score2: number) => void;

  // Tournament — group stage
  submitGroupScore: (fixtureId: string, score1: number, score2: number) => void;
  promoteToKnockout: (advancersPerGroup?: number) => void;
  /** Advance winner inside the knockout bracket that lives inside GroupBracket */
  setMatchWinnerInGroup: (
    roundIdx: number,
    matchIdx: number,
    winner: Team,
  ) => void;

  // Reset
  resetAll: () => void;
}

// ── Store ─────────────────────────────────────────────────

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ── Players ──────────────────────────────────────

      addPlayer(name, level) {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (
          get().players.some(
            (p) => p.name.toLowerCase() === trimmed.toLowerCase(),
          )
        )
          return;
        const player: Player = {
          id: `p-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: trimmed,
          level,
          power: { Newbie: 1, Middle: 2, Pro: 3 }[level],
        };
        set((s) => ({ players: [...s.players, player] }));
      },

      removePlayer(id) {
        set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
      },

      clearPlayers() {
        set({ players: [], teams: [], tournament: null });
      },

      setLevel(level) {
        set({ selectedLevel: level });
      },

      // ── Config ────────────────────────────────────────

      updateConfig(partial) {
        set((s) => ({ config: { ...s.config, ...partial } }));
      },

      // ── Team Generation ───────────────────────────────

      generateTeams() {
        const { players, config } = get();
        if (players.length < config.teamCount) {
          return {
            success: false,
            error: `Butuh minimal ${config.teamCount} pemain (saat ini ${players.length}).`,
          };
        }
        const teams = balanceTeams(players, config.teamCount, config.useLevel);
        set({ teams, tournament: null });
        return { success: true };
      },

      // ── Tournament — Build ────────────────────────────

      buildTournament() {
        const { teams, config } = get();
        if (!teams.length) return;

        let tournament: Tournament | null = null;
        switch (config.tournamentType) {
          case "elimination":
            tournament = generateElimination(teams);
            break;
          case "roundrobin":
            tournament = generateRoundRobin(teams);
            break;
          case "group":
            tournament = generateGroupStage(teams);
            break;
        }
        set({ tournament });
      },

      // ── Tournament — Elimination ──────────────────────

      advanceWinner(roundIdx, matchIdx, winner) {
        const { tournament } = get();
        if (tournament?.type !== "elimination") return;
        set({
          tournament: setMatchWinner(tournament, roundIdx, matchIdx, winner),
        });
      },

      // ── Tournament — Round Robin ──────────────────────

      submitRRScore(fixtureId, score1, score2) {
        const { tournament } = get();
        if (tournament?.type !== "roundrobin") return;
        set({
          tournament: recordRRResult(tournament, fixtureId, score1, score2),
        });
      },

      // ── Tournament — Group Stage ──────────────────────

      submitGroupScore(fixtureId, score1, score2) {
        const { tournament } = get();
        if (tournament?.type !== "group") return;
        set({
          tournament: recordGroupResult(tournament, fixtureId, score1, score2),
        });
      },

      promoteToKnockout(advancersPerGroup = 2) {
        const { tournament } = get();
        if (tournament?.type !== "group" || !tournament.isComplete) return;
        set({
          tournament: buildKnockoutFromGroups(tournament, advancersPerGroup),
        });
      },

      setMatchWinnerInGroup(roundIdx, matchIdx, winner) {
        const { tournament } = get();
        if (tournament?.type !== "group" || !tournament.knockoutBracket) return;
        const updatedKnockout = setMatchWinner(
          tournament.knockoutBracket,
          roundIdx,
          matchIdx,
          winner,
        );
        set({
          tournament: { ...tournament, knockoutBracket: updatedKnockout },
        });
      },

      // ── Reset ─────────────────────────────────────────

      resetAll() {
        set(defaultState);
      },
    }),
    {
      name: "randomix-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        players: s.players,
        teams: s.teams,
        config: s.config,
        tournament: s.tournament,
        selectedLevel: s.selectedLevel,
      }),
    },
  ),
);
