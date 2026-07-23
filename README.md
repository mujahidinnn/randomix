# Randomix

🔗 **Live:** [randomix.vercel.app](https://randomix.vercel.app)

Randomix adalah aplikasi web untuk membagi pemain olahraga menjadi tim secara **adil dan acak**, lalu (opsional) melanjutkannya ke **bagan turnamen single-elimination** — lengkap dengan opsi berbagi hasil sebagai gambar, PDF, teks, atau link WhatsApp.

## Fitur Utama

- **Generate Tim** — tambahkan pemain (dengan atau tanpa level skill: Newbie/Middle/Pro), tentukan jumlah tim, lalu acak. Saat mode level aktif, pembagian menggunakan algoritma greedy agar total skor tiap tim tetap seimbang.
- **Buat Cup** — ubah hasil generate tim menjadi bagan turnamen otomatis, termasuk penanganan *bye* saat jumlah tim bukan pangkat dua.
- **Ekspor Hasil** — download sebagai PDF/gambar, salin sebagai teks, atau share langsung ke WhatsApp.
- **Persisted state** — progres tersimpan di `localStorage` (Pinia + `pinia-plugin-persistedstate`) sehingga tidak hilang saat refresh.

## Tech Stack

- [Nuxt 4](https://nuxt.com/) (Vue 3, Vite)
- [Pinia](https://pinia.vuejs.org/) + `pinia-plugin-persistedstate` untuk state management
- [Tailwind CSS](https://tailwindcss.com/) untuk styling
- [vue3-tournament](https://www.npmjs.com/package/vue3-tournament) untuk render bagan turnamen
- `jspdf` & `html2canvas` (di-*lazy-load*) untuk ekspor PDF/gambar

## Prasyarat

- Node.js **20.19+** atau **22.12+** (dibutuhkan oleh Vite 7 — versi Node yang lebih lama akan gagal saat `build`/`dev`)
- Yarn (project ini menggunakan `packageManager: yarn` — lihat `package.json`)

## Setup

Install dependencies:

```bash
yarn install
```

## Development Server

Jalankan development server di `http://localhost:3000`:

```bash
yarn dev
```

## Production

Build untuk production:

```bash
yarn build
```

Preview hasil build secara lokal:

```bash
yarn preview
```

Generate versi statis:

```bash
yarn generate
```

Lihat [dokumentasi deployment Nuxt](https://nuxt.com/docs/getting-started/deployment) untuk detail lebih lanjut.

## Struktur Proyek

```
app/
├── app.vue                 # Root component (loading indicator, page outlet, toast host)
├── assets/css/main.css     # Design tokens & global a11y/motion defaults
├── components/             # Komponen bersama (BaseButton, EmptyState, BaseSkeleton, AppToast)
├── composables/useToast.ts # Sistem notifikasi toast global
├── pages/
│   ├── index.vue           # Landing page
│   ├── generate.vue        # Form tambah pemain + generate tim
│   └── create-cup.vue      # Bagan turnamen
├── plugins/persist.client.ts
└── stores/cup.ts           # State turnamen: tim, pertandingan, ronde, pemenang
```

## Environment Variables

| Variable                 | Default                        | Keterangan                                   |
| ------------------------ | ------------------------------- | --------------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`   | `https://randomix.vercel.app`  | Dipakai untuk canonical URL & meta OpenGraph. Ganti bila pindah domain. |

## Live Demo

[randomix.vercel.app](https://randomix.vercel.app)

## Dokumentasi Produk

Lihat `PRD.md` (tidak di-commit, hanya lokal — lihat `.gitignore`) untuk detail requirement produk.
