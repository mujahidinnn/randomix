<template>
  <li
    class="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-[var(--clay-surface-alt)] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
    :class="fixture.played ? 'opacity-90' : ''"
  >
    <span class="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--clay-text)] sm:text-right sm:text-base">
      {{ teamName(fixture.team1) }}
    </span>

    <div class="flex shrink-0 items-center justify-center gap-2">
      <input
        v-model.number="score1"
        type="number"
        min="0"
        step="1"
        :aria-label="t('cup.fixtureRow.scoreAria', { team: teamName(fixture.team1) })"
        class="clay-inset h-9 w-14 text-center text-sm font-bold text-[var(--clay-text)] outline-none"
        @change="trySave"
      />
      <span class="text-xs font-semibold text-[var(--clay-text-muted)]">{{ t("cup.fixtureRow.vs") }}</span>
      <input
        v-model.number="score2"
        type="number"
        min="0"
        step="1"
        :aria-label="t('cup.fixtureRow.scoreAria', { team: teamName(fixture.team2) })"
        class="clay-inset h-9 w-14 text-center text-sm font-bold text-[var(--clay-text)] outline-none"
        @change="trySave"
      />
    </div>

    <span class="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--clay-text)] sm:text-base">
      {{ teamName(fixture.team2) }}
    </span>
  </li>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Team } from "../stores/cup";
import type { Fixture } from "../utils/standings";

const props = defineProps<{
  fixture: Fixture;
  teams: Team[];
}>();

const emit = defineEmits<{ save: [score1: number, score2: number] }>();
const { t } = useI18n();

const score1 = ref<number | null>(props.fixture.score1);
const score2 = ref<number | null>(props.fixture.score2);

watch(
  () => props.fixture,
  (f) => {
    score1.value = f.score1;
    score2.value = f.score2;
  }
);

function teamName(teamId: number) {
  return props.teams.find((team) => team.id === teamId)?.name ?? t("common.matchLabel.unknownTeam");
}

function trySave() {
  if (
    score1.value != null &&
    score2.value != null &&
    Number.isInteger(score1.value) &&
    Number.isInteger(score2.value) &&
    score1.value >= 0 &&
    score2.value >= 0
  ) {
    emit("save", score1.value, score2.value);
  }
}
</script>
