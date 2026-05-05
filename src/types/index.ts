export type Level = "Newbie" | "Middle" | "Pro";
export type TournamentType = "none" | "elimination" | "roundrobin" | "group";
export type ExportFormat = "text" | "whatsapp" | "image" | "pdf" | "excel";
export type ExportScope = "teams" | "tournament" | "full";

export const LEVEL_POWER: Record<Level, number> = {
  Newbie: 1,
  Middle: 2,
  Pro: 3,
};

export const LEVEL_COLORS: Record<Level, string> = {
  Newbie: "#4ade80",
  Middle: "#facc15",
  Pro: "#f87171",
};

export const TEAM_PALETTE = [
  "#00c6ff",
  "#00ff88",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#34d399",
  "#f87171",
  "#60a5fa",
];

// ── Players ────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  level: Level;
  power: number;
}

// ── Teams ─────────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  color: string;
  players: Player[];
  power: number;
}

// ── Config ────────────────────────────────────────────────
export interface AppConfig {
  teamCount: number;
  useLevel: boolean;
  tournamentType: TournamentType;
}

// ── Tournament — Shared ───────────────────────────────────
export interface Match {
  id: string;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
  matchNumber: number;
}

export interface Round {
  id: string;
  name: string;
  matches: Match[];
}

// ── Tournament — Single Elimination ───────────────────────
export interface EliminationBracket {
  type: "elimination";
  rounds: Round[];
}

// ── Tournament — Round Robin ──────────────────────────────
export interface RoundRobinFixture {
  id: string;
  team1: Team;
  team2: Team;
  played: boolean;
  score1: number | null;
  score2: number | null;
}

export interface RoundRobinStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export interface RoundRobinBracket {
  type: "roundrobin";
  fixtures: RoundRobinFixture[];
  standings: RoundRobinStanding[];
}

// ── Tournament — Group Stage ──────────────────────────────

/** One intra-group match. */
export interface GroupFixture {
  id: string;
  groupId: string;
  team1: Team;
  team2: Team;
  played: boolean;
  score1: number | null;
  score2: number | null;
}

/** Per-team standing row inside a group. */
export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

/** One group with teams, fixtures, and live standings. */
export interface Group {
  id: string;
  name: string;
  color: string;
  teams: Team[];
  fixtures: GroupFixture[];
  standings: GroupStanding[];
}

export interface GroupBracket {
  type: "group";
  groups: Group[];
  /** true when every intra-group fixture has been played */
  isComplete: boolean;
  /** knockout bracket seeded from group winners/runners-up */
  knockoutBracket: EliminationBracket | null;
}

// ── App State ─────────────────────────────────────────────
export type Tournament = EliminationBracket | RoundRobinBracket | GroupBracket;

export interface AppState {
  players: Player[];
  teams: Team[];
  config: AppConfig;
  tournament: Tournament | null;
  selectedLevel: Level;
}
