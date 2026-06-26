// HEKAS POS — Payment types & utilities
// Schema mendukung single payment (legacy) DAN multi-payment split.
// Saat baca dari storage, jika tx.payment_methods tidak ada tapi ada
// payment_method (single), kita translate on-the-fly jadi array berisi 1 entry.

export type PaymentMethodKind = 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet';

export interface PaymentMethod {
  /** id unik per entry (untuk key render) */
  id: string;
  /** jenis pembayaran */
  kind: PaymentMethodKind;
  /** label/nama tambahan (mis. "BCA", "DANA", "ShopeePay") */
  label?: string;
  /** nominal untuk metode ini */
  amount: number;
  /**
   * Khusus tunai: jumlah yang diserahkan customer.
   * Untuk non-tunai: undefined atau 0.
   */
  tendered?: number;
  /** khusus tunai: kembalian */
  change?: number;
  /** referensi eksternal (no. approval, trace QRIS, dsb.) */
  reference?: string;
  /** timestamp ISO entry disimpan */
  paid_at?: string;
}

export interface PaymentSplitSummary {
  methods: PaymentMethod[];
  total_paid: number;
  total_change: number;
  /** apakah tx ini multi-payment (methods.length > 1) */
  is_split: boolean;
}

/** Opsi label default per metode (ditampilkan di struk / receipt) */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethodKind, string> = {
  tunai: 'Tunai',
  qris: 'QRIS',
  debit: 'Kartu Debit',
  kredit: 'Kartu Kredit',
  transfer: 'Transfer Bank',
  ewallet: 'E-Wallet',
};

/** Icon emoji default per metode */
export const PAYMENT_METHOD_ICON: Record<PaymentMethodKind, string> = {
  tunai: 'banknote',
  qris: 'smartphone',
  debit: 'credit-card',
  kredit: 'credit-card',
  transfer: '🏦',
  ewallet: 'smartphone',
};

/** metode yang butuh reference wajib (untuk audit/rekonsiliasi) */
export const PAYMENT_METHOD_NEEDS_REFERENCE: PaymentMethodKind[] = [
  'debit',
  'kredit',
  'transfer',
];

/** metode yang menampilkan field "diserahkan customer" (tendered) */
export const PAYMENT_METHOD_NEEDS_TENDERED: PaymentMethodKind[] = ['tunai'];

/**
 * Hitung summary pembayaran.
 * Mengembalikan total dibayar, total kembalian, dan flag is_split.
 */
export function summarizePayments(methods: PaymentMethod[]): PaymentSplitSummary {
  const total_paid = methods.reduce((s, m) => s + m.amount, 0);
  const total_change = methods.reduce((s, m) => s + (m.change ?? 0), 0);
  return {
    methods,
    total_paid,
    total_change,
    is_split: methods.length > 1,
  };
}

/**
 * Validasi split: total amount harus sama dengan grand total.
 * @throws Error jika mismatch
 */
export function validatePaymentSplit(methods: PaymentMethod[], grandTotal: number): void {
  if (methods.length === 0) {
    throw new Error('Minimal satu metode pembayaran harus diisi');
  }
  for (const m of methods) {
    if (m.amount <= 0) {
      throw new Error(`Nominal ${PAYMENT_METHOD_LABEL[m.kind]} harus > 0`);
    }
    if (m.kind === 'tunai' && m.tendered !== undefined && m.tendered < m.amount) {
      throw new Error(`Tunai kurang: Rp ${m.tendered.toLocaleString('id-ID')} < Rp ${m.amount.toLocaleString('id-ID')}`);
    }
    if (PAYMENT_METHOD_NEEDS_REFERENCE.includes(m.kind) && !m.reference) {
      throw new Error(`${PAYMENT_METHOD_LABEL[m.kind]} butuh no. referensi`);
    }
  }
  const sum = methods.reduce((s, m) => s + m.amount, 0);
  if (sum < grandTotal) {
    throw new Error(
      `Total bayar kurang: Rp ${sum.toLocaleString('id-ID')} < Rp ${grandTotal.toLocaleString('id-ID')}`,
    );
  }
}

/**
 * Generator id sederhana untuk PaymentMethod entry.
 */
export function genPaymentMethodId(): string {
  return 'pm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
