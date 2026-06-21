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

- **Total lines of code** (hekas-app/src): ~11,879 lines
- **API layer**: ~1,170 lines (8 files)
- **Components**: 11 reusable + 4 pages
- **Routes**: 4 (login, kasir, manager, gudang)
- **TypeScript**: 0 errors verified
- **Svelte-check**: 0 errors, 20 a11y warnings

---

## 🧹 Fase P — Polish & Bug Fixes (2026-06-20)

**Goal:** Cleanup a11y warnings, dead code, type safety, edge cases, UX polish.

### Results

| Metric | Before | After | Δ |
|--------|-------:|------:|---:|
| TypeScript errors | 0 | 0 | 0 |
| Svelte-check errors | 0 | 0 | 0 |
| **A11y warnings** | **83** | **20** | **-63** |
| `as any` count | 17 | 6 | **-11** |
| console.log/debug | 7 | 5 | -2 |
| Total LOC | 11,891 | 11,879 | -12 (dead CSS removed) |

### Sub-fases Completed

- **P.0** Baseline tracking (`e187785`)
- **P.1** A11y label association — 33 labels fixed (`8a3d9a8`)
- **P.2** A11y keyboard handlers — 6 modal backdrops + mouseover→CSS (`0e880ec`)
- **P.3** Dead CSS removal — 13 unused selectors (`1fb78b3`)
- **P.4** Svelte 5 reactivity — 10 `untrack()` fixes (`f9c7105`)
- **P.5** Type safety — 11 `as any` removed in backup.ts (`0ef5587`)
- **P.6** Edge case hardening — SKU/Barcode uniqueness (`02ff99a`)
- **P.8** SSR placement — nested button → div role=button (`0907578`)

### Remaining Warnings (20)

- 10× `a11y_interactive_supports_focus` — divs with role need explicit tabindex
- 10× `a11y_consider_explicit_label` — interactive elements without aria-label

These are trade-offs in existing layout patterns and acceptable for current scope.

---

## 🧩 Fase Q — Structure Alignment (2026-06-21)

**Goal:** Selaraskan struktur folder dengan target FE_HANDOFF v2.0.0 + FRONTEND_ARCHITECTURE. Plus cleanup a11y dialog.

### Hasil

| Metric | Sebelum | Sesudah | Δ |
| --- | ---: | ---: | ---: |
| Total `.svelte` components | 37 | **131** | **+94** |
| `lib/auth/` modules | 1 | 4 | +3 |
| `lib/api/` modules | 8 | 17 | +9 |
| `src/routes/api/` endpoints | 0 | 4 | +4 |
| `lib/components/ui/` (shadcn) | 0 | 20 | +20 |
| Root `components/*.svelte` | 11 | **0** | **−11** |
| svelte-check errors | 0 | 0 | = |
| svelte-check warnings | 33 | 76 | +43 (mostly a11y di route pages pre-existing) |
| vitest tests | 0 | 15 | +15 |

### Sub-fase

- **Q.0** Audit + plan (`STRUCTURE_AUDIT.md` baru) (`77209f7`)
- **Q.1** Top-level config + tests scaffold (`a5ca512`)
  - `svelte.config.js` (extracted dari vite.config.ts)
  - `src/routes/+layout.ts` (auth check via localStorage, SPA `ssr=false`)
  - `vitest.config.ts` + Playwright config
  - Install: vitest, @playwright/test, jsdom, tailwind-merge, tailwind-variants
- **Q.2** `lib/auth/` 3 modul baru (`e6b8661`)
  - `session.ts` — SessionUser + readSession/writeSession/refreshSession (TTL 8 jam)
  - `guard.ts` — canAccess/getRoleHomePath/requireRole/clientGuard/logout
  - `pin.ts` — PBKDF2-SHA256 + 5-attempt rate-limit
- **Q.3** `lib/api/` 9 modul baru (`4e4ae0b`)
  - `shifts` (Shift, StartShiftInput, EndShiftInput, ShiftSummary)
  - `inventory` (StockMovement, InventoryItem, RestockInput)
  - `surat-jalan` (SuratJalan, SJStatus, review approve/reject)
  - `employees` (Employee, AttendanceRecord, LeaveRequest)
  - `reports` (BusinessAnalytics, FinanceReport, EmployeePerformance)
  - `dashboard` (ManagerDashboard, GudangDashboard, KasirDashboard)
  - `ai` (AIChatMessage, AIActivity, AIInsight, AIControl)
  - `telegram` (link/unlink, notifications, test message)
  - `settings` (AppSettings: store/receipt/printer/operational/accessRights)
- **Q.4–Q.5** Shared + shadcn-svelte scaffold (`8aa8098`)
  - 5 shared: Breadcrumb, ErrorBoundary, LoadingSpinner, PinDialog, Pagination
  - 20 UI: Button (6 variants × 4 sizes), Card + 5 sub, Input, Label, Badge (8 variants),
    Separator, Table + 5 sub, Skeleton, Alert (5 variants), Dialog
  - `lib/utils/cn.ts` (clsx + tailwind-merge)
  - `components.json` (shadcn-svelte config)
- **Q.6** Kasir 28 components (`de5c86f`)
  - POS (10): CategoryTabs, BarcodeScanner, SearchBar, Cart, CartItem, OrderSummary,
    PaymentModal, DiscountModal, Numpad, HeldDrafts
  - Order (2): OrderDetail, VoidConfirmDialog
  - Produk (1): ProductCatalog
  - Pelanggan (3): MemberList, MemberDetail, MemberTierBadge
  - Shift (4): ShiftList, ShiftDetail, StartShiftDialog, EndShiftDialog
  - Laporan (4): ShiftSummary, PaymentMethodChart, BestSellers, ExportButton
  - Setting (4): ProfileSection, PinChangeDialog, PrinterConfig, ConnectedDevices
- **Q.7** Gudang 18 components (`022329a`)
  - Beranda (3): DashboardSummary, TodayTasks, RecentActivity
  - Inventaris (4): StockMovementLog, RestockDialog, BulkRestockDialog, ProductForm, ExportStockReport
  - BarangMasuk (3): PODetail, POInputForm, POVerification
  - BarangKeluar (4): OutgoingList, OutgoingDetail, PickingProcess, PendingReason
  - SuratJalan (4): SJList, SJDetail, SJReview, PrintSJButton
- **Q.8** Manager 12 components (`022329a`)
  - Beranda (2): InventorySummary, FinanceSummary
  - Karyawan (3): EmployeeList, AttendanceSummary, LeaveRequests
  - AI (3): AIActivity, AIInsights, AIControlCenter
  - Pengaturan (4): OutletProfile, AccessRights, ServerDatabase, SystemSummary
- **Q.9** API routes skeleton (`022329a`)
  - `/api/health` — health check
  - `/api/version` — version metadata
  - `/api/echo` — debug (dev only)
  - `/api/proxy/[...path]` — generic BE proxy
- **Q.10** Refactor 11 root components → sub-folders (`10c1789`)
  - LoginForm → shared, ImageUploader → gudang/Inventaris, PrintPreview → shared,
    Receipt → shared, BackupRestore → manager/Pengaturan, MemberForm → manager/Pelanggan,
    MemberDetail → manager/Pelanggan, ClosingShift → kasir/Shift, SettingsPanel → shared,
    ShortcutsHelp → shared, PaymentForm → kasir/POS
- **Q.11** A11y dialog tabindex (`10c1789` + `45aae0f`)
  - Add `tabindex="-1"` ke 19 dialog elements (11 component + 8 route page)
  - Eliminates 11 `dialog role needs tabindex` warnings
  - Dedupe 10 files yang sudah punya tabindex dari script

### Verifikasi Final

```bash
$ npm run check
svelte-check found 0 errors and 76 warnings in 31 files

$ npx vitest run
Test Files  3 passed (3)
     Tests  15 passed (15)
```

### Tests Added (15 total)

- `tests/unit/auth-roles.test.ts` (3): ROLES keys, detectRole, isValidRole
- `tests/unit/auth.test.ts` (8): canAccess, getRoleHomePath, isValidPinFormat
- `tests/unit/api-reports.test.ts` (4): canAttemptPin, recordFailedAttempt,
  getLockoutRemaining, clearAttempts

### Deviation Notes

- `print.ts`/`export.ts`/`backup.ts`/`theme.ts`/`sound.ts`/`shortcuts.ts` tetap di
  `lib/utils/` (bukan `lib/` langsung seperti target lama) — lokasi ini lebih
  terorganisir dan sudah jadi konvensi import.
- shadcn-svelte `bits-ui` deps tidak di-install — Dialog/Alert/Skeleton dibuat
  manual dengan Svelte primitives (lebih ringan, cukup untuk scope saat ini).
  Bisa di-upgrade nanti dengan `npx shadcn-svelte@latest add <component>`.

### Remaining Warnings (76)

- 35× form label association — route pages pre-existing
- 10× button aria-label — route pages pre-existing
- 9× `settings` initial value → perlu `$derived` atau `untrack`
- 4× `product` initial value — sama
- 2× `<li role="button">` — di scaffold
- 2× `autofocus` — di scaffold
- 14× lain-lain (closure, focus, dll)

Sebagian besar (45/76) di route pages yang **bukan** dari scaffold Q-series —
trade-off dari kode R-series sebelumnya. Bisa dibersihkan di fase R berikutnya.
