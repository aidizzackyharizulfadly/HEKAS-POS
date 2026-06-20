# HEKAS POS — Implementation Progress

> Full-frontend SvelteKit 2 + Svelte 5 + Tailwind 4 POS (Point of Sale) system dengan mock API layer localStorage. Frontend-only, no backend.

## 🚀 Quick Start

```bash
# 1. Masuk ke folder project (clone dari GitHub atau kalau udah ada)
git clone https://github.com/aidizzackyharizulfadly/HEKAS-POS.git
cd HEKAS-POS/hekas-app
# (kalau udah ada di lokal: cd ~/Documents/HEKAS-POS-main/hekas-app)

# 2. Install dependencies
npm install
# atau: bun install

# 3. Jalankan dev server
npm run dev
# → buka http://localhost:5173 di browser
```

## 🔐 Demo Login

| Username  | Password | Role   |
|-----------|----------|--------|
| `kasi01`    | `[REDACTED]`     | Kasir    |
| `manager01` | `[REDACTED]`     | Manager  |
| `gudang01`  | `[REDACTED]`     | Gudang   |

> Role otomatis terdeteksi dari prefix username (`kasi*`/`manager*`/`mgr*`/`gudang*`/`admin*`).

## 📂 Project Structure

```
HEKAS-POS-main/
├── hekas-app/                    # SvelteKit 2 + Svelte 5 + Tailwind 4 app
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api/              # Mock API layer (localStorage)
│   │   │   │   ├── types.ts
│   │   │   │   ├── storage.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── members.ts
│   │   │   │   ├── transactions.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── index.ts
│   │   │   ├── components/       # Reusable components
│   │   │   │   ├── Receipt.svelte
│   │   │   │   ├── PrintPreview.svelte
│   │   │   │   ├── ClosingShift.svelte
│   │   │   │   ├── BackupRestore.svelte
│   │   │   │   ├── SettingsPanel.svelte
│   │   │   │   └── ShortcutsHelp.svelte
│   │   │   ├── print.ts          # Thermal printer + browser print
│   │   │   ├── export.ts         # CSV + HTML report export
│   │   │   ├── backup.ts         # Backup / restore / reset
│   │   │   ├── theme.ts          # Dark/light/auto theme
│   │   │   ├── sound.ts          # Web Audio sound feedback
│   │   │   └── shortcuts.ts      # Keyboard shortcut registry
│   │   ├── routes/
│   │   │   ├── login/+page.svelte
│   │   │   ├── kasir/+page.svelte       # 2100+ lines
│   │   │   ├── manager/+page.svelte     # 700+ lines
│   │   │   └── gudang/+page.svelte      # 700+ lines
│   │   ├── app.css               # Tailwind + print CSS
│   │   └── app.html
│   ├── package.json
│   ├── svelte.config.js
│   ├── tailwind.config (via Vite plugin)
│   └── vite.config.ts
├── design/                       # Figma React reference (shadcn/ui)
├── docs/                         # Project documentation
├── stitch_hekas_pos_*/           # Stitch HTML exports (visual reference)
├── contohposkasir.html/jpg       # Example POS reference
└── PROGRESS.md                   # ← you are here
```

## ✅ Completed Phases

### **Fase 0: Foundation** (Step 1-4)
- Created `src/lib/api/` with 8 TypeScript files (~937 lines): `types`, `storage`, `products`, `members`, `transactions`, `analytics`, `auth`, `index` facade
- Refactored `src/routes/kasir/+page.svelte` → API integration, loading skeleton, error UI, `processCheckout()`, `doHold()`, `recallHeldItem()`, toast notification, invoice format `INV-YYYYMMDD-0001`
- Created `src/routes/manager/+page.svelte` (700+ lines, 5 tab: Ringkasan/Outlet/Shift/Persetujuan/Telegram)
- Created `src/routes/gudang/+page.svelte` (700+ lines, 2 tab: Inventaris/Mutasi Stok)
- Deleted `backend/` folder (full-frontend only)
- **Verified**: `svelte-check` 0 errors, dev server 200 OK

### **Fase A: Cetak Struk** (5 sub-fases)
- Created `src/lib/print.ts` — thermal printer (ESC/POS via Web Serial API) + browser print fallback + ESC/POS builder
- Updated `src/lib/api/storage.ts` — settings storage
- Created `src/lib/components/Receipt.svelte` — reusable receipt template, compact & watermark modes
- Created `src/lib/components/PrintPreview.svelte` — modal preview + print controls + thermal connect + store settings
- Added print CSS rules in `src/app.css`: `@page { size: 80mm auto; margin: 0 }`
- Integrated PrintPreview in kasir page — import, state, auto-print (300ms delay), tombol "🖨️ Cetak Struk"
- Integrated reprint in manager page — tombol "Cetak" di transactions table, `isReprint` watermark "COPY"
- **Verified**: `svelte-check` 0 errors, 63 a11y warnings

### **Fase B: Laporan & Export** (5 sub-fases)
- Added `getClosingReport()` in `src/lib/api/transactions.ts` — aggregate per periode: tx_count, void, by_payment, top_products, hour_breakdown
- Created `src/lib/export.ts` — CSV UTF-8 BOM (Excel-friendly) + HTML report → print-to-PDF + helper `fmtIDR`
- Created `src/lib/components/ClosingShift.svelte` — X/Z Report modal: toggle "Hari Ini / Shift Ini", KPI cards, breakdown payment, top 5 produk, 3 tombol aksi
- Integrated ClosingShift in kasir page — logout button → modal
- Wired up Export di manager page — `handleExportCSV` + `handlePrintReport` handlers, header buttons
- **Verified**: `svelte-check` 0 errors, dev server 200 OK

### **Fase C: Backup & Restore** (5 sub-fases)
- Created `src/lib/backup.ts` — `exportBackup()`, `previewBackup()`, `importBackup()`, `resetData()`, `getDataStats()`, `isBackupStale()` (≥ 7 hari threshold)
- Created `src/lib/components/BackupRestore.svelte` — 3 tabs (Export/Import/Reset): indigo gradient header, stats summary, ISI BACKUP table, stale warning, file picker, JSON paste, mode Replace/Merge, reset double-confirm
- Integrated di manager page — tombol "Backup" dengan stale badge merah
- **Verified**: `svelte-check` 0 errors, dev server 200 OK

### **Fase D: UX Polish & Shortcuts** (5 sub-fases)
- Created `src/lib/theme.ts` — light/dark/auto theme dengan persistence + auto-detect OS preference
- Created `src/lib/sound.ts` — Web Audio API sound feedback (success/error/scan/click/notification/cha-ching) — no asset files
- Created `src/lib/shortcuts.ts` — Global keyboard shortcut registry + handler + 17 predefined shortcuts
- Created `src/lib/components/SettingsPanel.svelte` — Modal settings: theme picker + sound toggle + test sounds
- Created `src/lib/components/ShortcutsHelp.svelte` — Modal daftar 17 pintasan keyboard dikelompokkan 4 kategori
- Added dark mode CSS variables di `src/app.css`
- Updated `src/routes/+layout.svelte` — init theme + sound on mount
- Updated `src/routes/kasir/+page.svelte` — register 5 keyboard shortcuts (`?` `/` `d` `s` `esc`) + render SettingsPanel & ShortcutsHelp modal
- **Verified**: `svelte-check` 0 errors, 64 a11y warnings

## ⏳ Pending / Future Phases

### **Fase E: Manajemen Member** (planned)
- CRUD member lengkap
- Tier benefits: Silver 0% / Gold 5% / Platinum 10%
- Top-up poin
- Transaction history

### **Fase F: Product Image** (planned)
- Base64 localStorage
- Image picker gallery
- Drag & drop

### **Fase 5: Multi-Payment Split** (cancelled — refactor too risky)
- Schema change `payment_method: string` → `payments: PaymentMethod[]`
- Affects 9 files (~560 lines)
- Best done in dedicated session with backup

## 🎨 Theme Palette

- `#2563EB` biru
- `#059669` hijau
- `#F59E0B` kuning
- `#DC2626` merah
- `#F0F4F8` background
- Indigo gradient untuk backup modal

## 💾 LocalStorage Keys

- `hekas:seeded` — seed flag
- `hekas:products` — product catalog
- `hekas:members` — member database
- `hekas:users` — user accounts
- `hekas:transactions` — transaction history
- `hekas:held` — held transactions
- `hekas:settings` — app settings (store info, receipt config, printer)

## 🖨️ Printing

- **Paper**: 80mm default (42 char) atau 58mm (32 char)
- **Print CSS**: `@page { size: 80mm auto; margin: 0 }`
- **Dual-mode**: Web Serial API untuk thermal (Chrome/Edge only) + `window.print()` fallback universal
- **Auto-print delay**: 300ms setelah checkout
- **Reprint watermark**: "COPY" merah transparan

## 💾 Backup Format

```json
{
  "app": "hekas-pos",
  "version": 1,
  "exported_at": "2026-06-20T17:00:00Z",
  "device": "browser",
  "data": {
    "products": [...],
    "members": [...],
    "users": [...],
    "transactions": [...],
    "held": [...],
    "settings": {...}
  }
}
```

- Backup file: `hekas-backup-YYYYMMDD_HHMM.json`
- Stale threshold: ≥ 7 hari
- Reset double-confirm: input harus ketik `RESET` (case-sensitive)

## 🔊 Sound Feedback

- `playSuccess()` (mid → high double beep)
- `playError()` (descending square wave)
- `playScan()` (quick high beep)
- `playClick()` (subtle 30ms click)
- `playNotification()` (3 quick beeps)
- `playChaChing()` (cash register style)

## ⌨️ Keyboard Shortcuts

| Kategori | Shortcut | Aksi |
|----------|----------|------|
| **Global** | `?` | Buka panel pintasan keyboard |
| | `Esc` | Tutup modal/batal (priority chain) |
| **Kasir** | `/` | Fokus ke pencarian produk |
| | `Enter` | Tambah produk pertama hasil cari |
| | `+` `-` | Tambah/kurangi qty item |
| | `h` | Hold (tahan transaksi) |
| | `p` | Buka panel pembayaran |
| | `Del` | Hapus item dari keranjang |
| **Navigasi** | `g` + `1/2/3` | Pergi ke halaman |
| **Aksi Cepat** | `b` | Backup & Restore |
| | `e` | Export CSV |
| | `c` | Cetak laporan |
| | `d` | Toggle dark mode |

## 📊 Stats

- **Total lines of code** (hekas-app/src): ~9000+ lines
- **API layer**: ~937 lines (8 files)
- **Components**: 6 reusable + 4 pages
- **Routes**: 4 (login, kasir, manager, gudang)
- **TypeScript**: 0 errors verified
- **Svelte-check**: 0 errors, 64 a11y warnings
