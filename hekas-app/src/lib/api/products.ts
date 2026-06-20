// HEKAS POS — API layer: Products
// Semua operasi dibungkus Promise + delay kecil (10-30ms) supaya UI terasa
// seperti beneran manggil HTTP request — gampang ditukar ke fetch() nanti.

import type { Product } from './types.js';
import { storage, seedIfEmpty, nextProductId } from './storage.js';

/** Simulasi latency jaringan (biar terasa realistis) */
const delay = (ms = 15) => new Promise<void>((r) => setTimeout(r, ms));

// ─── list ────────────────────────────────────────────────────────────────────
export interface ListProductsFilter {
  category?: string;
  q?: string;
  activeOnly?: boolean;
}

export async function listProducts(filter: ListProductsFilter = {}): Promise<Product[]> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  return all
    .filter((p) => {
      if (filter.activeOnly !== false && !p.is_active) return false;
      if (filter.category && filter.category !== 'all' && p.category !== filter.category) return false;
      if (filter.q) {
        const term = filter.q.toLowerCase();
        if (!p.name.toLowerCase().includes(term) &&
            !p.sku.toLowerCase().includes(term) &&
            !p.barcode.includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

// ─── get by id ──────────────────────────────────────────────────────────────
export async function getProduct(id: number): Promise<Product | null> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  return all.find((p) => p.id === id) ?? null;
}

// ─── get by barcode (untuk scanner) ─────────────────────────────────────────
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  return all.find((p) => p.barcode === barcode && p.is_active) ?? null;
}

// ─── create ─────────────────────────────────────────────────────────────────
export interface CreateProductInput {
  name: string;
  price: number;
  category: string;
  sku: string;
  barcode: string;
  stock: number;
  unit?: string;
  image?: string;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);

  // Validasi unik
  if (all.some((p) => p.sku === input.sku)) throw new Error(`SKU ${input.sku} sudah dipakai`);
  if (all.some((p) => p.barcode === input.barcode)) throw new Error(`Barcode ${input.barcode} sudah dipakai`);

  const product: Product = {
    id: nextProductId(),
    name: input.name.trim(),
    price: input.price,
    category: input.category,
    sku: input.sku.trim(),
    barcode: input.barcode,
    stock: input.stock,
    unit: input.unit ?? 'pcs',
    image: input.image ?? '📦',
    is_active: true,
  };
  storage.set('products', [...all, product]);
  return product;
}

// ─── update ─────────────────────────────────────────────────────────────────
export async function updateProduct(id: number, patch: Partial<CreateProductInput>): Promise<Product> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produk #${id} tidak ditemukan`);

  const updated: Product = { ...all[idx], ...patch };
  all[idx] = updated;
  storage.set('products', all);
  return updated;
}

// ─── Fase F: image operations ────────────────────────────────────────────────
export interface ProductImageMeta {
  image_data: string;
  image_mime: string;
  image_size: number;
  image_width: number;
  image_height: number;
}

export async function setProductImage(id: number, meta: ProductImageMeta): Promise<Product> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produk #${id} tidak ditemukan`);

  all[idx] = {
    ...all[idx],
    image_data: meta.image_data,
    image_mime: meta.image_mime,
    image_size: meta.image_size,
    image_width: meta.image_width,
    image_height: meta.image_height,
    image_updated_at: new Date().toISOString(),
  };
  storage.set('products', all);
  return all[idx];
}

export async function removeProductImage(id: number): Promise<Product> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produk #${id} tidak ditemukan`);

  // Hapus field image_data* tapi keep emoji fallback
  const { image_data, image_mime, image_size, image_width, image_height, image_updated_at, ...rest } = all[idx];
  all[idx] = rest as Product;
  storage.set('products', all);
  return all[idx];
}

// ─── update stock (dipakai transaksi & restock gudang) ─────────────────────
export async function updateStock(id: number, delta: number): Promise<Product> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produk #${id} tidak ditemukan`);

  const newStock = all[idx].stock + delta;
  if (newStock < 0) throw new Error(`Stok ${all[idx].name} tidak cukup`);

  all[idx] = { ...all[idx], stock: newStock };
  storage.set('products', all);
  return all[idx];
}

export async function setStock(id: number, stock: number): Promise<Product> {
  if (stock < 0) throw new Error('Stok tidak boleh negatif');
  return updateProduct(id, { stock });
}

// ─── soft delete (is_active = false) ────────────────────────────────────────
export async function deactivateProduct(id: number): Promise<void> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Produk #${id} tidak ditemukan`);
  all[idx] = { ...all[idx], is_active: false };
  storage.set('products', all);
}

// ─── list categories (distinct, dihitung dari data aktif) ───────────────────
export async function listCategories(): Promise<{ id: string; label: string }[]> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Product[]>('products', []).filter((p) => p.is_active);
  const ids = Array.from(new Set(all.map((p) => p.category))).sort();
  const labelMap: Record<string, string> = {
    minuman: 'Minuman',
    snack: 'Snack',
    sembako: 'Sembako',
    frozen: 'Frozen',
    rokok: 'Rokok',
    lainnya: 'Lainnya',
  };
  return [
    { id: 'all', label: 'Semua' },
    ...ids.map((id) => ({ id, label: labelMap[id] ?? id })),
  ];
}
