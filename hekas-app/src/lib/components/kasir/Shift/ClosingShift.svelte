<!--
  ClosingShift.svelte — X/Z Report modal (Fase 10: shadcn-svelte)

  Ringkasan penjualan shift + opsi cetak. Dipakai kasir sebelum logout.

  Props:
    open          : boolean  — kontrol modal visibility
    onClose       : () => void
    showToast     : (msg, kind?) => void
    initialReport : ClosingReport | null
                    — kalau di-pass, skip fetch + pakai data ini (untuk tests)
                    — kalau tidak, fetch via api.orders.getClosingReport
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import type { ClosingReport } from '$lib/types/api';
  import { fmtIDR, printReport } from '$lib/utils/export';
  import { cn } from '$lib/utils/cn';

  // shadcn-svelte primitives
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import Label from '$lib/components/ui/label.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import Skeleton from '$lib/components/ui/skeleton.svelte';
  import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
  } from '$lib/components/ui/table';

  // lucide-svelte icons
  import ChartBarIcon from '@lucide/svelte/icons/chart-bar';
  import XIcon from '@lucide/svelte/icons/x';
  import RefreshCwIcon from '@lucide/svelte/icons/refresh-cw';
  import PrinterIcon from '@lucide/svelte/icons/printer';
  import CheckIcon from '@lucide/svelte/icons/check';
  import FileTextIcon from '@lucide/svelte/icons/file-text';

  // ─── Props ──────────────────────────────────────────────────────────────
  let {
    open,
    onClose,
    showToast,
    initialReport = null,
  }: {
    open: boolean;
    onClose: () => void;
    showToast?: (msg: string, kind?: 'success' | 'error' | 'info') => void;
    initialReport?: ClosingReport | null;
  } = $props();

  // ─── State ──────────────────────────────────────────────────────────────
  let loading = $state(!initialReport); // skip loading kalau initialReport di-pass
  let report = $state<ClosingReport | null>(initialReport);
  let rangeMode = $state<'today' | 'shift'>('today');
  let shiftStart = $state<string>(''); // HH:MM (jam buka shift)

  // Default shift start: 8 jam yang lalu
  onMount(() => {
    if (!shiftStart) {
      const d = new Date();
      d.setHours(d.getHours() - 8);
      shiftStart = d.toTimeString().slice(0, 5);
    }
  });

  // Reload tiap dibuka (skip kalau initialReport)
  $effect(() => {
    if (open && !initialReport) {
      load();
    } else if (open && initialReport) {
      report = initialReport;
      loading = false;
    }
  });

  // Body scroll lock + Esc key saat modal terbuka
  $effect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKeydown);
    };
  });

  // ─── Data loading ───────────────────────────────────────────────────────
  async function load() {
    if (initialReport) {
      report = initialReport;
      loading = false;
      return;
    }
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
    } catch (e: unknown) {
      showToast?.(e instanceof Error ? e.message : 'Gagal memuat laporan', 'error');
    } finally {
      loading = false;
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
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

  // Map method name → Badge variant
  function methodBadgeVariant(method: string): 'success' | 'info' | 'default' {
    if (method === 'tunai') return 'success';
    if (method === 'qris' || method === 'ewallet') return 'info';
    return 'default';
  }

  // ─── Actions ────────────────────────────────────────────────────────────
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
            rows: report.by_payment.map((p) => [
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

  function handleConfirm() {
    showToast?.('Shift ditutup. Sampai jumpa!', 'success');
    onClose();
  }
</script>

{#if open}
  <!-- Backdrop -->
  <button
    type="button"
    aria-label="Tutup modal"
    onclick={onClose}
    class="fixed inset-0 z-40 cursor-default bg-slate-900/55 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
  ></button>

  <!-- Modal shell (centered, pointer-events passthrough) -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="closing-title"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
  >
    <div
      class="bg-popover text-popover-foreground ring-foreground/10 grid w-full max-w-2xl gap-0 overflow-auto rounded-2xl shadow-2xl ring-1 outline-none max-h-[92vh] pointer-events-auto animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
    >
      <!-- Header (gradient blue matching original brand) -->
      <header
        class="flex items-center justify-between gap-2 rounded-t-2xl bg-gradient-to-br from-blue-600 to-blue-800 px-5 py-4 text-white"
      >
        <div>
          <h2 id="closing-title" class="flex items-center gap-2 text-lg font-bold">
            <ChartBarIcon class="size-5" aria-hidden="true" />
            Penutupan Shift
          </h2>
          <p class="mt-0.5 text-xs opacity-90">Ringkasan penjualan kasir</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onclick={onClose}
          aria-label="Tutup dialog penutupan shift"
          class="text-white/80 hover:bg-white/20 hover:text-white"
        >
          <XIcon />
        </Button>
      </header>

      <!-- Range filter bar -->
      <div
        class="flex flex-wrap items-center gap-2.5 border-b border-slate-200 px-5 py-3.5"
      >
        <div class="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={rangeMode === 'today' ? 'default' : 'outline'}
            onclick={() => {
              rangeMode = 'today';
              load();
            }}
            disabled={loading}
            aria-pressed={rangeMode === 'today'}
          >
            Hari Ini
          </Button>
          <Button
            type="button"
            size="sm"
            variant={rangeMode === 'shift' ? 'default' : 'outline'}
            onclick={() => {
              rangeMode = 'shift';
              load();
            }}
            disabled={loading}
            aria-pressed={rangeMode === 'shift'}
          >
            Shift Ini
          </Button>
        </div>

        {#if rangeMode === 'shift'}
          <Label class="flex items-center gap-1.5 text-xs font-normal text-slate-600">
            Mulai:
            <Input
              type="time"
              bind:value={shiftStart}
              onchange={load}
              class="h-7 w-auto px-2 text-xs"
            />
          </Label>
        {/if}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onclick={load}
          disabled={loading}
          aria-label="Refresh laporan"
          class="ml-auto"
        >
          <RefreshCwIcon class={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <!-- Body -->
      <div class="px-5 py-4">
        {#if loading}
          <div class="flex flex-col gap-2.5">
            {#each Array(6) as _, i (i)}
              <Skeleton class="h-7 w-full" />
            {/each}
          </div>
        {:else if !report}
          <div
            class="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center text-slate-400"
          >
            <FileTextIcon class="mx-auto size-8 opacity-50" aria-hidden="true" />
            <p class="mt-2 text-sm">Tidak ada data</p>
          </div>
        {:else}
          <!-- Summary KPIs -->
          <div class="mb-4 grid grid-cols-2 gap-2.5">
            <div
              class="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-3.5"
            >
              <div class="text-[11px] font-semibold uppercase tracking-wide text-blue-800">
                Total Penjualan
              </div>
              <div class="mt-1 text-xl font-extrabold text-blue-900 tabular-nums">
                {fmtIDR(report.total)}
              </div>
              <div class="mt-0.5 text-[11px] text-blue-600">
                {report.tx_count} transaksi
              </div>
            </div>
            <div
              class="rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-3.5"
            >
              <div class="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                Tunai Diterima
              </div>
              <div class="mt-1 text-xl font-extrabold text-emerald-900 tabular-nums">
                {fmtIDR(report.paid_total)}
              </div>
              <div class="mt-0.5 text-[11px] text-emerald-600">
                {report.void_count} void
              </div>
            </div>
          </div>

          <!-- By payment method -->
          {#if report.by_payment.length}
            <div class="mb-4">
              <h3 class="mb-2 text-xs font-bold text-slate-700">Metode Pembayaran</h3>
              <div class="flex flex-col gap-1.5">
                {#each report.by_payment as p (p.method)}
                  <div
                    class="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                  >
                    <div class="flex items-center gap-2">
                      <Badge variant={methodBadgeVariant(p.method)}>
                        {capitalize(p.method)}
                      </Badge>
                      <span class="text-xs text-slate-500">{p.count}×</span>
                    </div>
                    <span class="text-[13px] font-bold text-slate-900 tabular-nums">
                      {fmtIDR(p.total)}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Top products -->
          {#if report.top_products.length}
            <div class="mb-4">
              <h3 class="mb-2 text-xs font-bold text-slate-700">Top 5 Produk</h3>
              <Table class="text-xs">
                <TableHeader>
                  <TableRow class="bg-slate-100">
                    <TableHead class="text-slate-600">#</TableHead>
                    <TableHead class="text-slate-600">Produk</TableHead>
                    <TableHead class="text-right text-slate-600">Qty</TableHead>
                    <TableHead class="text-right text-slate-600">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {#each report.top_products.slice(0, 5) as p, i (p.name)}
                    <TableRow>
                      <TableCell class="text-slate-400">{i + 1}</TableCell>
                      <TableCell class="text-slate-900">{p.name}</TableCell>
                      <TableCell class="text-right text-slate-600 tabular-nums">{p.qty}</TableCell>
                      <TableCell class="text-right font-semibold text-slate-900 tabular-nums">
                        {fmtIDR(p.total)}
                      </TableCell>
                    </TableRow>
                  {/each}
                </TableBody>
              </Table>
            </div>
          {/if}

          {#if report.tx_count === 0}
            <div
              class="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-400"
            >
              Tidak ada transaksi dalam periode ini.
            </div>
          {/if}
        {/if}
      </div>

      <!-- Footer -->
      <footer
        class="flex justify-end gap-2.5 rounded-b-2xl border-t border-slate-200 bg-slate-50 px-5 py-3.5"
      >
        <Button type="button" variant="outline" onclick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          type="button"
          variant="default"
          onclick={handlePrint}
          disabled={loading || !report?.tx_count}
          class="bg-blue-600 hover:bg-blue-700"
        >
          <PrinterIcon class="size-3.5" />
          Cetak
        </Button>
        <Button
          type="button"
          onclick={handleConfirm}
          disabled={loading}
          class="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckIcon class="size-3.5" />
          Tutup Shift
        </Button>
      </footer>
    </div>
  </div>
{/if}
