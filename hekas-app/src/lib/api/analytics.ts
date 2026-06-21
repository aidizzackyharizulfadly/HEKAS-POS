// HEKAS POS — API layer: Analytics
//
// Dual-mode: HTTP (Wafiq BE) | localStorage mock.
//
// BE endpoints used:
//   GET /api/dashboard/manager — manager KPIs (raw object, no wrapper)
//   GET /api/dashboard/gudang  — gudang KPIs
// Kalau endpoint tidak ada (e.g. specific range), fallback ke client-compute
// dari order list.

import type { DashboardSummary } from '../types/api.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';
import { API_MODE, httpFetch, unwrapOne } from './http.js';
import { listTransactions } from './transactions.js';

const delay = (ms = 25) => new Promise<void>((r) => setTimeout(r, ms));

// ─── summary ────────────────────────────────────────────────────────────────
export interface SummaryRange { from?: string; to?: string; }

export async function getSummary(range: SummaryRange = {}): Promise<DashboardSummary> {
  if (API_MODE === 'http') {
    // BE dashboard/manager returns raw object (per FE_HANDOFF §5.1)
    try {
      const raw = await httpFetch<any>('/api/dashboard/manager');
      const d = unwrapOne<any>(raw);
      // Normalize BE shape to FE DashboardSummary
      return {
        range: { from: range.from ?? new Date().toISOString().slice(0, 10), to: range.to ?? new Date().toISOString().slice(0, 10) },
        kpi: {
          revenue: parseFloat(d.kpi?.pendapatan_hari_ini ?? d.kpi?.revenue ?? 0) || 0,
          transactions: d.kpi?.total_transaksi ?? d.kpi?.transactions ?? 0,
          avg_transaction: d.kpi?.avg_per_transaksi ?? d.kpi?.avg_transaction ?? 0
        },
        by_payment_method: Object.entries(d.kpi?.by_payment_method ?? d.by_payment_method ?? {}).map(([k, v]: any) => ({
          payment_method: k,
          count: v?.count ?? 0,
          total: parseFloat(v?.amount ?? v?.total ?? 0) || 0
        })),
        top_products: (d.best_sellers ?? d.top_products ?? []).map((p: any) => ({
          product_id: p.id ?? p.productId,
          product_name: p.name ?? p.productName,
          qty_sold: p.qty ?? p.quantity ?? 0,
          revenue: parseFloat(p.revenue ?? p.total ?? 0) || 0
        })),
        hourly_distribution: d.hourly_distribution ?? [],
        low_stock: d.low_stock ?? []
      };
    } catch {
      // Fallback: client-compute from order list
      const orders = await listTransactions({
        from: range.from,
        to: range.to,
        limit: 1000
      });
      return computeFromOrders(orders, range);
    }
  }

  return computeFromLocal(range);
}

// ─── Gudang dashboard ────────────────────────────────────────────────────
export async function getGudangSummary(): Promise<any> {
  if (API_MODE === 'http') {
    const raw = await httpFetch<any>('/api/dashboard/gudang');
    return unwrapOne<any>(raw);
  }
  return null;
}

// ─── Helper: compute from BE order list (fallback) ──────────────────────
function computeFromOrders(orders: any[], range: SummaryRange): DashboardSummary {
  const today = new Date().toISOString().slice(0, 10);
  const from = range.from ?? today;
  const to = range.to ?? today;
  const inRange = orders.filter((t) => t.status !== 'void' && t.created_at?.slice(0, 10) >= from && t.created_at?.slice(0, 10) <= to);

  const revenue = inRange.reduce((s, t) => s + t.total, 0);
  const txCount = inRange.length;
  const avg = txCount > 0 ? Math.round(revenue / txCount) : 0;

  const methodMap = new Map<string, { count: number; total: number }>();
  for (const t of inRange) {
    const cur = methodMap.get(t.payment_method) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += t.total;
    methodMap.set(t.payment_method, cur);
  }
  const byPayment = Array.from(methodMap.entries()).map(([payment_method, v]) => ({ payment_method, count: v.count, total: v.total }));

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

  return {
    range: { from, to },
    kpi: { revenue, transactions: txCount, avg_transaction: avg },
    by_payment_method: byPayment,
    top_products: topProducts,
    hourly_distribution: [],
    low_stock: []
  };
}

// ─── Helper: compute from localStorage (mock mode) ──────────────────────
function computeFromLocal(range: SummaryRange): DashboardSummary {
  seedIfEmpty();
  void delay();

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
