import {
  Team,
  Match,
  Round,
  EliminationBracket,
  RoundRobinBracket,
  RoundRobinFixture,
  RoundRobinStanding,
  GroupBracket,
  GroupFixture,
  GroupStanding,
  Group,
  TEAM_PALETTE,
} from "../types";

let _uid = 0;
const uid = () => `id-${Date.now()}-${++_uid}`;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function nextPowerOf2(n: number): number {
  return Math.pow(2, Math.ceil(Math.log2(Math.max(n, 2))));
}

function getRoundName(totalRounds: number, roundIndex: number): string {
  const remaining = totalRounds - roundIndex;
  if (remaining === 0) return "Final";
  if (remaining === 1) return "Semifinal";
  if (remaining === 2) return "Perempat Final";
  return `Babak ${roundIndex + 1}`;
}

const BYE: Team = {
  id: "bye",
  name: "BYE",
  color: "#374151",
  players: [],
  power: 0,
};

// ============================================================
// 1. SINGLE ELIMINATION
// ============================================================

export function generateElimination(teams: Team[]): EliminationBracket {
  const seeded = shuffle(teams);
  const size = nextPowerOf2(seeded.length);
  const padded = [...seeded];
  while (padded.length < size) padded.push({ ...BYE, id: uid() });

  const rounds: Round[] = [];
  let matchCounter = 1;

  const firstRoundMatches: Match[] = [];
  for (let i = 0; i < padded.length; i += 2) {
    const t1 = padded[i];
    const t2 = padded[i + 1];
    const autoWinner = t2.id === "bye" ? t1 : t1.id === "bye" ? t2 : null;
    firstRoundMatches.push({
      id: uid(),
      team1: t1,
      team2: t2,
      winner: autoWinner,
      matchNumber: matchCounter++,
    });
  }

  const totalRounds = Math.log2(size);
  rounds.push({
    id: uid(),
    name: getRoundName(totalRounds, 0),
    matches: firstRoundMatches,
  });

  let prevCount = firstRoundMatches.length;
  for (let r = 1; r < totalRounds; r++) {
    prevCount = Math.ceil(prevCount / 2);
    const matches: Match[] = Array.from({ length: prevCount }, () => ({
      id: uid(),
      team1: null,
      team2: null,
      winner: null,
      matchNumber: matchCounter++,
    }));
    rounds.push({ id: uid(), name: getRoundName(totalRounds, r), matches });
  }

  return { type: "elimination", rounds };
}

export function setMatchWinner(
  bracket: EliminationBracket,
  roundIdx: number,
  matchIdx: number,
  winner: Team,
): EliminationBracket {
  const rounds = bracket.rounds.map((r, ri) =>
    ri !== roundIdx
      ? r
      : {
          ...r,
          matches: r.matches.map((m, mi) =>
            mi !== matchIdx ? m : { ...m, winner },
          ),
        },
  );

  const nextRound = rounds[roundIdx + 1];
  if (nextRound) {
    const slotIdx = Math.floor(matchIdx / 2);
    const isTeam1 = matchIdx % 2 === 0;
    const updated = nextRound.matches.map((m, mi) =>
      mi !== slotIdx
        ? m
        : isTeam1
          ? { ...m, team1: winner }
          : { ...m, team2: winner },
    );
    rounds[roundIdx + 1] = { ...nextRound, matches: updated };
  }

  return { ...bracket, rounds };
}

// ============================================================
// 2. ROUND ROBIN
// ============================================================

function buildRRStandings(
  teams: Team[],
  fixtures: RoundRobinFixture[],
): RoundRobinStanding[] {
  const map: Record<string, RoundRobinStanding> = {};
  teams.forEach((t) => {
    map[t.id] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0 };
  });

  fixtures
    .filter((f) => f.played)
    .forEach((f) => {
      const s1 = map[f.team1.id];
      const s2 = map[f.team2.id];
      if (!s1 || !s2 || f.score1 === null || f.score2 === null) return;
      s1.played++;
      s2.played++;
      if (f.score1 > f.score2) {
        s1.won++;
        s1.points += 3;
        s2.lost++;
      } else if (f.score2 > f.score1) {
        s2.won++;
        s2.points += 3;
        s1.lost++;
      } else {
        s1.drawn++;
        s1.points++;
        s2.drawn++;
        s2.points++;
      }
    });

  return Object.values(map).sort(
    (a, b) => b.points - a.points || b.won - a.won,
  );
}

export function generateRoundRobin(teams: Team[]): RoundRobinBracket {
  const fixtures: RoundRobinFixture[] = [];
  for (let i = 0; i < teams.length; i++)
    for (let j = i + 1; j < teams.length; j++)
      fixtures.push({
        id: uid(),
        team1: teams[i],
        team2: teams[j],
        played: false,
        score1: null,
        score2: null,
      });
  return {
    type: "roundrobin",
    fixtures,
    standings: buildRRStandings(teams, fixtures),
  };
}

export function recordRRResult(
  bracket: RoundRobinBracket,
  fixtureId: string,
  score1: number,
  score2: number,
): RoundRobinBracket {
  const fixtures = bracket.fixtures.map((f) =>
    f.id !== fixtureId ? f : { ...f, played: true, score1, score2 },
  );
  const teams = [
    ...new Map(
      fixtures.flatMap((f) => [f.team1, f.team2]).map((t) => [t.id, t]),
    ).values(),
  ];
  return { ...bracket, fixtures, standings: buildRRStandings(teams, fixtures) };
}

// ============================================================
// 3. GROUP STAGE — full logic
// ============================================================

/** Build per-group standings from its fixtures. */
function buildGroupStandings(
  teams: Team[],
  fixtures: GroupFixture[],
): GroupStanding[] {
  const map: Record<string, GroupStanding> = {};
  teams.forEach((t) => {
    map[t.id] = {
      team: t,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
    };
  });

  fixtures
    .filter((f) => f.played)
    .forEach((f) => {
      const s1 = map[f.team1.id];
      const s2 = map[f.team2.id];
      if (!s1 || !s2 || f.score1 === null || f.score2 === null) return;

      s1.played++;
      s2.played++;
      s1.gf += f.score1;
      s1.ga += f.score2;
      s2.gf += f.score2;
      s2.ga += f.score1;
      s1.gd = s1.gf - s1.ga;
      s2.gd = s2.gf - s2.ga;

      if (f.score1 > f.score2) {
        s1.won++;
        s1.points += 3;
        s2.lost++;
      } else if (f.score2 > f.score1) {
        s2.won++;
        s2.points += 3;
        s1.lost++;
      } else {
        s1.drawn++;
        s1.points++;
        s2.drawn++;
        s2.points++;
      }
    });

  // Sort: points → goal diff → goals for → name
  return Object.values(map).sort(
    (a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.gf - a.gf ||
      a.team.name.localeCompare(b.team.name),
  );
}

/** Generate intra-group fixtures for one group. */
function buildGroupFixtures(group: Group): GroupFixture[] {
  const fixtures: GroupFixture[] = [];
  for (let i = 0; i < group.teams.length; i++)
    for (let j = i + 1; j < group.teams.length; j++)
      fixtures.push({
        id: uid(),
        groupId: group.id,
        team1: group.teams[i],
        team2: group.teams[j],
        played: false,
        score1: null,
        score2: null,
      });
  return fixtures;
}

export function generateGroupStage(
  teams: Team[],
  numGroups?: number,
): GroupBracket {
  const n = numGroups ?? Math.max(2, Math.round(teams.length / 4));
  const seeded = shuffle(teams);

  const groups: Group[] = Array.from({ length: n }, (_, i) => ({
    id: uid(),
    name: "Grup " + "ABCDEFGH"[i],
    color: TEAM_PALETTE[i % TEAM_PALETTE.length],
    teams: [],
    fixtures: [],
    standings: [],
  }));

  seeded.forEach((t, i) => groups[i % n].teams.push(t));

  // Build fixtures and initial standings for each group
  groups.forEach((g) => {
    g.fixtures = buildGroupFixtures(g);
    g.standings = buildGroupStandings(g.teams, g.fixtures);
  });

  return { type: "group", groups, isComplete: false, knockoutBracket: null };
}

/** Submit a result for one group fixture and recompute that group's standings. */
export function recordGroupResult(
  bracket: GroupBracket,
  fixtureId: string,
  score1: number,
  score2: number,
): GroupBracket {
  const groups = bracket.groups.map((g) => {
    const hasFixture = g.fixtures.some((f) => f.id === fixtureId);
    if (!hasFixture) return g;

    const fixtures = g.fixtures.map((f) =>
      f.id !== fixtureId ? f : { ...f, played: true, score1, score2 },
    );
    const standings = buildGroupStandings(g.teams, fixtures);
    return { ...g, fixtures, standings };
  });

  const isComplete = groups.every((g) => g.fixtures.every((f) => f.played));

  return { ...bracket, groups, isComplete };
}

/**
 * After all group fixtures are played, seed top-N teams from each group
 * into a single-elimination knockout bracket.
 * advancersPerGroup = 2 by default (winner + runner-up).
 */
export function buildKnockoutFromGroups(
  bracket: GroupBracket,
  advancersPerGroup = 2,
): GroupBracket {
  const advancers: Team[] = bracket.groups.flatMap((g) =>
    g.standings.slice(0, advancersPerGroup).map((s) => s.team),
  );
  const knockoutBracket = generateElimination(advancers);
  return { ...bracket, knockoutBracket };
}
