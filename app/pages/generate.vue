<template>
  <main
    class="page-shell flex min-h-screen flex-col items-center pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))]"
    :style="{ paddingBottom: mobilePaddingBottom }"
  >
    <div
      class="relative mb-4 flex h-max w-full max-w-md animate-scaleIn items-center justify-center sm:mb-6 sm:max-w-xl md:max-w-3xl lg:max-w-6xl"
      style="animation-duration: 0.5s"
    >
      <NuxtLink
        to="/"
        :aria-label="t('generate.header.back')"
        class="clay-raised absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--clay-surface-alt)] font-bold text-[var(--clay-text)] transition"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>

      <img
        src="/randomix-white.png"
        :alt="t('common.logoAlt')"
        width="497"
        height="123"
        class="w-52 drop-shadow-sm sm:w-64 md:w-80"
      />
    </div>

    <h1 class="sr-only">{{ t("generate.header.title") }}</h1>

    <ol
      class="mb-4 flex w-full max-w-md items-center justify-center gap-1.5 text-[11px] font-semibold text-[var(--page-text-muted)] sm:max-w-xl sm:text-xs md:max-w-3xl lg:max-w-6xl"
      aria-hidden="true"
    >
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(1) ? 'bg-white/25 text-white' : ''"
      >
        {{ t("generate.header.step1") }}
      </li>
      <li class="opacity-50">→</li>
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(2) ? 'bg-white/25 text-white' : ''"
      >
        {{ t("generate.header.step2") }}
      </li>
      <li class="opacity-50">→</li>
      <li
        class="rounded-full px-2 py-1 transition"
        :class="stepActive(3) ? 'bg-white/25 text-white' : ''"
      >
        {{ t("generate.header.step3") }}
      </li>
    </ol>

    <div class="grid w-full max-w-md gap-6 sm:max-w-xl md:max-w-3xl lg:max-w-6xl lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8">
      <section
        aria-labelledby="form-heading"
        class="clay-surface clay-raised w-full p-5 sm:p-6"
      >
      <h2 id="form-heading" class="sr-only">{{ t("generate.form.heading") }}</h2>

      <div class="mb-4 flex items-center gap-3 text-[var(--clay-text)]">
        <BaseToggle v-model="useLevel" :label="t('generate.form.useLevel')" />
        <span class="cursor-pointer text-sm font-medium sm:text-base" @click="useLevel = !useLevel">
          {{ t("generate.form.useLevel") }}
        </span>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent="addPlayer">
        <div>
          <label for="player-name" class="sr-only">{{ t("generate.form.nameLabel") }}</label>
          <input
            id="player-name"
            v-model="playerName"
            type="text"
            :placeholder="t('generate.form.namePlaceholder')"
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
          <span class="mb-1.5 block text-xs font-semibold text-[var(--clay-text)]">{{ t("generate.form.levelLabel") }}</span>
          <div class="grid grid-cols-3 gap-2" role="radiogroup" :aria-label="t('generate.form.levelLabel')">
            <button
              v-for="lvl in levelOptions"
              :key="lvl.value"
              type="button"
              role="radio"
              :aria-checked="playerLevel === lvl.value"
              class="rounded-xl px-3 py-2 text-sm font-bold transition"
              :class="
                playerLevel === lvl.value
                  ? 'clay-raised bg-[var(--clay-accent)] text-white'
                  : 'clay-inset text-[var(--clay-text-muted)]'
              "
              @click="playerLevel = lvl.value"
            >
              {{ lvl.label }}
            </button>
          </div>
        </div>

        <BaseButton type="submit" :disabled="!canAddPlayer">
          {{ t("generate.form.submit") }}
        </BaseButton>
      </form>

      <div v-if="players.length" class="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
          <span class="rounded-full bg-black/5 px-2.5 py-1 font-semibold text-[var(--clay-text)]">
            {{ t("generate.playerList.total", { count: players.length }) }}
          </span>
          <template v-if="useLevel">
            <span class="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
              {{ t("generate.playerList.levelCount", { level: t("generate.levels.newbie"), count: levelCounts.Newbie }) }}
            </span>
            <span class="rounded-full bg-sky-100 px-2.5 py-1 font-semibold text-sky-700">
              {{ t("generate.playerList.levelCount", { level: t("generate.levels.middle"), count: levelCounts.Middle }) }}
            </span>
            <span class="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-700">
              {{ t("generate.playerList.levelCount", { level: t("generate.levels.pro"), count: levelCounts.Pro }) }}
            </span>
          </template>
          <span v-if="maxPlayersReached" class="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-700">
            {{ t("generate.playerList.max", { max: MAX_PLAYERS }) }}
          </span>
        </div>
        <button
          type="button"
          class="text-xs font-semibold text-rose-500 underline-offset-2 transition hover:underline sm:text-sm"
          @click="handleClearAllPlayers"
        >
          {{ t("generate.playerList.clearAll") }}
        </button>
      </div>

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
                {{ t("generate.playerList.pendingBadge") }}
              </span>
            </span>
            <button
              type="button"
              :aria-label="t('generate.playerList.removeAria', { name: p.name })"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-rose-400 transition hover:bg-black/5 hover:text-rose-500"
              @click="removePlayer(idx)"
            >
              <XMarkIcon class="h-5 w-5" aria-hidden="true" />
            </button>
          </li>
        </template>
        <EmptyState v-else :message="t('generate.playerList.empty')" :icon="InboxIcon" />
      </ul>

      <div
        v-if="pendingPlayers.length"
        ref="pendingPanelRef"
        class="clay-surface mt-4 p-4 transition"
        :class="pendingHighlight ? 'ring-2 ring-amber-300' : ''"
      >
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-bold text-amber-900 sm:text-base">
            {{ t("generate.pending.heading", { count: pendingPlayers.length }) }}
          </h3>
          <BaseButton variant="accent" size="sm" @click="autoAssignAllPending">
            {{ t("generate.pending.autoAll") }}
          </BaseButton>
        </div>
        <p class="mb-3 text-xs text-amber-800/80">
          {{ t("generate.pending.helper") }}
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
              :label="t('generate.pending.assignLabel', { name: p.name })"
              @assign="(value) => handlePendingAssign(p, value)"
            />
          </li>
        </ul>
        <button
          type="button"
          class="mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-[var(--clay-text)] transition hover:bg-black/5 sm:text-sm"
          @click="handleCreateCup"
        >
          {{ t("generate.pending.continueWithout") }}
        </button>
      </div>

      <div class="mt-4 hidden sm:block">
        <div>
          <div class="flex items-center gap-3">
            <label for="team-count-desktop" class="whitespace-nowrap text-sm font-semibold text-[var(--clay-text)] sm:text-base">
              {{ t("generate.teamCount.label") }}
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
          {{ teams.length ? t("generate.teamCount.regenerate") : t("generate.teamCount.generate") }}
        </BaseButton>

        <div v-if="teams.length" class="mt-3">
          <p class="mb-1.5 text-xs font-semibold text-[var(--clay-text)] sm:text-sm">{{ t("generate.teamCount.tournamentType") }}</p>
          <CupTypeSelector v-model="tournamentType" />
        </div>

        <BaseButton v-if="teams.length" class="mt-3 w-full" variant="accent" size="lg" @click="handleCreateCupClick">
          <template #icon>
            <TrophyIcon class="h-5 w-5" aria-hidden="true" />
          </template>
          {{ t("generate.teamCount.createCup") }}
        </BaseButton>
      </div>
      </section>

      <div class="flex min-w-0 flex-col gap-4">
        <div v-if="!teams.length" class="clay-surface clay-raised">
          <EmptyState :message="t('generate.results.empty')" :icon="TrophyIcon" />
        </div>

        <template v-else>
          <div class="flex w-full flex-wrap items-center justify-center gap-3 lg:justify-start">
            <BaseButton variant="secondary" size="sm" :loading="isGeneratingPDF" @click="downloadPDF">
              <template #icon><DocumentIcon class="h-4 w-4" aria-hidden="true" /></template>
              {{ t("common.export.downloadPdf") }}
            </BaseButton>
            <BaseButton variant="secondary" size="sm" :loading="isGeneratingImage" @click="downloadImage">
              <template #icon><PhotoIcon class="h-4 w-4" aria-hidden="true" /></template>
              {{ t("common.export.downloadImage") }}
            </BaseButton>
            <BaseButton variant="secondary" size="sm" @click="copyText">
              <template #icon><DocumentDuplicateIcon class="h-4 w-4" aria-hidden="true" /></template>
              {{ t("common.export.copyText") }}
            </BaseButton>
            <BaseButton variant="secondary" size="sm" @click="shareWhatsApp">
              <template #icon><ChatBubbleOvalLeftIcon class="h-4 w-4" aria-hidden="true" /></template>
              {{ t("common.export.shareWhatsapp") }}
            </BaseButton>
          </div>

          <div
            id="hasil-tim"
            class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
      <div
        v-for="(team, idx) in teams"
        :key="idx"
        class="clay-raised animate-scaleIn rounded-2xl p-4 text-white"
        :style="{
          backgroundColor: teamColors[idx % teamColors.length],
          transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)`,
          animationDelay: `${idx * 0.08}s`,
        }"
      >
        <div class="mb-2 flex items-center justify-between gap-2">
          <h3 class="text-sm font-bold sm:text-base">
            {{ t("generate.results.teamHeading", { number: idx + 1, count: team.length }) }}
          </h3>
          <button
            type="button"
            class="rounded-full bg-black/10 px-2 py-1 text-[10px] font-semibold text-white/90 transition hover:bg-black/20 sm:text-xs"
            @click="disbandTeam(idx)"
          >
            {{ t("generate.results.disband") }}
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
                :aria-label="t('generate.results.moveMemberAria', { name: p.name })"
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
              :label="t('generate.results.moveMemberLabel', { name: p.name })"
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

    <Teleport to="body">
      <div
        ref="mobileFooterRef"
        class="clay-surface clay-raised fixed inset-x-0 bottom-0 z-30 rounded-b-none pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:hidden"
      >
        <div class="mx-auto mb-2 h-1 w-10 rounded-full bg-black/10" aria-hidden="true" />
        <div class="mx-auto flex w-full max-w-md flex-col gap-3">
          <div>
            <div class="flex items-center gap-3">
              <label for="team-count-mobile" class="whitespace-nowrap text-sm font-semibold text-[var(--clay-text)]">
                {{ t("generate.teamCount.label") }}
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
            {{ teams.length ? t("generate.teamCount.regenerate") : t("generate.teamCount.generate") }}
          </BaseButton>

          <div v-if="teams.length">
            <p class="mb-1.5 text-xs font-semibold text-[var(--clay-text)]">{{ t("generate.teamCount.tournamentType") }}</p>
            <CupTypeSelector v-model="tournamentType" />
          </div>

          <BaseButton v-if="teams.length" variant="accent" size="lg" @click="handleCreateCupClick">
            <template #icon>
              <TrophyIcon class="h-5 w-5" aria-hidden="true" />
            </template>
            {{ t("generate.teamCount.createCup") }}
          </BaseButton>
        </div>
      </div>
    </Teleport>

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
              <h2 class="mb-2 text-lg font-bold sm:text-xl">{{ t("generate.exportCapture.teamHeading", { number: idx + 1 }) }}</h2>
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
          {{ t("common.export.generateBy") }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
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

const { t } = useI18n();

const config = useRuntimeConfig();
const ogImageUrl = new URL("/randomix.png", config.public.siteUrl).toString();

useSeoMeta({
  title: () => t("generate.seo.title"),
  description: () => t("generate.seo.description"),
  ogTitle: () => t("generate.seo.ogTitle"),
  ogDescription: () => t("generate.seo.ogDescription"),
  ogUrl: `${config.public.siteUrl}/generate`,
  ogImage: ogImageUrl,
  ogImageWidth: 498,
  ogImageHeight: 129,
  ogImageAlt: () => t("common.logoAlt"),
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl,
  twitterImageAlt: () => t("common.logoAlt"),
  robots: "index, follow",
});
useHead({
  link: [{ rel: "canonical", href: `${config.public.siteUrl}/generate` }],
});

const toast = useToast();

const MAX_PLAYERS = 64;
const MAX_NAME_LENGTH = 30;
const SCORE_MAP = { Pro: 3, Middle: 2, Newbie: 1 };

const levelOptions = computed(() => [
  { value: "Newbie", label: t("generate.levels.newbie") },
  { value: "Middle", label: t("generate.levels.middle") },
  { value: "Pro", label: t("generate.levels.pro") },
]);

const playerName = ref("");
const playerLevel = ref("Newbie");
const useLevel = ref(false);
const players = ref([]);
const teamCount = ref(2);
const teams = ref([]);
const tournamentType = ref("elimination");
const teamColors = ["#34d399", "#38bdf8", "#fbbf24", "#fb923c", "#a78bfa"];

const hasGenerated = ref(false);
const pendingPanelRef = ref(null);
const pendingHighlight = ref(false);
const movingMemberId = ref(null);
const confirmDialog = ref(null);

const mobileFooterRef = ref(null);
const mobileFooterHeight = ref(0);
const isMobileViewport = ref(false);
const mobilePaddingBottom = computed(() =>
  isMobileViewport.value ? `${mobileFooterHeight.value + 24}px` : undefined
);

let footerResizeObserver = null;
function checkMobileViewport() {
  isMobileViewport.value = window.innerWidth < 640;
}

onMounted(() => {
  checkMobileViewport();
  window.addEventListener("resize", checkMobileViewport);
  if (mobileFooterRef.value) {
    footerResizeObserver = new ResizeObserver(() => {
      mobileFooterHeight.value = mobileFooterRef.value?.getBoundingClientRect().height ?? 0;
    });
    footerResizeObserver.observe(mobileFooterRef.value);
  }
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", checkMobileViewport);
  footerResizeObserver?.disconnect();
});

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

const assignedPlayerIds = computed(() => new Set(teams.value.flatMap((t) => t.map((m) => m.id))));

const pendingPlayers = computed(() =>
  hasGenerated.value ? players.value.filter((p) => !assignedPlayerIds.value.has(p.id)) : []
);

const teamOptions = computed(() =>
  teams.value.map((tm, i) => ({ name: t("generate.exportCapture.teamHeading", { number: i + 1 }), count: tm.length }))
);

const levelCounts = computed(() => {
  const counts = { Newbie: 0, Middle: 0, Pro: 0 };
  players.value.forEach((p) => {
    if (p.level && counts[p.level] !== undefined) counts[p.level]++;
  });
  return counts;
});

function isPending(player) {
  return hasGenerated.value && !assignedPlayerIds.value.has(player.id);
}

function stepActive(step) {
  if (step === 1) return players.value.length === 0;
  if (step === 2) return players.value.length > 0 && !hasGenerated.value;
  return hasGenerated.value;
}

watch(playerName, (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    nameError.value = "";
    return;
  }
  if (maxPlayersReached.value) {
    nameError.value = t("generate.validation.maxReached", { max: MAX_PLAYERS });
  } else if (isDuplicateName(trimmed)) {
    nameError.value = t("generate.validation.duplicateName");
  } else {
    nameError.value = "";
  }
});

watch(teamCount, (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    teamCountError.value = t("generate.validation.teamCountNaN");
    return;
  }
  if (!Number.isInteger(value)) {
    teamCountError.value = t("generate.validation.teamCountNotInteger");
    return;
  }
  const max = Math.max(players.value.length, 2);
  if (value > max) {
    teamCountError.value = t("generate.validation.teamCountExceeds", { max });
  } else if (value < 2) {
    teamCountError.value = t("generate.validation.teamCountMin");
  } else {
    teamCountError.value = "";
  }
});

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
    console.error("Failed to load PDF module:", err);
  }
});

const cupStore = useCupStore();
const router = useRouter();

// Rehydrate dari cup store: state lokal komponen ini reset saat unmount/remount,
// jadi tanpa ini data hilang kalau user balik dari halaman turnamen.
onMounted(() => {
  if (cupStore.players.length === 0 && cupStore.teams.length === 0) return;

  const nameToId = new Map();
  players.value = cupStore.players.map((p) => {
    const id = ++playerIdSeq;
    nameToId.set(p.name, id);
    return { id, name: p.name, level: p.level ?? null };
  });
  teams.value = cupStore.teams.map((t) =>
    t.members.map((m) => ({
      id: nameToId.get(m.name) ?? ++playerIdSeq,
      name: m.name,
      level: m.level ?? null,
    }))
  );
  useLevel.value = cupStore.useLevel;
  teamCount.value = cupStore.teamCount || teams.value.length || 2;
  tournamentType.value = cupStore.tournamentType;
  hasGenerated.value = teams.value.length > 0;
});

function isDuplicateName(name) {
  const normalized = name.toLowerCase();
  return players.value.some((p) => p.name.toLowerCase() === normalized);
}

function addPlayer() {
  const trimmed = playerName.value.trim();
  if (!trimmed) return;

  if (maxPlayersReached.value) {
    toast.error(t("generate.toast.maxPlayers", { max: MAX_PLAYERS }));
    return;
  }
  if (isDuplicateName(trimmed)) {
    nameError.value = t("generate.validation.duplicateName");
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
    toast.info(t("generate.toast.playerAddedPending", { name: trimmed }));
  }
}

function removePlayer(idx) {
  const player = players.value[idx];
  players.value.splice(idx, 1);

  for (const team of teams.value) {
    const i = team.findIndex((m) => m.id === player.id);
    if (i !== -1) {
      team.splice(i, 1);
      toast.info(t("generate.toast.playerRemoved", { name: player.name }));
      break;
    }
  }
}

function handleClearAllPlayers() {
  confirmDialog.value = {
    title: t("generate.toast.clearAllTitle"),
    message: t("generate.toast.clearAllMessage", { count: players.value.length }),
    variant: "danger",
    onConfirm: () => {
      players.value = [];
      teams.value = [];
      hasGenerated.value = false;
      toast.info(t("generate.toast.clearedAll"));
    },
  };
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
    toast.error(t("generate.toast.needTwoPlayers"));
    return;
  }
  clampTeamCount();
  if (teamCount.value < 2) {
    toast.error(t("generate.toast.needTwoTeams"));
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

    for (const p of shuffledPool) {
      teamStats.sort((a, b) => {
        if (a.totalScore !== b.totalScore) return a.totalScore - b.totalScore;
        return a.members.length - b.members.length;
      });
      teamStats[0].members.push(p);
      teamStats[0].totalScore += p.score;
    }

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
  toast.success(t("generate.toast.teamsGenerated"));
}

function assignPlayerToTeam(player, teamIdx) {
  teams.value[teamIdx].push({ id: player.id, name: player.name, level: player.level || null });
  toast.success(t("generate.toast.playerAssigned", { name: player.name, teamNumber: teamIdx + 1 }));
}

function assignPlayerToNewTeam(player) {
  teams.value.push([{ id: player.id, name: player.name, level: player.level || null }]);
  teamCount.value = teams.value.length;
  toast.success(t("generate.toast.playerNewTeam", { name: player.name, teamNumber: teams.value.length }));
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
  toast.success(t("generate.toast.allPendingAssigned"));
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
    toast.success(t("generate.toast.memberMovedNew", { name: member.name, teamNumber: teams.value.length }));
  } else if (value === "auto") {
    const targetIdx = leastLoadedTeamIndex();
    teams.value[targetIdx].push(member);
    toast.success(t("generate.toast.memberMovedAuto", { name: member.name, teamNumber: targetIdx + 1 }));
  } else {
    teams.value[value].push(member);
    toast.success(t("generate.toast.memberMoved", { name: member.name, teamNumber: value + 1 }));
  }
}

function performDisbandTeam(idx) {
  teams.value.splice(idx, 1);
  toast.info(t("generate.toast.teamDisbanded", { teamNumber: idx + 1 }));
}

function disbandTeam(idx) {
  const team = teams.value[idx];
  if (team.length > 0) {
    confirmDialog.value = {
      title: t("generate.toast.disbandTitle"),
      message: t("generate.toast.disbandMessage", { teamNumber: idx + 1, count: team.length }),
      variant: "danger",
      onConfirm: () => performDisbandTeam(idx),
    };
    return;
  }
  performDisbandTeam(idx);
}

function handleCreateCupClick() {
  if (teams.value.length < 2) {
    toast.error(t("generate.toast.needTeamsForCup"));
    return;
  }
  if (pendingPlayers.value.length > 0) {
    toast.info(t("generate.toast.pendingBeforeCup", { count: pendingPlayers.value.length }));
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
    toast.error(t("generate.toast.needTeamsForCup"));
    return;
  }

  cupStore.initializeCup({
    players: players.value,
    teams: teams.value,
    useLevel: useLevel.value,
    teamCount: teamCount.value,
    tournamentType: tournamentType.value,
    teamNamePrefix: t("cup.standingsTable.team"),
    groupNamePrefix: t("cup.groupStage.groupNamePrefix"),
  });

  router.push("/create-cup");
}

function getTeamsText(forWhatsApp = false) {
  let text = (forWhatsApp ? t("generate.shareText.headerWa") : t("generate.shareText.header")) + "\n\n";

  teams.value.forEach((team, idx) => {
    text += (forWhatsApp ? t("generate.shareText.teamLineWa", { number: idx + 1 }) : t("generate.shareText.teamLine", { number: idx + 1 })) + "\n";
    team.forEach((p) => {
      text += `- ${p.name}${useLevel.value && p.level ? " (" + p.level + ")" : ""}\n`;
    });
    text += "\n";
  });

  text += forWhatsApp ? t("common.export.generateByWa") : t("common.export.generateBy");
  return text;
}

async function copyText() {
  const text = getTeamsText(false);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error(t("common.export.clipboardUnavailable"));
    }
    toast.success(t("generate.toast.textCopied"));
  } catch (err) {
    console.error("Failed to copy text:", err);
    toast.error(t("common.export.copyError"));
  }
}

function shareWhatsApp() {
  const text = encodeURIComponent(getTeamsText(true));
  const url = `https://wa.me/?text=${text}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error(t("common.export.whatsappPopupBlocked"));
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
    console.error("Failed to create image:", err);
    toast.error(t("common.export.imageError"));
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
    pdf.setFontSize(16);
    pdf.text(t("generate.shareText.header").replace(/:$/, ""), 105, 16, { align: "center" });

    const marginTop = 26;
    const marginBottom = 283;
    const colX = [15, 110];
    const colWidth = 85;
    const colY = [marginTop, marginTop];

    teams.value.forEach((team, idx) => {
      const blockHeight = 6 + team.length * 5 + 4;
      let col = colY[0] <= colY[1] ? 0 : 1;

      if (colY[col] + blockHeight > marginBottom) {
        col = 1 - col;
        if (colY[col] + blockHeight > marginBottom) {
          pdf.addPage();
          colY[0] = marginTop;
          colY[1] = marginTop;
          col = 0;
        }
      }

      const x = colX[col];
      let y = colY[col];

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11.5);
      pdf.text(t("generate.exportCapture.teamHeading", { number: idx + 1 }), x, y);
      y += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      team.forEach((p) => {
        const textLine = `- ${p.name}${useLevel.value && p.level ? " (" + p.level + ")" : ""}`;
        pdf.text(textLine, x + 2, y, { maxWidth: colWidth - 2 });
        y += 5;
      });

      colY[col] = y + 4;
    });

    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.setFont("helvetica", "italic");
    pdf.text(t("common.export.generateBy"), 105, 292, { align: "center" });

    pdf.save("randomix_hasil-generate-tim.pdf");
  } catch (err) {
    console.error("Failed to create PDF:", err);
    toast.error(t("common.export.pdfError"));
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
