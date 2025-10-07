import { defineStore } from "pinia";

export const useCupStore = defineStore("cup", {
  state: () => ({
    teams: [] as Array<{
      id: number;
      name: string;
      members: Array<{ name: string; level?: string | null }>;
      status?: "win" | "lose" | "pending";
    }>,
    matches: [] as Array<{
      id: number;
      teams: number[];
      winner?: number;
      loser?: number;
    }>,
  }),
  actions: {
    setTeams(teams: any[]) {
      this.teams = teams;
    },
    setMatchResult(matchId: number, winnerId: number) {
      const match = this.matches.find((m) => m.id === matchId);
      if (!match) return;
      match.winner = winnerId;
      match.loser = match.teams.find((id) => id !== winnerId);
      this.teams.forEach((team) => {
        if (team.id === winnerId) team.status = "win";
        else if (match.teams.includes(team.id)) team.status = "lose";
      });
    },
  },
  persist: true,
});
