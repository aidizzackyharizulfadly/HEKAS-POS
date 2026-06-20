// HEKAS POS — API layer: Shared TypeScript types
// Mirror persis tipe di hekas-app/src/routes/kasir/+page.svelte
// supaya gampang di-port ke backend beneran nanti.

export interface Product {
  id: number;
  name: string;
  price: number;       // IDR (whole rupiah)
  category: string;    // minuman | snack | sembako | frozen | rokok | lainnya
  sku: string;
  barcode: string;
  stock: number;
  unit: string;        // btl | pcs | kg | ltr | bks
  image: string;       // emoji (fallback)
  is_active: boolean;
  // ── Fase F additions (optional) ──────────────────────────────────────────
  image_data?: string;     // base64 dataURL (image/png or image/jpeg)
  image_mime?: string;     // image/png, image/jpeg
  image_size?: number;     // bytes
  image_width?: number;    // px
  image_height?: number;   // px
  image_updated_at?: string;  // ISO timestamp
}

export interface Member {
  id: string;          // M001, M002 ...
  name: string;
  phone: string;
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum';
  // ── Fase E additions (all optional for backward compat) ────────────────
  email?: string;            // email opsional
  address?: string;          // alamat
  birthday?: string;         // YYYY-MM-DD
  created_at?: string;       // ISO timestamp saat registrasi
  last_transaction_at?: string | null; // ISO timestamp tx terakhir
  lifetime_spend?: number;   // total belanja sepanjang masa (untuk auto-tier)
  // Poin history (Fase E.3)
  point_history?: PointEntry[];   // log earn/redeem
  tier_history?: TierEntry[];     // log upgrade/downgrade tier
  note?: string;             // catatan internal (manager only)
}

export interface PointEntry {
  id: string;                // P001, P002 ...
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  amount: number;            // positif = earn, negatif = redeem
  balance_after: number;     // poin setelah transaksi
  ref_id?: string;           // tx_id atau note
  note?: string;
  created_at: string;
}

export interface TierEntry {
  from: Member['tier'] | null;
  to: Member['tier'];
  reason: 'auto' | 'manual' | 'new';
  note?: string;
  created_at: string;
}

// Tier configuration (Fase E.2)
export interface TierConfig {
  name: Member['tier'];
  label: string;
  color: string;            // hex untuk badge
  bg: string;               // hex untuk background badge
  discount_pct: number;     // 0/5/10
  point_multiplier: number; // 1/2/3 (earn rate)
  min_lifetime_spend: number; // untuk auto-upgrade
  priority: number;         // 1=Silver, 2=Gold, 3=Platinum
}

export const TIER_CONFIG: Record<Member['tier'], TierConfig> = {
  Silver: {
    name: 'Silver',
    label: 'Silver',
    color: '#64748B',
    bg: '#E2E8F0',
    discount_pct: 0,
    point_multiplier: 1,
    min_lifetime_spend: 0,
    priority: 1,
  },
  Gold: {
    name: 'Gold',
    label: 'Gold',
    color: '#B45309',
    bg: '#FEF3C7',
    discount_pct: 5,
    point_multiplier: 2,
    min_lifetime_spend: 5_000_000,   // Rp 5 juta
    priority: 2,
  },
  Platinum: {
    name: 'Platinum',
    label: 'Platinum',
    color: '#1E40AF',
    bg: '#DBEAFE',
    discount_pct: 10,
    point_multiplier: 3,
    min_lifetime_spend: 15_000_000,  // Rp 15 juta
    priority: 3,
  },
};

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'kasir' | 'manager' | 'gudang';
  outlet_id: number | null;
}

export interface CartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
  disc: number;        // percent discount (0-100)
}

export interface CheckoutInput {
  user_id: number;
  outlet_id?: number;
  member_id?: string | null;
  items: { product_id: number; qty: number; disc_pct?: number }[];
  discount_pct?: number;
  /** Total dibayar (legacy: jumlah uang tunai customer) */
  paid: number;
  /**
   * Single payment (legacy): 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet'.
   * Tetap diterima. Jika `payments` juga diisi, yang dipakai adalah `payments`.
   */
  payment_method?: 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet';
  /**
   * Multi-payment split (Fase 5). Array of PaymentMethod.
   * Length 1 = sama dgn single payment.
   * Length > 1 = split (mis. cash 50rb + QRIS 30rb untuk total 80rb).
   */
  payments?: import('../payment.js').PaymentMethod[];
  note?: string;
}

export interface CheckoutResult {
  invoice_no: string;
  id: number;
  subtotal: number;
  discount_pct: number;
  discount_amt: number;
  total: number;
  paid: number;
  change_amt: number;
  payment_method: string;
  /**
   * Fase 5: detail split payment.
   * Untuk tx single-payment, array berisi 1 entry.
   */
  payments?: import('../payment.js').PaymentMethod[];
  /** true jika payments.length > 1 */
  is_split?: boolean;
  member_id: string | null;
  points_earned: number;
  updated_member: Member | null;
}

export interface Transaction {
  id: number;
  invoice_no: string;
  user_id: number;
  outlet_id: number | null;
  member_id: string | null;
  subtotal: number;
  discount_pct: number;
  discount_amt: number;
  total: number;
  paid: number;
  change_amt: number;
  /**
   * Legacy: single payment method string.
   * Untuk tx multi-payment, ini = metode pertama (utama).
   * Untuk audit akurat, baca `payments` (array).
   */
  payment_method: string;
  /**
   * Fase 5: detail split payment. Optional untuk backward-compat dgn tx lama.
   * Jika undefined (tx legacy), gunakan `payment_method` tunggal.
   */
  payments?: import('../payment.js').PaymentMethod[];
  /** true jika payments.length > 1 */
  is_split?: boolean;
  status: 'completed' | 'void' | 'held';
  note: string | null;
  created_at: string;
  user_name?: string;
  member_name?: string | null;
  items?: TransactionItem[];
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  qty: number;
  price: number;
  disc_pct: number;
  subtotal: number;
}

export interface HeldTransaction {
  id: string;
  user_id: number;
  member_id?: string | null;
  cart: CartItem[];
  subtotal: number;
  discount_pct: number;
  total: number;
  items: number;
  time: string;         // HH:MM
  held_at: string;
  user_name?: string;
  note: string | null;
}

export interface DashboardSummary {
  range: { from: string; to: string };
  kpi: {
    revenue: number;
    transactions: number;
    avg_transaction: number;
  };
  by_payment_method: { payment_method: string; count: number; total: number }[];
  top_products: { product_id: number; product_name: string; qty_sold: number; revenue: number }[];
  hourly_distribution: { hour: string; tx_count: number; revenue: number }[];
  low_stock: { id: number; name: string; stock: number; category: string; sku: string; unit: string }[];
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  error?: string;
}
