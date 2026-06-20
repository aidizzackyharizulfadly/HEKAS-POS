// HEKAS POS — Print utility
// Support 2 mode:
//   1. Thermal printer (Web Serial API) — Chrome/Edge + USB thermal printer
//   2. Browser print fallback           — Universal (ke printer biasa / Save as PDF)
//
// Browser detection ada di helper isThermalSupported().

import type { Transaction } from '$lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface StoreSettings {
  store_name: string;
  address: string;
  phone: string;
  footer_message: string;     // "Terima kasih atas kunjungannya!"
  show_logo: boolean;
  paper_width: '58mm' | '80mm';
  auto_print: boolean;
  printer_type: 'browser' | 'thermal';
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_name: 'HEKAS POS — Pusat',
  address: 'Jl. Sudirman No. 1, Jakarta',
  phone: '021-500001',
  footer_message: 'Terima kasih atas kunjungannya! 🙏',
  show_logo: true,
  paper_width: '80mm',
  auto_print: false,
  printer_type: 'browser',
};

// ─── Settings storage ──────────────────────────────────────────────────────
const SETTINGS_KEY = 'settings';

export function loadSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(`hekas:${SETTINGS_KEY}`);
    if (!raw) return DEFAULT_STORE_SETTINGS;
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveSettings(s: StoreSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`hekas:${SETTINGS_KEY}`, JSON.stringify(s));
}

// ─── Thermal printer detection ──────────────────────────────────────────────
export function isThermalSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

// ─── ESC/POS command builder ────────────────────────────────────────────────
// Builds byte sequence untuk printer thermal (ESC/POS compatible).
// Char width: 58mm = 32 char, 80mm = 42 char (paling umum).
function getCharWidth(paper: '58mm' | '80mm'): number {
  return paper === '58mm' ? 32 : 42;
}

function pad(text: string, width: number): string {
  // Pad dengan spasi; kalau lebih panjang, truncate dengan ellipsis
  if (text.length >= width) return text.slice(0, width - 1) + '…';
  return text + ' '.repeat(width - text.length);
}

function padLR(left: string, right: string, width: number): string {
  // Left-right justified line, misal "Indomie Goreng         Rp 3.500"
  const gap = width - left.length - right.length;
  if (gap < 1) return left.slice(0, width - right.length - 1) + ' ' + right;
  return left + ' '.repeat(gap) + right;
}

function formatRupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// Encode string ke ESC/POS bytes (CP437 / Latin1 cukup untuk karakter Indonesia
// standar, emoji tidak akan render di thermal tanpa custom font)
function encodeLine(s: string): Uint8Array {
  return new TextEncoder().encode(s + '\n');
}

/**
 * Build raw ESC/POS bytes untuk struk thermal.
 */
export function buildReceiptBytes(tx: Transaction, settings: StoreSettings): Uint8Array {
  const W = getCharWidth(settings.paper_width);
  const cmds: Uint8Array[] = [];

  // ESC @ — Initialize printer
  cmds.push(new Uint8Array([0x1B, 0x40]));

  // Header (centered, bold)
  cmds.push(new Uint8Array([0x1B, 0x61, 0x01])); // center align
  cmds.push(new Uint8Array([0x1B, 0x45, 0x01])); // bold on
  cmds.push(encodeLine(settings.store_name.toUpperCase()));
  cmds.push(new Uint8Array([0x1B, 0x45, 0x00])); // bold off
  cmds.push(encodeLine(settings.address));
  cmds.push(encodeLine(`Telp: ${settings.phone}`));
  cmds.push(encodeLine('-' .repeat(W)));

  // Left align
  cmds.push(new Uint8Array([0x1B, 0x61, 0x00]));
  cmds.push(encodeLine(padLR(`#${tx.invoice_no}`, formatRupiah(tx.total).slice(0, 14), W)));
  cmds.push(encodeLine(new Date(tx.created_at).toLocaleString('id-ID')));
  cmds.push(encodeLine(`Kasir: ${tx.user_name ?? '—'}`));
  if (tx.member_name) cmds.push(encodeLine(`Member: ${tx.member_name}`));
  cmds.push(encodeLine('-' .repeat(W)));

  // Items
  for (const it of tx.items ?? []) {
    const nameLine = `${it.qty}x ${it.product_name}`;
    cmds.push(encodeLine(nameLine.length > W ? nameLine.slice(0, W) : nameLine));
    const priceLine = padLR(
      `  @ ${formatRupiah(it.price)}`,
      formatRupiah(it.subtotal).slice(0, 14),
      W,
    );
    cmds.push(encodeLine(priceLine));
  }
  cmds.push(encodeLine('-' .repeat(W)));

  // Totals
  cmds.push(encodeLine(padLR('Subtotal', formatRupiah(tx.subtotal).slice(0, 14), W)));
  if (tx.discount_pct > 0) {
    cmds.push(encodeLine(padLR(`Diskon (${tx.discount_pct}%)`, `-${formatRupiah(tx.discount_amt)}`.slice(0, 14), W)));
  }
  cmds.push(new Uint8Array([0x1B, 0x45, 0x01])); // bold
  cmds.push(encodeLine(padLR('TOTAL', formatRupiah(tx.total).slice(0, 14), W)));
  cmds.push(new Uint8Array([0x1B, 0x45, 0x00])); // bold off
  cmds.push(encodeLine(padLR(`Bayar (${tx.payment_method})`, formatRupiah(tx.paid).slice(0, 14), W)));
  if (tx.change_amt > 0) {
    cmds.push(encodeLine(padLR('Kembali', formatRupiah(tx.change_amt).slice(0, 14), W)));
  }
  cmds.push(encodeLine('=' .repeat(W)));

  // Footer (centered)
  cmds.push(new Uint8Array([0x1B, 0x61, 0x01]));
  cmds.push(encodeLine(settings.footer_message));
  cmds.push(encodeLine(''));
  cmds.push(encodeLine(''));

  // Cut paper (GS V 0 — full cut)
  cmds.push(new Uint8Array([0x1D, 0x56, 0x00]));

  // Concat
  const total = cmds.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of cmds) { out.set(c, offset); offset += c.length; }
  return out;
}

// ─── Thermal printer send ───────────────────────────────────────────────────
type SerialPortLike = {
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
  writable: WritableStream<Uint8Array> | null;
};

let thermalPort: SerialPortLike | null = null;

export async function connectThermal(): Promise<boolean> {
  if (!isThermalSupported()) {
    throw new Error('Web Serial API tidak tersedia. Gunakan Chrome/Edge di HTTPS atau localhost.');
  }
  try {
    const port = await (navigator as any).serial.requestPort() as SerialPortLike;
    await port.open({ baudRate: 9600 });
    thermalPort = port;
    return true;
  } catch (e: any) {
    if (e.name === 'NotFoundError') return false; // user cancelled
    throw e;
  }
}

export async function disconnectThermal(): Promise<void> {
  if (thermalPort) {
    try { await thermalPort.close(); } catch { /* ignore */ }
    thermalPort = null;
  }
}

export function isThermalConnected(): boolean {
  return thermalPort !== null;
}

export async function printToThermal(tx: Transaction, settings: StoreSettings): Promise<void> {
  if (!thermalPort) throw new Error('Printer thermal belum terhubung');
  const bytes = buildReceiptBytes(tx, settings);
  if (!thermalPort.writable) throw new Error('Printer stream tidak tersedia');
  const writer = thermalPort.writable.getWriter();
  try {
    await writer.write(bytes);
  } finally {
    writer.releaseLock();
  }
}

// ─── Browser print fallback ─────────────────────────────────────────────────
export function printViaBrowser(elementId?: string): void {
  // Strategy: kalau elementId diberikan, cuma print element itu.
  // Else, print seluruh document (yang ada @media print rules).
  if (elementId) {
    const el = document.getElementById(elementId);
    if (!el) { window.print(); return; }
    const original = document.body.innerHTML;
    const printContent = el.outerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = original;
    // Re-mount Svelte — kasih hint ke user untuk refresh
  } else {
    window.print();
  }
}

// ─── Unified print API ──────────────────────────────────────────────────────
export interface PrintResult {
  ok: boolean;
  method: 'thermal' | 'browser' | 'cancelled' | 'error';
  message?: string;
}

export async function printReceipt(tx: Transaction): Promise<PrintResult> {
  const settings = loadSettings();
  try {
    if (settings.printer_type === 'thermal' && isThermalConnected()) {
      await printToThermal(tx, settings);
      return { ok: true, method: 'thermal' };
    }
    // Fallback: browser print
    printViaBrowser('hekas-receipt-print');
    return { ok: true, method: 'browser' };
  } catch (e: any) {
    if (e.name === 'NotFoundError' || e.message?.includes('cancelled')) {
      return { ok: false, method: 'cancelled' };
    }
    return { ok: false, method: 'error', message: e.message };
  }
}
