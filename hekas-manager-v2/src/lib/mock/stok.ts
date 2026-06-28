// Mock data approval & stok-related
export type ApprovalRow = {
  tanggal: string;
  no: string;
  tipe: string;
  pengaju: string;
  nominal: string;
  verifikasiOleh?: string;
  tanggalVerifikasi?: string;
  status: string;
};

export const approvalList: ApprovalRow[] = [
  { tanggal: '28/06/26', no: 'APR-26062001', tipe: 'Pembelian - Invoice', pengaju: 'Bp. Joko', nominal: 'Rp 12.450.000', verifikasiOleh: 'Bu Siti Wahyuni', tanggalVerifikasi: '28/06/26 14:35', status: 'Disetujui' },
  { tanggal: '27/06/26', no: 'APR-26062002', tipe: 'Pembelian - Order', pengaju: 'Bp. Sutrisno', nominal: 'Rp 8.720.000', verifikasiOleh: 'Bu Siti Wahyuni', tanggalVerifikasi: '27/06/26 15:20', status: 'Disetujui' },
  { tanggal: '27/06/26', no: 'APR-26062003', tipe: 'Pengeluaran Lain-lain', pengaju: 'Ibu Sari', nominal: 'Rp 1.250.000', status: 'Menunggu Persetujuan' },
  { tanggal: '26/06/26', no: 'APR-26062004', tipe: 'Produksi', pengaju: 'Bp. Hartono', nominal: 'Rp 4.580.000', verifikasiOleh: 'Bu Siti Wahyuni', tanggalVerifikasi: '26/06/26 16:42', status: 'Ditolak' },
  { tanggal: '26/06/26', no: 'APR-26062005', tipe: 'Mutasi Barang', pengaju: 'Bp. Rudi', nominal: 'Rp 2.140.000', status: 'Menunggu Persetujuan' },
  { tanggal: '25/06/26', no: 'APR-26062006', tipe: 'Penyesuaian Stok', pengaju: 'Ibu Maya', nominal: 'Rp 685.000', verifikasiOleh: 'Bu Siti Wahyuni', tanggalVerifikasi: '25/06/26 11:18', status: 'Disetujui' },
  { tanggal: '25/06/26', no: 'APR-26062007', tipe: 'Waste Goods', pengaju: 'Bp. Wahyu', nominal: 'Rp 425.000', status: 'Menunggu Persetujuan' }
];

export const approvalTipeOptions = [
  'Semua Tipe',
  'Pembelian - Invoice',
  'Pembelian - Order',
  'Pembelian - Pembayaran',
  'Pengeluaran Lain-lain',
  'Pendapatan Lain-lain',
  'Transfer Dana',
  'Produksi',
  'Mutasi Barang',
  'Penyesuaian Stok',
  'Waste Goods'
];

export const penyesuaianStokList = [
  { tanggal: '28/06/26', no: 'ADJ-26062001', produk: 'Beras Premium 5kg', gudang: 'Pandeansari', qty: '15 → 12', alasan: 'Rusak', status: 'Menunggu Persetujuan' },
  { tanggal: '27/06/26', no: 'ADJ-26062002', produk: 'Minyak Goreng 2L', gudang: 'Panjen', qty: '48 → 45', alasan: 'Tumpah', status: 'Disetujui' },
  { tanggal: '27/06/26', no: 'ADJ-26062003', produk: 'Gula Pasir 1kg', gudang: 'Sulfat', qty: '32 → 30', alasan: 'Selisih Opname', status: 'Menunggu Persetujuan' },
  { tanggal: '26/06/26', no: 'ADJ-26062004', produk: 'Telur Ayam 1kg', gudang: 'Pandeansari', qty: '85 → 80', alasan: 'Expired', status: 'Disetujui' }
];

export const mutasiList = [
  { tanggal: '28/06/26', no: 'MT-26062001', produk: 'Beras Premium 5kg', dari: 'Pandeansari', ke: 'Panjen', qty: '25 unit', status: 'Selesai' },
  { tanggal: '27/06/26', no: 'MT-26062002', produk: 'Minyak Goreng 2L', dari: 'Sulfat', ke: 'Sawojajar', qty: '36 unit', status: 'Selesai' },
  { tanggal: '27/06/26', no: 'MT-26062003', produk: 'Gula Pasir 1kg', dari: 'Pandeansari', ke: 'Sulfat', qty: '48 unit', status: 'Pending' },
  { tanggal: '26/06/26', no: 'MT-26062004', produk: 'Telur Ayam 1kg', dari: 'Panjen', ke: 'Pandeansari', qty: '50 unit', status: 'Selesai' }
];

export const produksiList = [
  { tanggal: '28/06/26', no: 'PRD-26062001', nama: 'Paket Sembako A', qty: 50, status: 'Selesai' },
  { tanggal: '27/06/26', no: 'PRD-26062002', nama: 'Paket Sembako B', qty: 35, status: 'Selesai' },
  { tanggal: '27/06/26', no: 'PRD-26062003', nama: 'Paket Snack', qty: 80, status: 'Draft' },
  { tanggal: '26/06/26', no: 'PRD-26062004', nama: 'Paket Sembako C', qty: 45, status: 'Selesai' }
];

export const wasteList = [
  { tanggal: '28/06/26', no: 'WG-26062001', produk: 'Sayur Box A', qty: 5, nominal: 'Rp 125.000', gudang: 'Pandeansari' },
  { tanggal: '27/06/26', no: 'WG-26062002', produk: 'Roti Sobekan', qty: 12, nominal: 'Rp 84.000', gudang: 'Panjen' },
  { tanggal: '26/06/26', no: 'WG-26062003', produk: 'Makanan Jadi B', qty: 8, nominal: 'Rp 240.000', gudang: 'Sulfat' }
];

export const reservasiList = [
  { tanggal: '29/06/26', no: 'RSV-26062001', nama: 'Bp. Hendra', paket: 'Paket Meeting A', sesi: 2, status: 'Aktif' },
  { tanggal: '30/06/26', no: 'RSV-26062002', nama: 'Ibu Linda', paket: 'Paket Meeting B', sesi: 1, status: 'Aktif' },
  { tanggal: '01/07/26', no: 'RSV-26062003', nama: 'Bp. Feri', paket: 'Paket Meeting A', sesi: 3, status: 'Draft' }
];

export type KomisiRow = {
  nama: string;
  outlet: string;
  periode: string;
  total: string;
  status: string;
};

export const komisiList: KomisiRow[] = [
  { nama: 'Bp. Joko', outlet: 'Pandeansari', periode: 'Juni 2026', total: 'Rp 1.450.000', status: 'Selesai' },
  { nama: 'Bp. Sutrisno', outlet: 'Panjen', periode: 'Juni 2026', total: 'Rp 1.120.000', status: 'Selesai' },
  { nama: 'Ibu Sari', outlet: 'Sulfat', periode: 'Juni 2026', total: 'Rp 985.000', status: 'Pending' },
  { nama: 'Bp. Hartono', outlet: 'Sawojajar', periode: 'Juni 2026', total: 'Rp 1.285.000', status: 'Selesai' }
];

export type KasBankRow = {
  kode: string;
  nama: string;
  saldo: string;
  status: string;
};

export const kasBankList: KasBankRow[] = [
  { kode: 'KK-PND-001', nama: 'Kas Besar Pandeansari', saldo: 'Rp 45.250.000', status: 'Aktif' },
  { kode: 'KK-PND-002', nama: 'Kas Kecil Pandeansari', saldo: 'Rp 5.420.000', status: 'Aktif' },
  { kode: 'BCA-1234', nama: 'Bank BCA Operasional', saldo: 'Rp 128.450.000', status: 'Aktif' },
  { kode: 'MDR-5678', nama: 'Bank Mandiri Operasional', saldo: 'Rp 87.320.000', status: 'Aktif' },
  { kode: 'BNI-9012', nama: 'Bank BNI Cadangan', saldo: 'Rp 65.000.000', status: 'Aktif' },
  { kode: 'KK-PNJ-001', nama: 'Kas Besar Panjen', saldo: 'Rp 28.580.000', status: 'Aktif' },
  { kode: 'KK-SUL-001', nama: 'Kas Besar Sulfat', saldo: 'Rp 18.450.000', status: 'Aktif' }
];

export const coaList = [
  { kode: '1-1001', nama: 'Kas Besar', tipe: 'Aset', saldo: 'Rp 45.250.000' },
  { kode: '1-1002', nama: 'Kas Kecil', tipe: 'Aset', saldo: 'Rp 5.420.000' },
  { kode: '1-2001', nama: 'Bank BCA', tipe: 'Aset', saldo: 'Rp 128.450.000' },
  { kode: '1-2002', nama: 'Bank Mandiri', tipe: 'Aset', saldo: 'Rp 87.320.000' },
  { kode: '2-1001', nama: 'Hutang Supplier', tipe: 'Kewajiban', saldo: 'Rp 24.580.000' },
  { kode: '3-1001', nama: 'Modal Pemilik', tipe: 'Modal', saldo: 'Rp 250.000.000' },
  { kode: '4-1001', nama: 'Penjualan', tipe: 'Pendapatan', saldo: 'Rp 142.531.800' },
  { kode: '5-1001', nama: 'HPP', tipe: 'HPP', saldo: 'Rp 104.316.400' },
  { kode: '6-1001', nama: 'Beban Gaji', tipe: 'Beban', saldo: 'Rp 18.450.000' },
  { kode: '6-2001', nama: 'Beban Listrik', tipe: 'Beban', saldo: 'Rp 3.250.000' },
  { kode: '6-3001', nama: 'Beban Sewa', tipe: 'Beban', saldo: 'Rp 12.000.000' },
  { kode: '6-4001', nama: 'Beban ATK', tipe: 'Beban', saldo: 'Rp 485.000' }
];