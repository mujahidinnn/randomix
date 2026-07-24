# Randomix

🔗 **Live:** [randomix.vercel.app](https://randomix.vercel.app)

Randomix adalah aplikasi web untuk membagi pemain olahraga menjadi tim secara **adil dan acak**, lalu (opsional) melanjutkannya ke **bagan turnamen single-elimination** — lengkap dengan opsi berbagi hasil sebagai gambar, PDF, teks, atau link WhatsApp.

## Fitur Utama

- **Generate Tim** — tambahkan pemain (dengan atau tanpa level skill: Newbie/Middle/Pro), tentukan jumlah tim, lalu acak. Saat mode level aktif, pembagian menggunakan algoritma greedy agar total skor tiap tim tetap seimbang.
- **Penempatan Pemain Baru Pasca-Generate** — kalau ada pemain ditambahkan setelah tim di-generate (misal ada yang telat datang), pemain itu masuk daftar "Perlu Ditempatkan" dan bisa dipilih: masuk ke tim tertentu, otomatis ke tim paling sedikit anggotanya, atau bikin tim baru. Anggota yang sudah masuk tim juga bisa dipindah tim atau tim dibubarkan tanpa perlu generate ulang semua. Detail aturan lengkap ada di `PRD.md` §5.1.
- **Buat Cup** — ubah hasil generate tim menjadi bagan turnamen otomatis, termasuk penanganan *bye* saat jumlah tim bukan pangkat dua. Tetap bisa dilanjutkan walau masih ada pemain pending (dengan peringatan).
- **Ekspor Hasil** — download sebagai PDF/gambar, salin sebagai teks, atau share langsung ke WhatsApp.
- **Persisted state** — progres tersimpan di `localStorage` (Pinia + `pinia-plugin-persistedstate`) sehingga tidak hilang saat refresh.
- **Mobile-first** — form & aksi utama di `/generate` pakai sticky bottom bar di layar kecil supaya tombol Generate selalu terjangkau tanpa scroll; bagan turnamen di `/create-cup` bisa di-scroll horizontal di HP.

## Tech Stack

- [Nuxt 4](https://nuxt.com/) (Vue 3, Vite)
- [Pinia](https://pinia.vuejs.org/) + `pinia-plugin-persistedstate` untuk state management
- [Tailwind CSS](https://tailwindcss.com/) untuk styling
- [vue3-tournament](https://www.npmjs.com/package/vue3-tournament) untuk render bagan turnamen
- `jspdf` & `html2canvas` (di-*lazy-load*) untuk ekspor PDF/gambar

## Prasyarat

- Node.js **20.19+** (lihat `.nvmrc` — dibutuhkan oleh Vite 7, versi Node yang lebih lama akan gagal saat `build`/`dev` dengan error `crypto.hash is not a function`). Kalau pakai `nvm`, jalankan `nvm use` di root project untuk otomatis pindah ke versi yang sesuai.
- pnpm (project ini menggunakan `packageManager: pnpm` — lihat `package.json`; lockfile-nya `pnpm-lock.yaml`, jangan pakai `npm`/`yarn` supaya tidak dobel lockfile)

## Setup

Install dependencies:

```bash
nvm use
pnpm install
```

## Development Server

Jalankan development server di `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build untuk production:

```bash
pnpm build
```

Preview hasil build secara lokal:

```bash
pnpm preview
```

Generate versi statis:

```bash
pnpm generate
```

Lihat [dokumentasi deployment Nuxt](https://nuxt.com/docs/getting-started/deployment) untuk detail lebih lanjut.

## Struktur Proyek

```
app/
├── app.vue                       # Root component (loading indicator, page outlet, toast host)
├── assets/css/main.css           # Design tokens & global a11y/motion defaults
├── components/                   # Komponen bersama
│   ├── BaseButton.vue            # Tombol dasar (variant primary/secondary/ghost/accent)
│   ├── EmptyState.vue
│   ├── BaseSkeleton.vue
│   ├── AppToast.vue
│   └── TeamAssignSelect.vue      # Select "pilih tim/otomatis/tim baru", dipakai di panel pending & pindah tim
├── composables/useToast.ts       # Sistem notifikasi toast global
├── pages/
│   ├── index.vue                 # Landing page
│   ├── generate.vue              # Form tambah pemain + generate tim + penempatan pemain pasca-generate
│   └── create-cup.vue            # Bagan turnamen
├── plugins/persist.client.ts
└── stores/cup.ts                 # State turnamen: tim, pertandingan, ronde, pemenang
```

## Environment Variables

| Variable                 | Default                        | Keterangan                                   |
| ------------------------ | ------------------------------- | --------------------------------------------- |
| `NUXT_PUBLIC_SITE_URL`   | `https://randomix.vercel.app`  | Dipakai untuk canonical URL & meta OpenGraph. Ganti bila pindah domain. |

## Live Demo

[randomix.vercel.app](https://randomix.vercel.app)

## Dokumentasi Produk

Lihat `PRD.md` (tidak di-commit, hanya lokal — lihat `.gitignore`) untuk detail requirement produk.
