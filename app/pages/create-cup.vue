<template>
  <main
    class="page-shell flex min-h-screen flex-col items-center p-4 sm:p-6"
  >
    <div class="relative mb-4 flex w-full max-w-6xl items-center justify-center sm:mb-6 xl:max-w-7xl">
      <NuxtLink
        to="/generate"
        aria-label="Kembali ke halaman generate tim"
        class="clay-raised absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--clay-surface-alt)] font-bold text-[var(--clay-text)] transition"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>
      <h1 class="text-lg font-bold text-[var(--clay-text)] sm:text-xl lg:text-2xl">Bagan Turnamen</h1>
    </div>

    <section
      aria-label="Bagan turnamen"
      class="clay-surface clay-raised w-full max-w-6xl p-4 sm:p-6 xl:max-w-7xl xl:p-8"
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
            class="mb-6 flex items-center justify-center gap-3 rounded-xl bg-amber-200 p-4 text-center font-bold text-amber-900"
            role="status"
          >
            <TrophyIcon class="h-6 w-6" aria-hidden="true" />
            <span>Juara: {{ cupStore.champion.name }}</span>
          </div>

          <CupElimination v-if="cupStore.tournamentType === 'elimination'" />
          <CupRoundRobin v-else-if="cupStore.tournamentType === 'roundrobin'" />
          <CupGroupStage v-else-if="cupStore.tournamentType === 'group'" />

          <h2 class="mb-3 mt-8 text-base font-bold text-[var(--clay-text)] sm:text-lg">Daftar Tim</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            <div
              v-for="team in cupStore.teams"
              :key="team.id"
              class="rounded-2xl border border-slate-200/70 bg-[var(--clay-surface-alt)] p-4 text-[var(--clay-text)] transition"
              :class="[
                team.status === 'win' ? 'ring-2 ring-emerald-400/70' : '',
                team.status === 'lose' ? 'opacity-60 grayscale-[0.5]' : '',
              ]"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <p class="font-bold">{{ team.name }}</p>
                <span
                  v-if="cupStore.tournamentType === 'elimination'"
                  class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="statusBadgeClass(team.status)"
                >
                  {{ statusLabel(team.status) }}
                </span>
              </div>
              <ul class="space-y-1 text-sm text-[var(--clay-text)]/90">
                <li v-for="member in team.members" :key="member.name">
                  {{ member.name }}
                  <span v-if="member.level" class="text-[var(--clay-text-muted)]">({{ member.level }})</span>
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

    <ConfirmDialog
      :open="!!confirmDialog"
      :title="confirmDialog?.title ?? ''"
      :message="confirmDialog?.message ?? ''"
      :variant="confirmDialog?.variant ?? 'default'"
      @confirm="handleConfirmDialogConfirm"
      @cancel="confirmDialog = null"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ArrowLeftIcon, ArrowPathIcon, BoltIcon, TrophyIcon } from "@heroicons/vue/24/solid";
import { useCupStore } from "../stores/cup";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";

const config = useRuntimeConfig();
const ogImageUrl = new URL("/randomix.png", config.public.siteUrl).toString();

useSeoMeta({
  title: "Bagan Turnamen",
  description: "Lihat dan kelola bagan turnamen tim yang telah kamu buat di Randomix.",
  ogTitle: "Bagan Turnamen — Randomix",
  ogDescription: "Lihat dan kelola bagan turnamen tim yang telah kamu buat di Randomix.",
  ogImage: ogImageUrl,
  ogImageWidth: 498,
  ogImageHeight: 129,
  ogImageAlt: "Logo Randomix",
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl,
  twitterImageAlt: "Logo Randomix",
  // Halaman ini menampilkan data lokal milik pengguna, bukan konten publik yang stabil.
  robots: "noindex, follow",
});
useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/create-cup` }],
});

const cupStore = useCupStore();
const router = useRouter();
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

function statusLabel(status?: string) {
  if (status === "win") return "Menang";
  if (status === "lose") return "Tersingkir";
  return "Menunggu";
}

function statusBadgeClass(status?: string) {
  if (status === "win") return "bg-emerald-400/90 text-emerald-950";
  if (status === "lose") return "bg-rose-400/80 text-rose-950";
  return "bg-slate-200 text-slate-600";
}

function handleResetCup() {
  confirmDialog.value = {
    title: "Buat turnamen baru?",
    message: "Progres turnamen saat ini akan hilang.",
    variant: "danger",
    onConfirm: () => {
      cupStore.resetCup();
      toast.info("Turnamen direset.");
      router.push("/generate");
    },
  };
}
</script>
