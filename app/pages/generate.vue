<template>
  <main
    class="page-shell flex min-h-screen flex-col items-center p-4 pb-64 sm:p-6 sm:pb-6"
  >
    <!-- Header -->
    <div
      class="relative mb-4 flex h-max w-full max-w-md animate-scaleIn items-center justify-center sm:mb-6 sm:max-w-xl md:max-w-3xl lg:max-w-6xl"
    >
      <NuxtLink
        to="/"
        aria-label="Kembali ke beranda"
        class="clay-raised absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--clay-surface-alt)] font-bold text-[var(--clay-text)] transition"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>

      <img
        src="/randomix.png"
        alt="Logo Randomix"
        width="497"
        height="123"
        class="w-52 sm:w-64 md:w-80"
      />
    </div>

    <h1 class="sr-only">Generate Tim Olahraga Secara Acak</h1>

    <!-- Step indicator -->
    <ol
      class="mb-4 flex w-full max-w-md items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--clay-text-muted)] sm:max-w-xl sm:text-xs md:max-w-3xl lg:max-w-6xl"
      aria-hidden="true"
    >
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(1) ? 'bg-[var(--clay-accent)]/20 text-[var(--clay-accent-dark)]' : ''"
      >
        1. Pemain
      </li>
      <li class="opacity-50">→</li>
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(2) ? 'bg-[var(--clay-accent)]/20 text-[var(--clay-accent-dark)]' : ''"
      >
        2. Jumlah Tim
      </li>
      <li class="opacity-50">→</li>
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(3) ? 'bg-[var(--clay-accent)]/20 text-[var(--clay-accent-dark)]' : ''"
      >
        3. Hasil
      </li>
    </ol>

    <!-- Grid 2 kolom di desktop: form (kiri) + hasil (kanan) bersebelahan,
         supaya tidak perlu scroll jauh untuk lihat hasil sambil isi form. -->
    <div class="grid w-full max-w-md gap-6 sm:max-w-xl md:max-w-3xl lg:max-w-6xl lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
      <!-- Panel Form -->
      <section
        aria-labelledby="form-heading"
        class="clay-surface clay-raised w-full p-5 sm:p-6"
      >
      <h2 id="form-heading" class="sr-only">Tambah Pemain</h2>

      <!-- Toggle Level -->
      <div class="mb-4 flex items-center gap-3 text-[var(--clay-text)]">
        <BaseToggle v-model="useLevel" label="Gunakan Level" />
        <span class="cursor-pointer text-sm font-medium sm:text-base" @click="useLevel = !useLevel">
          Gunakan Level
        </span>
      </div>

      <!-- Input Pemain -->
      <form class="flex flex-col gap-3" @submit.prevent="addPlayer">
        <div>
          <label for="player-name" class="sr-only">Nama pemain</label>
          <input
            id="player-name"
            v-model="playerName"
            type="text"
            placeholder="Nama pemain"
            maxlength="30"
            autocomplete="off"
            :aria-invalid="!!nameError"
            aria-describedby="player-name-error"
            class="clay-inset w-full px-4 py-2.5 text-[var(--clay-text)] placeholder-[var(--clay-text-muted)] outline-none transition"
          />
          <div class="mt-1 flex items-start justify-between gap-2">
            <p
              id="player-name-error"
              class="min-h-[1.1rem] text-xs font-medium text-[var(--clay-danger-dark)]"
              aria-live="polite"
            >
              {{ nameError }}
            </p>
            <span class="shrink-0 text-xs text-[var(--clay-text-muted)]">{{ playerName.length }}/{{ MAX_NAME_LENGTH }}</span>
          </div>
        </div>

        <div v-if="useLevel">
          <span class="sr-only">Level pemain</span>
          <BaseSelect v-model="playerLevel" :options="levelOptions" label="Level pemain" />
        </div>

        <BaseButton type="submit" :disabled="!canAddPlayer">
          Tambah Pemain
        </BaseButton>
      </form>

      <!-- Info jumlah pemain -->
      <p v-if="players.length" class="mt-4 text-sm text-[var(--clay-text)]" aria-live="polite">
        {{ players.length }} pemain{{ maxPlayersReached ? ` (maksimal ${MAX_PLAYERS})` : "" }}
      </p>

      <!-- List Pemain -->
      <ul
        class="max-h-52 overflow-y-auto pr-1"
        :class="{ 'border-t border-slate-200 pt-3': players.length > 0 }"
      >
        <template v-if="players.length">
          <li
            v-for="(p, idx) in players"
            :key="p.id"
            class="mb-2 flex items-center justify-between gap-2 rounded-xl bg-black/[0.03] px-4 py-2 text-sm font-semibold transition hover:bg-black/[0.06] sm:text-base"
          >
            <span class="flex flex-wrap items-center gap-2">
              <span class="text-[var(--clay-text)]">{{ p.name }}</span>
              <span
                v-if="useLevel && p.level"
                class="rounded-full bg-[var(--clay-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--clay-accent-dark)] sm:text-sm"
              >
                {{ p.level }}
              </span>
              <span
                v-if="isPending(p)"
                class="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950"
              >
                Belum masuk tim
              </span>
            </span>
            <button
              type="button"
              :aria-label="`Hapus pemain ${p.name}`"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rose-400 transition hover:bg-black/5 hover:text-rose-500"
              @click="removePlayer(idx)"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        </template>
        <EmptyState v-else message="Belum ada pemain" :icon="InboxIcon" />
      </ul>

      <!-- Panel: pemain baru yang belum ditempatkan ke tim manapun -->
      <div
        v-if="pendingPlayers.length"
        ref="pendingPanelRef"
        class="clay-surface mt-4 p-4 transition"
        :class="pendingHighlight ? 'ring-2 ring-amber-300' : ''"
      >
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-bold text-amber-900 sm:text-base">
            🆕 Perlu Ditempatkan ({{ pendingPlayers.length }})
          </h3>
          <BaseButton variant="accent" size="sm" @click="autoAssignAllPending">
            ⚡ Otomatis Semua
          </BaseButton>
        </div>
        <p class="mb-3 text-xs text-amber-800/80">
          Pemain ini ditambahkan setelah tim dibuat. Tim yang sudah ada tidak berubah kecuali kamu pilih di sini.
        </p>
        <ul class="space-y-2">
          <li
            v-for="p in pendingPlayers"
            :key="p.id"
            class="clay-inset flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span class="flex items-center gap-2 text-sm font-semibold text-[var(--clay-text)]">
              {{ p.name }}
              <span
                v-if="useLevel && p.level"
                class="rounded-full bg-[var(--clay-accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--clay-accent-dark)]"
              >
                {{ p.level }}
              </span>
            </span>
            <TeamAssignSelect
              class="sm:w-56"
              :teams="teamOptions"
              :label="`Tempatkan ${p.name} ke tim`"
              @assign="(value) => handlePendingAssign(p, value)"
            />
          </li>
        </ul>
        <button
          type="button"
          class="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-[var(--clay-text)] transition hover:bg-black/5 sm:text-sm"
          @click="handleCreateCup"
        >
          Lanjutkan Tanpa Mereka →
        </button>
      </div>

      <!-- Jumlah Tim + Aksi Generate — versi desktop, statis di dalam card.
           Versi mobile di-teleport ke <body> sebagai fixed footer (lihat di bawah)
           supaya tidak ikut ter-scroll bersama form yang panjang di layar kecil. -->
      <div class="mt-4 hidden sm:block">
        <div>
          <div class="flex items-center gap-3">
            <label for="team-count-desktop" class="whitespace-nowrap text-sm font-semibold text-[var(--clay-text)] sm:text-base">
              Jumlah Tim:
            </label>
            <input
              id="team-count-desktop"
              v-model.number="teamCount"
              type="number"
              min="2"
              step="1"
              :max="Math.max(players.length, 2)"
              :aria-invalid="!!teamCountError"
              aria-describedby="team-count-error-desktop"
              class="clay-inset w-full px-3 py-2.5 text-[var(--clay-text)] outline-none transition"
              @change="clampTeamCount"
            />
          </div>
          <p
            id="team-count-error-desktop"
            class="mt-1 min-h-[1.1rem] text-xs font-medium text-[var(--clay-danger-dark)]"
            aria-live="polite"
          >
            {{ teamCountError }}
          </p>
        </div>

        <BaseButton class="mt-3 w-full" size="lg" :disabled="players.length < 2 || teamCount < 2" @click="generateTeams">
          <template #icon>
            <ArrowPathRoundedSquareIcon v-if="teams.length" class="h-5 w-5" aria-hidden="true" />
            <BoltIcon v-else class="h-5 w-5" aria-hidden="true" />
          </template>
          {{ teams.length ? "Generate Ulang" : "Generate Tim" }}
        </BaseButton>

        <div v-if="teams.length" class="mt-3">
          <p class="mb-1.5 text-xs font-semibold text-[var(--clay-text)] sm:text-sm">Jenis Turnamen</p>
          <CupTypeSelector v-model="tournamentType" />
        </div>

        <BaseButton v-if="teams.length" class="mt-3 w-full" variant="accent" size="lg" @click="handleCreateCupClick">
          <template #icon>
            <TrophyIcon class="h-5 w-5" aria-hidden="true" />
          </template>
          Buat Cup Turnamen
        </BaseButton>
      </div>
      </section>

      <!-- Kolom kanan: aksi export + hasil tim (desktop kesamping dgn form, lihat komentar grid di atas) -->
      <div class="flex min-w-0 flex-col gap-4">
        <EmptyState
          v-if="!teams.length"
          message="Hasil tim akan muncul di sini setelah kamu generate."
          :icon="TrophyIcon"
        />

        <template v-else>
          <!-- Aksi Result -->
          <div class="flex w-full flex-wrap items-center justify-center gap-3 lg:justify-start">
            <BaseButton variant="secondary" size="sm" :loading="isGeneratingPDF" @click="downloadPDF">
              <template #icon><DocumentIcon class="h-4 w-4" aria-hidden="true" /></template>
              Download PDF
            </BaseButton>
            <BaseButton variant="secondary" size="sm" :loading="isGeneratingImage" @click="downloadImage">
              <template #icon><PhotoIcon class="h-4 w-4" aria-hidden="true" /></template>
              Download Gambar
            </BaseButton>
            <BaseButton variant="secondary" size="sm" @click="copyText">
              <template #icon><DocumentDuplicateIcon class="h-4 w-4" aria-hidden="true" /></template>
              Salin Teks
            </BaseButton>
            <BaseButton variant="secondary" size="sm" @click="shareWhatsApp">
              <template #icon><ChatBubbleOvalLeftIcon class="h-4 w-4" aria-hidden="true" /></template>
              Share WhatsApp
            </BaseButton>
          </div>

          <!-- Hasil Tim -->
          <div
            id="hasil-tim"
            class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
      <div
        v-for="(team, idx) in teams"
        :key="idx"
        class="clay-raised animate-fadeIn rounded-2xl p-4 text-white"
        :style="{ backgroundColor: teamColors[idx % teamColors.length] }"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <h3 class="text-sm font-bold sm:text-base">
            Tim {{ idx + 1 }} <span class="font-normal opacity-80">({{ team.length }})</span>
          </h3>
          <button
            type="button"
            class="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold text-white/90 transition hover:bg-black/20 sm:text-xs"
            @click="disbandTeam(idx)"
          >
            Bubarkan
          </button>
        </div>
        <ul class="space-y-2 text-xs sm:text-sm">
          <li v-for="p in team" :key="p.id">
            <div class="flex items-center justify-between gap-2">
              <span>
                {{ p.name }} <span v-if="useLevel && p.level" class="opacity-80">({{ p.level }})</span>
              </span>
              <button
                type="button"
                :aria-label="`Pindahkan ${p.name} ke tim lain`"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
                @click="toggleMoveMember(p.id)"
              >
                <ArrowsRightLeftIcon class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <TeamAssignSelect
              v-if="movingMemberId === p.id"
              class="mt-1.5"
              :teams="teamOptions"
              :show-auto="teams.length > 1"
              :label="`Pindahkan ${p.name} ke tim`"
              @assign="
                (value) => {
                  moveMember(idx, p, value);
                  movingMemberId = null;
                }
              "
            />
          </li>
        </ul>
      </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Jumlah Tim + Aksi Generate — versi mobile: di-teleport ke <body> supaya `position: fixed`
         benar-benar relatif ke viewport, bebas dari ancestor manapun. -->
    <Teleport to="body">
      <div
        class="clay-surface clay-raised fixed inset-x-0 bottom-0 z-30 rounded-b-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:hidden"
      >
        <div class="mx-auto mb-2 h-1 w-10 rounded-full bg-black/10" aria-hidden="true" />
        <div class="mx-auto flex w-full max-w-md flex-col gap-3">
          <div>
            <div class="flex items-center gap-3">
              <label for="team-count-mobile" class="whitespace-nowrap text-sm font-semibold text-[var(--clay-text)]">
                Jumlah Tim:
              </label>
              <input
                id="team-count-mobile"
                v-model.number="teamCount"
                type="number"
                min="2"
                step="1"
                :max="Math.max(players.length, 2)"
                :aria-invalid="!!teamCountError"
                aria-describedby="team-count-error-mobile"
                class="clay-inset w-full px-3 py-2.5 text-[var(--clay-text)] outline-none transition"
                @change="clampTeamCount"
              />
            </div>
            <p
              id="team-count-error-mobile"
              class="mt-1 min-h-[1.1rem] text-xs font-medium text-[var(--clay-danger-dark)]"
              aria-live="polite"
            >
              {{ teamCountError }}
            </p>
          </div>

          <BaseButton size="lg" :disabled="players.length < 2 || teamCount < 2" @click="generateTeams">
            <template #icon>
              <ArrowPathRoundedSquareIcon v-if="teams.length" class="h-5 w-5" aria-hidden="true" />
              <BoltIcon v-else class="h-5 w-5" aria-hidden="true" />
            </template>
            {{ teams.length ? "Generate Ulang" : "Generate Tim" }}
          </BaseButton>

          <div v-if="teams.length">
            <p class="mb-1.5 text-xs font-semibold text-[var(--clay-text)]">Jenis Turnamen</p>
            <CupTypeSelector v-model="tournamentType" />
          </div>

          <BaseButton v-if="teams.length" variant="accent" size="lg" @click="handleCreateCupClick">
            <template #icon>
              <TrophyIcon class="h-5 w-5" aria-hidden="true" />
            </template>
            Buat Cup Turnamen
          </BaseButton>
        </div>
      </div>
    </Teleport>

    <!-- Export container - result download image - hidden -->
    <div class="pointer-events-none absolute opacity-0" aria-hidden="true">
      <div
        id="export-capture"
        class="mx-auto flex aspect-[9/16] w-full max-w-[480px] flex-col justify-between rounded-2xl bg-white p-6 shadow-lg"
      >
        <div>
          <img src="/randomix.png" alt="" class="mx-auto w-28 sm:w-36" />
          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              v-for="(team, idx) in teams"
              :key="idx"
              class="rounded-xl p-4 text-white"
              :style="{ backgroundColor: teamColors[idx % teamColors.length] }"
            >
              <h2 class="mb-2 text-lg font-bold sm:text-xl">Tim {{ idx + 1 }}</h2>
              <ul class="space-y-1 text-sm sm:text-base">
                <li v-for="p in team" :key="p.id">
                  {{ p.name }}
                  <span v-if="useLevel && p.level">({{ p.level }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p class="pt-6 text-center text-xs italic text-gray-500">
          Generate by <span class="randomix">randomix</span>
        </p>
      </div>
    </div>

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

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  XMarkIcon,
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  InboxIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  ChatBubbleOvalLeftIcon,
  TrophyIcon,
} from "@heroicons/vue/24/solid";

import { useCupStore } from "../stores/cup";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";
import { shuffleArray } from "../utils/shuffle";

const config = useRuntimeConfig();
const ogImageUrl = new URL("/randomix.png", config.public.siteUrl).toString();

useSeoMeta({
  title: "Generate Tim",
  description:
    "Tambahkan nama pemain lalu generate tim olahraga secara acak dan adil, dengan atau tanpa mempertimbangkan level skill.",
  ogTitle: "Generate Tim — Randomix",
  ogDescription:
    "Tambahkan nama pemain lalu generate tim olahraga secara acak dan adil dalam hitungan detik.",
  ogUrl: `${config.public.siteUrl}/generate`,
  ogImage: ogImageUrl,
  ogImageWidth: 498,
  ogImageHeight: 129,
  ogImageAlt: "Logo Randomix",
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl,
  twitterImageAlt: "Logo Randomix",
  robots: "index, follow",
});
useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/generate` }],
});

const toast = useToast();

const MAX_PLAYERS = 64;
const MAX_NAME_LENGTH = 30;
const SCORE_MAP = { Pro: 3, Middle: 2, Newbie: 1 };

const levelOptions = [
  { value: "Newbie", label: "Newbie" },
  { value: "Middle", label: "Middle" },
  { value: "Pro", label: "Pro" },
];

const playerName = ref("");
const playerLevel = ref("Newbie");
const useLevel = ref(false);
const players = ref([]);
const teamCount = ref(2);
const teams = ref([]);
const tournamentType = ref("elimination");
const teamColors = ["#34d399", "#38bdf8", "#fbbf24", "#fb923c", "#a78bfa"];

// true setelah generate pertama kali sukses — tetap true walau semua tim dibubarkan,
// supaya konsep "pemain pending" tidak hilang begitu saja.
const hasGenerated = ref(false);
const pendingPanelRef = ref(null);
const pendingHighlight = ref(false);
const movingMemberId = ref(null);
const confirmDialog = ref(null);

function handleConfirmDialogConfirm() {
  confirmDialog.value?.onConfirm();
  confirmDialog.value = null;
}

const isGeneratingPDF = ref(false);
const isGeneratingImage = ref(false);
const nameError = ref("");
const teamCountError = ref("");

let playerIdSeq = 0;
let jsPDFModule = null;
let html2canvasModule = null;

const maxPlayersReached = computed(() => players.value.length >= MAX_PLAYERS);

const canAddPlayer = computed(() => {
  const trimmed = playerName.value.trim();
  return trimmed.length > 0 && !maxPlayersReached.value;
});

// id pemain yang sudah tergabung di salah satu tim hasil generate.
const assignedPlayerIds = computed(() => new Set(teams.value.flatMap((t) => t.map((m) => m.id))));

// pemain yang ditambahkan setelah generate tapi belum masuk tim manapun.
const pendingPlayers = computed(() =>
  hasGenerated.value ? players.value.filter((p) => !assignedPlayerIds.value.has(p.id)) : []
);

const teamOptions = computed(() => teams.value.map((t, i) => ({ name: `Tim ${i + 1}`, count: t.length })));

function isPending(player) {
  return hasGenerated.value && !assignedPlayerIds.value.has(player.id);
}

function stepActive(step) {
  if (step === 1) return players.value.length === 0;
  if (step === 2) return players.value.length > 0 && !hasGenerated.value;
  return hasGenerated.value;
}

// Validasi nama secara reaktif: kosong, duplikat, atau melebihi batas pemain.
watch(playerName, (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    nameError.value = "";
    return;
  }
  if (maxPlayersReached.value) {
    nameError.value = `Maksimal ${MAX_PLAYERS} pemain tercapai.`;
  } else if (isDuplicateName(trimmed)) {
    nameError.value = "Nama pemain sudah ada.";
  } else {
    nameError.value = "";
  }
});

// Validasi jumlah tim secara reaktif (live saat mengetik), independen dari clamp on-blur.
watch(teamCount, (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    teamCountError.value = "Jumlah tim harus berupa angka.";
    return;
  }
  if (!Number.isInteger(value)) {
    teamCountError.value = "Jumlah tim harus bilangan bulat.";
    return;
  }
  const max = Math.max(players.value.length, 2);
  if (value > max) {
    teamCountError.value = `Jumlah tim tidak boleh melebihi jumlah pemain (${max}).`;
  } else if (value < 2) {
    teamCountError.value = "Minimal 2 tim.";
  } else {
    teamCountError.value = "";
  }
});

// Jika daftar pemain menyusut di bawah jumlah tim saat ini, sesuaikan otomatis.
watch(
  () => players.value.length,
  (count) => {
    if (count > 0 && teamCount.value > count) {
      teamCount.value = Math.max(2, count);
    }
  }
);

onMounted(async () => {
  try {
    const module = await import("jspdf");
    jsPDFModule = module.default;
  } catch (err) {
    console.error("Gagal memuat modul PDF:", err);
  }
});

const cupStore = useCupStore();
const router = useRouter();

function isDuplicateName(name) {
  const normalized = name.toLowerCase();
  return players.value.some((p) => p.name.toLowerCase() === normalized);
}

function addPlayer() {
  const trimmed = playerName.value.trim();
  if (!trimmed) return;

  if (maxPlayersReached.value) {
    toast.error(`Maksimal ${MAX_PLAYERS} pemain.`);
    return;
  }
  if (isDuplicateName(trimmed)) {
    nameError.value = "Nama pemain sudah ada.";
    return;
  }

  players.value.push({
    id: ++playerIdSeq,
    name: trimmed.slice(0, MAX_NAME_LENGTH),
    level: useLevel.value ? playerLevel.value : null,
  });
  playerName.value = "";
  nameError.value = "";
  if (useLevel.value) playerLevel.value = "Newbie";

  if (hasGenerated.value) {
    toast.info(`${trimmed} ditambahkan. Pilih tim untuk pemain ini di bawah.`);
  }
}

function removePlayer(idx) {
  const player = players.value[idx];
  players.value.splice(idx, 1);

  // sinkronkan: kalau pemain ini sudah masuk tim, keluarkan juga dari sana.
  for (const team of teams.value) {
    const i = team.findIndex((m) => m.id === player.id);
    if (i !== -1) {
      team.splice(i, 1);
      toast.info(`${player.name} dihapus dari tim.`);
      break;
    }
  }
}

function clampTeamCount() {
  const max = Math.max(players.value.length, 2);
  if (teamCount.value > max) {
    teamCount.value = max;
  } else if (!Number.isInteger(teamCount.value) || teamCount.value < 2) {
    teamCount.value = 2;
  }
}

function teamLoad(team) {
  return {
    count: team.length,
    score: team.reduce((sum, m) => sum + (SCORE_MAP[m.level] || SCORE_MAP.Newbie), 0),
  };
}

function leastLoadedTeamIndex() {
  let best = 0;
  for (let i = 1; i < teams.value.length; i++) {
    const a = teamLoad(teams.value[best]);
    const b = teamLoad(teams.value[i]);
    if (b.count < a.count || (b.count === a.count && b.score < a.score)) best = i;
  }
  return best;
}

function generateTeams() {
  if (players.value.length < 2) {
    toast.error("Tambahkan minimal 2 pemain untuk generate tim.");
    return;
  }
  clampTeamCount();
  if (teamCount.value < 2) {
    toast.error("Jumlah tim minimal 2.");
    return;
  }

  const nTeams = teamCount.value;

  if (useLevel.value) {
    const pool = players.value.map((p) => ({
      id: p.id,
      name: p.name,
      level: p.level || "Newbie",
      score: SCORE_MAP[p.level] || SCORE_MAP.Newbie,
    }));

    const shuffledPool = shuffleArray(pool);
    shuffledPool.sort((a, b) => b.score - a.score);

    const teamStats = Array.from({ length: nTeams }, () => ({
      members: [],
      totalScore: 0,
    }));

    // greedy assign: selalu masukkan ke tim dengan skor total terkecil
    for (const p of shuffledPool) {
      teamStats.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
        return a.members.length - b.members.length;
      });
      teamStats[0].members.push(p);
      teamStats[0].totalScore += p.score;
    }

    // ratakan jumlah anggota antar tim (selisih maksimal 1)
    let stabilized = false;
    while (!stabilized) {
      const sizes = teamStats.map((t) => t.members.length);
      const maxSize = Math.max(...sizes);
      const minSize = Math.min(...sizes);
      if (maxSize - minSize <= 1) {
        stabilized = true;
        break;
      }
      const iMax = teamStats.findIndex((t) => t.members.length === maxSize);
      const iMin = teamStats.findIndex((t) => t.members.length === minSize);

      teamStats[iMax].members.sort((a, b) => a.score - b.score);
      const moved = teamStats[iMax].members.shift();
      if (!moved) break;
      teamStats[iMax].totalScore -= moved.score;
      teamStats[iMin].members.push(moved);
      teamStats[iMin].totalScore += moved.score;
    }

    teams.value = teamStats.map((t) =>
      shuffleArray(t.members.map(({ id, name, level }) => ({ id, name, level })))
    );
  } else {
    const shuffled = shuffleArray(players.value);
    teams.value = Array.from({ length: nTeams }, () => []);
    shuffled.forEach((p, i) => {
      teams.value[i % nTeams].push({ id: p.id, name: p.name, level: p.level || null });
    });
  }

  hasGenerated.value = true;
  toast.success("Tim berhasil dibuat!");
}

function assignPlayerToTeam(player, teamIdx) {
  teams.value[teamIdx].push({ id: player.id, name: player.name, level: player.level || null });
  toast.success(`${player.name} masuk ke Tim ${teamIdx + 1}.`);
}

function assignPlayerToNewTeam(player) {
  teams.value.push([{ id: player.id, name: player.name, level: player.level || null }]);
  teamCount.value = teams.value.length;
  toast.success(`${player.name} membentuk Tim ${teams.value.length} baru.`);
}

function autoAssignPlayer(player) {
  if (teams.value.length === 0) {
    assignPlayerToNewTeam(player);
    return;
  }
  assignPlayerToTeam(player, leastLoadedTeamIndex());
}

function handlePendingAssign(player, value) {
  if (value === "auto") autoAssignPlayer(player);
  else if (value === "new") assignPlayerToNewTeam(player);
  else assignPlayerToTeam(player, value);
}

function autoAssignAllPending() {
  const targets = [...pendingPlayers.value];
  targets.forEach((p) => autoAssignPlayer(p));
  toast.success("Semua pemain baru berhasil ditempatkan.");
}

function toggleMoveMember(memberId) {
  movingMemberId.value = movingMemberId.value === memberId ? null : memberId;
}

function moveMember(fromTeamIdx, member, value) {
  const fromTeam = teams.value[fromTeamIdx];
  const i = fromTeam.findIndex((m) => m.id === member.id);
  if (i === -1) return;
  fromTeam.splice(i, 1);

  if (value === "new") {
    teams.value.push([member]);
    teamCount.value = teams.value.length;
    toast.success(`${member.name} pindah ke Tim ${teams.value.length} (baru).`);
  } else if (value === "auto") {
    const targetIdx = leastLoadedTeamIndex();
    teams.value[targetIdx].push(member);
    toast.success(`${member.name} dipindah otomatis ke Tim ${targetIdx + 1}.`);
  } else {
    teams.value[value].push(member);
    toast.success(`${member.name} pindah ke Tim ${value + 1}.`);
  }
}

function performDisbandTeam(idx) {
  teams.value.splice(idx, 1);
  toast.info(`Tim ${idx + 1} dibubarkan.`);
}

function disbandTeam(idx) {
  const team = teams.value[idx];
  if (team.length > 0) {
    confirmDialog.value = {
      title: "Bubarkan tim ini?",
      message: `Bubarkan Tim ${idx + 1}? ${team.length} pemain akan kembali ke daftar belum masuk tim.`,
      variant: "danger",
      onConfirm: () => performDisbandTeam(idx),
    };
    return;
  }
  performDisbandTeam(idx);
}

function handleCreateCupClick() {
  if (teams.value.length < 2) {
    toast.error("Generate minimal 2 tim terlebih dahulu.");
    return;
  }
  if (pendingPlayers.value.length > 0) {
    toast.info(
      `${pendingPlayers.value.length} pemain belum masuk tim. Atur di bawah, atau lanjutkan tanpa mereka.`
    );
    pendingHighlight.value = true;
    pendingPanelRef.value?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      pendingHighlight.value = false;
    }, 1600);
    return;
  }
  handleCreateCup();
}

function handleCreateCup() {
  if (teams.value.length < 2) {
    toast.error("Generate minimal 2 tim terlebih dahulu.");
    return;
  }

  cupStore.initializeCup({
    players: players.value,
    teams: teams.value,
    useLevel: useLevel.value,
    teamCount: teamCount.value,
    tournamentType: tournamentType.value,
  });

  router.push("/create-cup");
}

function getTeamsText(forWhatsApp = false) {
  let text = forWhatsApp ? "*Hasil Generate Tim:*\n\n" : "Hasil Generate Tim:\n\n";

  teams.value.forEach((team, idx) => {
    text += forWhatsApp ? `*Tim ${idx + 1}:*\n` : `Tim ${idx + 1}:\n`;
    team.forEach((p) => {
      text += `- ${p.name}${useLevel.value && p.level ? " (" + p.level + ")" : ""}\n`;
    });
    text += "\n";
  });

  text += forWhatsApp ? "_Generate by *randomix*_" : "Generate by randomix";
  return text;
}

async function copyText() {
  const text = getTeamsText(false);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("Clipboard API tidak tersedia");
    }
    toast.success("Hasil tim berhasil disalin!");
  } catch (err) {
    console.error("Gagal menyalin teks:", err);
    toast.error("Gagal menyalin teks. Coba salin manual.");
  }
}

function shareWhatsApp() {
  const text = encodeURIComponent(getTeamsText(true));
  const url = `https://wa.me/?text=${text}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error("Popup diblokir browser. Aktifkan izin popup untuk membagikan ke WhatsApp.");
  }
}

async function downloadImage() {
  if (isGeneratingImage.value) return;
  isGeneratingImage.value = true;
  try {
    if (!html2canvasModule) {
      const module = await import("html2canvas");
      html2canvasModule = module.default;
    }
    const element = document.querySelector("#export-capture");
    const canvas = await html2canvasModule(element, { scale: 2, width: 720, height: 1280 });
    const link = document.createElement("a");
    link.download = "randomix_hasil-generate-tim.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (err) {
    console.error("Gagal membuat gambar:", err);
    toast.error("Gagal membuat gambar. Silakan coba lagi.");
  } finally {
    isGeneratingImage.value = false;
  }
}

async function downloadPDF() {
  if (isGeneratingPDF.value) return;
  isGeneratingPDF.value = true;
  try {
    if (!jsPDFModule) {
      const module = await import("jspdf");
      jsPDFModule = module.default;
    }
    const pdf = new jsPDFModule("p", "mm", "a4");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Hasil Generate Tim", 105, 20, { align: "center" });

    let y = 35;

    teams.value.forEach((team, idx) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.text(`Tim ${idx + 1}`, 15, y);
      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      team.forEach((p) => {
        const textLine = `- ${p.name}${useLevel.value && p.level ? " (" + p.level + ")" : ""}`;
        pdf.text(textLine, 20, y);
        y += 7;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });

      y += 5;
    });

    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.setFont("helvetica", "italic");
    pdf.text("Generate by randomix", 105, 290, { align: "center" });

    pdf.save("randomix_hasil-generate-tim.pdf");
  } catch (err) {
    console.error("Gagal membuat PDF:", err);
    toast.error("Gagal membuat PDF. Silakan coba lagi.");
  } finally {
    isGeneratingPDF.value = false;
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.6s ease forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scaleIn {
  animation: scaleIn 0.8s ease forwards;
}

.randomix {
  font-family: "MuseoModerno", cursive;
  font-style: italic;
  font-weight: 500;
  word-spacing: -10px;
  margin-top: 2px;
}
</style>
