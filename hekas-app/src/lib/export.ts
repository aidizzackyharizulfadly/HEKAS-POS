// HEKAS POS — Export utility
// CSV (Excel-compatible UTF-8 BOM) + print-friendly HTML report trigger.
// Browser-only — semua via Blob + download anchor.

import type { Transaction } from './api/types.js';

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtIDR(n: number): string {
  return 'Rp ' + (n ?? 0).toLocaleString('id-ID');
}

function csvCell(v: unknown): string {
  if (v == null) return '';
  const s = String(v);
  // Escape: kutip ganda, kutip internal, newline
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '_' +
    pad(d.getHours()) +
    pad(d.getMinutes())
  );
}

// ─── CSV: transactions list ─────────────────────────────────────────────────
export function exportTransactionsCSV(txs: Transaction[]): void {
  if (!txs.length) {
    alert('Tidak ada transaksi untuk di-export.');
    return;
  }

  // Section 1: header info
  const lines: string[] = [];
  lines.push('# HEKAS POS — Laporan Transaksi');
  lines.push(`# Tanggal export,${new Date().toLocaleString('id-ID')}`);
  lines.push(`# Total baris,${txs.length}`);
  lines.push('');

  // Section 2: tx-level table
  lines.push(
    [
      'Invoice',
      'Tanggal',
      'Kasir',
      'Member',
      'Subtotal',
      'Diskon (%)',
      'Diskon (Rp)',
      'Total',
      'Bayar',
      'Kembali',
      'Metode',
      'Status',
      'Catatan',
    ]
      .map(csvCell)
      .join(','),
  );

  for (const t of txs) {
    lines.push(
      [
        t.invoice_no,
        new Date(t.created_at).toLocaleString('id-ID'),
        t.user_name ?? '',
        t.member_name ?? '',
        t.subtotal,
        t.discount_pct,
        t.discount_amt,
        t.total,
        t.paid,
        t.change_amt,
        t.payment_method,
        t.status,
        t.note ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }

  // Section 3: items detail (flat — biar gampang di-pivot di Excel)
  lines.push('');
  lines.push('# DETAIL ITEM TRANSAKSI');
  lines.push(
    ['Invoice', 'Tanggal', 'Produk', 'Qty', 'Harga', 'Diskon (%)', 'Subtotal']
      .map(csvCell)
      .join(','),
  );

  for (const t of txs) {
    for (const it of t.items ?? []) {
      lines.push(
        [
          t.invoice_no,
          new Date(t.created_at).toLocaleString('id-ID'),
          it.product_name,
          it.qty,
          it.price,
          it.disc_pct,
          it.subtotal,
        ]
          .map(csvCell)
          .join(','),
      );
    }
  }

  // UTF-8 BOM biar Excel auto-detect encoding
  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `hekas-transaksi-${nowStamp()}.csv`);
}

// ─── CSV: products stock ────────────────────────────────────────────────────
export function exportProductsCSV(
  products: { id: number; name: string; category: string; stock: number; price: number; is_active: boolean; barcode?: string }[],
): void {
  if (!products.length) {
    alert('Tidak ada produk untuk di-export.');
    return;
  }
  const lines: string[] = [];
  lines.push(
    ['#', 'Barcode', 'Nama Produk', 'Kategori', 'Stok', 'Harga', 'Status']
      .map(csvCell)
      .join(','),
  );
  for (const p of products) {
    lines.push(
      [
        p.id,
        p.barcode ?? '',
        p.name,
        p.category,
        p.stock,
        p.price,
        p.is_active ? 'Aktif' : 'Nonaktif',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  const csv = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `hekas-produk-${nowStamp()}.csv`);
}

// ─── Print report (HTML, browser print → Save as PDF) ───────────────────────
export interface DailyReportData {
  title: string;
  subtitle: string;
  rows: { label: string; value: string; bold?: boolean }[];
  table?: {
    headers: string[];
    rows: (string | number)[][];
  };
  footer?: string;
}

export function printReport(data: DailyReportData): void {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    alert('Pop-up diblokir — izinkan pop-up untuk mencetak laporan.');
    return;
  }

  const tableHtml = data.table
    ? `
      <table>
        <thead>
          <tr>${data.table.headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${data.table.rows
            .map(
              (r) =>
                `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`,
            )
            .join('')}
        </tbody>
      </table>
    `
    : '';

  const rowsHtml = data.rows
    .map(
      (r) =>
        `<tr class="${r.bold ? 'bold' : ''}"><td>${r.label}</td><td class="num">${r.value}</td></tr>`,
    )
    .join('');

  w.document.write(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<title>${data.title}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    margin: 24px;
    color: #1e293b;
    font-size: 13px;
  }
  .header {
    border-bottom: 2px solid #2563EB;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  h1 { margin: 0; font-size: 20px; color: #2563EB; }
  .sub { color: #64748b; font-size: 12px; margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; color: #475569; }
  table.kv { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  table.kv td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
  table.kv td:first-child { color: #475569; width: 40%; }
  table.kv td.num { text-align: right; font-variant-numeric: tabular-nums; }
  table.kv tr.bold td { font-weight: 700; color: #0f172a; background: #f1f5f9; }
  table.grid { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  table.grid th, table.grid td { padding: 6px 8px; border: 1px solid #cbd5e1; text-align: left; }
  table.grid th { background: #f1f5f9; font-weight: 600; color: #334155; }
  table.grid td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <div class="sub">${data.subtitle}</div>
  </div>
  <div class="meta">
    <span>Dicetak: ${new Date().toLocaleString('id-ID')}</span>
    <span>HEKAS POS</span>
  </div>
  <table class="kv">${rowsHtml}</table>
  ${tableHtml}
  <div class="footer">${data.footer ?? 'Dokumen ini dicetak otomatis oleh HEKAS POS.'}</div>
  <script class="no-print">
    window.addEventListener('load', () => {
      setTimeout(() => window.print(), 250);
    });
  </script>
</body>
</html>`);
  w.document.close();
}

export { fmtIDR };
