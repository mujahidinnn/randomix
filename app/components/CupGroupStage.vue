<template>
  <div class="flex flex-col gap-8">
    <div v-for="group in cupStore.groups" :key="group.id">
      <h3 class="mb-3 text-sm font-bold text-[var(--clay-text)] sm:text-base">{{ group.name }}</h3>
      <CupStandingsTable :teams="cupStore.teams" :standings="groupStandings(group)" class="mb-3" />
      <ul class="space-y-2">
        <CupFixtureRow
          v-for="fixture in group.fixtures"
          :key="fixture.id"
          :fixture="fixture"
          :teams="cupStore.teams"
          @save="(s1, s2) => saveFixture(group.id, fixture.id, s1, s2)"
        />
      </ul>
    </div>

    <div v-if="!cupStore.knockoutStarted" class="flex flex-col items-center gap-2 text-center">
      <p class="text-xs text-[var(--clay-text-muted)] sm:text-sm">
        {{ allGroupsPlayed ? t("cup.groupStage.allPlayed") : t("cup.groupStage.notAllPlayed") }}
      </p>
      <BaseButton variant="accent" :disabled="!allGroupsPlayed" @click="startKnockout">
        <template #icon><TrophyIcon class="h-4 w-4" aria-hidden="true" /></template>
        {{ t("cup.groupStage.buildKnockout") }}
      </BaseButton>
    </div>

    <div v-else>
      <h3 class="mb-3 text-sm font-bold text-[var(--clay-text)] sm:text-base">{{ t("cup.groupStage.knockoutHeading") }}</h3>
      <CupElimination />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TrophyIcon } from "@heroicons/vue/24/solid";
import { useCupStore, type Group } from "../stores/cup";
import { useToast } from "../composables/useToast";
import { buildStandings } from "../utils/standings";

const cupStore = useCupStore();
const toast = useToast();
const { t } = useI18n();

const allGroupsPlayed = computed(() =>
  cupStore.groups.length > 0 && cupStore.groups.every((g) => g.fixtures.every((f) => f.played))
);

function groupStandings(group: Group) {
  return buildStandings(group.teamIds, group.fixtures);
}

function saveFixture(groupId: number, fixtureId: number, score1: number, score2: number) {
  cupStore.recordGroupFixtureResult(groupId, fixtureId, score1, score2);
  toast.success(t("cup.groupStage.scoreSaved"));
}

function startKnockout() {
  cupStore.buildKnockoutFromGroups();
  toast.success(t("cup.groupStage.knockoutBuilt"));
}
</script>
