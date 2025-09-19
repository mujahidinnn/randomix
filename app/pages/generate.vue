<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-6 flex flex-col items-center"
  >
    <!-- Tombol Back -->
    <div
      class="animate-scaleIn mb-6 flex items-center justify-center relative w-full max-w-md h-max"
    >
      <NuxtLink
        to="/"
        class="absolute left-0 top-3 p-3 bg-white/20 text-white text-blue-600 font-bold rounded-full shadow hover:bg-white/30 transition"
      >
        <ArrowLeftIcon class="w-5 h-5" />
      </NuxtLink>

      <!-- Logo -->
      <img src="/randomix-white.png" alt="Randomix" class="w-60 md:w-80" />
    </div>

    <!-- Panel Form -->
    <div
      class="w-full max-w-md bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20"
    >
      <!-- Checkbox Level -->
      <div class="flex items-center gap-2 text-white mb-4">
        <label class="text-sm sm:text-base font-medium">Gunakan Level</label>
        <input
          type="checkbox"
          v-model="useLevel"
          class="w-5 h-5 accent-white border-0 outline-none focus:ring-0"
        />
      </div>

      <!-- Input Pemain -->
      <div class="flex flex-col gap-3">
        <input
          v-model="playerName"
          type="text"
          placeholder="Nama pemain"
          class="px-4 py-2 rounded-lg text-black placeholder-gray-500 shadow-sm focus:shadow-md focus:ring-2 focus:ring-white/70 outline-none transition bg-white"
        />

        <select
          v-if="useLevel"
          v-model="playerLevel"
          class="px-3 py-2 rounded-lg text-black shadow-sm focus:shadow-md focus:ring-2 focus:ring-white/70 outline-none transition bg-white"
        >
          <option value="Newbie">Newbie</option>
          <option value="Middle">Middle</option>
          <option value="Pro">Pro</option>
        </select>

        <button
          @click="addPlayer"
          :disabled="!playerName.trim()"
          class="px-4 py-2 bg-white text-blue-500 font-bold rounded-lg shadow-md flex items-center justify-center transition hover:bg-gray-200 disabled:bg-white/90 disabled:text-blue-400 disabled:cursor-not-allowed"
        >
          Tambah Pemain
        </button>
      </div>

      <!-- Info jumlah pemain -->
      <p v-if="players.length" class="mt-4 text-white text-sm">
        {{ players.length + " pemain" }}
      </p>
      <!-- List Pemain -->
      <ul
        class="max-h-52 overflow-y-auto pr-1"
        :class="{ 'border-t border-white/30 pt-3': players.length > 0 }"
      >
        <template v-if="players.length">
          <li
            v-for="(p, idx) in players"
            :key="idx"
            class="flex justify-between items-center mb-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 font-semibold text-sm sm:text-base hover:bg-white/30 hover:shadow transition"
          >
            <span class="flex items-center gap-2">
              <span class="text-white drop-shadow">{{ p.name }}</span>
              <span
                v-if="useLevel"
                class="bg-white/25 text-white text-xs sm:text-sm px-2 py-0.5 rounded-full font-medium drop-shadow"
              >
                {{ p.level }}
              </span>
            </span>
            <button
              @click="removePlayer(idx)"
              class="text-red-400 hover:text-red-500 font-bold transition"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </li>
        </template>
        <template v-else>
          <li class="text-white/70 italic text-center py-5">
            <div class="flex justify-center items-center gap-2">
              <InboxIcon class="w-4 h-4" />
              <p>Belum ada pemain</p>
            </div>
          </li>
        </template>
      </ul>

      <!-- Jumlah Tim -->
      <div class="mt-4 flex items-center gap-3">
        <label
          class="text-white font-semibold text-sm sm:text-base whitespace-nowrap"
        >
          Jumlah Tim:
        </label>
        <input
          type="number"
          v-model.number="teamCount"
          min="2"
          :max="players.length"
          class="w-full px-3 py-2 rounded-lg text-black shadow-sm focus:shadow-md focus:ring-2 focus:ring-white/70 outline-none transition"
        />
      </div>

      <!-- Tombol Generate -->
      <button
        @click="generateTeams"
        :disabled="players.length < 2 || teamCount < 2"
        class="mt-4 w-full px-6 py-3 bg-white text-blue-500 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:bg-white/90 disabled:text-blue-400 disabled:cursor-not-allowed hover:bg-gray-200"
      >
        <ArrowPathRoundedSquareIcon v-if="teams.length" class="w-5 h-5" />
        <BoltIcon v-else class="w-5 h-5" />
        <span>{{ teams.length ? "Generate Ulang" : "Generate Tim" }}</span>
      </button>
    </div>

    <!-- Aksi Result -->
    <div
      v-if="teams.length"
      class="w-full flex justify-center flex-wrap items-center gap-3 mt-4"
    >
      <button
        @click="downloadPDF"
        class="px-4 py-2 text-xs sm:text-sm bg-white text-blue-500 font-bold rounded-lg shadow hover:bg-gray-200 transition flex"
      >
        <DocumentIcon class="w-4 h-4" />
        <p>Download PDF</p>
      </button>
      <button
        @click="downloadImage"
        class="px-4 py-2 text-xs sm:text-sm bg-white text-blue-500 font-bold rounded-lg shadow hover:bg-gray-200 transition flex"
      >
        <PhotoIcon class="w-4 h-4" />
        <p>Download Gambar</p>
      </button>
      <button
        @click="copyText"
        class="px-4 py-2 text-xs sm:text-sm bg-white text-blue-500 font-bold rounded-lg shadow hover:bg-gray-200 transition flex"
      >
        <DocumentDuplicateIcon class="w-4 h-4" />
        <p>Salin Teks</p>
      </button>
      <button
        @click="shareWhatsApp"
        class="px-4 py-2 text-xs sm:text-sm bg-white text-blue-500 font-bold rounded-lg shadow hover:bg-gray-200 transition flex"
      >
        <ChatBubbleOvalLeftIcon class="w-4 h-4" />
        <p>Share WhatsApp</p>
      </button>
    </div>

    <!-- Hasil Tim -->
    <div
      v-if="teams.length"
      id="hasil-tim"
      class="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 p-6"
    >
      <div
        v-for="(team, idx) in teams"
        :key="idx"
        class="p-4 rounded-xl shadow-lg text-white animate-fadeIn"
        :style="{ backgroundColor: teamColors[idx % teamColors.length] }"
      >
        <h2 class="font-bold text-sm sm:text-base mb-2">Tim {{ idx + 1 }}</h2>
        <ul class="text-xs sm:text-sm space-y-1">
          <li v-for="(p, i) in team" :key="i">
            {{ p.name }} <span v-if="useLevel && p.level">({{ p.level }})</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Export container - result download image - hidden -->
    <div class="absolute opacity-0 pointer-events-none" aria-hidden="true">
      <div
        id="export-capture"
        class="bg-white p-6 shadow-lg aspect-[9/16] flex flex-col justify-between w-full max-w-[480px] mx-auto rounded-2xl"
      >
        <!-- Header -->
        <div>
          <img
            src="/randomix.png"
            alt="randomix"
            class="w-28 sm:w-36 mx-auto"
          />
          <!-- Isi grid tim -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div
              v-for="(team, idx) in teams"
              :key="idx"
              class="p-4 rounded-xl text-white"
              :style="{ backgroundColor: teamColors[idx % teamColors.length] }"
            >
              <h2 class="font-bold text-lg sm:text-xl mb-2">
                Tim {{ idx + 1 }}
              </h2>
              <ul class="text-sm sm:text-base space-y-1">
                <li v-for="(p, i) in team" :key="i">
                  {{ p.name }}
                  <span v-if="useLevel && p.level">({{ p.level }})</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Footer -->
        <p class="text-xs text-gray-500 italic text-center pt-6">
          Generate by <span class="randomix">randomix</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
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
} from "@heroicons/vue/24/solid";

import html2canvas from "html2canvas";

let jsPDF;

const playerName = ref("");
const playerLevel = ref("Newbie");
const useLevel = ref(false);
const players = ref([]);
const teamCount = ref(2);
const teams = ref([]);
const teamColors = ["#00b894", "#0096c7", "#e6b23c", "#e17055", "#6c5ce7"];

onMounted(async () => {
  const module = await import("jspdf");
  jsPDF = module.default;
});

function addPlayer() {
  if (!playerName.value.trim()) return;
  players.value.push({
    name: playerName.value.trim(),
    level: useLevel.value ? playerLevel.value : null,
  });
  playerName.value = "";
  if (useLevel.value) playerLevel.value = "Newbie";
}

function removePlayer(idx) {
  players.value.splice(idx, 1);
}

function generateTeams() {
  teams.value = Array.from({ length: teamCount.value }, () => []);
  if (useLevel.value) {
    const levels = ["Pro", "Middle", "Newbie"];
    const levelGroups = {};
    levels.forEach((lvl) => {
      levelGroups[lvl] = players.value.filter((p) => p.level === lvl);
      shuffleArray(levelGroups[lvl]); // acak tiap level
    });

    let teamIdx = 0;
    let remaining = true;

    while (remaining) {
      remaining = false;
      levels.forEach((lvl) => {
        if (levelGroups[lvl].length) {
          teams.value[teamIdx % teamCount.value].push(levelGroups[lvl].shift());
          teamIdx++;
          remaining = true;
        }
      });
    }
  } else {
    const allPlayers = [...players.value];
    shuffleArray(allPlayers);
    allPlayers.forEach((p, i) => {
      teams.value[i % teamCount.value].push(p);
    });
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getTeamsText(forWhatsApp = false) {
  let text = forWhatsApp
    ? "*Hasil Generate Tim:*\n\n"
    : "Hasil Generate Tim:\n\n";

  teams.value.forEach((team, idx) => {
    text += forWhatsApp ? `*Tim ${idx + 1}:*\n` : `Tim ${idx + 1}:\n`;
    team.forEach((p) => {
      text += `- ${p.name}${
        useLevel.value && p.level ? " (" + p.level + ")" : ""
      }\n`;
    });
    text += "\n";
  });

  text += forWhatsApp
    ? "_Generate by *randomix*_" // WhatsApp style
    : "Generate by randomix"; // normal plain

  return text;
}

function copyText() {
  const text = getTeamsText(false);
  navigator.clipboard.writeText(text);
  alert("✅ Hasil tim berhasil disalin!");
}

function shareWhatsApp() {
  const text = encodeURIComponent(getTeamsText(true));
  const url = `https://wa.me/?text=${text}`;
  window.open(url, "_blank");
}

function downloadImage() {
  const element = document.querySelector("#export-capture");
  html2canvas(element, {
    scale: 2,
    width: 720,
    height: 1280,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = "randomix_hasil-generate-tim.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function downloadPDF() {
  if (!jsPDF) return;
  const pdf = new jsPDF("p", "mm", "a4");

  // Judul
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Hasil Generate Tim", 105, 20, { align: "center" });

  let y = 35;

  teams.value.forEach((team, idx) => {
    // Nama tim
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(`Tim ${idx + 1}`, 15, y);
    y += 8;

    // Anggota tim
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    team.forEach((p) => {
      const textLine = `- ${p.name}${
        useLevel.value && p.level ? " (" + p.level + ")" : ""
      }`;
      pdf.text(textLine, 20, y);
      y += 7;

      // cek overflow -> new page
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    y += 5;
  });

  // Footer kecil
  pdf.setFontSize(10);
  pdf.setTextColor(150);
  pdf.setFont("helvetica", "italic");
  pdf.text("Generate by randomix", 105, 290, { align: "center" });

  pdf.save("randomix_hasil-generate-tim.pdf");
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
