<template>
  <main
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-green-400 to-blue-500 p-6 text-center"
  >
    <!-- Logo Randomix -->
    <div class="mb-6 animate-scaleIn">
      <img
        src="/randomix-white.png"
        alt="Logo Randomix"
        width="497"
        height="123"
        class="w-60 md:w-80"
        fetchpriority="high"
      />
    </div>

    <!-- Heading utama (H1 tunggal untuk halaman ini) -->
    <h1
      class="delay-200 mb-10 max-w-xl animate-fadeIn text-2xl font-semibold leading-snug text-white md:text-3xl"
    >
      Buat tim olahraga kamu secara adil &amp; seru!
    </h1>

    <!-- Tombol CTA -->
    <BaseButton
      tag="NuxtLink"
      to="/generate"
      size="lg"
      class="delay-400 animate-fadeIn"
    >
      <template #icon>
        <RocketLaunchIcon class="h-5 w-5" aria-hidden="true" />
      </template>
      Mulai Buat Tim
    </BaseButton>

    <!-- Footer -->
    <footer class="delay-600 mt-16 animate-fadeIn text-sm text-white opacity-80">
      &copy; {{ currentYear }} Randomix. Semua hak cipta dilindungi.
    </footer>
  </main>
</template>

<script setup>
import { RocketLaunchIcon } from "@heroicons/vue/24/solid";

const currentYear = new Date().getFullYear();

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
  twitterTitle: "Randomix — Buat Tim Olahraga Secara Adil & Acak",
  twitterDescription:
    "Bagi pemain jadi tim yang seimbang secara instan, lengkap dengan bagan turnamen.",
  twitterImage: ogImageUrl,
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
.delay-600 {
  animation-delay: 0.6s;
}
</style>
