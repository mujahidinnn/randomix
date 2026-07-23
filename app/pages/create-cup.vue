<template>
  <main
    class="flex min-h-screen flex-col items-center bg-gradient-to-r from-green-400 to-blue-500 p-6"
  >
    <div class="relative mb-6 flex w-full max-w-6xl items-center justify-center">
      <NuxtLink
        to="/generate"
        aria-label="Kembali ke halaman generate tim"
        class="absolute left-0 rounded-full bg-white/20 p-3 font-bold text-white shadow transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>
      <h1 class="text-lg font-bold text-white sm:text-xl">Bagan Turnamen</h1>
    </div>

    <section
      aria-label="Bagan turnamen"
      class="w-full max-w-6xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-md"
    >
      <!-- ClientOnly: state turnamen dipulihkan dari localStorage hanya di client,
           jadi render awal di server selalu kosong. Tampilkan skeleton agar tidak
           ada flash konten kosong -> terisi (mencegah hydration mismatch & CLS). -->
      <ClientOnly>
        <template #fallback>
          <div class="space-y-4" aria-hidden="true">
            <BaseSkeleton height="2rem" width="40%" />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <BaseSkeleton v-for="i in 3" :key="i" height="6rem" />
            </div>
          </div>
        </template>

        <div v-if="cupStore.hasCup">
          <!-- Banner juara -->
          <div
            v-if="cupStore.champion"
            class="mb-6 flex items-center justify-center gap-3 rounded-xl bg-yellow-300/90 p-4 text-center font-bold text-yellow-900 shadow"
            role="status"
          >
            <TrophyIcon class="h-6 w-6" aria-hidden="true" />
            <span>Juara: {{ cupStore.champion.name }}</span>
          </div>

          <TournamentBracket :rounds="rounds" @on-participant-click="onParticipantClick">
            <template #team="{ team }">
              <span class="font-semibold">{{ team.name }}</span>
              <span v-if="team.score != null" class="ml-1 text-gray-400">({{ team.score }})</span>
            </template>
          </TournamentBracket>

          <h2 class="mb-3 mt-8 text-base font-bold text-white sm:text-lg">Daftar Tim</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div
              v-for="team in cupStore.teams"
              :key="team.id"
              class="rounded-xl border border-white/20 bg-white/10 p-4 text-white shadow"
            >
              <div class="mb-2 flex items-center justify-between">
                <p class="font-bold">{{ team.name }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="statusBadgeClass(team.status)"
                >
                  {{ statusLabel(team.status) }}
                </span>
              </div>
              <ul class="space-y-1 text-sm text-white/90">
                <li v-for="member in team.members" :key="member.name">
                  {{ member.name }}
                  <span v-if="member.level" class="text-white/60">({{ member.level }})</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="mt-8 flex justify-center">
            <BaseButton variant="secondary" @click="handleResetCup">
              <template #icon><ArrowPathIcon class="h-4 w-4" aria-hidden="true" /></template>
              Buat Turnamen Baru
            </BaseButton>
          </div>
        </div>

        <EmptyState v-else message="Belum ada data cup, silakan buat di halaman Generate.">
          <template #action>
            <BaseButton tag="NuxtLink" to="/generate" class="mt-2">
              <template #icon><BoltIcon class="h-4 w-4" aria-hidden="true" /></template>
              Ke Halaman Generate
            </BaseButton>
          </template>
        </EmptyState>
      </ClientOnly>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowLeftIcon, ArrowPathIcon, BoltIcon, TrophyIcon } from "@heroicons/vue/24/solid";
import { useCupStore } from "../stores/cup";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";
import { TournamentBracket } from "vue3-tournament";
import "vue3-tournament/style.css";

const config = useRuntimeConfig();

useSeoMeta({
  title: "Bagan Turnamen",
  description: "Lihat dan kelola bagan turnamen tim yang telah kamu buat di Randomix.",
  // Halaman ini menampilkan data lokal milik pengguna, bukan konten publik yang stabil.
  robots: "noindex, follow",
});
useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/create-cup` }],
});

const cupStore = useCupStore();
const router = useRouter();
const toast = useToast();

// Konversi data store -> IRound yang dipahami vue3-tournament.
const rounds = computed(() =>
  cupStore.rounds.map((r) => ({
    matchs: r.matchs.map((m) => {
      const [a, b] = m.teams.map((id) => (id != null ? cupStore.teams.find((t) => t.id === id) : undefined));
      return {
        id: m.id,
        team1: a ? { id: a.id, name: a.name, score: null } : { id: "?", name: "TBD" },
        team2: b ? { id: b.id, name: b.name, score: null } : { id: "?", name: "TBD" },
        winner: m.winner,
      };
    }),
  }))
);

function statusLabel(status?: string) {
  if (status === "win") return "Menang";
  if (status === "lose") return "Tersingkir";
  return "Menunggu";
}

function statusBadgeClass(status?: string) {
  if (status === "win") return "bg-emerald-400/90 text-emerald-950";
  if (status === "lose") return "bg-red-400/80 text-red-950";
  return "bg-white/20 text-white";
}

function onParticipantClick(participant: { id: string | number; name?: string }, match: { id?: string | number }) {
  if (participant.id === "?" || match.id === undefined) {
    toast.info("Slot ini belum terisi tim.");
    return;
  }
  cupStore.setMatchResult(match.id as number, participant.id as number);
  toast.success(`${participant.name ?? "Tim"} maju ke babak berikutnya!`);
}

function handleResetCup() {
  const confirmed = window.confirm(
    "Yakin ingin membuat turnamen baru? Progres turnamen saat ini akan hilang."
  );
  if (!confirmed) return;

  cupStore.resetCup();
  toast.info("Turnamen direset.");
  router.push("/generate");
}
</script>
