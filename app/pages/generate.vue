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

      <!-- List Pemain -->
      <ul
        class="mt-4 max-h-52 overflow-y-auto pr-1"
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

    <!-- Hasil Tim -->
    <div
      v-if="teams.length"
      class="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6"
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
} from "@heroicons/vue/24/solid";

const playerName = ref("");
const playerLevel = ref("Newbie");
const useLevel = ref(false);
const players = ref([]);
const teamCount = ref(2);
const teams = ref([]);
const teamColors = ["#00b894", "#0096c7", "#e6b23c", "#e17055", "#6c5ce7"];

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
</style>
