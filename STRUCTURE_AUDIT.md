# HEKAS POS — Structure Audit & Target Alignment

> Snapshot perbandingan struktur aktual vs target.
> Dibuat: 2026-06-21 (commit baseline: `1f30ae0`)

Target struktur mengikuti spec front-end FE_HANDOFF v2.0.0 + R-series refactor
yang sudah berjalan sampai R3f (commit HEAD).

## 📊 Skor Kesesuaian

| Kategori                       | Skor   | Keterangan                                  |
| ------------------------------ | ------ | ------------------------------------------- |
| Top-level config               | 85%    | kurang `svelte.config.js`, `tests/`          |
| `src/lib/auth/`                | 25%    | 1/4 (cuma `roles.ts`)                       |
| `src/lib/api/`                 | 67%    | 8/12                                        |
| `src/lib/stores/`              | 100%   | 4/4                                         |
| `src/lib/types/`               | 100%   | 3/3                                         |
| `src/lib/utils/`               | 130%   | 13/5 (lebih banyak, lokasi setara)          |
| **`src/lib/components/ui/`**   | **0%** | shadcn-svelte belum diinisialisasi          |
| `src/lib/components/shared/`   | 67%    | 4/9 (+ extras di sub-folder)                |
| `src/lib/components/kasir/`    | ~25%   | POS 30%, Order 50%, lainnya 0              |
| `src/lib/components/gudang/`   | ~20%   | Beranda 25%, Inventaris 33%, sisanya 0     |
| `src/lib/components/manager/`  | ~50%   | Beranda 85%, sisanya seadanya               |
| `src/routes/`                  | 95%    | kurang `+layout.ts` root, `api/` (optional) |
| `static/`                      | 50%    | tidak ada `favicon.ico`                     |
| `tests/`                       | 0%     | belum ada                                   |

## 🎯 Gap Prioritas (urut eksekusi)

### 🔴 Kritis (fondasi hilang)
1. **`src/lib/components/ui/`** — shadcn-svelte (40+ komponen). Scaffold dulu.
2. **`src/lib/auth/`** — `session.ts`, `guard.ts`, `pin.ts` (3 file).
3. **`src/lib/api/`** — 9 file: `shifts`, `inventory`, `surat-jalan`, `employees`,
   `reports`, `dashboard`, `ai`, `telegram`, `settings`.
4. **`tests/`** — Vitest + Playwright config.

### 🟡 Penting (struktur ada, isi kurang)
5. **`src/lib/components/shared/`** — 5 file: `Breadcrumb`, `ErrorBoundary`,
   `LoadingSpinner`, `PinDialog`, `Pagination`.
6. **Sub-folder role components** yang masih kosong:
   - kasir: `Produk/`, `Shift/`, `Laporan/`, `Setting/`
   - gudang: `BarangKeluar/`, `SuratJalan/`
   - manager: `Karyawan/`, `Pengaturan/`, `AI/` (masing-masing 1-4 file)
7. **Root `+layout.ts`** untuk auth + theme loader.

### 🟢 Polish
8. `svelte.config.js` (extract dari `vite.config.ts` — best practice).
9. `static/favicon.ico` (copy dari `src/lib/assets/favicon.svg`).
10. `src/routes/api/` skeleton (edge functions, proxy).

## 📝 Catatan Deviasi

- File utilitas (`print.ts`, `export.ts`, `backup.ts`, `theme.ts`, `sound.ts`,
  `shortcuts.ts`) di target lama ada di `lib/` langsung, di struktur baru
  konsisten di `lib/utils/`. **Tidak dipindah** — lokasi `lib/utils/` lebih
  terorganisir dan sudah ada konvensi import di seluruh project.
- `svelte.config.js` saat ini tidak ada, konfigurasi SvelteKit disatukan di
  `vite.config.ts`. Dipisah jadi best practice tapi tidak wajib secara
  fungsional.
- Komponen `LoginForm.svelte`, `MemberForm.svelte`, `MemberDetail.svelte`,
  `PaymentForm.svelte`, `ImageUploader.svelte` ada di root `components/`,
  di struktur target bisa diletakkan di sub-folder role yang relevan saat
  sudah stabil.

## 🚀 Rencana Eksekusi

Refactor dilakukan step-by-step dengan commit di tiap checkpoint besar:

| Step | Isi                                                |
| ---- | -------------------------------------------------- |
| 0    | Audit file + base commit                           |
| 1    | Top-level config (+layout.ts, svelte.config, tests)|
| 2    | `lib/auth/` (3 file)                               |
| 3    | `lib/api/` (9 file)                                |
| 4    | `lib/components/shared/` (5 file)                  |
| 5    | `lib/components/ui/` shadcn-svelte scaffold        |
| 6    | `lib/components/kasir/` lengkapi sub-folder        |
| 7    | `lib/components/gudang/` lengkapi sub-folder       |
| 8    | `lib/components/manager/` lengkapi sub-folder      |
| 9    | `routes/api/` + verifikasi svelte-check + commit   |

Total file yang akan dibuat/diubah: ±70 file (mostly scaffolds/stubs untuk
komponen baru; fungsionalitas detail diisi pada iterasi berikutnya).
