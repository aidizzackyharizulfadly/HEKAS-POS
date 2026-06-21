<!--
  ClosingShift.svelte — X/Z Report modal
  Dipakai di kasir sebelum logout: kasih ringkasan penjualan shift + opsi cetak.
  Args:
    open        : boolean — kontrol modal visibility
    onClose     : () => void
    showToast   : (msg: string, kind?: 'success'|'error'|'info') => void
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ClosingReport } from '$lib/types/api';
  import { fmtIDR, printReport } from '$lib/utils/export';

  let { open, onClose, showToast }: {
    open: boolean;
    onClose: () => void;
    showToast?: (msg: string, kind?: 'success' | 'error' | 'info') => void;
  } = $props();

  let loading = $state(true);
  let report = $state<ClosingReport | null>(null);
  let rangeMode = $state<'today' | 'shift'>('today');
  let shiftStart = $state<string>('');     // HH:MM (jam buka shift)
  let now = $state(new Date());

  onMount(() => {
    // Default shift start: 8 jam yang lalu
    const d = new Date();
    d.setHours(d.getHours() - 8);
    shiftStart = d.toTimeString().slice(0, 5);
  });

  // Reload tiap dibuka
  $effect(() => {
    if (open) {
      load();
    }
  });

  async function load() {
    loading = true;
    try {
      let from: string | undefined;
      let to: string | undefined;

      if (rangeMode === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        from = today.toISOString();
        to = new Date().toISOString();
      } else {
        // Shift: dari shiftStart hari ini s/d sekarang
        const [hh, mm] = shiftStart.split(':').map(Number);
        const start = new Date();
        start.setHours(hh, mm, 0, 0);
        from = start.toISOString();
        to = new Date().toISOString();
      }

      report = await api.orders.getClosingReport({ from, to });
    } catch (e: any) {
      showToast?.(e?.message ?? 'Gagal memuat laporan', 'error');
    } finally {
      loading = false;
    }
  }

  function handleClose() {
    onClose();
  }

  function handlePrint() {
    if (!report) return;
    printReport({
      title: 'LAPORAN PENUTUPAN SHIFT',
      subtitle: `${report.cashier_name} • ${formatRangeLabel()}`,
      rows: [
        { label: 'Kasir', value: report.cashier_name },
        { label: 'Periode', value: formatRangeLabel() },
        { label: 'Jumlah Transaksi', value: String(report.tx_count), bold: true },
        { label: 'Transaksi Void', value: String(report.void_count) },
        { label: 'Subtotal', value: fmtIDR(report.subtotal) },
        { label: 'Total Diskon', value: `− ${fmtIDR(report.discount_amt)}` },
        { label: 'TOTAL PENJUALAN', value: fmtIDR(report.total), bold: true },
        { label: 'Total Tunai Diterima', value: fmtIDR(report.paid_total) },
      ],
      table: report.by_payment.length
        ? {
            headers: ['Metode Pembayaran', 'Jumlah', 'Total'],
            rows: report.by_payment.map((p: { method: string; count: number; total: number }) => [
              capitalize(p.method),
              p.count,
              fmtIDR(p.total),
            ]),
          }
        : undefined,
      footer: `Tanda tangan kasir: ____________________   Tanda tangan manager: ____________________`,
    });
    showToast?.('Membuka dialog cetak laporan…', 'info');
  }

  function capitalize(s: string) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function formatRangeLabel(): string {
    if (!report?.from) return '—';
    const f = new Date(report.from);
    const t = report.to ? new Date(report.to) : new Date();
    const fmt = (d: Date) =>
      d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    return `${fmt(f)} — ${fmt(t)}`;
  }

  function handleConfirm() {
    showToast?.('Shift ditutup. Sampai jumpa! 👋', 'success');
    handleClose();
  }
</script>

{#if open}
  <!-- Backdrop -->
  <div
    role="button"
    tabindex="-1"
    aria-label="Tutup modal"
    onclick={handleClose}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); z-index: 200; backdrop-filter: blur(2px);"
  ></div>

  <!-- Modal -->
  <div
    role="dialog"
    aria-modal="true" tabindex="-1"
    aria-labelledby="closing-title"
    style="position: fixed; inset: 0; z-index: 201; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none;"
  >
    <div
      style="background: white; border-radius: 16px; max-width: 640px; width: 100%; max-height: 92vh; overflow: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); pointer-events: auto; animation: slide-in 0.18s ease-out;"
    >
      <!-- Header -->
      <div
        style="background: linear-gradient(135deg, #2563EB, #1E40AF); color: white; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; border-radius: 16px 16px 0 0;"
      >
        <div>
          <h2 id="closing-title" style="margin: 0; font-size: 18px; font-weight: 700;">
            📊 Penutupan Shift
          </h2>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 2px;">
            Ringkasan penjualan kasir
          </div>
        </div>
        <button
          type="button"
          onclick={handleClose}
          aria-label="Tutup"
          style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px;"
        >
          ✕
        </button>
      </div>

      <!-- Range filter -->
      <div
        style="padding: 16px 22px; border-bottom: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;"
      >
        <div style="display: flex; gap: 6px;">
          <button
            type="button"
            onclick={() => { rangeMode = 'today'; load(); }}
            style="padding: 6px 12px; border-radius: 8px; border: 1px solid {rangeMode === 'today' ? '#2563EB' : '#cbd5e1'}; background: {rangeMode === 'today' ? '#2563EB' : 'white'}; color: {rangeMode === 'today' ? 'white' : '#475569'}; font-size: 12px; font-weight: 600; cursor: pointer;"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onclick={() => { rangeMode = 'shift'; load(); }}
            style="padding: 6px 12px; border-radius: 8px; border: 1px solid {rangeMode === 'shift' ? '#2563EB' : '#cbd5e1'}; background: {rangeMode === 'shift' ? '#2563EB' : 'white'}; color: {rangeMode === 'shift' ? 'white' : '#475569'}; font-size: 12px; font-weight: 600; cursor: pointer;"
          >
            Shift Ini
          </button>
        </div>
        {#if rangeMode === 'shift'}
          <label style="display: flex; gap: 6px; align-items: center; font-size: 12px; color: #475569;">
            Mulai:
            <input
              type="time"
              bind:value={shiftStart}
              onchange={load}
              style="padding: 4px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px;"
            />
          </label>
        {/if}
        <button
          type="button"
          onclick={load}
          aria-label="Refresh"
          style="margin-left: auto; padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #475569; font-size: 12px; cursor: pointer;"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Body -->
      <div style="padding: 18px 22px;">
        {#if loading}
          <div style="display: flex; flex-direction: column; gap: 10px;">
            {#each Array(6) as _, i (i)}
              <div
                style="height: 28px; background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px;"
              ></div>
            {/each}
          </div>
        {:else if !report}
          <div style="text-align: center; padding: 32px; color: #94a3b8;">
            Tidak ada data
          </div>
        {:else}
          <!-- Summary KPIs -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
            <div
              style="background: linear-gradient(135deg, #EFF6FF, #DBEAFE); padding: 14px; border-radius: 10px; border: 1px solid #BFDBFE;"
            >
              <div style="font-size: 11px; color: #1E40AF; font-weight: 600; text-transform: uppercase;">
                Total Penjualan
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #1E3A8A; margin-top: 4px;">
                {fmtIDR(report.total)}
              </div>
              <div style="font-size: 11px; color: #3B82F6; margin-top: 2px;">
                {report.tx_count} transaksi
              </div>
            </div>
            <div
              style="background: linear-gradient(135deg, #F0FDF4, #DCFCE7); padding: 14px; border-radius: 10px; border: 1px solid #BBF7D0;"
            >
              <div style="font-size: 11px; color: #166534; font-weight: 600; text-transform: uppercase;">
                Tunai Diterima
              </div>
              <div style="font-size: 20px; font-weight: 800; color: #14532D; margin-top: 4px;">
                {fmtIDR(report.paid_total)}
              </div>
              <div style="font-size: 11px; color: #16A34A; margin-top: 2px;">
                {report.void_count} void
              </div>
            </div>
          </div>

          <!-- By payment -->
          {#if report.by_payment.length}
            <div style="margin-bottom: 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
                Metode Pembayaran
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                {#each report.by_payment as p (p.method)}
                  <div
                    style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border-radius: 8px;"
                  >
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span
                        style="display: inline-block; padding: 2px 8px; background: {p.method === 'tunai' ? '#FEF3C7' : p.method === 'qris' ? '#DBEAFE' : '#E0E7FF'}; color: {p.method === 'tunai' ? '#92400E' : p.method === 'qris' ? '#1E40AF' : '#3730A3'}; border-radius: 4px; font-size: 11px; font-weight: 600;"
                      >
                        {capitalize(p.method)}
                      </span>
                      <span style="font-size: 12px; color: #64748b;">{p.count}×</span>
                    </div>
                    <span style="font-weight: 700; color: #0f172a; font-size: 13px;">
                      {fmtIDR(p.total)}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Top products -->
          {#if report.top_products.length}
            <div style="margin-bottom: 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">
                Top 5 Produk
              </div>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="text-align: left; padding: 6px 8px; color: #475569;">#</th>
                    <th style="text-align: left; padding: 6px 8px; color: #475569;">Produk</th>
                    <th style="text-align: right; padding: 6px 8px; color: #475569;">Qty</th>
                    <th style="text-align: right; padding: 6px 8px; color: #475569;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {#each report.top_products.slice(0, 5) as p, i (p.name)}
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 6px 8px; color: #94a3b8;">{i + 1}</td>
                      <td style="padding: 6px 8px; color: #0f172a;">{p.name}</td>
                      <td style="padding: 6px 8px; text-align: right; color: #475569;">{p.qty}</td>
                      <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: #0f172a;">
                        {fmtIDR(p.total)}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}

          {#if report.tx_count === 0}
            <div
              style="text-align: center; padding: 24px; color: #94a3b8; background: #f8fafc; border-radius: 8px; font-size: 13px;"
            >
              Tidak ada transaksi dalam periode ini.
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <div
        style="padding: 14px 22px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; justify-content: flex-end; background: #f8fafc; border-radius: 0 0 16px 16px;"
      >
        <button
          type="button"
          onclick={handleClose}
          style="padding: 10px 18px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; color: #475569; font-size: 13px; font-weight: 600; cursor: pointer;"
        >
          Batal
        </button>
        <button
          type="button"
          onclick={handlePrint}
          disabled={loading || !report?.tx_count}
          style="padding: 10px 18px; border-radius: 8px; border: none; background: #2563EB; color: white; font-size: 13px; font-weight: 600; cursor: pointer; opacity: {loading || !report?.tx_count ? 0.5 : 1};"
        >
          🖨️ Cetak
        </button>
        <button
          type="button"
          onclick={handleConfirm}
          disabled={loading}
          style="padding: 10px 18px; border-radius: 8px; border: none; background: #059669; color: white; font-size: 13px; font-weight: 600; cursor: pointer; opacity: {loading ? 0.5 : 1};"
        >
          ✓ Tutup Shift
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateY(8px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
