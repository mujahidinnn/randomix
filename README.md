# ⚡ RANDOMIX v2.0

> Platform manajemen tim olahraga & turnamen mini — frontend-only, modern, dan advanced.

![Randomix](https://img.shields.io/badge/version-2.0.0-00c6ff?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript)

---

## 🚀 Quick Start

```bash
# Clone repo
git clone https://github.com/mujahidinnn/randomix.git
cd randomix

# Install dependencies
npm install

# Development
npm run dev

# Build production
npm run build
```

---

## 📁 Struktur Proyek

```
src/
├── types/
│   └── index.ts              # Semua TypeScript interfaces & constants
├── lib/
│   ├── balancing.ts          # Smart balancing algorithm (snake draft + greedy)
│   ├── tournament.ts         # Tournament engine (3 format)
│   └── export.ts             # Export center (5 format)
├── store/
│   └── useStore.ts           # Zustand store + localStorage persistence
├── components/
│   ├── PlayerManager.tsx     # Input & manajemen pemain
│   ├── ConfigDashboard.tsx   # Konfigurasi tim & turnamen
│   ├── ResultArena.tsx       # Tampilan hasil tim
│   ├── TournamentView.tsx    # Bracket & jadwal turnamen
│   └── ExportCenter.tsx      # Download & share hasil
├── App.tsx                   # Root component & tab navigation
├── main.tsx                  # Entry point
└── index.css                 # Global styles + Tailwind
```

---

## ✨ Fitur

### 🧠 Smart Balancing Algorithm
- **Snake Draft**: distribusi zigzag berdasarkan power ranking
- **Greedy Balance**: selalu assign ke tim dengan power terendah
- Otomatis memilih hasil dengan standard deviation terkecil
- Mendukung level: **Newbie** (1), **Middle** (2), **Pro** (3)

### 🏆 Tournament Engine
| Format | Deskripsi |
|--------|-----------|
| Single Elimination | Sistem gugur — klik pemenang langsung di bracket |
| Round Robin | Sistem liga — input skor, klasemen otomatis update |
| Grup Stage | Fase grup otomatis, shuffle seeded |

### 📤 Export Center
| Format | Library |
|--------|---------|
| Plain Text | `navigator.clipboard` |
| WhatsApp | `navigator.clipboard` (format bold WA) |
| PNG Image | `html-to-image` |
| PDF | `jsPDF` |
| Excel | `ExcelJS` (2 sheet: Overview + Detail) |

### 💾 Persistensi
- Semua data tersimpan di **localStorage** via Zustand persist middleware
- Data tidak hilang saat refresh browser
- Zero backend, zero database

---

## 🎨 Design System

- **Palet**: Electric Blue (`#00c6ff`) → Neon Green (`#00ff88`) gradient
- **Theme**: Dark mode elegan
- **UI**: Glassmorphism cards
- **Typography**: Montserrat (headings) + Inter (body)
- **Icons**: Lucide React
- **Animation**: Framer Motion

---

## 🔧 Tech Stack

- **React 18** + **TypeScript 5**
- **Tailwind CSS 3** (custom config)
- **Framer Motion** (animasi transisi)
- **Zustand** (state management + persistence)
- **Vite 5** (build tool)
- **Lucide React** (icons)

---

## 📝 License

MIT © 2025 Randomix
