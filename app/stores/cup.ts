// stores/cup.ts
import { defineStore } from "pinia";

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
};
export type Round = { matchs: Match[] };

let idSeq = Date.now();
const nextId = () => idSeq++;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export const useCupStore = defineStore("cup", {
  state: () => ({
    players: [] as Player[],
    teams: [] as Team[],
    matches: [] as Match[],
    useLevel: false,
    teamCount: 2,
    rounds: [] as Round[],
  }),

  getters: {
    // Tournament is done once the final round's single match has a winner.
    champion(state): Team | null {
      const finalRound = state.rounds[state.rounds.length - 1];
      const finalMatch = finalRound?.matchs[0];
      if (!finalMatch?.winner) return null;
      return state.teams.find((t) => t.id === finalMatch.winner) ?? null;
    },
    hasCup(state): boolean {
      return state.teams.length > 0 && state.rounds.length > 0;
    },
  },

  actions: {
    setTeams(teams: Team[] | any[]) {
      // jika input berupa array of arrays, ubah jadi array of Team
      if (teams.length > 0 && !("id" in teams[0])) {
        this.teams = (teams as any[]).map((members, idx) => ({
          id: idx + 1,
          name: `Tim ${idx + 1}`,
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

    setMatchResult(matchId: number, winnerId: number) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) return;
      // guard: winner must actually be one of the two contenders in this match
      if (!match.teams.includes(winnerId)) return;

      match.winner = winnerId;
      match.loser =
        match.teams.find((id) => id !== null && id !== winnerId) ?? undefined;

      this.teams.forEach((team) => {
        if (team.id === winnerId) team.status = "win";
        else if (match.teams.includes(team.id)) team.status = "lose";
      });

      this.propagateWinner(match.id, winnerId);
    },

    // dorong pemenang ke slot yang sesuai di ronde berikutnya
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

    initializeCup({
      players,
      teams,
      useLevel,
      teamCount,
    }: {
      players?: Player[];
      teams?: any[];
      useLevel?: boolean;
      teamCount?: number;
    }) {
      if (players) this.players = players;
      if (typeof useLevel === "boolean") this.useLevel = useLevel;
      if (typeof teamCount === "number") this.teamCount = teamCount;

      if (teams) {
        this.setTeams(teams);
        this.generateBracket();
      }
    },

    // Bangun seluruh bracket single-elimination sekaligus, termasuk bye
    // (tim yang otomatis lolos ronde pertama bila jumlah tim bukan pangkat dua).
    generateBracket() {
      const n = this.teams.length;

      if (n < 2) {
        // tidak cukup tim untuk membuat turnamen — reset agar UI menampilkan empty state
        this.matches = [];
        this.rounds = [];
        return;
      }

      const shuffledIds = shuffle(this.teams.map((t) => t.id));
      const size = nextPowerOfTwo(n);
      const byes = size - n;
      const totalFirstRoundMatches = size / 2;

      let pointer = 0;
      const firstRound: Match[] = [];

      for (let m = 0; m < totalFirstRoundMatches; m++) {
        const a = shuffledIds[pointer++] ?? null;
        if (m < byes) {
          // bye: hanya satu tim di slot ini, otomatis menang tanpa bertanding
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

        // langsung salurkan bye/pemenang yang sudah diketahui ke ronde berikutnya
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

      // sinkronkan status tim yang otomatis menang lewat bye
      firstRound.forEach((match) => {
        if (match.winner == null) return;
        const team = this.teams.find((t) => t.id === match.winner);
        if (team) team.status = "win";
      });
    },

    resetCup() {
      this.players = [];
      this.teams = [];
      this.matches = [];
      this.rounds = [];
      this.useLevel = false;
      this.teamCount = 2;
    },
  },

  persist: true,
});
