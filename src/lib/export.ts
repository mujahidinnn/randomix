import { Team, Tournament } from "../types";

function teamsToPlain(teams: Team[]): string {
  return teams
    .map((t) =>
      [
        `${t.name} (⚡${t.power})`,
        ...t.players.map((p) => `  - ${p.name} [${p.level}]`),
      ].join("\n"),
    )
    .join("\n\n");
}

function teamsToWhatsApp(teams: Team[]): string {
  return teams
    .map((t) =>
      [
        `*${t.name}* _(⚡${t.power})_`,
        ...t.players.map((p) => `  • ${p.name} [${p.level}]`),
      ].join("\n"),
    )
    .join("\n\n");
}

function tournamentToPlain(tournament: Tournament | null): string {
  if (!tournament) return "—";

  if (tournament.type === "elimination") {
    return tournament.rounds
      .map(
        (r) =>
          `${r.name}\n` +
          r.matches
            .map(
              (m) =>
                `  Match ${m.matchNumber}: ${m.team1?.name ?? "?"} vs ${m.team2?.name ?? "?"}` +
                (m.winner ? ` → ${m.winner.name}` : ""),
            )
            .join("\n"),
      )
      .join("\n\n");
  }

  if (tournament.type === "roundrobin") {
    const klasemen = tournament.standings
      .map(
        (s, i) =>
          `  ${i + 1}. ${s.team.name} — ${s.points} poin (${s.won}M ${s.drawn}S ${s.lost}K)`,
      )
      .join("\n");
    return `Klasemen Liga\n${klasemen}`;
  }

  if (tournament.type === "group") {
    return tournament.groups
      .map(
        (g) =>
          `${g.name}\n` +
          g.standings
            .map(
              (s, i) =>
                `  ${i + 1}. ${s.team.name} — ${s.points}pts (${s.gf}-${s.ga})`,
            )
            .join("\n"),
      )
      .join("\n\n");
  }

  return "—";
}

// ── 1. Clipboard exports ──────────────────────────────────

export async function copyPlainText(
  teams: Team[],
  tournament?: Tournament | null,
): Promise<void> {
  const parts = [teamsToPlain(teams)];
  if (tournament) parts.push("─".repeat(30), tournamentToPlain(tournament));
  await navigator.clipboard.writeText(parts.join("\n\n"));
}

export async function copyWhatsApp(
  teams: Team[],
  tournament?: Tournament | null,
): Promise<void> {
  const parts = [teamsToWhatsApp(teams)];
  if (tournament) {
    parts.push(
      "──────────────",
      `*Hasil Turnamen*\n${tournamentToPlain(tournament)}`,
    );
  }
  await navigator.clipboard.writeText(parts.join("\n\n"));
}

// ── 2. Image — scoped by element ID ──────────────────────

/**
 * Capture a DOM node by id and download as PNG.
 * @param elementId  - id of the element to screenshot
 * @param filename   - output filename (without extension)
 */
export async function downloadImage(
  elementId: string,
  filename = "randomix-export",
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const node = document.getElementById(elementId);
  if (!node)
    throw new Error(
      `Element #${elementId} not found. Make sure the tab is visible.`,
    );
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#0a0e1a",
  });
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

// ── 3. PDF — scoped ───────────────────────────────────────

interface PdfOptions {
  teams?: Team[];
  tournament?: Tournament | null;
  scope: "teams" | "tournament" | "full";
}

export async function downloadPDF({
  teams = [],
  tournament = null,
  scope,
}: PdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageW = doc.internal.pageSize.getWidth();
  let y = 22;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 198, 255);
  doc.text("RANDOMIX", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 150);
  doc.text(
    `${scope === "teams" ? "Teams Report" : scope === "tournament" ? "Tournament Report" : "Full Report"} · ${new Date().toLocaleString("id-ID")}`,
    margin,
    (y += 7),
  );
  y += 8;

  // Teams section
  if (scope !== "tournament" && teams.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 255, 136);
    doc.text("DAFTAR TIM", margin, y);
    y += 6;

    teams.forEach((t) => {
      if (y > 268) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(20, 30, 55);
      doc.roundedRect(margin, y, pageW - margin * 2, 9, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(240, 244, 255);
      doc.text(t.name, margin + 3, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 150);
      doc.text(`⚡ ${t.power}`, pageW - margin - 18, y + 6);
      y += 12;

      t.players.forEach((p) => {
        if (y > 272) {
          doc.addPage();
          y = 20;
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 210, 230);
        doc.text(`  ${p.name}`, margin + 3, y);
        doc.setFontSize(7.5);
        doc.setTextColor(
          p.level === "Pro" ? 248 : p.level === "Middle" ? 250 : 74,
          p.level === "Pro" ? 113 : p.level === "Middle" ? 204 : 222,
          p.level === "Pro" ? 113 : p.level === "Middle" ? 21 : 128,
        );
        doc.text(`[${p.level}]`, pageW - margin - 14, y);
        y += 5.5;
      });
      y += 4;
    });
  }

  // Tournament section
  if (scope !== "teams" && tournament) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 198, 255);
    const label =
      tournament.type === "elimination"
        ? "SINGLE ELIMINATION"
        : tournament.type === "roundrobin"
          ? "KLASEMEN LIGA"
          : "GROUP STAGE";
    doc.text(label, margin, y);
    y += 8;

    const text = tournamentToPlain(tournament);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(200, 210, 230);
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    lines.forEach((line: string) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    });
  }

  doc.save(`randomix-${scope}.pdf`);
}

// ── 4. Excel — scoped ────────────────────────────────────

interface ExcelOptions {
  teams?: Team[];
  tournament?: Tournament | null;
  scope: "teams" | "tournament" | "full";
}

export async function downloadExcel({
  teams = [],
  tournament = null,
  scope,
}: ExcelOptions): Promise<void> {
  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Randomix v2.0";
  wb.created = new Date();

  const DARK = "FF0A0E1A";
  const ROW_A = "FF111827";
  const ROW_B = "FF1A2235";
  const CYAN = "FF00C6FF";
  const GREEN = "FF00FF88";

  function styleHeader(row: import("exceljs").Row, color: string) {
    row.height = 22;
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: DARK },
      };
      cell.font = { bold: true, color: { argb: color }, size: 10 };
      cell.border = { bottom: { style: "thin", color: { argb: "FF1E2D45" } } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  function styleRow(
    row: import("exceljs").Row,
    idx: number,
    colOverrides?: Record<number, string>,
  ) {
    row.height = 18;
    row.eachCell((cell, col) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: idx % 2 ? ROW_A : ROW_B },
      };
      cell.font = {
        color: { argb: colOverrides?.[col] ?? "FFF0F4FF" },
        size: 9,
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  }

  // ── Teams sheet ──
  if (scope !== "tournament" && teams.length) {
    const ws = wb.addWorksheet("Teams", {
      properties: { tabColor: { argb: CYAN.slice(2) } },
    });
    ws.columns = [
      { header: "Tim", key: "team", width: 18 },
      { header: "Pemain", key: "player", width: 22 },
      { header: "Level", key: "level", width: 12 },
      { header: "Power", key: "power", width: 10 },
    ];
    styleHeader(ws.getRow(1), CYAN);
    const lvlClr: Record<string, string> = {
      Newbie: "FF4ADE80",
      Middle: "FFFACC15",
      Pro: "FFF87171",
    };
    let ri = 0;
    teams.forEach((t) =>
      t.players.forEach((p) => {
        const row = ws.addRow({
          team: t.name,
          player: p.name,
          level: p.level,
          power: p.power,
        });
        styleRow(row, ri++, { 3: lvlClr[p.level] });
      }),
    );
  }

  // ── Tournament sheet ──
  if (scope !== "teams" && tournament) {
    if (tournament.type === "roundrobin") {
      const ws = wb.addWorksheet("Klasemen", {
        properties: { tabColor: { argb: GREEN.slice(2) } },
      });
      ws.columns = [
        { header: "#", key: "rank", width: 6 },
        { header: "Tim", key: "team", width: 18 },
        { header: "M", key: "played", width: 6 },
        { header: "W", key: "won", width: 6 },
        { header: "D", key: "drawn", width: 6 },
        { header: "L", key: "lost", width: 6 },
        { header: "Pts", key: "pts", width: 8 },
      ];
      styleHeader(ws.getRow(1), GREEN);
      tournament.standings.forEach((s, i) => {
        const row = ws.addRow({
          rank: i + 1,
          team: s.team.name,
          played: s.played,
          won: s.won,
          drawn: s.drawn,
          lost: s.lost,
          pts: s.points,
        });
        styleRow(row, i, { 7: CYAN });
      });
    }

    if (tournament.type === "group") {
      tournament.groups.forEach((g) => {
        const ws = wb.addWorksheet(g.name, {
          properties: { tabColor: { argb: "FF00C6FF" } },
        });
        ws.columns = [
          { header: "#", key: "rank", width: 6 },
          { header: "Tim", key: "team", width: 18 },
          { header: "M", key: "played", width: 6 },
          { header: "W", key: "won", width: 6 },
          { header: "D", key: "drawn", width: 6 },
          { header: "L", key: "lost", width: 6 },
          { header: "GF", key: "gf", width: 6 },
          { header: "GA", key: "ga", width: 6 },
          { header: "GD", key: "gd", width: 6 },
          { header: "Pts", key: "pts", width: 8 },
        ];
        styleHeader(ws.getRow(1), CYAN);
        g.standings.forEach((s, i) => {
          const row = ws.addRow({
            rank: i + 1,
            team: s.team.name,
            played: s.played,
            won: s.won,
            drawn: s.drawn,
            lost: s.lost,
            gf: s.gf,
            ga: s.ga,
            gd: s.gd,
            pts: s.points,
          });
          styleRow(row, i, { 10: CYAN });
        });
      });
    }

    if (tournament.type === "elimination") {
      const ws = wb.addWorksheet("Bracket", {
        properties: { tabColor: { argb: "FFF472B6" } },
      });
      ws.columns = [
        { header: "Babak", key: "round", width: 18 },
        { header: "Match", key: "match", width: 8 },
        { header: "Tim 1", key: "t1", width: 18 },
        { header: "Tim 2", key: "t2", width: 18 },
        { header: "Pemenang", key: "winner", width: 18 },
      ];
      styleHeader(ws.getRow(1), "FFF472B6");
      let ri = 0;
      tournament.rounds.forEach((r) =>
        r.matches.forEach((m) => {
          const row = ws.addRow({
            round: r.name,
            match: m.matchNumber,
            t1: m.team1?.name ?? "?",
            t2: m.team2?.name ?? "?",
            winner: m.winner?.name ?? "—",
          });
          styleRow(row, ri++);
        }),
      );
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `randomix-${scope}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
