// HEKAS POS — API layer: Analytics
// Semua agregasi dihitung client-side dari data transactions di localStorage.
// Nanti kalau ada backend beneran, ini tinggal pindah ke SQL GROUP BY.

import type { DashboardSummary } from '../types/api.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';

const delay = (ms = 25) => new Promise<void>((r) => setTimeout(r, ms));

// ─── summary ────────────────────────────────────────────────────────────────
export interface SummaryRange { from?: string; to?: string; }

export async function getSummary(range: SummaryRange = {}): Promise<DashboardSummary> {
  seedIfEmpty();
  await delay();

  const today = new Date().toISOString().slice(0, 10);
  const from = range.from ?? today;
  const to = range.to ?? today;

  const all = storage.get<any[]>('transactions', []);
  const inRange = all.filter((t) =>
    t.status !== 'void' &&
    t.created_at.slice(0, 10) >= from &&
    t.created_at.slice(0, 10) <= to,
  );

  // KPI
  const revenue = inRange.reduce((s, t) => s + t.total, 0);
  const txCount = inRange.length;
  const avg = txCount > 0 ? Math.round(revenue / txCount) : 0;

  // By payment method
  const methodMap = new Map<string, { count: number; total: number }>();
  for (const t of inRange) {
    const cur = methodMap.get(t.payment_method) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += t.total;
    methodMap.set(t.payment_method, cur);
  }
  const byPayment = Array.from(methodMap.entries()).map(([payment_method, v]) => ({
    payment_method, count: v.count, total: v.total,
  }));

  // Top products
  const prodMap = new Map<number, { name: string; qty: number; revenue: number }>();
  for (const t of inRange) {
    for (const it of (t.items ?? [])) {
      const cur = prodMap.get(it.product_id) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.subtotal;
      prodMap.set(it.product_id, cur);
    }
  }
  const topProducts = Array.from(prodMap.entries())
    .map(([product_id, v]) => ({ product_id, product_name: v.name, qty_sold: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.qty_sold - a.qty_sold)
    .slice(0, 10);

  // Hourly distribution (hanya hari ini)
  const todayTx = all.filter((t) => t.status !== 'void' && t.created_at.slice(0, 10) === today);
  const hourMap = new Map<string, { count: number; revenue: number }>();
  for (let h = 0; h < 24; h++) hourMap.set(String(h).padStart(2, '0'), { count: 0, revenue: 0 });
  for (const t of todayTx) {
    const h = t.created_at.slice(11, 13);
    const cur = hourMap.get(h) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += t.total;
    hourMap.set(h, cur);
  }
  const hourly = Array.from(hourMap.entries()).map(([hour, v]) => ({
    hour, tx_count: v.count, revenue: v.revenue,
  }));

  // Low stock
  const products = storage.get<any[]>('products', []).filter((p) => p.is_active);
  const lowStock = products
    .filter((p) => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
    .map((p) => ({ id: p.id, name: p.name, stock: p.stock, category: p.category, sku: p.sku, unit: p.unit }));

  return {
    range: { from, to },
    kpi: { revenue, transactions: txCount, avg_transaction: avg },
    by_payment_method: byPayment,
    top_products: topProducts,
    hourly_distribution: hourly,
    low_stock: lowStock,
  };
}
