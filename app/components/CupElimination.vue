<template>
  <div>
    <div class="mb-3 flex items-center justify-center gap-3 text-[var(--clay-text)]">
      <BaseToggle :model-value="cupStore.useScore" :label="t('cup.elimination.useScore')" @update:model-value="cupStore.setUseScore" />
      <span
        class="cursor-pointer text-sm font-medium sm:text-base"
        @click="cupStore.setUseScore(!cupStore.useScore)"
      >
        {{ t("cup.elimination.useScoreLabel") }}
      </span>
    </div>
    <p class="mb-1 text-center text-xs text-[var(--clay-text-muted)]">
      {{ cupStore.useScore ? t("cup.elimination.helperScored") : t("cup.elimination.helperManual") }}
    </p>
    <p
      v-if="!cupStore.champion"
      class="mb-2 text-center text-xs font-semibold text-[var(--clay-text-muted)] sm:text-sm"
    >
      {{ progressText }}
    </p>
    <p
      class="mb-2 text-xs text-[var(--clay-text-muted)] sm:hidden"
      aria-hidden="true"
    >
      {{ t("cup.elimination.swipeHint") }}
    </p>
    <div
      v-if="legendInfo.hasBye || legendInfo.hasTbd"
      class="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[var(--clay-text-muted)] sm:text-xs"
    >
      <span v-if="legendInfo.hasBye" class="inline-flex items-center gap-1.5">
        <span class="rounded-full bg-black/10 px-2 py-0.5 font-bold text-[var(--clay-text)]">{{ t("common.matchLabel.bye") }}</span>
        {{ t("cup.elimination.legendByeLabel") }}
      </span>
      <span v-if="legendInfo.hasTbd" class="inline-flex items-center gap-1.5">
        <span class="rounded-full bg-black/10 px-2 py-0.5 font-bold text-[var(--clay-text)]">{{ t("common.matchLabel.tbd") }}</span>
        {{ t("cup.elimination.legendTbdLabel") }}
      </span>
    </div>
    <div class="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <TournamentBracket
        :rounds="rounds"
        text-color="#33415c"
        title-color="rgba(51,65,92,0.55)"
        team-background-color="#eef2f5"
        highlight-team-background-color="rgba(52,211,153,0.45)"
        score-background-color="rgba(51,65,92,0.08)"
        winner-score-background-color="#fbbf24"
        @on-participant-click="onParticipantClick"
      >
        <template #team="{ team, match }">
          <span class="name truncate font-semibold">{{ team.name }}</span>
          <span v-if="canScoreMatch(match) && team.id !== '?'" class="score" @click.stop>
            <input
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              class="score-input"
              :aria-label="t('cup.elimination.scoreAria', { team: team.name })"
              :value="team.score ?? ''"
              @change="onScoreChange(match, team, $event)"
            />
          </span>
          <span v-else-if="team.score != null" class="score">{{ team.score }}</span>
        </template>
      </TournamentBracket>
    </div>

    <ConfirmDialog
      :open="!!confirmDialog"
      :title="confirmDialog?.title ?? ''"
      :message="confirmDialog?.message ?? ''"
      :variant="confirmDialog?.variant ?? 'default'"
      @confirm="handleConfirmDialogConfirm"
      @cancel="confirmDialog = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useCupStore } from "../stores/cup";
import { useToast } from "../composables/useToast";
import { TournamentBracket } from "vue3-tournament";
import "vue3-tournament/style.css";

const cupStore = useCupStore();
const toast = useToast();
const { t } = useI18n();

type ConfirmDialogState = {
  title: string;
  message: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
};
const confirmDialog = ref<ConfirmDialogState | null>(null);

function handleConfirmDialogConfirm() {
  confirmDialog.value?.onConfirm();
  confirmDialog.value = null;
}

function roundTitle(roundIndex: number, totalRounds: number) {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return t("common.roundTitle.final");
  if (fromEnd === 1) return t("common.roundTitle.semifinal");
  if (fromEnd === 2) return t("common.roundTitle.quarterfinal");
  return t("common.roundTitle.roundN", { n: roundIndex + 1 });
}

const rounds = computed(() =>
  cupStore.rounds.map((r, roundIndex) => ({
    matchs: r.matchs.map((m) => {
      const [a, b] = m.teams.map((id) =>
        id != null ? cupStore.teams.find((t) => t.id === id) : undefined,
      );
      // Match dengan 1 slot (bye) beda dari match 2-slot yang lawannya belum
      // ditentukan — labelnya jangan disamakan biar gak membingungkan.
      const emptyLabel = m.teams.length === 1 ? t("common.matchLabel.bye") : t("common.matchLabel.tbd");
      return {
        id: m.id,
        title: roundTitle(roundIndex, cupStore.rounds.length),
        team1: a
          ? { id: a.id, name: a.name, score: cupStore.useScore ? m.score1 ?? null : null }
          : { id: "?", name: emptyLabel },
        team2: b
          ? { id: b.id, name: b.name, score: cupStore.useScore ? m.score2 ?? null : null }
          : { id: "?", name: emptyLabel },
        winner: m.winner,
      };
    }),
  })),
);

const legendInfo = computed(() => {
  let hasBye = false;
  let hasTbd = false;
  for (const round of cupStore.rounds) {
    for (const m of round.matchs) {
      if (m.teams.length === 1) hasBye = true;
      else if (m.teams.includes(null)) hasTbd = true;
    }
  }
  return { hasBye, hasTbd };
});

const progressText = computed(() => {
  const playable = cupStore.matches.filter((m) =>
    m.teams.every((id) => id != null),
  );
  const decided = playable.filter((m) => m.winner != null).length;
  return t("cup.elimination.progress", { decided, total: playable.length });
});

function canScoreMatch(match: { team1?: { id: string | number }; team2?: { id: string | number } }) {
  return cupStore.useScore && match.team1?.id !== "?" && match.team2?.id !== "?";
}

function onScoreChange(
  match: { id: string | number; team1?: { id: string | number }; team2?: { id: string | number } },
  team: { id: string | number },
  event: Event,
) {
  const raw = (event.target as HTMLInputElement).value;
  const score = raw === "" ? null : Number(raw);
  if (score != null && (!Number.isInteger(score) || score < 0)) return;

  const matchId = match.id as number;
  const slot = match.team1?.id === team.id ? 0 : 1;
  cupStore.setMatchScore(matchId, slot, score);

  const updated = cupStore.matches.find((m) => m.id === matchId);
  if (!updated || updated.score1 == null || updated.score2 == null) return;
  if (updated.score1 === updated.score2) return;
  if (!updated.teams.every((id) => id != null)) return;

  const winnerId = updated.score1 > updated.score2 ? updated.teams[0]! : updated.teams[1]!;
  const winnerName = cupStore.teams.find((t) => t.id === winnerId)?.name;
  applyMatchResult(matchId, winnerId, winnerName);
}

function applyMatchResult(
  matchId: number,
  winnerId: number,
  winnerName?: string,
) {
  cupStore.setMatchResult(matchId, winnerId);
  toast.success(t("cup.elimination.advanced", { name: winnerName ?? t("cup.standingsTable.team") }));
}

function onParticipantClick(
  participant: { id: string | number; name?: string },
  match: { id?: string | number },
) {
  if (participant.id === "?" || match.id === undefined) {
    toast.info(t("cup.elimination.emptySlot"));
    return;
  }

  const matchId = match.id as number;
  const winnerId = participant.id as number;
  const existingMatch = cupStore.matches.find((m) => m.id === matchId);
  if (!existingMatch) return;

  const isOverturn =
    existingMatch.winner != null && existingMatch.winner !== winnerId;
  // Match punya 2 slot tapi lawannya belum ditentukan (masih TBD) — tetap boleh
  // memenangkan tim ini duluan (mis. walkover), tapi wanti-wanti dulu supaya
  // gak kepencet gak sengaja.
  const hasUndecidedOpponent =
    existingMatch.teams.length === 2 && existingMatch.teams.includes(null);

  if (isOverturn) {
    confirmDialog.value = {
      title: t("cup.elimination.overturnTitle"),
      message: t("cup.elimination.overturnMessage", { name: participant.name ?? t("cup.elimination.overturnFallbackName") }),
      variant: "danger",
      onConfirm: () => applyMatchResult(matchId, winnerId, participant.name),
    };
    return;
  }

  if (hasUndecidedOpponent) {
    confirmDialog.value = {
      title: t("cup.elimination.walkoverTitle"),
      message: t("cup.elimination.walkoverMessage", { name: participant.name ?? t("cup.elimination.walkoverFallbackName") }),
      variant: "danger",
      onConfirm: () => applyMatchResult(matchId, winnerId, participant.name),
    };
    return;
  }

  applyMatchResult(matchId, winnerId, participant.name);
}
</script>

<style scoped>
/* Reskin visual vue3-tournament (library pihak ketiga, hanya expose warna lewat
   CSS vars/props) supaya radius, ukuran, & garis penghubungnya senada dengan
   tema clay dan lebih mudah dibaca — tidak mengubah struktur/posisi elemen. */
:deep(.vt-item-teams .vt-team) {
  width: 200px;
  border-radius: 0.75rem;
  font-size: 14px;
  transition: background-color 0.15s ease;
}
:deep(.vt-item-teams .vt-team .name) {
  width: 148px;
  padding: 8px 12px;
  font-size: 14px;
}
:deep(.vt-item-teams .vt-team .score) {
  width: 40px;
  padding: 4px;
  font-size: 14px;
  text-align: center;
}
:deep(.vt-item-teams .vt-team .score-input) {
  width: 32px;
  border: none;
  border-radius: 0.375rem;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--clay-text);
  outline: none;
}
:deep(.vt-item-teams .vt-team .score-input:focus) {
  background: #fff;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.6);
}
:deep(.vt-item-teams .vt-team .score-input::-webkit-inner-spin-button),
:deep(.vt-item-teams .vt-team .score-input::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
:deep(.vt-item-teams .title) {
  font-size: 11px;
}
:deep(.vt-item-teams .vt-team-top) {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  border-bottom-color: rgba(51, 65, 92, 0.12);
}
:deep(.vt-item-teams .vt-team-bot) {
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}
:deep(.vt-item-parent) {
  margin-left: 70px;
}
:deep(.vt-item-child) {
  margin-top: 14px;
  margin-bottom: 14px;
}
:deep(.vt-item-parent:after),
:deep(.vt-item-child:before),
:deep(.vt-item-child:after) {
  background-color: rgba(124, 135, 151, 0.4) !important;
}
</style>
