// HEKAS POS — API layer: Transactions
// Inti dari POS: checkout (atomic: re-price + decrement stock + record tx +
// earn member points). Semua dibungkus Promise biar swap ke fetch() nanti
// tinggal ganti implementasi.

import type {
  CartItem, CheckoutInput, CheckoutResult, Member,
  Transaction, TransactionItem, HeldTransaction,
} from '../types/api.js';
import { TIER_CONFIG } from '../types/api.js';
import { storage, seedIfEmpty, genInvoiceNo, genHoldId } from '$lib/utils/storage.js';
import { recordTransaction } from './members.js';
import type { PaymentMethod, PaymentSplitSummary } from '../utils/payment.js';
import {
  validatePaymentSplit, summarizePayments, PAYMENT_METHOD_NEEDS_TENDERED,
} from '../utils/payment.js';

const delay = (ms = 20) => new Promise<void>((r) => setTimeout(r, ms));

// ─── checkout ───────────────────────────────────────────────────────────────
export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  seedIfEmpty();
  await delay(40);

  const products = storage.get<any[]>('products', []);
  const transactions = storage.get<Transaction[]>('transactions', []);

  // Re-load products from storage (real prices)
  const lines = input.items.map((item) => {
    const p = products.find((p) => p.id === item.product_id);
    if (!p) throw new Error(`Produk #${item.product_id} tidak ditemukan`);
    if (!p.is_active) throw new Error(`Produk ${p.name} nonaktif`);
    if (p.stock < item.qty) {
      throw new Error(`Stok ${p.name} tidak cukup (sisa ${p.stock}, diminta ${item.qty})`);
    }
    const discPct = item.disc_pct ?? 0;
    const lineSub = Math.round((p.price * item.qty * (100 - discPct)) / 100);
    return {
      product: p,
      qty: item.qty,
      disc_pct: discPct,
      subtotal: lineSub,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discountPct = input.discount_pct ?? 0;
  const discountAmt = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discountAmt;

  // ─── Normalisasi payment: legacy single → array, multi → array ─────────
  let payments: PaymentMethod[];
  if (input.payments && input.payments.length > 0) {
    // Multi-payment path (Fase 5)
    payments = input.payments;
  } else {
    // Legacy single-payment path
    const method = input.payment_method;
    if (!method) {
      throw new Error('Metode pembayaran harus diisi');
    }
    // Hitung change untuk tunai: paid >= total, change = paid - total
    const tendered = PAYMENT_METHOD_NEEDS_TENDERED.includes(method as any)
      ? input.paid
      : undefined;
    const change = method === 'tunai'
      ? Math.max(0, input.paid - total)
      : 0;
    payments = [{
      id: 'pm_' + Math.random().toString(36).slice(2, 10),
      kind: method,
      amount: total,
      tendered,
      change,
      paid_at: new Date().toISOString(),
    }];
  }

  // Validasi split
  validatePaymentSplit(payments, total);

  // Hitung summary
  const summary: PaymentSplitSummary = summarizePayments(payments);
  const paidTotal = summary.total_paid;
  const changeAmt = summary.total_change;
  const primaryMethod = payments[0].kind;

  // ─── Persist: decrement stocks + write tx ───────────────────────────────
  const updatedProducts = products.map((p) => {
    const line = lines.find((l) => l.product.id === p.id);
    if (!line) return p;
    return { ...p, stock: p.stock - line.qty };
  });
  storage.set('products', updatedProducts);

  // Build tx + items
  const txId = transactions.length ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
  const invoiceNo = genInvoiceNo();
  const tx: Transaction = {
    id: txId,
    invoice_no: invoiceNo,
    user_id: input.user_id,
    outlet_id: input.outlet_id ?? null,
    member_id: input.member_id ?? null,
    subtotal,
    discount_pct: discountPct,
    discount_amt: discountAmt,
    total,
    paid: paidTotal,
    change_amt: changeAmt,
    payment_method: primaryMethod,
    payments,
    is_split: summary.is_split,
    status: 'completed',
    note: input.note ?? null,
    created_at: new Date().toISOString(),
  };

  tx.items = lines.map((l, i) => ({
    id: i + 1,
    transaction_id: txId,
    product_id: l.product.id,
    product_name: l.product.name,
    qty: l.qty,
    price: l.product.price,
    disc_pct: l.disc_pct,
    subtotal: l.subtotal,
  })) satisfies TransactionItem[];

  storage.set('transactions', [...transactions, tx]);

  // Award member points (1 poin / Rp 10.000, dikali tier multiplier)
  let updatedMember: Member | null = null;
  let pointsEarned = 0;
  if (input.member_id) {
    // Ambil tier member untuk multiplier
    const allMembers = storage.get<Member[]>('members', []);
    const member = allMembers.find((m) => m.id === input.member_id);
    const multiplier = member ? TIER_CONFIG[member.tier].point_multiplier : 1;

    // Base earn: 1 poin per Rp 10.000
    const basePoints = Math.floor(total / 10000);
    pointsEarned = basePoints * multiplier;

    // Record transaction → update lifetime_spend + log point + auto-recalc tier
    if (pointsEarned > 0 || total > 0) {
      updatedMember = await recordTransaction(input.member_id, {
        amount: total,
        earned_points: pointsEarned,
        invoice_no: invoiceNo,
      });
    }
  }

  return {
    invoice_no: invoiceNo,
    id: txId,
    subtotal,
    discount_pct: discountPct,
    discount_amt: discountAmt,
    total,
    paid: paidTotal,
    change_amt: changeAmt,
    payment_method: primaryMethod,
    payments,
    is_split: summary.is_split,
    member_id: input.member_id ?? null,
    points_earned: pointsEarned,
    updated_member: updatedMember,
  };
}

// ─── list ───────────────────────────────────────────────────────────────────
export interface ListTxFilter {
  from?: string;      // YYYY-MM-DD
  to?: string;
  user_id?: number;
  payment?: string;
  status?: 'completed' | 'void' | 'held';
  limit?: number;
}

/**
 * Inflate legacy tx (tanpa field `payments`) jadi tx dgn payments array.
 * Backward-compat: tx lama yg cuma punya `payment_method` (string) di-translate
 * jadi payments = [{ kind: payment_method, amount: paid, ... }]
 */
function inflateLegacyPayments(tx: Transaction): Transaction {
  if (tx.payments && tx.payments.length > 0) {
    return tx; // sudah multi-payment format
  }
  // legacy single → inflate ke array 1-entry
  const kind = tx.payment_method as PaymentMethod['kind'];
  return {
    ...tx,
    payments: [{
      id: 'pm_legacy_' + tx.id,
      kind,
      amount: tx.paid,
      tendered: kind === 'tunai' ? tx.paid : undefined,
      change: tx.change_amt,
      paid_at: tx.created_at,
    }],
    is_split: false,
  };
}

export async function listTransactions(filter: ListTxFilter = {}): Promise<Transaction[]> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Transaction[]>('transactions', []);
  const users = storage.get<any[]>('users', []);
  const members = storage.get<any[]>('members', []);

  return all
    .filter((t) => {
      if (filter.from && t.created_at.slice(0, 10) < filter.from) return false;
      if (filter.to   && t.created_at.slice(0, 10) > filter.to)   return false;
      if (filter.user_id && t.user_id !== filter.user_id) return false;
      if (filter.payment && t.payment_method !== filter.payment) return false;
      if (filter.status && t.status !== filter.status) return false;
      return true;
    })
    .map(inflateLegacyPayments)
    .map((t) => ({
      ...t,
      user_name: users.find((u) => u.id === t.user_id)?.full_name ?? '—',
      member_name: t.member_id ? members.find((m) => m.id === t.member_id)?.name ?? null : null,
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, filter.limit ?? 100);
}

// ─── get detail ─────────────────────────────────────────────────────────────
export async function getTransaction(id: number | string): Promise<Transaction | null> {
  seedIfEmpty();
  await delay();
  const all = storage.get<Transaction[]>('transactions', []);
  const found = all.find((t) => t.id === Number(id) || t.invoice_no === id);
  if (!found) return null;
  const users = storage.get<any[]>('users', []);
  return inflateLegacyPayments({
    ...found,
    user_name: users.find((u) => u.id === found.user_id)?.full_name ?? '—',
  });
}

// ─── void ───────────────────────────────────────────────────────────────────
export async function voidTransaction(id: number): Promise<void> {
  seedIfEmpty();
  await delay(40);
  const txs = storage.get<Transaction[]>('transactions', []);
  const products = storage.get<any[]>('products', []);
  const idx = txs.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Transaksi #${id} tidak ditemukan`);
  if (txs[idx].status !== 'completed') throw new Error('Transaksi sudah void / held');

  // Restore stock
  const items = txs[idx].items ?? [];
  const restored = products.map((p) => {
    const it = items.find((i: any) => i.product_id === p.id);
    if (!it) return p;
    return { ...p, stock: p.stock + it.qty };
  });
  storage.set('products', restored);

  txs[idx] = {
    ...txs[idx],
    status: 'void',
    note: (txs[idx].note ? txs[idx].note + ' | ' : '') + 'VOIDED',
  };
  storage.set('transactions', txs);
}

// ─── held: park a cart ──────────────────────────────────────────────────────
export interface HoldInput {
  user_id: number;
  outlet_id?: number;
  member_id?: string | null;
  cart: CartItem[];
  discount_pct?: number;
  note?: string;
}

export async function holdTransaction(input: HoldInput): Promise<HeldTransaction> {
  seedIfEmpty();
  await delay();
  const all = storage.get<HeldTransaction[]>('held', []);
  const subtotal = input.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const total = Math.round((subtotal * (100 - (input.discount_pct ?? 0))) / 100);

  const held: HeldTransaction = {
    id: genHoldId(),
    user_id: input.user_id,
    member_id: input.member_id ?? null,
    cart: input.cart,
    subtotal,
    discount_pct: input.discount_pct ?? 0,
    total,
    items: input.cart.length,
    time: new Date().toISOString().slice(11, 16),
    held_at: new Date().toISOString(),
    note: input.note ?? null,
  };
  storage.set('held', [held, ...all]);
  return held;
}

// ─── held: list ─────────────────────────────────────────────────────────────
export async function listHeld(): Promise<HeldTransaction[]> {
  seedIfEmpty();
  await delay();
  const all = storage.get<HeldTransaction[]>('held', []);
  const users = storage.get<any[]>('users', []);
  return all.map((h) => ({
    ...h,
    user_name: users.find((u) => u.id === h.user_id)?.full_name ?? '—',
  }));
}

// ─── held: recall (delete after resumed) ────────────────────────────────────
export async function recallHeld(id: string): Promise<void> {
  seedIfEmpty();
  await delay();
  const all = storage.get<HeldTransaction[]>('held', []);
  storage.set('held', all.filter((h) => h.id !== id));
}

// ─── closing report (X/Z Report style) ──────────────────────────────────────
export interface ClosingReport {
  from: string;
  to: string;
  cashier_name: string;
  tx_count: number;
  void_count: number;
  subtotal: number;
  discount_amt: number;
  total: number;
  paid_total: number;
  by_payment: { method: string; count: number; total: number }[];
  top_products: { name: string; qty: number; total: number }[];
  hour_breakdown: { hour: string; count: number; total: number }[];
}

export interface ClosingReportFilter {
  from?: string;            // ISO datetime
  to?: string;
  user_id?: number;         // filter by cashier (omit = all)
}

export async function getClosingReport(
  filter: ClosingReportFilter = {},
): Promise<ClosingReport> {
  seedIfEmpty();
  await delay();
  const txs = storage.get<Transaction[]>('transactions', []);
  const users = storage.get<any[]>('users', []);

  const inRange = (iso: string) => {
    if (filter.from && iso < filter.from) return false;
    if (filter.to && iso > filter.to) return false;
    return true;
  };

  const filtered = txs.filter((t) => {
    if (!inRange(t.created_at)) return false;
    if (filter.user_id && t.user_id !== filter.user_id) return false;
    return true;
  });

  const completed = filtered.filter((t) => t.status === 'completed');
  const voided = filtered.filter((t) => t.status === 'void');

  const subtotal = completed.reduce((s, t) => s + t.subtotal, 0);
  const discount_amt = completed.reduce((s, t) => s + t.discount_amt, 0);
  const total = completed.reduce((s, t) => s + t.total, 0);
  const paid_total = completed.reduce((s, t) => s + t.paid, 0);

  // By payment method
  const payMap = new Map<string, { count: number; total: number }>();
  for (const t of completed) {
    const cur = payMap.get(t.payment_method) ?? { count: 0, total: 0 };
    payMap.set(t.payment_method, {
      count: cur.count + 1,
      total: cur.total + t.total,
    });
  }

  // Top products
  const prodMap = new Map<string, { name: string; qty: number; total: number }>();
  for (const t of completed) {
    for (const it of (t.items ?? [])) {
      const cur = prodMap.get(it.product_name) ?? {
        name: it.product_name,
        qty: 0,
        total: 0,
      };
      prodMap.set(it.product_name, {
        name: cur.name,
        qty: cur.qty + it.qty,
        total: cur.total + it.subtotal,
      });
    }
  }

  // Hourly breakdown
  const hourMap = new Map<string, { count: number; total: number }>();
  for (const t of completed) {
    const hr = t.created_at.slice(11, 13) + ':00';
    const cur = hourMap.get(hr) ?? { count: 0, total: 0 };
    hourMap.set(hr, { count: cur.count + 1, total: cur.total + t.total });
  }

  const cashier_name = filter.user_id
    ? users.find((u) => u.id === filter.user_id)?.full_name ?? '—'
    : 'Semua Kasir';

  return {
    from: filter.from ?? '',
    to: filter.to ?? '',
    cashier_name,
    tx_count: completed.length,
    void_count: voided.length,
    subtotal,
    discount_amt,
    total,
    paid_total,
    by_payment: Array.from(payMap.entries())
      .map(([method, v]) => ({ method, count: v.count, total: v.total }))
      .sort((a, b) => b.total - a.total),
    top_products: Array.from(prodMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
    hour_breakdown: Array.from(hourMap.entries())
      .map(([hour, v]) => ({ hour, count: v.count, total: v.total }))
      .sort((a, b) => a.hour.localeCompare(b.hour)),
  };
}
