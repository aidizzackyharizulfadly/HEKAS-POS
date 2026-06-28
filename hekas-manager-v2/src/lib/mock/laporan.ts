// Mock data Laporan (3 sub-pages)
export const laporanPenjualan = [
  { periode: '22/06/26', invoice: 145, gross: 'Rp 18.450.000', net: 'Rp 16.215.000', profit: 'Rp 4.580.000', margin: '24,8%' },
  { periode: '23/06/26', invoice: 132, gross: 'Rp 16.820.000', net: 'Rp 14.785.000', profit: 'Rp 4.125.000', margin: '24,5%' },
  { periode: '24/06/26', invoice: 118, gross: 'Rp 14.120.000', net: 'Rp 12.405.000', profit: 'Rp 3.450.000', margin: '24,4%' },
  { periode: '25/06/26', invoice: 105, gross: 'Rp 12.840.000', net: 'Rp 11.285.000', profit: 'Rp 3.150.000', margin: '24,5%' },
  { periode: '26/06/26', invoice: 168, gross: 'Rp 21.650.000', net: 'Rp 19.025.000', profit: 'Rp 5.320.000', margin: '24,6%' },
  { periode: '27/06/26', invoice: 187, gross: 'Rp 28.450.000', net: 'Rp 25.005.000', profit: 'Rp 7.125.000', margin: '25,0%' },
  { periode: '28/06/26', invoice: 142, gross: 'Rp 19.875.000', net: 'Rp 17.485.000', profit: 'Rp 4.920.000', margin: '24,8%' }
];

export const laporanStok = [
  { kategori: 'Sembako', totalItem: 284, nilaiStok: 'Rp 124.580.000', perputaran: '4,2x/bulan' },
  { kategori: 'Bahan Masak', totalItem: 156, nilaiStok: 'Rp 28.450.000', perputaran: '3,8x/bulan' },
  { kategori: 'Snack', totalItem: 312, nilaiStok: 'Rp 18.250.000', perputaran: '6,5x/bulan' },
  { kategori: 'Minuman', totalItem: 428, nilaiStok: 'Rp 24.820.000', perputaran: '8,1x/bulan' },
  { kategori: 'Toiletries', totalItem: 198, nilaiStok: 'Rp 32.450.000', perputaran: '2,9x/bulan' }
];

export const laporanKeuangan = [
  { akun: 'Pendapatan Penjualan', bulan: 'Rp 142.531.800', ytd: 'Rp 825.485.000', growth: '+12,4%' },
  { akun: 'Pendapatan Lain', bulan: 'Rp 3.489.500', ytd: 'Rp 18.625.000', growth: '+5,2%' },
  { akun: 'HPP', bulan: 'Rp 104.316.400', ytd: 'Rp 612.485.000', growth: '+8,1%' },
  { akun: 'Beban Operasional', bulan: 'Rp 34.185.000', ytd: 'Rp 198.450.000', growth: '+2,8%' },
  { akun: 'Laba Kotor', bulan: 'Rp 38.215.400', ytd: 'Rp 213.000.000', growth: '+15,2%' },
  { akun: 'Laba Bersih', bulan: 'Rp 7.519.900', ytd: 'Rp 41.625.000', growth: '+18,7%' }
];