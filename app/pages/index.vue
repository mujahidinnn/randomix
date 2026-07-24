<template>
  <main
    class="page-shell relative flex min-h-screen flex-col items-center justify-center p-6 text-center"
  >
    <!-- Logo Randomix -->
    <div class="mb-6 animate-scaleIn lg:mb-8">
      <img
        src="/randomix.png"
        alt="Logo Randomix"
        width="497"
        height="123"
        class="w-60 md:w-80 lg:w-[26rem]"
        fetchpriority="high"
      />
    </div>

    <!-- Heading utama (H1 tunggal untuk halaman ini) -->
    <h1
      class="delay-200 mb-10 max-w-xl animate-fadeIn text-2xl font-bold leading-snug tracking-tight text-[var(--clay-text)] md:text-4xl lg:max-w-3xl lg:text-5xl"
    >
      Buat tim olahraga kamu secara adil &amp; seru!
    </h1>

    <!-- Tombol CTA -->
    <BaseButton
      tag="NuxtLink"
      to="/generate"
      size="lg"
      class="delay-400 animate-fadeIn lg:px-8 lg:py-4 lg:text-xl"
    >
      <template #icon>
        <RocketLaunchIcon class="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
      </template>
      Mulai Buat Tim
    </BaseButton>

    <!-- Highlight fitur -->
    <ul
      class="delay-500 mt-10 flex w-full max-w-xs animate-fadeIn flex-col gap-3 text-left sm:max-w-xl sm:flex-row sm:justify-center sm:gap-4 sm:text-center lg:mt-16 lg:max-w-4xl lg:gap-8"
    >
      <li
        v-for="feature in features"
        :key="feature.title"
        class="clay-surface clay-raised flex items-center gap-3 px-4 py-3 text-[var(--clay-text)] transition sm:flex-1 sm:flex-col sm:gap-3 sm:py-5 lg:gap-4 lg:p-8"
      >
        <span class="clay-inset flex h-11 w-11 shrink-0 items-center justify-center rounded-full lg:h-14 lg:w-14">
          <component :is="feature.icon" class="h-5 w-5 text-[var(--clay-accent-dark)] lg:h-6 lg:w-6" aria-hidden="true" />
        </span>
        <div>
          <p class="text-sm font-bold sm:text-base lg:text-lg">{{ feature.title }}</p>
          <p class="text-xs text-[var(--clay-text-muted)] sm:text-sm lg:text-base">{{ feature.description }}</p>
        </div>
      </li>
    </ul>

    <!-- Footer -->
    <footer class="delay-600 mt-12 animate-fadeIn text-sm text-[var(--clay-text-muted)] lg:mt-20">
      &copy; {{ currentYear }} Randomix. Semua hak cipta dilindungi.
    </footer>
  </main>
</template>

<script setup>
import { RocketLaunchIcon, SparklesIcon, TrophyIcon, ShareIcon } from "@heroicons/vue/24/solid";

const currentYear = new Date().getFullYear();

const features = [
  {
    icon: SparklesIcon,
    title: "Acak & Adil",
    description: "Pembagian tim acak, opsional dibobot pakai level skill.",
  },
  {
    icon: TrophyIcon,
    title: "Bagan Turnamen",
    description: "Lanjut ke bagan single-elimination tanpa input ulang.",
  },
  {
    icon: ShareIcon,
    title: "Bagikan Hasil",
    description: "Ekspor ke PDF, gambar, teks, atau langsung ke WhatsApp.",
  },
];

const config = useRuntimeConfig();
// og:image/twitter:image butuh URL absolut agar bisa di-crawl oleh bot yang tidak menjalankan JS.
const ogImageUrl = new URL("/randomix.png", config.public.siteUrl).toString();

useSeoMeta({
  title: "Buat Tim Olahraga Secara Adil & Acak",
  description:
    "Randomix membantu kamu membagi tim olahraga secara adil dan acak dalam hitungan detik, lengkap dengan bagan turnamen otomatis.",
  ogTitle: "Randomix — Buat Tim Olahraga Secara Adil & Acak",
  ogDescription:
    "Bagi pemain jadi tim yang seimbang, generate bagan turnamen, lalu bagikan hasilnya sebagai gambar, PDF, atau WhatsApp.",
  ogUrl: config.public.siteUrl,
  ogImage: ogImageUrl,
  ogImageWidth: 498,
  ogImageHeight: 129,
  ogImageAlt: "Logo Randomix",
  twitterTitle: "Randomix — Buat Tim Olahraga Secara Adil & Acak",
  twitterDescription:
    "Bagi pemain jadi tim yang seimbang secara instan, lengkap dengan bagan turnamen.",
  twitterImage: ogImageUrl,
  twitterImageAlt: "Logo Randomix",
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
        description:
          "Randomix membantu membagi tim olahraga secara adil dan acak, lengkap dengan bagan turnamen otomatis.",
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
