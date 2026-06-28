# Panduan Eksplorasi HEKAS POS Manager v2

URL: **http://127.0.0.1:8785/** (otomatis redirect ke `/dashboard`)

## Setup Awal (sekali aja)

1. Buka browser, akses `http://127.0.0.1:8785/`
2. Landing page: `/dashboard` dengan greeting "Sore, Bu Siti —" (greeting otomatis berubah sesuai jam: Pagi/Siang/Sore/Malem)
3. Persona default: Siti Wahyuni (Manager), outlet HEKAS Pandeansari

## Layout Shell (ada di setiap halaman)

Cek ini dulu sebelum masuk menu:

- **Top navbar** (tinggi 40px, navy `#1E3A5F`): logo "HEKAS" + badge hijau "What's New!" + 5 menu (Dashboard / Transaksi▾ / Master▾ / Laporan▾ / Pengaturan) + outlet selector + user badge (SW + Siti Wahyuni + Manager)
- **Dropdown hover, bukan click** — hover cursor ke button Transaksi/Master/Laporan untuk buka sub-menu
- **Content area** (background abu sangat terang `#F3F4F6`, padding 24px)

## Verifikasi per Menu (36 route, ~5 menit)

### 1. Dashboard (`/dashboard`)
**Yang harus terlihat:**
- Greeting block dengan avatar "SW" gradient navy-biru, status line "outlet Pandeansari buka, 6 shift jalan." (status berubah per jam)
- Card "Ringkasan Penjualan" dengan 8 metric cards (Gross Sales / Net Sales / Gross Profit / Gross Margin / Total Bill / Avg Sales/Bill / Total Pax / Avg Sales/Pax)
- Line chart "Penjualan" dengan 7 titik (Min-Sab), dot orange di peak (Sel), label hari di bawah
- 6 donut cards (Top Outlet / Top Pelanggan / Top Produk by Jumlah / Top Produk by Qty / Top Kategori by Jumlah / Top Kategori by Qty) — **multi-segment donut** (bukan solid 100%)
- Tabel "Produk dengan Stok Rendah" dengan pagination

### 2. Transaksi (13 sub-route)
Hover ke button **Transaksi▾** di navbar — dropdown muncul dengan 14 menu (Penjualan/Pembelian/dst dipisah divider).

| Route | Highlight yang harus terlihat |
|-------|-------------------------------|
| `/transaksi/penjualan` | 10 rows, format date "28/06/26" + jam "14:23", status badges Selesai/Pending/Belum Dibayar, Ubah split pill |
| `/transaksi/pembelian` | 7 rows supplier (PT Sumber Rezeki/CV Maju Bersama/UD Makmur Sentosa) |
| `/transaksi/pendapatan` | 5 rows Pendapatan Bunga/Sewa/Lain |
| `/transaksi/pengeluaran` | 6 rows Bayar Listrik/Air/Internet/Sampah/Keamanan |
| `/transaksi/penyesuaian-stok` | 4 rows format qty "15 → 12" + alasan Rusak/Tumpah/Expired |
| `/transaksi/mutasi` | 4 rows transfer antar outlet |
| `/transaksi/produksi` | 2 tabs: Daftar Transaksi (4 rows) + Formula Produksi (3 rows: Paket Sembako A/B/Snack) |
| `/transaksi/waste` | 2 summary cards (Jumlah Barang: 25 unit + Nominal Total Modal: rp 449.000) dengan accent border biru + rose |
| `/transaksi/reservasi` | 2 tabs: Daftar Reservasi (3 rows) + Paket Reservasi (3 rows: Meeting A/B/C) |
| `/transaksi/komisi` | **2 tabs** (Dasbor Komisi / Daftar Transaksi) + **3 summary cards** (Total Produk: 847 / Total Invoice: 284 / Total Nilai: rp 4.840.000) |
| `/transaksi/kas-bank` | Kolom PRD-literal: **Kode | Nama | Saldo | Status** (7 akun: KK-PND-001/BCA-1234/dll) |
| `/transaksi/coa` | 12 akun Chart of Account, Ledger split button (bukan Ubah) |
| `/transaksi/approval` | Dropdown **11 sub-tipe** (Semua/Pembelian-Invoice/Order/Pembayaran/Pengeluaran/Pendapatan/Transfer/Produksi/Mutasi/Penyesuaian/Waste) + 2 inner tabs (Daftar/Aksi) + kolom lengkap: No Approval/Dibuat Oleh/Tgl Dibuat/Tipe/No Transaksi/Verifikasi Oleh/Tgl Verifikasi/Nominal/Status |

### 3. Master (12 sub-route)
Hover ke button **Master▾** — 11 menu items: Kontak/Pelanggan/Supplier/Karyawan/Produk/Aset/dst.

| Route | Highlight |
|-------|-----------|
| `/master/kontak` | Dropdown Tipe (Semua/Pelanggan/Supplier/Karyawan/Pemegang Saham), kolom dinamis: Tingkat Harga + Saldo muncul hanya untuk Pelanggan |
| `/master/pelanggan` | **Page terpisah** hanya Pelanggan (filtered otomatis), kolom Tingkat Harga + Saldo prominent |
| `/master/supplier` | Page hanya Supplier, kolom Tingkat Harga "Distributor" |
| `/master/karyawan` | **3 tabs**: Daftar Karyawan (5 rows + Jabatan/Jam Shift) / Riwayat Absensi (7 rows: 5 Hadir/1 Tidak Hadir/1 Terlambat) / Sesi Shift (5 rows Shift 1/2) |
| `/master/produk` | 15 rows + POS toggle switch per row + link "analitik" di bawah nama + qty color-coded (rose/amber/biru) |
| `/master/outlet` | 4 rows dengan logo avatar gradient inisial (HP/HS) |
| `/master/target-outlet` | 3 rows program target |
| `/master/grup-komisi` | 3 rows dengan 8 kolom (termasuk Item Komisi/Kategori/Metode) |
| `/master/aset` | 4 rows dengan kode AST-xxx |
| `/master/qpon` | 3 rows program diskon |
| `/master/toko-hekas` | **EmptyState** dengan icon + "Toko Online Belum Diaktifkan" |
| `/master/kupon` | 4 rows dengan badge Tipe (Publik/Privat) |
| `/master/membership` | 3 rows program membership |
| `/master/loyalti-poin` | 2 rows program poin |

### 4. Laporan (3 sub-route)
Hover ke button **Laporan▾** — 3 menu: Laporan Penjualan / Laporan Stok / Laporan Keuangan.

| Route | Highlight |
|-------|-----------|
| `/laporan` (= Laporan Penjualan) | Trend line chart mingguan + tabel 7 rows periode harian |
| `/laporan/stok` | 5 rows kategori dengan Total Item/Nilai Stok/Perputaran |
| `/laporan/keuangan` | 6 rows akun dengan Bulan Ini/Year-to-Date/Growth |

### 5. Pengaturan (5 sub-route)
Direct link di navbar (no dropdown).

| Route | Highlight |
|-------|-----------|
| `/pengaturan` | 4 icon-cards (Toko/Penjualan/Tampilan/Reservasi) dengan arrow "Konfigurasi →" |
| `/pengaturan/toko` | Form Nama Toko + Zona Waktu + 7-day toggle operasional + social media inputs |
| `/pengaturan/penjualan` | Checkbox Tipe Order (Dine In/Take Away/Delivery) + Metode Checkout (Tunai/QRIS/Transfer/EDC) |
| `/pengaturan/tampilan` | Upload area Logo 600x150 + 3-slot Banner 1080x360 + Tagging (dengan pill removable) |
| `/pengaturan/reservasi` | Toggle ON/OFF besar |

## Dropdown Navbar — Cara Pakai

5 menu utama (Dashboard/Transaksi/Master/Laporan/Pengaturan) + outlet + user. Yang punya **dropdown▾**: Transaksi, Master, Laporan.

Dropdown punya **3 trigger** (semua work):
1. **Hover** cursor ke button — dropdown langsung muncul
2. **Click** button — toggle on/off (chevron rotate-180 saat open)
3. **Escape key** — close dropdown

Close otomatis:
- Klik di luar navbar
- Pilih salah satu menu item (otomatis navigasi + close)
- Hover ke menu lain / outlet / user badge
- Delay 120ms saat mouse leave (biar cursor bisa geser dari button ke menu panel tanpa close prematur)

Setiap button dropdown punya `aria-haspopup="true"` dan `aria-expanded={true/false}` — proper a11y.

## Quick Test Interaksi

1. **Hover dropdown navbar** — Transaksi/Master/Laporan harus muncul
2. **Klik tab Karyawan** — ganti dari Daftar Karyawan → Riwayat Absensi → Sesi Shift, lihat search placeholder & tabel berganti
3. **Dropdown Kontak** — pilih "Pelanggan" dari dropdown, kolom Tipe hilang, Tingkat Harga + Saldo tetap muncul; pilih "Supplier", Tingkat Harga + Saldo hilang
4. **Status badges hover** — cursor di atas badge, warna konsisten (Selesai sky/Aktif emerald/Pending amber/Ditolak rose)
5. **Pagination arrow** — page 1 active, prev disabled, next aktif
6. **Ubah split button** — pill navy dengan chevron, hover lebih gelap

## Troubleshooting

- **Dropdown gak muncul saat klik** — udah fix (Aug 2026 update): click + hover + Escape semua work. Kalau masih ada issue, hard refresh `Ctrl+Shift+R`.
- **Page blank** — hard refresh `Ctrl+Shift+R`
- **Server mati** — bilang ke AI, dia start ulang `npm run dev` di port 8785

## Yang HARUS terlihat di SEMUA halaman (visual identity)

- Navbar navy `#1E3A5F` dengan logo HEKAS + 5 menu konsisten
- Tabel dengan header abu, border tipis, hover abu sangat muda
- Button primary navy `#1E3A5F`, button outline border navy text navy
- Format rupiah **lowercase** "rp 142.531.800" (bukan "Rp")
- Date format compact "28/06/26" + en-dash untuk range "22/06/2026 – 28/06/2026"
- Sortable header pakai icon ⇅
- Ubah/Ledger split button rounded-full navy
- No emoji berlebihan di UI text (semua replaced dengan lucide-style SVG atau text label)