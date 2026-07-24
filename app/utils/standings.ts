export type Fixture = {
  id: number;
  team1: number;
  team2: number;
  score1: number | null;
  score2: number | null;
  played: boolean;
};

export type Standing = {
  teamId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

/** Klasemen dari daftar fixture — dipakai bareng oleh round robin & tiap grup. */
export function buildStandings(
  teamIds: number[],
  fixtures: Fixture[],
  teamNames?: Record<number, string>
): Standing[] {
  const map = new Map<number, Standing>();
  teamIds.forEach((id) => {
    map.set(id, { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
  });

  fixtures
    .filter((f) => f.played && f.score1 != null && f.score2 != null)
    .forEach((f) => {
      const s1 = map.get(f.team1);
      const s2 = map.get(f.team2);
      if (!s1 || !s2) return;
      const score1 = f.score1 as number;
      const score2 = f.score2 as number;

      s1.played++;
      s2.played++;
      s1.gf += score1;
      s1.ga += score2;
      s2.gf += score2;
      s2.ga += score1;
      s1.gd = s1.gf - s1.ga;
      s2.gd = s2.gf - s2.ga;

      if (score1 > score2) {
        s1.won++;
        s1.points += 3;
        s2.lost++;
      } else if (score2 > score1) {
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

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    if (teamNames) return (teamNames[a.teamId] ?? "").localeCompare(teamNames[b.teamId] ?? "");
    return 0;
  });
}
