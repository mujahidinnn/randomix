<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-center p-6 relative overflow-hidden"
  >
    <!-- Logo gambar Randomix dengan spotlight -->
    <div class="logo-wrapper mb-6 animate-scaleIn">
      <img
        src="/randomix.png"
        alt="Randomix"
        class="w-60 md:w-80 drop-shadow-logo"
      />
    </div>

    <!-- Paragraf utama -->
    <p
      class="font-semibold text-2xl md:text-3xl lg:text-4xl mb-10 max-w-xl text-white drop-shadow-text leading-snug animate-fadeIn delay-200"
    >
      Buat tim olahraga kamu secara adil & seru!
    </p>

    <!-- Tombol CTA -->
    <NuxtLink
      to="/generate"
      class="flex gap-2 px-10 py-4 rounded-2xl bg-white text-blue-500 font-bold hover:bg-gray-200 transition duration-300 shadow-lg animate-fadeIn delay-400"
    >
      Mulai Buat Tim

      <RocketLaunchIcon class="h-5 w-5" />
    </NuxtLink>

    <!-- Footer kecil -->
    <p class="mt-16 text-sm opacity-80 text-white animate-fadeIn delay-600">
      © 2025 randomix. Semua hak cipta dilindungi.
    </p>
  </div>
</template>

<script setup>
import { RocketLaunchIcon } from "@heroicons/vue/24/solid";

// Stateless opening screen
</script>

<style scoped>
/* Animasi sederhana */
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

/* Drop shadow / glow putih super luas & horizontal */
.drop-shadow-logo {
  filter: drop-shadow(20px 0 60px rgba(255, 255, 255, 1))
    drop-shadow(-20px 0 120px rgba(255, 255, 255, 0.9))
    drop-shadow(30px 0 180px rgba(255, 255, 255, 0.7))
    drop-shadow(-30px 0 240px rgba(255, 255, 255, 0.5))
    drop-shadow(0 0 300px rgba(255, 255, 255, 0.3));
}

/* Spotlight effect oval di belakang logo */
.logo-wrapper::before {
  content: "";
  position: absolute;
  inset: -60px;
  background: radial-gradient(
    ellipse 120% 80%,
    /* lebih lebar di X */ rgba(255, 255, 255, 0.8) 0%,
    transparent 90%
  );
  z-index: -1;
  filter: blur(100px); /* blur lebih besar */
}

/* Shadow tipis untuk teks agar terbaca */
.drop-shadow-text {
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.25));
}
</style>
