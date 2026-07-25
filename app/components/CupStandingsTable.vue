<template>
  <div class="clay-inset overflow-x-auto p-1">
    <table class="w-full min-w-[480px] border-collapse text-xs sm:text-sm">
      <thead>
        <tr class="text-left text-[var(--clay-text-muted)]">
          <th class="px-2 py-2 font-semibold">{{ t("cup.standingsTable.rank") }}</th>
          <th class="px-2 py-2 font-semibold">{{ t("cup.standingsTable.team") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.played") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.won") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.drawn") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.lost") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.gf") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.ga") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.gd") }}</th>
          <th class="px-2 py-2 text-center font-semibold">{{ t("cup.standingsTable.points") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in standings"
          :key="row.teamId"
          class="rounded-xl text-[var(--clay-text)]"
          :class="idx % 2 === 0 ? 'bg-black/[0.02]' : ''"
        >
          <td class="px-2 py-2 font-semibold">{{ idx + 1 }}</td>
          <td class="px-2 py-2 font-semibold">{{ teamName(row.teamId) }}</td>
          <td class="px-2 py-2 text-center">{{ row.played }}</td>
          <td class="px-2 py-2 text-center">{{ row.won }}</td>
          <td class="px-2 py-2 text-center">{{ row.drawn }}</td>
          <td class="px-2 py-2 text-center">{{ row.lost }}</td>
          <td class="px-2 py-2 text-center">{{ row.gf }}</td>
          <td class="px-2 py-2 text-center">{{ row.ga }}</td>
          <td class="px-2 py-2 text-center">{{ row.gd }}</td>
          <td class="px-2 py-2 text-center font-bold text-[var(--clay-accent-dark)]">{{ row.points }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Team } from "../stores/cup";
import type { Standing } from "../utils/standings";

const props = defineProps<{
  teams: Team[];
  standings: Standing[];
}>();

const { t } = useI18n();

function teamName(teamId: number) {
  return props.teams.find((team) => team.id === teamId)?.name ?? t("common.matchLabel.unknownTeam");
}
</script>
