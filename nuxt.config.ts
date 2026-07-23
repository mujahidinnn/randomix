// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://randomix.vercel.app";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      siteUrl,
    },
  },

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 100,
      },
      hmr: {
        overlay: true,
      },
    },
    clearScreen: false,
  },

  app: {
    head: {
      htmlAttrs: { lang: "id" },
      titleTemplate: "%s | Randomix",
      title: "Randomix",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#3b82f6" },
        {
          name: "description",
          content:
            "Randomix — buat tim olahraga secara adil dan acak dalam hitungan detik, lengkap dengan bagan turnamen.",
        },
        { property: "og:site_name", content: "Randomix" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "id_ID" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "robots", content: "index, follow" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=MuseoModerno:ital,wght@0,100..900;1,100..900&display=swap",
        },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },
});
