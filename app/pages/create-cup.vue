<template>
  <main
    class="page-shell flex min-h-screen flex-col items-center pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pl-[max(1.5rem,env(safe-area-inset-left))]"
  >
    <div class="relative mb-4 flex w-full max-w-6xl animate-fadeInUp items-center justify-center sm:mb-6 xl:max-w-7xl">
      <NuxtLink
        to="/generate"
        :aria-label="t('cup.header.back')"
        class="clay-raised absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--clay-surface-alt)] font-bold text-[var(--clay-text)] transition"
      >
        <ArrowLeftIcon class="h-5 w-5" aria-hidden="true" />
      </NuxtLink>
      <h1 class="text-lg font-bold text-[var(--page-text)] drop-shadow-sm sm:text-xl lg:text-2xl">{{ t("cup.header.title") }}</h1>
    </div>

    <section
      :aria-label="t('cup.header.sectionAria')"
      class="clay-surface clay-raised w-full max-w-6xl animate-fadeInUp p-4 sm:p-6 xl:max-w-7xl xl:p-8"
      style="animation-delay: 0.1s"
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
          <div
            v-if="cupStore.champion"
            class="mb-6 flex items-center justify-center gap-3 rounded-xl bg-amber-200 p-4 text-center font-bold text-amber-900"
            role="status"
          >
            <TrophyIcon class="h-6 w-6" aria-hidden="true" />
            <span>{{ t("cup.champion", { name: cupStore.champion.name }) }}</span>
          </div>

          <div class="mb-6 flex w-full flex-wrap items-center justify-center gap-3">
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

          <div ref="captureRef">
            <CupElimination v-if="cupStore.tournamentType === 'elimination'" />
            <CupRoundRobin v-else-if="cupStore.tournamentType === 'roundrobin'" />
            <CupGroupStage v-else-if="cupStore.tournamentType === 'group'" />
          </div>

          <h2 class="mb-3 mt-8 text-base font-bold text-[var(--clay-text)] sm:text-lg">{{ t("cup.daftarTim") }}</h2>
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
              {{ t("cup.resetButton") }}
            </BaseButton>
          </div>
        </div>

        <EmptyState v-else :message="t('cup.empty')">
          <template #action>
            <BaseButton tag="NuxtLink" to="/generate" class="mt-2">
              <template #icon><BoltIcon class="h-4 w-4" aria-hidden="true" /></template>
              {{ t("cup.emptyAction") }}
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
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BoltIcon,
  ChatBubbleOvalLeftIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  PhotoIcon,
  TrophyIcon,
} from "@heroicons/vue/24/solid";
import { useCupStore } from "../stores/cup";
import { useRouter } from "vue-router";
import { useToast } from "../composables/useToast";
import { buildStandings, type Standing } from "../utils/standings";

const { t } = useI18n();

const config = useRuntimeConfig();
const ogImageUrl = new URL("/randomix.png", config.public.siteUrl).toString();

useSeoMeta({
  title: () => t("cup.seo.title"),
  description: () => t("cup.seo.description"),
  ogTitle: () => t("cup.seo.ogTitle"),
  ogDescription: () => t("cup.seo.description"),
  ogImage: ogImageUrl,
  ogImageWidth: 498,
  ogImageHeight: 129,
  ogImageAlt: () => t("common.logoAlt"),
  twitterCard: "summary_large_image",
  twitterImage: ogImageUrl,
  twitterImageAlt: () => t("common.logoAlt"),
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

const captureRef = ref<HTMLElement | null>(null);
const isGeneratingPDF = ref(false);
const isGeneratingImage = ref(false);
let jsPDFModule: any = null;
let html2canvasModule: any = null;

function roundTitleFor(roundIndex: number, totalRounds: number) {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return t("common.roundTitle.final");
  if (fromEnd === 1) return t("common.roundTitle.semifinal");
  if (fromEnd === 2) return t("common.roundTitle.quarterfinal");
  return t("common.roundTitle.roundN", { n: roundIndex + 1 });
}

function teamName(id: number | null) {
  if (id == null) return t("common.matchLabel.tbd");
  return cupStore.teams.find((t) => t.id === id)?.name ?? t("common.matchLabel.unknownTeam");
}

function standingLines(standings: Standing[]) {
  return standings.map(
    (s, i) =>
      `${i + 1}. ${teamName(s.teamId)} - ${s.points} ${t("cup.standingsTable.points").toLowerCase()} (${t("cup.standingsTable.played")}${s.played} ${t("cup.standingsTable.won")}${s.won} ${t("cup.standingsTable.drawn")}${s.drawn} ${t("cup.standingsTable.lost")}${s.lost}, ${t("cup.standingsTable.gd")}${s.gd >= 0 ? "+" : ""}${s.gd})`
  );
}

function getTournamentText(forWhatsApp = false) {
  const wrap = (s: string) => (forWhatsApp ? `*${s}*` : s);
  let text = `${wrap(t("cup.shareText.header"))}\n\n`;

  if (cupStore.champion) {
    text += `${wrap(t("cup.shareText.champion", { name: cupStore.champion.name }))}\n\n`;
  }

  if (cupStore.tournamentType === "elimination") {
    cupStore.rounds.forEach((round, ri) => {
      text += `${wrap(roundTitleFor(ri, cupStore.rounds.length))}\n`;
      round.matchs.forEach((m) => {
        const label = m.teams.length === 1 ? t("common.matchLabel.bye") : t("common.matchLabel.tbd");
        const names = m.teams.map((id) => (id != null ? teamName(id) : label));
        const result = m.winner ? t("cup.shareText.winSuffix", { name: teamName(m.winner) }) : "";
        text += `${names.join(" vs ")}${result}\n`;
      });
      text += "\n";
    });
  } else if (cupStore.tournamentType === "roundrobin") {
    text += `${wrap(t("cup.shareText.standingsHeading"))}\n`;
    text += standingLines(cupStore.roundRobinStandings).join("\n") + "\n\n";
    text += `${wrap(t("cup.shareText.fixturesHeading"))}\n`;
    cupStore.fixtures.forEach((f) => {
      const score = f.played ? `${f.score1} - ${f.score2}` : t("cup.fixtureRow.vs");
      text += `${teamName(f.team1)} ${score} ${teamName(f.team2)}\n`;
    });
  } else if (cupStore.tournamentType === "group") {
    cupStore.groups.forEach((g) => {
      text += `${wrap(g.name)}\n`;
      text += standingLines(buildStandings(g.teamIds, g.fixtures)).join("\n") + "\n";
      g.fixtures.forEach((f) => {
        const score = f.played ? `${f.score1} - ${f.score2}` : t("cup.fixtureRow.vs");
        text += `${teamName(f.team1)} ${score} ${teamName(f.team2)}\n`;
      });
      text += "\n";
    });
    if (cupStore.knockoutStarted) {
      text += `${wrap(t("cup.shareText.knockoutHeading"))}\n`;
      cupStore.rounds.forEach((round, ri) => {
        text += `${wrap(roundTitleFor(ri, cupStore.rounds.length))}\n`;
        round.matchs.forEach((m) => {
          const label = m.teams.length === 1 ? t("common.matchLabel.bye") : t("common.matchLabel.tbd");
          const names = m.teams.map((id) => (id != null ? teamName(id) : label));
          const result = m.winner ? t("cup.shareText.winSuffix", { name: teamName(m.winner) }) : "";
          text += `${names.join(" vs ")}${result}\n`;
        });
        text += "\n";
      });
    }
  }

  text += forWhatsApp ? t("common.export.generateByWa") : t("common.export.generateBy");
  return text;
}

async function copyText() {
  const text = getTournamentText(false);
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error(t("common.export.clipboardUnavailable"));
    }
    toast.success(t("cup.toast.textCopied"));
  } catch (err) {
    console.error("Failed to copy text:", err);
    toast.error(t("common.export.copyError"));
  }
}

function shareWhatsApp() {
  const text = encodeURIComponent(getTournamentText(true));
  const url = `https://wa.me/?text=${text}`;
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    toast.error(t("common.export.whatsappPopupBlocked"));
  }
}

async function downloadImage() {
  if (isGeneratingImage.value || !captureRef.value) return;
  isGeneratingImage.value = true;
  try {
    if (!html2canvasModule) {
      const module = await import("html2canvas");
      html2canvasModule = module.default;
    }
    const canvas = await html2canvasModule(captureRef.value, { scale: 2 });
    const link = document.createElement("a");
    link.download = "randomix_hasil-turnamen.png";
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
    pdf.setFontSize(15);
    pdf.text(t("cup.shareText.header"), 105, 14, { align: "center" });

    // Heading gak dibiarkan sendirian di ujung bawah halaman.
    const marginTop = 22;
    const marginBottom = 290;
    const lineHeight = 4.6;
    const blankHeight = 2.2;
    let y = marginTop;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    const generateByLine = t("common.export.generateBy");
    const lines = getTournamentText(false).split("\n").slice(2);
    lines.forEach((line) => {
      if (line === "") {
        y += blankHeight;
        return;
      }

      const isHeading = !line.includes(" vs ") && !line.match(/^\d+\./) && line !== generateByLine;
      const neededSpace = isHeading ? lineHeight * 2 : lineHeight;
      if (y + neededSpace > marginBottom) {
        pdf.addPage();
        y = marginTop;
      }

      pdf.setFont("helvetica", isHeading ? "bold" : "normal");
      pdf.setFontSize(isHeading ? 10.5 : 9);
      pdf.text(line, 15, y);
      y += isHeading ? lineHeight + 0.8 : lineHeight;
    });

    pdf.save("randomix_hasil-turnamen.pdf");
  } catch (err) {
    console.error("Failed to create PDF:", err);
    toast.error(t("common.export.pdfError"));
  } finally {
    isGeneratingPDF.value = false;
  }
}

function statusLabel(status?: string) {
  if (status === "win") return t("cup.status.win");
  if (status === "lose") return t("cup.status.lose");
  return t("cup.status.pending");
}

function statusBadgeClass(status?: string) {
  if (status === "win") return "bg-emerald-400/90 text-emerald-950";
  if (status === "lose") return "bg-rose-400/80 text-rose-950";
  return "bg-slate-200 text-slate-600";
}

function handleResetCup() {
  confirmDialog.value = {
    title: t("cup.toast.resetTitle"),
    message: t("cup.toast.resetMessage"),
    variant: "danger",
    onConfirm: () => {
      cupStore.resetCup();
      toast.info(t("cup.toast.resetDone"));
      router.push("/generate");
    },
  };
}
</script>
