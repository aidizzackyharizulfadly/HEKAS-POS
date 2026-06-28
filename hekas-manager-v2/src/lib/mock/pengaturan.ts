// Mock data untuk menu Pengaturan (sub-pages)
export const kuponList = [
  { nama: 'Diskon Akhir Pekan', tipe: 'Publik', outlet: 'Semua', digunakan: 145, sisa: 355, hadiah: '10% Off', periode: '01/06 – 30/06', status: 'Aktif' },
  { nama: 'VIP Customer 15%', tipe: 'Privat', outlet: 'Pandeansari', digunakan: 28, sisa: 72, hadiah: '15% Off', periode: '01/06 – 31/07', status: 'Aktif' },
  { nama: 'Promo Lebaran', tipe: 'Publik', outlet: 'Semua', digunakan: 500, sisa: 0, hadiah: 'Free Voucher', periode: '20/03 – 15/04', status: 'Expired' },
  { nama: 'Member Baru Cashback', tipe: 'Privat', outlet: 'Panjen', digunakan: 65, sisa: 185, hadiah: 'Rp 25.000', periode: '01/06 – 31/08', status: 'Aktif' }
];

export const membershipList = [
  { nama: 'HEKAS Silver', outlet: 'Semua', level: 'Silver – Gold – Platinum', status: 'Aktif' },
  { nama: 'HEKAS Gold+', outlet: 'Pandeansari, Panjen', level: 'Gold – Platinum', status: 'Aktif' },
  { nama: 'HEKAS Platinum Elite', outlet: 'Pandeansari', level: 'Platinum Only', status: 'Draft' }
];

export const loyaltiPoinList = [
  { nama: 'Poin Belanja Reguler', outlet: 'Semua', dapatPoin: '1 poin / Rp 10.000', tukarPoin: '100 poin = Rp 10.000', mulai: '01/01/2026', berakhir: '31/12/2026', status: 'Aktif' },
  { nama: 'Poin Weekend Double', outlet: 'Pandeansari', dapatPoin: '2 poin / Rp 10.000', tukarPoin: '100 poin = Rp 10.000', mulai: '01/06/2026', berakhir: '31/08/2026', status: 'Aktif' }
];

export const paketReservasiList = [
  { nama: 'Paket Meeting A', harga: 'Rp 250.000', sesi: '2 sesi × 3 jam', ketentuan: 'Bayar di muka 50%' },
  { nama: 'Paket Meeting B', harga: 'Rp 450.000', sesi: '1 sesi × 5 jam', ketentuan: 'Bayar lunas saat booking' },
  { nama: 'Paket Meeting C', harga: 'Rp 850.000', sesi: '1 sesi × 8 jam + snack', ketentuan: 'Bayar lunas 7 hari sebelum' }
];