// Generic mock data transaksi (Penjualan, Pembelian, dst)
export type TransaksiRow = {
  tanggal: string;
  jam: string;
  no: string;
  tipe: string;
  outlet: string;
  pelanggan: string;
  total: string;
  status: string;
};

export const penjualanList: TransaksiRow[] = [
  { tanggal: '28/06/26', jam: '14:23', no: 'JL-INV-26062001', tipe: 'Penjualan', outlet: 'Pandeansari', pelanggan: 'Ibu Ratna', total: 'Rp 425.000', status: 'Selesai' },
  { tanggal: '28/06/26', jam: '13:47', no: 'JL-INV-26062002', tipe: 'Penjualan', outlet: 'Panjen', pelanggan: 'Bp. Hartono', total: 'Rp 318.500', status: 'Selesai' },
  { tanggal: '28/06/26', jam: '12:15', no: 'JL-INV-26062003', tipe: 'Penjualan', outlet: 'Sulfat', pelanggan: 'Ibu Dewi', total: 'Rp 285.000', status: 'Selesai' },
  { tanggal: '28/06/26', jam: '11:32', no: 'JL-INV-26062004', tipe: 'Penjualan', outlet: 'Pandeansari', pelanggan: 'Bp. Andi', total: 'Rp 542.300', status: 'Pending' },
  { tanggal: '28/06/26', jam: '10:48', no: 'JL-INV-26062005', tipe: 'Penjualan', outlet: 'Sawojajar', pelanggan: 'Ibu Siti Aminah', total: 'Rp 184.700', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '16:12', no: 'JL-INV-26062006', tipe: 'Penjualan', outlet: 'Pandeansari', pelanggan: 'Bp. Sugeng', total: 'Rp 678.400', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '15:05', no: 'JL-INV-26062007', tipe: 'Penjualan', outlet: 'Panjen', pelanggan: 'Ibu Maya', total: 'Rp 256.800', status: 'Belum Dibayar' },
  { tanggal: '27/06/26', jam: '13:38', no: 'JL-INV-26062008', tipe: 'Penjualan', outlet: 'Pandeansari', pelanggan: 'Bp. Rudi', total: 'Rp 412.500', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '11:24', no: 'JL-INV-26062009', tipe: 'Penjualan', outlet: 'Sulfat', pelanggan: 'Ibu Lestari', total: 'Rp 198.200', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '09:55', no: 'JL-INV-26062010', tipe: 'Penjualan', outlet: 'Pandeansari', pelanggan: 'Bp. Wahyu', total: 'Rp 524.700', status: 'Selesai' }
];

export const pembelianList: TransaksiRow[] = [
  { tanggal: '28/06/26', jam: '10:15', no: 'PB-INV-26062001', tipe: 'Pembelian', outlet: 'Pandeansari', pelanggan: 'PT Sumber Rezeki', total: 'Rp 12.450.000', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '14:30', no: 'PB-INV-26062002', tipe: 'Pembelian', outlet: 'Panjen', pelanggan: 'CV Maju Bersama', total: 'Rp 8.720.000', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '11:45', no: 'PB-INV-26062003', tipe: 'Pembelian', outlet: 'Sulfat', pelanggan: 'UD Makmur Sentosa', total: 'Rp 5.380.000', status: 'Pending' },
  { tanggal: '26/06/26', jam: '15:20', no: 'PB-INV-26062004', tipe: 'Pembelian', outlet: 'Pandeansari', pelanggan: 'PT Sumber Rezeki', total: 'Rp 9.870.000', status: 'Selesai' },
  { tanggal: '26/06/26', jam: '09:30', no: 'PB-INV-26062005', tipe: 'Pembelian', outlet: 'Panjen', pelanggan: 'Toko Aneka Jaya', total: 'Rp 4.250.000', status: 'Selesai' },
  { tanggal: '25/06/26', jam: '13:10', no: 'PB-INV-26062006', tipe: 'Pembelian', outlet: 'Sawojajar', pelanggan: 'CV Maju Bersama', total: 'Rp 6.980.000', status: 'Selesai' },
  { tanggal: '25/06/26', jam: '10:25', no: 'PB-INV-26062007', tipe: 'Pembelian', outlet: 'Pandeansari', pelanggan: 'PT Sumber Rezeki', total: 'Rp 11.240.000', status: 'Selesai' }
];

export const pendapatanList: TransaksiRow[] = [
  { tanggal: '28/06/26', jam: '11:00', no: 'PD-26062001', tipe: 'Pendapatan', outlet: 'Pandeansari', pelanggan: 'Pendapatan Bunga Bank', total: 'Rp 425.000', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '14:20', no: 'PD-26062002', tipe: 'Pendapatan', outlet: 'Panjen', pelanggan: 'Pendapatan Sewa Kios', total: 'Rp 2.500.000', status: 'Selesai' },
  { tanggal: '26/06/26', jam: '09:15', no: 'PD-26062003', tipe: 'Pendapatan', outlet: 'Sulfat', pelanggan: 'Pendapatan Lain-lain', total: 'Rp 184.500', status: 'Selesai' },
  { tanggal: '25/06/26', jam: '15:45', no: 'PD-26062004', tipe: 'Pendapatan', outlet: 'Pandeansari', pelanggan: 'Pendapatan Bunga Bank', total: 'Rp 380.000', status: 'Selesai' },
  { tanggal: '24/06/26', jam: '10:30', no: 'PD-26062005', tipe: 'Pendapatan', outlet: 'Panjen', pelanggan: 'Pendapatan Sewa Kios', total: 'Rp 2.500.000', status: 'Selesai' }
];

export const pengeluaranList: TransaksiRow[] = [
  { tanggal: '28/06/26', jam: '13:30', no: 'PG-26062001', tipe: 'Pengeluaran', outlet: 'Pandeansari', pelanggan: 'Bayar Listrik PLN', total: 'Rp 1.250.000', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '15:45', no: 'PG-26062002', tipe: 'Pengeluaran', outlet: 'Panjen', pelanggan: 'Bayar Air PDAM', total: 'Rp 485.000', status: 'Selesai' },
  { tanggal: '27/06/26', jam: '10:20', no: 'PG-26062003', tipe: 'Pengeluaran', outlet: 'Pandeansari', pelanggan: 'Bayar Internet', total: 'Rp 425.000', status: 'Pending' },
  { tanggal: '26/06/26', jam: '14:15', no: 'PG-26062004', tipe: 'Pengeluaran', outlet: 'Sulfat', pelanggan: 'Bayar Sampah', total: 'Rp 150.000', status: 'Selesai' },
  { tanggal: '25/06/26', jam: '11:30', no: 'PG-26062005', tipe: 'Pengeluaran', outlet: 'Pandeansari', pelanggan: 'Bayar Keamanan', total: 'Rp 350.000', status: 'Selesai' },
  { tanggal: '24/06/26', jam: '09:45', no: 'PG-26062006', tipe: 'Pengeluaran', outlet: 'Sawojajar', pelanggan: 'Bayar Listrik PLN', total: 'Rp 980.000', status: 'Selesai' }
];