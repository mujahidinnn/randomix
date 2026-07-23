<template>
  <main
    class="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-400 to-blue-500 p-6"
  >
    <!-- Header -->
    <div
      class="relative mb-6 flex h-max w-full max-w-md animate-scaleIn items-center justify-center"
    >
      <NuxtLink
        to="/"
        aria-label="Kembali ke beranda"
        class="absolute left-0 top-3 rounded-full bg-white/20 p-3 font-bold text-white shadow transition hover:bg-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>

      <img
        src="/randomix-white.png"
        alt="Logo Randomix"
        width="497"
        height="123"
        class="w-60 md:w-80"
      />
    </div>

    <h1 class="sr-only">Generate Tim Olahraga Secara Acak</h1>

    <!-- Panel Form -->
    <section
      aria-labelledby="form-heading"
      class="w-full max-w-md rounded-2xl border border-white/20 bg-white/20 p-6 shadow-lg backdrop-blur-md"
    >
      <h2 id="form-heading" class="sr-only">Tambah Pemain</h2>

      <!-- Checkbox Level -->
      <div class="mb-4 flex items-center gap-2 text-white">
        <input
          id="use-level"
          v-model="useLevel"
          type="checkbox"
          class="h-5 w-5 rounded border-0 accent-white outline-none focus-visible:ring-2 focus-visible:ring-white"
        />
        <label for="use-level" class="text-sm font-medium sm:text-base">
          Gunakan Level
        </label>
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
            class="w-full rounded-lg bg-white px-4 py-2 text-black placeholder-gray-500 shadow-sm outline-none transition focus:shadow-md focus:ring-2 focus:ring-white/70"
          />
          <p
            id="player-name-error"
            class="mt-1 min-h-[1.1rem] text-xs font-medium text-red-100"
            aria-live="polite"
          >
            {{ nameError }}
          </p>
        </div>

        <div v-if="useLevel">
          <label for="player-level" class="sr-only">Level pemain</label>
          <select
            id="player-level"
            v-model="playerLevel"
            class="w-full rounded-lg bg-white px-3 py-2 text-black shadow-sm outline-none transition focus:shadow-md focus:ring-2 focus:ring-white/70"
          >
            <option value="Newbie">Newbie</option>
            <option value="Middle">Middle</option>
            <option value="Pro">Pro</option>
          </select>
        </div>

        <BaseButton type="submit" :disabled="!canAddPlayer">
          Tambah Pemain
        </BaseButton>
      </form>

      <!-- Info jumlah pemain -->
      <p v-if="players.length" class="mt-4 text-sm text-white" aria-live="polite">
        {{ players.length }} pemain{{ maxPlayersReached ? ` (maksimal ${MAX_PLAYERS})` : "" }}
      </p>

      <!-- List Pemain -->
      <ul
        class="max-h-52 overflow-y-auto pr-1"
        :class="{ 'border-t border-white/30 pt-3': players.length > 0 }"
      >
        <template v-if="players.length">
          <li
            v-for="(p, idx) in players"
            :key="p.id"
            class="mb-2 flex items-center justify-between rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30 hover:shadow sm:text-base"
          >
            <span class="flex items-center gap-2">
              <span class="text-white drop-shadow">{{ p.name }}</span>
              <span
                v-if="useLevel"
                class="rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium text-white drop-shadow sm:text-sm"
              >
                {{ p.level }}
              </span>
            </span>
            <button
              type="button"
              :aria-label="`Hapus pemain ${p.name}`"
              class="rounded-full p-1 text-red-400 transition hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              @click="removePlayer(idx)"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        </template>
        <EmptyState v-else message="Belum ada pemain" :icon="InboxIcon" />
      </ul>

      <!-- Jumlah Tim -->
      <div class="mt-4">
        <div class="flex items-center gap-3">
          <label for="team-count" class="whitespace-nowrap text-sm font-semibold text-white sm:text-base">
            Jumlah Tim:
          </label>
          <input
            id="team-count"
            v-model.number="teamCount"
            type="number"
            min="2"
            :max="Math.max(players.length, 2)"
            :aria-invalid="!!teamCountError"
            aria-describedby="team-count-error"
            class="w-full rounded-lg px-3 py-2 text-black shadow-sm outline-none transition focus:shadow-md focus:ring-2 focus:ring-white/70"
            @change="clampTeamCount"
          />
        </div>
        <p id="team-count-error" class="mt-1 min-h-[1.1rem] text-xs font-medium text-red-100" aria-live="polite">
          {{ teamCountError }}
        </p>
      </div>

      <!-- Tombol Generate -->
      <BaseButton
        class="mt-2 w-full"
        size="lg"
        :disabled="players.length < 2 || teamCount < 2"
        @click="generateTeams"
      >
        <template #icon>
          <ArrowPathRoundedSquareIcon v-if="teams.length" class="h-5 w-5" aria-hidden="true" />
          <BoltIcon v-else class="h-5 w-5" aria-hidden="true" />
        </template>
        {{ teams.length ? "Generate Ulang" : "Generate Tim" }}
      </BaseButton>

      <!-- Tombol Buat Cup -->
      <BaseButton
        v-if="teams.length"
        class="mt-4 w-full"
        size="lg"
        @click="handleCreateCup"
      >
        <template #icon>
          <TrophyIcon class="h-5 w-5" aria-hidden="true" />
        </template>
        Buat Cup Turnamen
      </BaseButton>
    </section>

    <!-- Aksi Result -->
    <div
      v-if="teams.length"
      class="mt-4 flex w-full flex-wrap items-center justify-center gap-3"
    >
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
      v-if="teams.length"
      id="hasil-tim"
      class="mt-2 grid w-full max-w-5xl grid-cols-1 gap-5 p-6 sm:grid-cols-2 md:grid-cols-3"
    >
      <div
        v-for="(team, idx) in teams"
        :key="idx"
        class="animate-fadeIn rounded-xl p-4 text-white shadow-lg"
        :style="{ backgroundColor: teamColors[idx % teamColors.length] }"
      >
        <h3 class="mb-2 text-sm font-bold sm:text-base">Tim {{ idx + 1 }}</h3>
        <ul class="space-y-1 text-xs sm:text-sm">
          <li v-for="(p, i) in team" :key="i">
            {{ p.name }} <span v-if="useLevel && p.level">({{ p.level }})</span>
          </li>
        </ul>
      </div>
    </div>

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
                <li v-for="(p, i) in team" :key="i">
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
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  XMarkIcon,
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
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
  ogImage: ogImageUrl,
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl,
  robots: "index, follow",
});
useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/generate` }],
});

const toast = useToast();

const MAX_PLAYERS = 64;
const MAX_NAME_LENGTH = 30;

const playerName = ref("");
const playerLevel = ref("Newbie");
const useLevel = ref(false);
const players = ref([]);
const teamCount = ref(2);
const teams = ref([]);
const teamColors = ["#00b894", "#0096c7", "#e6b23c", "#e17055", "#6c5ce7"];

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
}

function removePlayer(idx) {
  players.value.splice(idx, 1);
}

function clampTeamCount() {
  const max = Math.max(players.value.length, 2);
  if (teamCount.value > max) {
    teamCount.value = max;
    teamCountError.value = `Jumlah tim tidak boleh melebihi jumlah pemain (${max}).`;
  } else if (teamCount.value < 2) {
    teamCount.value = 2;
    teamCountError.value = "Minimal 2 tim.";
  } else {
    teamCountError.value = "";
  }
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
    const scoreMap = { Pro: 3, Middle: 2, Newbie: 1 };

    const pool = players.value.map((p) => ({
      name: p.name,
      level: p.level || "Newbie",
      score: scoreMap[p.level] || scoreMap.Newbie,
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

    teams.value = teamStats.map((t) => shuffleArray(t.members.map(({ name, level }) => ({ name, level }))));
  } else {
    const shuffled = shuffleArray(players.value);
    teams.value = Array.from({ length: nTeams }, () => []);
    shuffled.forEach((p, i) => {
      teams.value[i % nTeams].push({ name: p.name, level: p.level || null });
    });
  }

  toast.success("Tim berhasil dibuat!");
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
