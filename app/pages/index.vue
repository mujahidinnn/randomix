<template>
  <main
    class="page-shell relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-[max(1.5rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] text-center"
  >
    <div class="mb-6 animate-scaleIn lg:mb-8">
      <img
        src="/randomix-white.png"
        :alt="t('common.logoAlt')"
        width="497"
        height="123"
        class="w-60 drop-shadow-[0_4px_16px_rgba(0,0,0,0.15)] md:w-80 lg:w-[26rem]"
        fetchpriority="high"
      />
    </div>

    <h1
      class="delay-200 mb-10 max-w-xl animate-fadeIn text-2xl font-bold leading-snug tracking-tight text-[var(--page-text)] drop-shadow-sm md:text-4xl lg:max-w-3xl lg:text-5xl"
    >
      {{ t("home.hero.titleLead") }}
      <span
        class="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent"
        >{{ t("home.hero.titleHighlight") }}</span
      >
    </h1>

    <BaseButton
      tag="NuxtLink"
      to="/generate"
      size="lg"
      class="delay-400 animate-fadeIn lg:px-8 lg:py-4 lg:text-xl"
    >
      <template #icon>
        <RocketLaunchIcon class="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
      </template>
      {{ t("home.cta") }}
    </BaseButton>

    <ul
      class="delay-500 mt-10 flex w-full max-w-xs animate-fadeIn flex-col gap-3 text-left sm:max-w-xl sm:flex-row sm:justify-center sm:gap-4 sm:text-center lg:mt-16 lg:max-w-4xl lg:gap-8"
    >
      <li
        v-for="(feature, idx) in features"
        :key="feature.key"
        class="clay-surface clay-raised flex items-center gap-3 px-4 py-3 text-[var(--clay-text)] transition sm:flex-1 sm:flex-col sm:gap-3 sm:py-5 lg:gap-4 lg:p-8"
        :style="{ transform: `rotate(${idx % 2 === 0 ? -1.5 : 1.5}deg)` }"
      >
        <span
          class="clay-inset flex h-11 w-11 shrink-0 items-center justify-center rounded-full lg:h-14 lg:w-14"
          :style="{ transform: `rotate(${idx % 2 === 0 ? 8 : -8}deg)` }"
        >
          <component
            :is="feature.icon"
            class="h-5 w-5 text-[var(--clay-accent-dark)] lg:h-6 lg:w-6"
            aria-hidden="true"
          />
        </span>
        <div>
          <p class="text-sm font-bold sm:text-base lg:text-lg">
            {{ t(`home.features.${feature.key}.title`) }}
          </p>
          <p
            class="text-xs text-[var(--clay-text-muted)] sm:text-sm lg:text-base"
          >
            {{ t(`home.features.${feature.key}.description`) }}
          </p>
        </div>
      </li>
    </ul>

    <footer
      class="delay-600 mt-12 animate-fadeIn text-sm text-[var(--page-text-muted)] lg:mt-20"
    >
      {{ t("home.footer", { year: currentYear }) }}
    </footer>
  </main>
</template>

<script setup>
import {
  RocketLaunchIcon,
  SparklesIcon,
  TrophyIcon,
  ShareIcon,
} from "@heroicons/vue/24/solid";

const { t } = useI18n();

const currentYear = new Date().getFullYear();

const features = [
  { key: "random", icon: SparklesIcon },
  { key: "bracket", icon: TrophyIcon },
  { key: "share", icon: ShareIcon },
];

const config = useRuntimeConfig();
const ogImageUrl = new URL("/og-image.png", config.public.siteUrl).toString();

useSeoMeta({
  title: () => t("home.seo.title"),
  description: () => t("home.seo.description"),
  ogTitle: () => t("home.seo.ogTitle"),
  ogDescription: () => t("home.seo.ogDescription"),
  ogUrl: config.public.siteUrl,
  ogImage: ogImageUrl,
  ogImageType: "image/png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => t("home.seo.ogTitle"),
  twitterCard: "summary_large_image",
  twitterTitle: () => t("home.seo.ogTitle"),
  twitterDescription: () => t("home.seo.twitterDescription"),
  twitterImage: ogImageUrl,
  twitterImageAlt: () => t("home.seo.ogTitle"),
});

useHead({
  link: [{ rel: "canonical", href: config.public.siteUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Randomix",
        applicationCategory: "SportsApplication",
        operatingSystem: "Any",
        url: config.public.siteUrl,
        description: t("home.seo.jsonLdDescription"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    },
  ],
});
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

.animate-fadeIn {
  animation: fadeIn 0.8s ease forwards;
}
.animate-scaleIn {
  animation: scaleIn 0.8s ease forwards;
}

.delay-200 {
  animation-delay: 0.2s;
}
.delay-400 {
  animation-delay: 0.4s;
}
.delay-500 {
  animation-delay: 0.5s;
}
.delay-600 {
  animation-delay: 0.6s;
}
</style>
