// Mock data untuk Dasbor / Dashboard Manager
export const greetingHour = (): string => {
  const h = new Date().getHours();
  if (h < 11) return 'Pagi';
  if (h < 15) return 'Siang';
  if (h < 18) return 'Sore';
  return 'Malem';
};

// Status operasional outlet (real-time feel) — berubah by hour
export const operationalStatus = (outlet: string): string => {
  const h = new Date().getHours();
  const outletName = outlet.replace('HEKAS ', '');
  if (h < 6) return `${outletName} masih tutup, buka jam 07:00.`;
  if (h < 11) return `${outletName} buka, 6 shift jalan, breakfast rush.`;
  if (h < 14) return `${outletName} buka, lunch hour lagi rame.`;
  if (h < 17) return `${outletName} buka, 5 shift aktif, afternoon.`;
  if (h < 21) return `${outletName} buka, closing shift udah jalan.`;
  return `${outletName} masih buka, 2 shift malam aktif.`;
};

export const ringkasanPenjualan = [
  { label: 'Gross Sales', value: 'Rp 142.531.800', trend: '+12,4%', accent: 'up' as const },
  { label: 'Net Sales', value: 'Rp 124.987.500', trend: '+8,7%', accent: 'up' as const },
  { label: 'Gross Profit', value: 'Rp 38.215.400', trend: '+15,2%', accent: 'up' as const },
  { label: 'Gross Margin', value: '26,8%', trend: '+0,4 pt', accent: 'up' as const },
  { label: 'Total Bill', value: '2.847', trend: '+5,1%', accent: 'up' as const },
  { label: 'Avg Sales/Bill', value: 'Rp 50.062', trend: '-1,2%', accent: 'down' as const },
  { label: 'Total Pax', value: '7.523', trend: '+6,8%', accent: 'up' as const },
  { label: 'Avg Sales/Pax', value: 'Rp 18.949', trend: '+0,9%', accent: 'up' as const }
];

export const peakInfo = {
  peakDate: 'Sab, 27/06',
  peakValue: 'Rp 28.450.000',
  topIncome: 'Ming, 22/06',
  topValue: 'Rp 31.870.000',
  lowDate: 'Sel, 24/06',
  lowValue: 'Rp 14.120.000',
  lowerDate: 'Rab, 25/06',
  lowerValue: 'Rp 12.840.000'
};

export const penjualanTrend = {
  values: [22, 14, 31.8, 18, 28.4, 16.5, 24.2],
  labels: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
};

export const topOutlet = [
  { label: 'Pandeansari', value: 38, raw: 'Rp 54.165.000', pct: '38,0%', color: '#1E3A5F' },
  { label: 'Panjen', value: 27, raw: 'Rp 38.482.000', pct: '27,0%', color: '#3B82F6' },
  { label: 'Sulfat', value: 18, raw: 'Rp 25.655.000', pct: '18,0%', color: '#93C5FD' },
  { label: 'Sawojajar', value: 11, raw: 'Rp 15.673.000', pct: '11,0%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 6, raw: 'Rp 8.556.000', pct: '6,0%', color: '#E2E8F0' }
];

export const topPelanggan = [
  { label: 'Ibu Ratna', value: 22, raw: 'Rp 31.357.000', pct: '22,0%', color: '#1E3A5F' },
  { label: 'Bp. Hartono', value: 17, raw: 'Rp 24.230.000', pct: '17,0%', color: '#3B82F6' },
  { label: 'Ibu Dewi', value: 14, raw: 'Rp 19.954.000', pct: '14,0%', color: '#93C5FD' },
  { label: 'Bp. Andi', value: 9, raw: 'Rp 12.828.000', pct: '9,0%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 38, raw: 'Rp 54.162.000', pct: '38,0%', color: '#E2E8F0' }
];

export const topProdukByJumlah = [
  { label: 'Beras Premium 5kg', value: 28, raw: 'Rp 28.450.000', pct: '28,0%', color: '#1E3A5F' },
  { label: 'Minyak Goreng 2L', value: 21, raw: 'Rp 21.358.000', pct: '21,0%', color: '#3B82F6' },
  { label: 'Gula Pasir 1kg', value: 16, raw: 'Rp 16.265.000', pct: '16,0%', color: '#93C5FD' },
  { label: 'Telur Ayam 1kg', value: 12, raw: 'Rp 12.193.000', pct: '12,0%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 23, raw: 'Rp 23.412.000', pct: '23,0%', color: '#E2E8F0' }
];

export const topProdukByQty = [
  { label: 'Telur Ayam 1kg', value: 1842, raw: '1.842 unit', pct: '34,3%', color: '#1E3A5F' },
  { label: 'Beras Premium 5kg', value: 1320, raw: '1.320 unit', pct: '24,6%', color: '#3B82F6' },
  { label: 'Gula Pasir 1kg', value: 968, raw: '968 unit', pct: '18,0%', color: '#93C5FD' },
  { label: 'Mie Instan', value: 712, raw: '712 unit', pct: '13,2%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 534, raw: '534 unit', pct: '9,9%', color: '#E2E8F0' }
];

export const topKategoriByJumlah = [
  { label: 'Sembako', value: 42, raw: 'Rp 59.863.000', pct: '42,0%', color: '#1E3A5F' },
  { label: 'Snack', value: 24, raw: 'Rp 34.207.000', pct: '24,0%', color: '#3B82F6' },
  { label: 'Minuman', value: 18, raw: 'Rp 25.655.000', pct: '18,0%', color: '#93C5FD' },
  { label: 'Bahan Masak', value: 10, raw: 'Rp 14.253.000', pct: '10,0%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 6, raw: 'Rp 8.553.000', pct: '6,0%', color: '#E2E8F0' }
];

export const topKategoriByQty = [
  { label: 'Sembako', value: 3215, raw: '3.215 unit', pct: '43,4%', color: '#1E3A5F' },
  { label: 'Snack', value: 1842, raw: '1.842 unit', pct: '24,9%', color: '#3B82F6' },
  { label: 'Minuman', value: 1245, raw: '1.245 unit', pct: '16,8%', color: '#93C5FD' },
  { label: 'Bahan Masak', value: 687, raw: '687 unit', pct: '9,3%', color: '#CBD5E1' },
  { label: 'Lainnya', value: 412, raw: '412 unit', pct: '5,6%', color: '#E2E8F0' }
];

export const stokRendah = [
  { produk: 'Bumbu Dapur 250g', gudang: 'Pandeansari', qty: 8, minimum: 25 },
  { produk: 'Sabun Mandi 100g', gudang: 'Panjen', qty: 12, minimum: 30 },
  { produk: 'Pasta Gigi 150g', gudang: 'Pandeansari', qty: 5, minimum: 20 },
  { produk: 'Deterjen 1kg', gudang: 'Sulfat', qty: 14, minimum: 35 },
  { produk: 'Tissue 250sht', gudang: 'Panjen', qty: 9, minimum: 25 }
];