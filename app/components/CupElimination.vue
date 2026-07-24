<template>
  <div>
    <p class="mb-1 text-center text-xs text-[var(--clay-text-muted)]">
      Klik nama tim yang menang untuk lanjut ke babak berikutnya.
    </p>
    <p v-if="!cupStore.champion" class="mb-2 text-center text-xs font-semibold text-[var(--clay-text-muted)] sm:text-sm">
      {{ progressText }}
    </p>
    <p class="mb-2 text-xs text-[var(--clay-text-muted)] sm:hidden" aria-hidden="true">Geser untuk lihat ronde berikutnya →</p>
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
        <template #team="{ team }">
          <span class="font-semibold">{{ team.name }}</span>
          <span v-if="team.score != null" class="ml-1 text-[var(--clay-text-muted)]">({{ team.score }})</span>
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

// Nama ronde ala turnamen sungguhan, dihitung mundur dari final.
function roundTitle(roundIndex: number, totalRounds: number) {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinal";
  if (fromEnd === 2) return "Perempat Final";
  return `Babak ${roundIndex + 1}`;
}

// Konversi data store -> IRound yang dipahami vue3-tournament.
const rounds = computed(() =>
  cupStore.rounds.map((r, roundIndex) => ({
    matchs: r.matchs.map((m) => {
      const [a, b] = m.teams.map((id) => (id != null ? cupStore.teams.find((t) => t.id === id) : undefined));
      return {
        id: m.id,
        title: roundTitle(roundIndex, cupStore.rounds.length),
        team1: a ? { id: a.id, name: a.name, score: null } : { id: "?", name: "TBD" },
        team2: b ? { id: b.id, name: b.name, score: null } : { id: "?", name: "TBD" },
        winner: m.winner,
      };
    }),
  }))
);

// Match yang relevan untuk progres = punya dua tim nyata (bukan bye/TBD).
const progressText = computed(() => {
  const playable = cupStore.matches.filter((m) => m.teams.every((id) => id != null));
  const decided = playable.filter((m) => m.winner != null).length;
  return `${decided}/${playable.length} match selesai`;
});

function applyMatchResult(matchId: number, winnerId: number, winnerName?: string) {
  cupStore.setMatchResult(matchId, winnerId);
  toast.success(`${winnerName ?? "Tim"} maju ke babak berikutnya!`);
}

function onParticipantClick(participant: { id: string | number; name?: string }, match: { id?: string | number }) {
  if (participant.id === "?" || match.id === undefined) {
    toast.info("Slot ini belum terisi tim.");
    return;
  }

  const matchId = match.id as number;
  const winnerId = participant.id as number;
  const existingMatch = cupStore.matches.find((m) => m.id === matchId);
  const isOverturn = existingMatch?.winner != null && existingMatch.winner !== winnerId;

  if (isOverturn) {
    confirmDialog.value = {
      title: "Ubah pemenang match?",
      message: `Progres di babak berikutnya yang berasal dari hasil match ini akan direset ke ${participant.name ?? "tim ini"}.`,
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
  width: 160px;
  padding: 8px 12px;
  font-size: 14px;
}
:deep(.vt-item-teams .vt-team .score) {
  width: 28px;
  padding: 8px;
  font-size: 14px;
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
