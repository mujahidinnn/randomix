import { Player, Team, TEAM_PALETTE } from "../types";

/**
 * Snake-draft balancing.
 * Players sorted descending by power, then distributed
 * in a zigzag pattern so every team gets one top player
 * before any team gets a second — minimises total-power variance.
 */
function snakeDraft(players: Player[], numTeams: number): Team[] {
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Tim ${i + 1}`,
    color: TEAM_PALETTE[i % TEAM_PALETTE.length],
    players: [],
    power: 0,
  }));

  const sorted = [...players].sort((a, b) => b.power - a.power);

  sorted.forEach((player, idx) => {
    const round = Math.floor(idx / numTeams);
    // Even rounds: left-to-right  |  Odd rounds: right-to-left
    const pos =
      round % 2 === 0 ? idx % numTeams : numTeams - 1 - (idx % numTeams);
    teams[pos].players.push(player);
    teams[pos].power += player.power;
  });

  return teams;
}

/**
 * Min-heap greedy — always assign next player to team with lowest power.
 * Produces tighter balance when numTeams doesn't divide evenly.
 */
function greedyBalance(players: Player[], numTeams: number): Team[] {
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Tim ${i + 1}`,
    color: TEAM_PALETTE[i % TEAM_PALETTE.length],
    players: [],
    power: 0,
  }));

  const sorted = [...players].sort((a, b) => b.power - a.power);

  sorted.forEach((player) => {
    const weakest = teams.reduce((min, t) => (t.power < min.power ? t : min));
    weakest.players.push(player);
    weakest.power += player.power;
  });

  return teams;
}

/**
 * Pure random shuffle — used when level-balancing is disabled.
 */
function randomShuffle(players: Player[], numTeams: number): Team[] {
  const teams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
    id: `team-${i + 1}`,
    name: `Tim ${i + 1}`,
    color: TEAM_PALETTE[i % TEAM_PALETTE.length],
    players: [],
    power: 0,
  }));

  const shuffled = [...players].sort(() => Math.random() - 0.5);
  shuffled.forEach((player, i) => {
    const t = teams[i % numTeams];
    t.players.push(player);
    t.power += player.power;
  });

  return teams;
}

/** Compute standard deviation of team powers (balance quality metric). */
export function powerStdDev(teams: Team[]): number {
  if (!teams.length) return 0;
  const mean = teams.reduce((s, t) => s + t.power, 0) / teams.length;
  const variance =
    teams.reduce((s, t) => s + Math.pow(t.power - mean, 2), 0) / teams.length;
  return Math.sqrt(variance);
}

/**
 * Main entry point.
 * Runs both snakeDraft and greedy, returns the one with lower stdDev.
 */
export function balanceTeams(
  players: Player[],
  numTeams: number,
  useLevel: boolean,
): Team[] {
  if (!players.length || numTeams < 2) return [];

  if (!useLevel) return randomShuffle(players, numTeams);

  const snake = snakeDraft(players, numTeams);
  const greedy = greedyBalance(players, numTeams);

  return powerStdDev(snake) <= powerStdDev(greedy) ? snake : greedy;
}
