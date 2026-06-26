// HEKAS POS — API layer: Storage wrapper
// localStorage yang aman untuk SSR (SvelteKit prerender) + seed data awal.
//
// Konvensi key prefix: "hekas:"
//   hekas:products          → Product[]
//   hekas:members           → Member[]
//   hekas:users             → User[]  (mirror DEMO_ACCOUNTS)
//   hekas:transactions      → Transaction[]
//   hekas:held              → HeldTransaction[]
//   hekas:counters          → { products, transactions }
//   hekas:purchase_orders   → PO[]       (Barang Masuk)
//   hekas:outgoing_orders   → Outgoing[] (Barang Keluar)
//   hekas:surat_jalan       → SuratJalan[] (Surat Jalan antar-outlet)
//   hekas:seeded            → "1" (penanda sudah di-seed)

import type { Product, Member, User } from '../types/api.js';

// ─── SSR-safe localStorage ──────────────────────────────────────────────────
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!isBrowser) return fallback;
    try {
      const raw = localStorage.getItem(`hekas:${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch (e) {
      console.warn(`[hekas storage] Failed to read ${key}:`, e);
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(`hekas:${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(`[hekas storage] Failed to write ${key}:`, e);
    }
  },

  remove(key: string): void {
    if (!isBrowser) return;
    localStorage.removeItem(`hekas:${key}`);
  },

  /** Reset semua data HEKAS ke seed awal. Berguna untuk testing. */
  resetAll(): void {
    if (!isBrowser) return;
    ['products', 'members', 'users', 'transactions', 'held', 'counters', 'seeded']
      .forEach((k) => localStorage.removeItem(`hekas:${k}`));
  },
};

// ─── Seed data (mirror persis DEMO_ACCOUNTS di auth/roles.ts) ───────────────
const SEED_PRODUCTS: Product[] = [
  { id: 1,  name: 'Aqua 600ml',              price: 4000,   category: 'minuman', sku: 'MNM001', barcode: '8996001300050', stock: 144, min_stock: 24,  max_stock: 200, unit: 'btl', image: '💧', is_active: true },
  { id: 2,  name: 'Teh Botol Sosro 350ml',   price: 5000,   category: 'minuman', sku: 'MNM002', barcode: '8992388100060', stock: 72,  min_stock: 20,  max_stock: 150, unit: 'btl', image: '🍵', is_active: true },
  { id: 3,  name: 'Pocari Sweat 330ml',      price: 8500,   category: 'minuman', sku: 'MNM003', barcode: '4901085088700', stock: 36,  min_stock: 15,  max_stock: 100, unit: 'btl', image: '🥤', is_active: true },
  { id: 4,  name: 'Milo 3in1 Sachet',        price: 3000,   category: 'minuman', sku: 'MNM004', barcode: '4800361001204', stock: 240, min_stock: 50,  max_stock: 400, unit: 'pcs', image: '🥛', is_active: true },
  { id: 5,  name: 'Chitato Sapi Panggang',   price: 14000,  category: 'snack',   sku: 'SNK001', barcode: '8992752210011', stock: 8,   min_stock: 15,  max_stock: 80,  unit: 'pcs', image: '🥨', is_active: true },
  { id: 6,  name: 'Qtela Singkong BBQ',      price: 9500,   category: 'snack',   sku: 'SNK002', barcode: '8993022000120', stock: 60,  min_stock: 15,  max_stock: 100, unit: 'pcs', image: '🍿', is_active: true },
  { id: 7,  name: 'Richeese Nabati',         price: 5500,   category: 'snack',   sku: 'SNK003', barcode: '8992979200050', stock: 84,  min_stock: 20,  max_stock: 150, unit: 'pcs', image: '🧀', is_active: true },
  { id: 8,  name: 'Oreo Vanilla 119g',       price: 12500,  category: 'snack',   sku: 'SNK004', barcode: '7622200672070', stock: 30,  min_stock: 10,  max_stock: 60,  unit: 'pcs', image: '🍪', is_active: true },
  { id: 9,  name: 'Indomie Goreng',          price: 3500,   category: 'sembako', sku: 'SBK001', barcode: '8992388101038', stock: 200, min_stock: 50,  max_stock: 400, unit: 'pcs', image: '🍜', is_active: true },
  { id: 21, name: 'Biskuit Roma Kelapa',     price: 8500,   category: 'snack',   sku: 'SNK005', barcode: '8991002300011', stock: 0,   min_stock: 10,  max_stock: 50,  unit: 'pcs', image: '🥥', is_active: true },
  { id: 10, name: 'Beras Cap Ayam 5kg',      price: 68000,  category: 'sembako', sku: 'SBK002', barcode: '8996001000025', stock: 20,  min_stock: 5,   max_stock: 40,  unit: 'kg',  image: '🌾', is_active: true },
  { id: 11, name: 'Minyak Goreng Tropical 1L', price: 18500, category: 'sembako', sku: 'SBK003', barcode: '8999999011111', stock: 35,  min_stock: 10,  max_stock: 60,  unit: 'ltr', image: '🫙', is_active: true },
  { id: 12, name: 'Gula Pasir 1kg',          price: 15000,  category: 'sembako', sku: 'SBK004', barcode: '8999999022222', stock: 45,  min_stock: 10,  max_stock: 80,  unit: 'kg',  image: '🍬', is_active: true },
  { id: 13, name: 'Sosis So Nice 375g',      price: 24000,  category: 'frozen',  sku: 'FRZ001', barcode: '8993351000130', stock: 24,  min_stock: 8,   max_stock: 40,  unit: 'pcs', image: '🌭', is_active: true },
  { id: 14, name: 'Nugget So Good 500g',     price: 38000,  category: 'frozen',  sku: 'FRZ002', barcode: '8993351000147', stock: 18,  min_stock: 6,   max_stock: 30,  unit: 'pcs', image: '🍗', is_active: true },
  { id: 15, name: 'Sampoerna Mild 16',       price: 32000,  category: 'rokok',   sku: 'ROK001', barcode: '8990009000010', stock: 60,  min_stock: 20,  max_stock: 100, unit: 'bks', image: '🚬', is_active: true },
  { id: 16, name: 'Dji Sam Soe Filter',      price: 28000,  category: 'rokok',   sku: 'ROK002', barcode: '8990009000027', stock: 40,  min_stock: 15,  max_stock: 80,  unit: 'bks', image: '🚬', is_active: true },
  { id: 17, name: 'Sabun Lifebuoy 90g',      price: 5500,   category: 'lainnya', sku: 'LNY001', barcode: '8851932091111', stock: 90,  min_stock: 20,  max_stock: 150, unit: 'pcs', image: '🧼', is_active: true },
  { id: 18, name: 'Shampoo Sunsilk 170ml',   price: 22000,  category: 'lainnya', sku: 'LNY002', barcode: '8851932092222', stock: 55,  min_stock: 15,  max_stock: 100, unit: 'btl', image: '🧴', is_active: true },
  { id: 19, name: 'Pasta Gigi Pepsodent',    price: 12000,  category: 'lainnya', sku: 'LNY003', barcode: '8851932093333', stock: 70,  min_stock: 20,  max_stock: 120, unit: 'pcs', image: '🪥', is_active: true },
  { id: 20, name: 'Kecap Bango 135ml',       price: 9000,   category: 'lainnya', sku: 'LNY004', barcode: '8887290011223', stock: 65,  min_stock: 15,  max_stock: 100, unit: 'btl', image: '🫙', is_active: true },
];

const SEED_MEMBERS: Member[] = [
  { id: 'M001', name: 'Siti Rahayu',    phone: '081234567890', points: 1250, tier: 'Gold' },
  { id: 'M002', name: 'Budi Setiawan',  phone: '082345678901', points: 320,  tier: 'Silver' },
  { id: 'M003', name: 'Dewi Lestari',   phone: '083456789012', points: 5800, tier: 'Platinum' },
  { id: 'M004', name: 'Andi Rahman',    phone: '085678901234', points: 90,   tier: 'Silver' },
];

const SEED_USERS: User[] = [
  // Canonical accounts (per FE_HANDOFF v2.0.0 §3, matches DEMO_ACCOUNTS in auth/roles.ts)
  { id: 1, username: 'kasir1',    full_name: 'Kasir Demo 01',    role: 'kasir',   outlet_id: 1 },
  { id: 2, username: 'manager1',  full_name: 'Manager Demo 01',  role: 'manager', outlet_id: 1 },
  { id: 3, username: 'gudang1',   full_name: 'Admin Gudang 01',  role: 'gudang',  outlet_id: 1 },
  // Legacy accounts (typo, kept for backward compat with existing sessions)
  { id: 4, username: 'kasi01',    full_name: 'Kasir Demo 01',    role: 'kasir',   outlet_id: 1 },
  { id: 5, username: 'manager01', full_name: 'Manager Demo 01',  role: 'manager', outlet_id: 1 },
  { id: 6, username: 'gudang01',  full_name: 'Admin Gudang 01',  role: 'gudang',  outlet_id: 1 }
];

// ─── Purchase Order seed (Barang Masuk) ─────────────────────────────────────
const SEED_PURCHASE_ORDERS = [
  {
    id: 'po-seed-001',
    po_no: 'PO-20260625-0001',
    sj_no: 'SJ-IM-20260625-0001',
    supplier_name: 'PT Maju Jaya Sentosa',
    status: 'MENUNGGU_VERIFIKASI',
    received_at: '2026-06-25T08:30:00.000Z',
    verified_at: undefined,
    total_items: 120,
    sku_count: 4,
    total_value: 2850000,
    notes: 'Pengiriman rutin mingguan'
  },
  {
    id: 'po-seed-002',
    po_no: 'PO-20260625-0002',
    sj_no: 'SJ-IM-20260625-0002',
    supplier_name: 'CV Sumber Rezeki',
    status: 'MENUNGGU_VERIFIKASI',
    received_at: '2026-06-25T10:15:00.000Z',
    verified_at: undefined,
    total_items: 60,
    sku_count: 3,
    total_value: 1240000,
    notes: 'Stock opname emergency'
  },
  {
    id: 'po-seed-003',
    po_no: 'PO-20260624-0003',
    sj_no: 'SJ-IM-20260624-0003',
    supplier_name: 'UD Berkah Makmur',
    status: 'TERVERIFIKASI',
    received_at: '2026-06-24T09:00:00.000Z',
    verified_at: '2026-06-24T14:30:00.000Z',
    total_items: 200,
    sku_count: 6,
    total_value: 4750000,
    notes: 'OK semua, sudah masuk rak A-01 s/d A-06'
  },
  {
    id: 'po-seed-004',
    po_no: 'PO-20260624-0004',
    sj_no: 'SJ-IM-20260624-0004',
    supplier_name: 'PT Indofood Sukses',
    status: 'TERVERIFIKASI',
    received_at: '2026-06-24T11:45:00.000Z',
    verified_at: '2026-06-24T16:00:00.000Z',
    total_items: 80,
    sku_count: 2,
    total_value: 1480000,
    notes: 'Verifikasi cepat, stok langsung di-display'
  },
  {
    id: 'po-seed-005',
    po_no: 'PO-20260623-0005',
    sj_no: 'SJ-IM-20260623-0005',
    supplier_name: 'PT Wings Surya',
    status: 'DITOLAK',
    received_at: '2026-06-23T13:20:00.000Z',
    verified_at: '2026-06-23T17:45:00.000Z',
    total_items: 36,
    sku_count: 2,
    total_value: 720000,
    notes: 'Ditolak: kemasan rusak & kadaluarsa dekat'
  }
];

// ─── Outgoing Order seed (Barang Keluar) ────────────────────────────────────
const SEED_OUTGOING_ORDERS = [
  {
    id: 'og-seed-001',
    soNumber: 'SO-20260626-0001',
    sj_no: 'SO-20260626-0001',
    orderRef: 'ORD-20260626-0042',
    destination: 'Outlet Jakarta Selatan',
    customerName: 'Outlet Jakarta Selatan',
    outletId: 'dev',
    itemCount: 24,
    skuCount: 4,
    status: 'pending',
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    notes: 'Pick up jam 14:00'
  },
  {
    id: 'og-seed-002',
    soNumber: 'SO-20260626-0002',
    sj_no: 'SO-20260626-0002',
    orderRef: 'ORD-20260626-0043',
    destination: 'Outlet Bandung Dago',
    customerName: 'Outlet Bandung Dago',
    outletId: 'dev',
    itemCount: 48,
    skuCount: 6,
    status: 'picking',
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    notes: 'Prioritas tinggi — pre-order event'
  },
  {
    id: 'og-seed-003',
    soNumber: 'SO-20260625-0003',
    sj_no: 'SO-20260625-0003',
    orderRef: 'ORD-20260625-0099',
    destination: 'Outlet Surabaya Pusat',
    customerName: 'Outlet Surabaya Pusat',
    outletId: 'dev',
    itemCount: 18,
    skuCount: 3,
    status: 'ready',
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
    notes: 'Siap dikirim via J&T'
  },
  {
    id: 'og-seed-004',
    soNumber: 'SO-20260625-0004',
    sj_no: 'SO-20260625-0004',
    orderRef: 'ORD-20260625-0102',
    destination: 'Outlet Yogyakarta',
    customerName: 'Outlet Yogyakarta',
    outletId: 'dev',
    itemCount: 12,
    skuCount: 2,
    status: 'shipped',
    createdAt: Date.now() - 28 * 60 * 60 * 1000,
    shippedAt: Date.now() - 24 * 60 * 60 * 1000,
    notes: 'Terkirim via SiCepat, resi otomatis'
  },
  {
    id: 'og-seed-005',
    soNumber: 'SO-20260624-0005',
    sj_no: 'SO-20260624-0005',
    orderRef: 'ORD-20260624-0156',
    destination: 'Outlet Semarang',
    customerName: 'Outlet Semarang',
    outletId: 'dev',
    itemCount: 6,
    skuCount: 1,
    status: 'cancelled',
    createdAt: Date.now() - 52 * 60 * 60 * 1000,
    notes: 'Customer request pembatalan (stok tidak sesuai)'
  }
];

// ─── Surat Jalan seed (antar-outlet) ─────────────────────────────────────────
const SEED_SURAT_JALAN = [
  {
    id: 'sj-seed-001',
    sjNumber: 'SJ-20260626-0001',
    poNumber: 'PO-20260625-0001',
    fromOutlet: 'Gudang Pusat Jakarta',
    toOutlet: 'Outlet Jakarta Selatan',
    driver: 'Pak Hendra',
    vehicle: 'B 9876 XYZ',
    items: [
      { productId: '1',  productName: 'Aqua 600ml',            qty: 48, unit: 'btl' },
      { productId: '2',  productName: 'Teh Botol Sosro 350ml', qty: 24, unit: 'btl' },
      { productId: '4',  productName: 'Milo 3in1 Sachet',      qty: 36, unit: 'pcs' },
      { productId: '11', productName: 'Minyak Goreng 1L',      qty: 12, unit: 'ltr' }
    ],
    status: 'pending_review',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    createdBy: 'Admin Gudang 01'
  },
  {
    id: 'sj-seed-002',
    sjNumber: 'SJ-20260626-0002',
    poNumber: 'PO-20260625-0002',
    fromOutlet: 'Gudang Pusat Jakarta',
    toOutlet: 'Outlet Bandung Dago',
    driver: 'Pak Joko',
    vehicle: 'B 1234 ABC',
    items: [
      { productId: '5',  productName: 'Chitato Sapi Panggang', qty: 18, unit: 'pcs' },
      { productId: '7',  productName: 'Richeese Nabati',       qty: 24, unit: 'pcs' },
      { productId: '8',  productName: 'Oreo Vanilla 119g',     qty: 12, unit: 'pcs' },
      { productId: '13', productName: 'Sosis So Nice 375g',    qty: 6,  unit: 'pcs' },
      { productId: '14', productName: 'Nugget So Good 500g',   qty: 8,  unit: 'pcs' },
      { productId: '9',  productName: 'Indomie Goreng',        qty: 48, unit: 'pcs' }
    ],
    status: 'approved',
    createdAt: Date.now() - 5 * 60 * 60 * 1000,
    createdBy: 'Admin Gudang 01',
    reviewedAt: Date.now() - 4 * 60 * 60 * 1000,
    reviewedBy: 'Manager Demo 01',
    reviewNotes: 'OK, lanjut kirim'
  },
  {
    id: 'sj-seed-003',
    sjNumber: 'SJ-20260625-0003',
    poNumber: 'PO-20260624-0003',
    fromOutlet: 'Gudang Pusat Jakarta',
    toOutlet: 'Outlet Surabaya Pusat',
    driver: 'Pak Slamet',
    vehicle: 'B 5678 DEF',
    items: [
      { productId: '10', productName: 'Beras Cap Ayam 5kg',   qty: 6,  unit: 'kg' },
      { productId: '12', productName: 'Gula Pasir 1kg',       qty: 8,  unit: 'kg' },
      { productId: '15', productName: 'Sampoerna Mild 16',    qty: 12, unit: 'bks' }
    ],
    status: 'delivered',
    createdAt: Date.now() - 26 * 60 * 60 * 1000,
    createdBy: 'Admin Gudang 01',
    reviewedAt: Date.now() - 25 * 60 * 60 * 1000,
    reviewedBy: 'Manager Demo 01',
    reviewNotes: 'Approved, kirim via SiCepat',
    deliveredAt: Date.now() - 22 * 60 * 60 * 1000
  },
  {
    id: 'sj-seed-004',
    sjNumber: 'SJ-20260625-0004',
    fromOutlet: 'Gudang Pusat Jakarta',
    toOutlet: 'Outlet Yogyakarta',
    driver: 'Pak Yanto',
    vehicle: 'B 9012 GHI',
    items: [
      { productId: '17', productName: 'Sabun Lifebuoy 90g',    qty: 24, unit: 'pcs' },
      { productId: '19', productName: 'Pasta Gigi Pepsodent',  qty: 12, unit: 'pcs' }
    ],
    status: 'in_transit',
    createdAt: Date.now() - 28 * 60 * 60 * 1000,
    createdBy: 'Admin Gudang 01',
    reviewedAt: Date.now() - 27 * 60 * 60 * 1000,
    reviewedBy: 'Manager Demo 01'
  }
];

// ─── Seed runner ────────────────────────────────────────────────────────────
// Bump SEED_VERSION kalau SEED_PRODUCTS / SEED_MEMBERS / SEED_USERS berubah
// supaya existing localStorage di-re-seed dengan data baru.
const SEED_VERSION = 3;
const SEED_VERSION_KEY = 'hekas:seed_version';

export function seedIfEmpty(): void {
  if (!isBrowser) return;
  const currentVersion = Number(localStorage.getItem(SEED_VERSION_KEY) ?? '0');
  if (currentVersion >= SEED_VERSION) return;

  storage.set('products', SEED_PRODUCTS);
  storage.set('members', SEED_MEMBERS);
  storage.set('users', SEED_USERS);
  storage.set('transactions', []);
  storage.set('held', []);
  storage.set('counters', { products: 21, transactions: 0 });
  // Seed gudang modul data (agar dashboard tidak kosong saat first-load)
  // Tulis langsung ke localStorage dengan prefix 'hekas:' karena di sini
  // kita belum di-import sebagai module lain (circular-safe).
  localStorage.setItem('hekas:purchase_orders', JSON.stringify(SEED_PURCHASE_ORDERS));
  localStorage.setItem('hekas:outgoing_orders', JSON.stringify(SEED_OUTGOING_ORDERS));
  localStorage.setItem('hekas:surat_jalan', JSON.stringify(SEED_SURAT_JALAN));
  localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
  // Keep legacy flag set juga (backward compat dengan code lama)
  localStorage.setItem('hekas:seeded', '1');

  console.log(`🌱 [hekas api] Seed data v${SEED_VERSION} loaded into localStorage`);
}

// ─── ID generators ──────────────────────────────────────────────────────────
export function nextProductId(): number {
  const counters = storage.get<{ products: number; transactions: number }>('counters', { products: 21, transactions: 0 });
  counters.products += 1;
  storage.set('counters', counters);
  return counters.products;
}

export function nextTransactionId(): number {
  const counters = storage.get<{ products: number; transactions: number }>('counters', { products: 21, transactions: 0 });
  counters.transactions += 1;
  storage.set('counters', counters);
  return counters.transactions;
}

export function genInvoiceNo(): string {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(nextTransactionId()).padStart(4, '0');
  return `INV-${ymd}-${seq}`;
}

export function genHoldId(): string {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Date.now()).slice(-4);
  return `H-${ymd}-${seq}`;
}
