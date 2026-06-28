// Mock data Master: Kontak, Produk, Outlet, dll
export type Kontak = {
  nama: string;
  tipe: 'Pelanggan' | 'Supplier' | 'Karyawan' | 'Pemegang Saham';
  email: string;
  hp: string;
  outlet?: string;
  tingkatHarga?: 'Retail' | 'Grosir' | 'Distributor' | 'Karyawan' | 'Manajemen';
  saldo?: string;
};

export const kontakList: Kontak[] = [
  { nama: 'Ibu Ratna Wulandari', tipe: 'Pelanggan', email: 'ratna.w@gmail.com', hp: '0812-3456-7890', tingkatHarga: 'Retail', saldo: 'Rp 425.000' },
  { nama: 'Bp. Hartono', tipe: 'Pelanggan', email: 'hartono@yahoo.com', hp: '0813-2345-6789', tingkatHarga: 'Grosir', saldo: 'Rp 0' },
  { nama: 'PT Sumber Rezeki', tipe: 'Supplier', email: 'order@sumberrezeki.co.id', hp: '0341-789-012', outlet: 'Pandeansari' },
  { nama: 'CV Maju Bersama', tipe: 'Supplier', email: 'sales@majubersama.id', hp: '0341-456-789', outlet: 'Panjen' },
  { nama: 'Bp. Joko Santoso', tipe: 'Karyawan', email: 'joko@hekas.id', hp: '0812-1111-2222', outlet: 'Pandeansari' },
  { nama: 'Ibu Sari Rahayu', tipe: 'Karyawan', email: 'sari@hekas.id', hp: '0813-2222-3333', outlet: 'Panjen' },
  { nama: 'Bp. Sutrisno', tipe: 'Karyawan', email: 'sutrisno@hekas.id', hp: '0814-3333-4444', outlet: 'Sulfat' },
  { nama: 'Bp. Hendra Wijaya', tipe: 'Pemegang Saham', email: 'hendra@hekas.co.id', hp: '0812-9999-8888' }
];

export type Produk = {
  nama: string;
  sku: string;
  kategori: string;
  qty: number;
  unit: string;
  harga: string;
  varian: string;
  pos: boolean;
};

export const produkList: Produk[] = [
  { nama: 'Beras Premium 5kg', sku: 'BRP-5KG-001', kategori: 'Sembako', qty: 1320, unit: 'karung', harga: 'Rp 78.500', varian: '5kg, 10kg', pos: true },
  { nama: 'Minyak Goreng 2L', sku: 'MGR-2L-001', kategori: 'Bahan Masak', qty: 968, unit: 'botol', harga: 'Rp 38.200', varian: '1L, 2L, 5L', pos: true },
  { nama: 'Gula Pasir 1kg', sku: 'GLP-1KG-001', kategori: 'Sembako', qty: 712, unit: 'bungkus', harga: 'Rp 18.500', varian: '1kg, 2kg', pos: true },
  { nama: 'Telur Ayam 1kg', sku: 'TLR-1KG-001', kategori: 'Sembako', qty: 1842, unit: 'rak', harga: 'Rp 28.500', varian: '1kg, 0.5kg', pos: true },
  { nama: 'Tepung Terigu 1kg', sku: 'TPG-1KG-001', kategori: 'Bahan Masak', qty: 425, unit: 'bungkus', harga: 'Rp 14.200', varian: '1kg, 2kg, 5kg', pos: true },
  { nama: 'Mie Instan Goreng', sku: 'MIE-001', kategori: 'Snack', qty: 2450, unit: 'bungkus', harga: 'Rp 3.800', varian: 'Goreng, Kuah, Pedas', pos: true },
  { nama: 'Air Mineral 600ml', sku: 'AIR-600-001', kategori: 'Minuman', qty: 3120, unit: 'botol', harga: 'Rp 4.200', varian: '600ml, 1.5L', pos: true },
  { nama: 'Sabun Mandi 100g', sku: 'SBM-100-001', kategori: 'Toiletries', qty: 685, unit: 'batang', harga: 'Rp 5.500', varian: '100g, 200g', pos: true },
  { nama: 'Pasta Gigi 150g', sku: 'PSG-150-001', kategori: 'Toiletries', qty: 528, unit: 'tube', harga: 'Rp 12.500', varian: '150g, 250g', pos: true },
  { nama: 'Deterjen 1kg', sku: 'DTJ-1KG-001', kategori: 'Toiletries', qty: 392, unit: 'bungkus', harga: 'Rp 24.800', varian: '1kg, 2kg', pos: true },
  { nama: 'Tissue 250sht', sku: 'TSC-250-001', kategori: 'Toiletries', qty: 845, unit: 'bungkus', harga: 'Rp 18.500', varian: '250sht, 500sht', pos: true },
  { nama: 'Bumbu Dapur 250g', sku: 'BMB-250-001', kategori: 'Bahan Masak', qty: 142, unit: 'bungkus', harga: 'Rp 8.500', varian: '250g, 500g', pos: false },
  { nama: 'Kopi Sachet', sku: 'KPI-SCH-001', kategori: 'Minuman', qty: 1850, unit: 'sachet', harga: 'Rp 2.500', varian: 'Gula, Original, Sachet', pos: true },
  { nama: 'Teh Celup', sku: 'TEH-CLP-001', kategori: 'Minuman', qty: 920, unit: 'box', harga: 'Rp 8.200', varian: '25sht, 50sht', pos: true },
  { nama: 'Snack Kerupuk 200g', sku: 'KRK-200-001', kategori: 'Snack', qty: 645, unit: 'bungkus', harga: 'Rp 12.500', varian: 'Original, Pedas', pos: true }
];

export type Outlet = {
  nama: string;
  email: string;
  telpon: string;
  fax: string;
  status: string;
  masaBerlaku: string;
};

export const outletList: Outlet[] = [
  { nama: 'HEKAS Pandeansari', email: 'pandeansari@hekas.id', telpon: '0341-5500-001', fax: '0341-5500-002', status: 'Aktif', masaBerlaku: '31/12/2027' },
  { nama: 'HEKAS Panjen', email: 'panjen@hekas.id', telpon: '0341-5500-003', fax: '0341-5500-004', status: 'Aktif', masaBerlaku: '31/12/2027' },
  { nama: 'HEKAS Sulfat', email: 'sulfat@hekas.id', telpon: '0341-5500-005', fax: '0341-5500-006', status: 'Aktif', masaBerlaku: '30/06/2027' },
  { nama: 'HEKAS Sawojajar', email: 'sawojajar@hekas.id', telpon: '0341-5500-007', fax: '0341-5500-008', status: 'Aktif', masaBerlaku: '31/12/2026' }
];

export const targetOutletList = [
  { nama: 'Target Q2 Pandeansari', jenis: 'Penjualan', periode: 'Apr – Jun 2026', outlet: 'Pandeansari', status: 'Aktif' },
  { nama: 'Target Q2 Panjen', jenis: 'Penjualan', periode: 'Apr – Jun 2026', outlet: 'Panjen', status: 'Aktif' },
  { nama: 'Target Q2 Sulfat', jenis: 'Penjualan', periode: 'Apr – Jun 2026', outlet: 'Sulfat', status: 'Aktif' }
];

export const grupKomisiList = [
  { nama: 'Grup Kasir Senior', outlet: 'Pandeansari', karyawan: 'Bp. Joko', item: 'Semua Produk', kategori: 'Sembako', tipe: 'Persentase', metode: '5% dari Penjualan', status: 'Aktif' },
  { nama: 'Grup Kasir Panjen', outlet: 'Panjen', karyawan: 'Ibu Sari', item: 'Semua Produk', kategori: 'Sembako', tipe: 'Persentase', metode: '4% dari Penjualan', status: 'Aktif' },
  { nama: 'Grup Manager Outlet', outlet: 'Semua', karyawan: 'Semua Manager', item: 'Semua Produk', kategori: 'Semua', tipe: 'Persentase', metode: '2% dari Profit', status: 'Aktif' }
];

export const asetList = [
  { nama: 'Kulkas Display 2 Pintu', kode: 'AST-001', outlet: 'Pandeansari', nilai: 'Rp 8.500.000', status: 'Aktif' },
  { nama: 'Mesin Kasir POS', kode: 'AST-002', outlet: 'Pandeansari', nilai: 'Rp 4.250.000', status: 'Aktif' },
  { nama: 'Rak Besi 5 Susun', kode: 'AST-003', outlet: 'Panjen', nilai: 'Rp 2.800.000', status: 'Aktif' },
  { nama: 'AC Split 1 PK', kode: 'AST-004', outlet: 'Panjen', nilai: 'Rp 4.500.000', status: 'Aktif' }
];

// Karyawan dengan 3 tab: Daftar Karyawan / Riwayat Absensi / Sesi Shift (PRD §4.16)
export const karyawanList = [
  { nama: 'Bp. Joko Santoso', email: 'joko@hekas.id', hp: '0812-1111-2222', outlet: 'Pandeansari', jabatan: 'Kasir Senior', statusAktif: true, jamMasuk: '08:00', jamKeluar: '17:00' },
  { nama: 'Ibu Sari Rahayu', email: 'sari@hekas.id', hp: '0813-2222-3333', outlet: 'Panjen', jabatan: 'Kasir', statusAktif: true, jamMasuk: '08:00', jamKeluar: '17:00' },
  { nama: 'Bp. Sutrisno', email: 'sutrisno@hekas.id', hp: '0814-3333-4444', outlet: 'Sulfat', jabatan: 'Manager Outlet', statusAktif: true, jamMasuk: '07:30', jamKeluar: '18:00' },
  { nama: 'Ibu Maya Sari', email: 'maya@hekas.id', hp: '0815-4444-5555', outlet: 'Pandeansari', jabatan: 'Kasir', statusAktif: true, jamMasuk: '14:00', jamKeluar: '22:00' },
  { nama: 'Bp. Rudi Hartono', email: 'rudi@hekas.id', hp: '0816-5555-6666', outlet: 'Sawojajar', jabatan: 'Stok Keeper', statusAktif: false, jamMasuk: '09:00', jamKeluar: '18:00' }
];

export const absensiList = [
  { tanggal: '28/06/26', nama: 'Bp. Joko Santoso', jamMasuk: '07:55', jamKeluar: '17:05', status: 'Hadir' },
  { tanggal: '28/06/26', nama: 'Ibu Sari Rahayu', jamMasuk: '08:02', jamKeluar: '17:00', status: 'Hadir' },
  { tanggal: '28/06/26', nama: 'Bp. Sutrisno', jamMasuk: '07:28', jamKeluar: '18:10', status: 'Hadir' },
  { tanggal: '28/06/26', nama: 'Ibu Maya Sari', jamMasuk: '14:05', jamKeluar: '22:00', status: 'Hadir' },
  { tanggal: '27/06/26', nama: 'Bp. Joko Santoso', jamMasuk: '08:00', jamKeluar: '17:00', status: 'Hadir' },
  { tanggal: '27/06/26', nama: 'Bp. Rudi Hartono', jamMasuk: '—', jamKeluar: '—', status: 'Tidak Hadir' },
  { tanggal: '27/06/26', nama: 'Ibu Sari Rahayu', jamMasuk: '08:05', jamKeluar: '17:00', status: 'Terlambat' }
];

export const shiftList = [
  { sesi: 'Shift 1', jam: '07:00 – 14:00', outlet: 'Pandeansari', karyawan: 'Bp. Sutrisno, Bp. Joko, Ibu Sari', tanggal: 'Senin, 29/06/26' },
  { sesi: 'Shift 2', jam: '14:00 – 21:00', outlet: 'Pandeansari', karyawan: 'Ibu Maya, Bp. Rudi', tanggal: 'Senin, 29/06/26' },
  { sesi: 'Shift 1', jam: '08:00 – 16:00', outlet: 'Panjen', karyawan: 'Ibu Sari, Bp. Joko', tanggal: 'Senin, 29/06/26' },
  { sesi: 'Shift 2', jam: '16:00 – 22:00', outlet: 'Panjen', karyawan: 'Bp. Rudi, Ibu Maya', tanggal: 'Senin, 29/06/26' },
  { sesi: 'Shift 1', jam: '07:30 – 16:30', outlet: 'Sulfat', karyawan: 'Bp. Sutrisno', tanggal: 'Senin, 29/06/26' }
];

export const qponList = [
  { nama: 'Promo Weekend 10%', outlet: 'Semua', periode: 'Sab – Min', diskon: '10%', status: 'Aktif' },
  { nama: 'Cashback Rp 25rb', outlet: 'Pandeansari', periode: 'Jun 2026', diskon: 'Rp 25.000', status: 'Aktif' },
  { nama: 'Buy 1 Get 1 Snack', outlet: 'Semua', periode: 'Weekday Juni', diskon: 'B1G1', status: 'Closed' }
];