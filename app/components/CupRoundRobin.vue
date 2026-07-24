<template>
  <div class="flex flex-col gap-6">
    <div>
      <h3 class="mb-3 text-sm font-bold text-[var(--clay-text)] sm:text-base">Klasemen</h3>
      <CupStandingsTable :teams="cupStore.teams" :standings="cupStore.roundRobinStandings" />
    </div>

    <div>
      <h3 class="mb-3 text-sm font-bold text-[var(--clay-text)] sm:text-base">
        Pertandingan ({{ playedCount }}/{{ cupStore.fixtures.length }} selesai)
      </h3>
      <ul class="space-y-2">
        <CupFixtureRow
          v-for="fixture in cupStore.fixtures"
          :key="fixture.id"
          :fixture="fixture"
          :teams="cupStore.teams"
          @save="(s1, s2) => saveFixture(fixture.id, s1, s2)"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCupStore } from "../stores/cup";
import { useToast } from "../composables/useToast";

const cupStore = useCupStore();
const toast = useToast();

const playedCount = computed(() => cupStore.fixtures.filter((f) => f.played).length);

function saveFixture(fixtureId: number, score1: number, score2: number) {
  cupStore.recordFixtureResult(fixtureId, score1, score2);
  toast.success("Skor tersimpan.");
}
</script>
