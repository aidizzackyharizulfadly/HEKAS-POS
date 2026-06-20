// HEKAS POS — API layer: Storage wrapper
// localStorage yang aman untuk SSR (SvelteKit prerender) + seed data awal.
//
// Konvensi key prefix: "hekas:"
//   hekas:products        → Product[]
//   hekas:members         → Member[]
//   hekas:users           → User[]  (mirror DEMO_ACCOUNTS)
//   hekas:transactions    → Transaction[]
//   hekas:held            → HeldTransaction[]
//   hekas:counters        → { products: number, transactions: number }
//   hekas:seeded          → "1" (penanda sudah di-seed)

import type { Product, Member, User } from './types.js';

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
  { id: 1,  name: 'Aqua 600ml',              price: 4000,   category: 'minuman', sku: 'MNM001', barcode: '8996001300050', stock: 144, unit: 'btl', image: '💧', is_active: true },
  { id: 2,  name: 'Teh Botol Sosro 350ml',   price: 5000,   category: 'minuman', sku: 'MNM002', barcode: '8992388100060', stock: 72,  unit: 'btl', image: '🍵', is_active: true },
  { id: 3,  name: 'Pocari Sweat 330ml',      price: 8500,   category: 'minuman', sku: 'MNM003', barcode: '4901085088700', stock: 36,  unit: 'btl', image: '🥤', is_active: true },
  { id: 4,  name: 'Milo 3in1 Sachet',        price: 3000,   category: 'minuman', sku: 'MNM004', barcode: '4800361001204', stock: 240, unit: 'pcs', image: '🥛', is_active: true },
  { id: 5,  name: 'Chitato Sapi Panggang',   price: 14000,  category: 'snack',   sku: 'SNK001', barcode: '8992752210011', stock: 48,  unit: 'pcs', image: '🥨', is_active: true },
  { id: 6,  name: 'Qtela Singkong BBQ',      price: 9500,   category: 'snack',   sku: 'SNK002', barcode: '8993022000120', stock: 60,  unit: 'pcs', image: '🍿', is_active: true },
  { id: 7,  name: 'Richeese Nabati',         price: 5500,   category: 'snack',   sku: 'SNK003', barcode: '8992979200050', stock: 84,  unit: 'pcs', image: '🧀', is_active: true },
  { id: 8,  name: 'Oreo Vanilla 119g',       price: 12500,  category: 'snack',   sku: 'SNK004', barcode: '7622200672070', stock: 30,  unit: 'pcs', image: '🍪', is_active: true },
  { id: 9,  name: 'Indomie Goreng',          price: 3500,   category: 'sembako', sku: 'SBK001', barcode: '8992388101038', stock: 200, unit: 'pcs', image: '🍜', is_active: true },
  { id: 21, name: 'Biskuit Roma Kelapa',     price: 8500,   category: 'snack',   sku: 'SNK005', barcode: '8991002300011', stock: 0,   unit: 'pcs', image: '🥥', is_active: true },
  { id: 10, name: 'Beras Cap Ayam 5kg',      price: 68000,  category: 'sembako', sku: 'SBK002', barcode: '8996001000025', stock: 20,  unit: 'kg',  image: '🌾', is_active: true },
  { id: 11, name: 'Minyak Goreng Tropical 1L', price: 18500, category: 'sembako', sku: 'SBK003', barcode: '8999999011111', stock: 35,  unit: 'ltr', image: '🫙', is_active: true },
  { id: 12, name: 'Gula Pasir 1kg',          price: 15000,  category: 'sembako', sku: 'SBK004', barcode: '8999999022222', stock: 45,  unit: 'kg',  image: '🍬', is_active: true },
  { id: 13, name: 'Sosis So Nice 375g',      price: 24000,  category: 'frozen',  sku: 'FRZ001', barcode: '8993351000130', stock: 24,  unit: 'pcs', image: '🌭', is_active: true },
  { id: 14, name: 'Nugget So Good 500g',     price: 38000,  category: 'frozen',  sku: 'FRZ002', barcode: '8993351000147', stock: 18,  unit: 'pcs', image: '🍗', is_active: true },
  { id: 15, name: 'Sampoerna Mild 16',       price: 32000,  category: 'rokok',   sku: 'ROK001', barcode: '8990009000010', stock: 60,  unit: 'bks', image: '🚬', is_active: true },
  { id: 16, name: 'Dji Sam Soe Filter',      price: 28000,  category: 'rokok',   sku: 'ROK002', barcode: '8990009000027', stock: 40,  unit: 'bks', image: '🚬', is_active: true },
  { id: 17, name: 'Sabun Lifebuoy 90g',      price: 5500,   category: 'lainnya', sku: 'LNY001', barcode: '8851932091111', stock: 90,  unit: 'pcs', image: '🧼', is_active: true },
  { id: 18, name: 'Shampoo Sunsilk 170ml',   price: 22000,  category: 'lainnya', sku: 'LNY002', barcode: '8851932092222', stock: 55,  unit: 'btl', image: '🧴', is_active: true },
  { id: 19, name: 'Pasta Gigi Pepsodent',    price: 12000,  category: 'lainnya', sku: 'LNY003', barcode: '8851932093333', stock: 70,  unit: 'pcs', image: '🪥', is_active: true },
  { id: 20, name: 'Kecap Bango 135ml',       price: 9000,   category: 'lainnya', sku: 'LNY004', barcode: '8887290011223', stock: 65,  unit: 'btl', image: '🫙', is_active: true },
];

const SEED_MEMBERS: Member[] = [
  { id: 'M001', name: 'Siti Rahayu',    phone: '081234567890', points: 1250, tier: 'Gold' },
  { id: 'M002', name: 'Budi Setiawan',  phone: '082345678901', points: 320,  tier: 'Silver' },
  { id: 'M003', name: 'Dewi Lestari',   phone: '083456789012', points: 5800, tier: 'Platinum' },
  { id: 'M004', name: 'Andi Rahman',    phone: '085678901234', points: 90,   tier: 'Silver' },
];

const SEED_USERS: User[] = [
  { id: 1, username: 'kasi01',    full_name: 'Kasir Demo 01',    role: 'kasir',   outlet_id: 1 },
  { id: 2, username: 'manager01', full_name: 'Manager Demo 01',  role: 'manager', outlet_id: 1 },
  { id: 3, username: 'gudang01',  full_name: 'Admin Gudang 01',  role: 'gudang',  outlet_id: 1 },
];

// ─── Seed runner ────────────────────────────────────────────────────────────
export function seedIfEmpty(): void {
  if (!isBrowser) return;
  if (localStorage.getItem('hekas:seeded') === '1') return;

  storage.set('products', SEED_PRODUCTS);
  storage.set('members', SEED_MEMBERS);
  storage.set('users', SEED_USERS);
  storage.set('transactions', []);
  storage.set('held', []);
  storage.set('counters', { products: 21, transactions: 0 });
  localStorage.setItem('hekas:seeded', '1');

  console.log('🌱 [hekas api] Seed data loaded into localStorage');
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
