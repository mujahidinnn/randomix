import { defineStore } from "pinia";
import { shuffleArray } from "../utils/shuffle";
import { buildStandings, type Fixture, type Standing } from "../utils/standings";

export type Player = { name: string; level?: string | null };
export type Team = {
  id: number;
  name: string;
  members: Player[];
  status?: "win" | "lose" | "pending";
};
export type Match = {
  id: number;
  teams: (number | null)[]; // team ids; null = not decided yet / bye slot
  winner?: number;
  loser?: number;
  score1?: number | null;
  score2?: number | null;
};
export type Round = { matchs: Match[] };
export type TournamentType = "elimination" | "roundrobin" | "group";
export type Group = {
  id: number;
  name: string;
  teamIds: number[];
  fixtures: Fixture[];
};

let idSeq = Date.now();
const nextId = () => idSeq++;

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function buildAllPairsFixtures(teamIds: number[]): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      fixtures.push({ id: nextId(), team1: teamIds[i], team2: teamIds[j], score1: null, score2: null, played: false });
    }
  }
  return fixtures;
}

function bracketChampion(rounds: Round[], teams: Team[]): Team | null {
  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound?.matchs[0];
  if (!finalMatch?.winner) return null;
  return teams.find((t) => t.id === finalMatch.winner) ?? null;
}

export const useCupStore = defineStore("cup", {
  state: () => ({
    players: [] as Player[],
    teams: [] as Team[],
    matches: [] as Match[],
    useLevel: false,
    teamCount: 2,
    useScore: false,
    rounds: [] as Round[],
    tournamentType: "elimination" as TournamentType,
    fixtures: [] as Fixture[],
    groups: [] as Group[],
    knockoutStarted: false,
  }),

  getters: {
    champion(state): Team | null {
      if (state.tournamentType === "roundrobin") {
        if (!state.fixtures.length || !state.fixtures.every((f) => f.played)) return null;
        const standings = buildStandings(state.teams.map((t) => t.id), state.fixtures);
        return state.teams.find((t) => t.id === standings[0]?.teamId) ?? null;
      }
      if (state.tournamentType === "group" && !state.knockoutStarted) return null;
      return bracketChampion(state.rounds, state.teams);
    },
    hasCup(state): boolean {
      if (state.teams.length === 0) return false;
      if (state.tournamentType === "roundrobin") return state.fixtures.length > 0;
      if (state.tournamentType === "group") return state.groups.length > 0;
      return state.rounds.length > 0;
    },
    roundRobinStandings(state): Standing[] {
      return buildStandings(state.teams.map((t) => t.id), state.fixtures);
    },
  },

  actions: {
    setTeams(teams: Team[] | any[], teamNamePrefix = "Tim") {
      if (teams.length > 0 && !("id" in teams[0])) {
        this.teams = (teams as any[]).map((members, idx) => ({
          id: idx + 1,
          name: `${teamNamePrefix} ${idx + 1}`,
          members: members.map((m: any) => ({
            name: m.name,
            level: m.level ?? null,
          })),
          status: "pending",
        }));
      } else {
        this.teams = teams as Team[];
      }
    },

    setUseScore(value: boolean) {
      this.useScore = value;
    },

    setMatchScore(matchId: number, slot: 0 | 1, score: number | null) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) return;
      if (slot === 0) match.score1 = score;
      else match.score2 = score;
    },

    setMatchResult(matchId: number, winnerId: number) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) return;
      if (!match.teams.includes(winnerId)) return;

      // Overturn: bersihkan dulu jejak propagasi lama sebelum menimpa dengan
      // yang baru, supaya ronde berikutnya tidak menyisakan hasil yang invalid.
      const previousWinner = match.winner;
      if (previousWinner != null && previousWinner !== winnerId) {
        this.clearDownstream(match.id, previousWinner);
      }

      match.winner = winnerId;
      match.loser =
        match.teams.find((id) => id !== null && id !== winnerId) ?? undefined;

      this.teams.forEach((team) => {
        if (team.id === winnerId) team.status = "win";
        else if (match.teams.includes(team.id)) team.status = "lose";
      });

      this.propagateWinner(match.id, winnerId);
    },

    propagateWinner(matchId: number, winnerId: number) {
      for (let r = 0; r < this.rounds.length - 1; r++) {
        const idx = this.rounds[r].matchs.findIndex((m) => m.id === matchId);
        if (idx === -1) continue;

        const nextMatch = this.rounds[r + 1]?.matchs[Math.floor(idx / 2)];
        if (nextMatch) {
          nextMatch.teams[idx % 2] = winnerId;
        }
        break;
      }
    },

    // Bersihkan efek berantai pemenang lama yang sudah terlanjur dipropagasi
    // (dan mungkin sudah menang lagi di ronde setelahnya), supaya overturn
    // tidak meninggalkan bracket dalam keadaan tidak konsisten.
    clearDownstream(matchId: number, teamId: number) {
      for (let r = 0; r < this.rounds.length - 1; r++) {
        const idx = this.rounds[r].matchs.findIndex((m) => m.id === matchId);
        if (idx === -1) continue;

        const nextMatch = this.rounds[r + 1]?.matchs[Math.floor(idx / 2)];
        if (!nextMatch) return;

        const slot = idx % 2;
        if (nextMatch.teams[slot] === teamId) {
          nextMatch.teams[slot] = null;
        }

        if (nextMatch.winner != null) {
          const oldWinner = nextMatch.winner;
          const oldLoser = nextMatch.loser;

          [oldWinner, oldLoser].forEach((id) => {
            if (id == null) return;
            const team = this.teams.find((t) => t.id === id);
            if (team) team.status = "pending";
          });

          nextMatch.winner = undefined;
          nextMatch.loser = undefined;

          this.clearDownstream(nextMatch.id, oldWinner);
        }
        return;
      }
    },

    initializeCup({
      players,
      teams,
      useLevel,
      teamCount,
      tournamentType,
      teamNamePrefix,
      groupNamePrefix,
    }: {
      players?: Player[];
      teams?: any[];
      useLevel?: boolean;
      teamCount?: number;
      tournamentType?: TournamentType;
      teamNamePrefix?: string;
      groupNamePrefix?: string;
    }) {
      if (players) this.players = players;
      if (typeof useLevel === "boolean") this.useLevel = useLevel;
      if (typeof teamCount === "number") this.teamCount = teamCount;
      if (tournamentType) this.tournamentType = tournamentType;

      if (teams) {
        this.setTeams(teams, teamNamePrefix);
        if (this.tournamentType === "roundrobin") this.generateRoundRobin();
        else if (this.tournamentType === "group") this.generateGroupStage(groupNamePrefix);
        else this.generateBracket();
      }
    },

    // `seedTeamIds` opsional dipakai untuk babak knockout dari top-N tiap grup
    // (lihat buildKnockoutFromGroups) — default-nya seluruh this.teams.
    generateBracket(seedTeamIds?: number[]) {
      const ids = seedTeamIds ?? this.teams.map((t) => t.id);
      const n = ids.length;

      if (n < 2) {
        this.matches = [];
        this.rounds = [];
        return;
      }

      const shuffledIds = shuffleArray(ids);
      const size = nextPowerOfTwo(n);
      const byes = size - n;
      const totalFirstRoundMatches = size / 2;

      let pointer = 0;
      const firstRound: Match[] = [];

      for (let m = 0; m < totalFirstRoundMatches; m++) {
        const a = shuffledIds[pointer++] ?? null;
        if (m < byes) {
          firstRound.push({ id: nextId(), teams: [a], winner: a ?? undefined });
        } else {
          const b = shuffledIds[pointer++] ?? null;
          firstRound.push({ id: nextId(), teams: [a, b] });
        }
      }

      const allMatches: Match[] = [...firstRound];
      const rounds: Round[] = [{ matchs: firstRound }];

      let previousRound = firstRound;
      let currentCount = totalFirstRoundMatches;

      while (currentCount > 1) {
        const nextCount = currentCount / 2;
        const nextRound: Match[] = Array.from({ length: nextCount }, () => ({
          id: nextId(),
          teams: [null, null],
        }));

        rounds.push({ matchs: nextRound });
        allMatches.push(...nextRound);

        previousRound.forEach((match, i) => {
          if (match.winner != null) {
            nextRound[Math.floor(i / 2)].teams[i % 2] = match.winner;
          }
        });

        previousRound = nextRound;
        currentCount = nextCount;
      }

      this.matches = allMatches;
      this.rounds = rounds;

      // Status tim ber-bye sengaja tidak di-set "win" di sini — semua tim mulai
      // dari "pending" seragam, meski bye-nya sudah otomatis lolos di bracket.
    },

    generateRoundRobin() {
      this.fixtures = buildAllPairsFixtures(this.teams.map((t) => t.id));
    },

    recordFixtureResult(fixtureId: number, score1: number, score2: number) {
      const fixture = this.fixtures.find((f) => f.id === fixtureId);
      if (!fixture) return;
      fixture.score1 = score1;
      fixture.score2 = score2;
      fixture.played = true;
    },

    generateGroupStage(groupNamePrefix = "Grup") {
      const shuffledIds = shuffleArray(this.teams.map((t) => t.id));
      const n = Math.max(2, Math.round(this.teamCount / 4));
      const groupNames = "ABCDEFGH";

      const groups: Group[] = Array.from({ length: n }, (_, i) => ({
        id: nextId(),
        name: `${groupNamePrefix} ${groupNames[i] ?? String(i + 1)}`,
        teamIds: [],
        fixtures: [],
      }));

      shuffledIds.forEach((id, i) => groups[i % n].teamIds.push(id));
      groups.forEach((g) => {
        g.fixtures = buildAllPairsFixtures(g.teamIds);
      });

      this.groups = groups;
      this.knockoutStarted = false;
    },

    recordGroupFixtureResult(groupId: number, fixtureId: number, score1: number, score2: number) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      const fixture = group.fixtures.find((f) => f.id === fixtureId);
      if (!fixture) return;
      fixture.score1 = score1;
      fixture.score2 = score2;
      fixture.played = true;
    },

    // Seed top-N (default 2) tiap grup ke babak knockout single-elimination,
    // pakai ulang generateBracket() supaya fix cascading-reset tetap berlaku.
    buildKnockoutFromGroups(advancersPerGroup = 2) {
      const advancers = this.groups.flatMap((g) => {
        const standings = buildStandings(g.teamIds, g.fixtures);
        return standings.slice(0, advancersPerGroup).map((s) => s.teamId);
      });
      this.generateBracket(advancers);
      this.knockoutStarted = true;
    },

    resetCup() {
      this.players = [];
      this.teams = [];
      this.matches = [];
      this.rounds = [];
      this.useLevel = false;
      this.teamCount = 2;
      this.tournamentType = "elimination";
      this.fixtures = [];
      this.groups = [];
      this.knockoutStarted = false;
      this.useScore = false;
    },
  },

  persist: true,
});
