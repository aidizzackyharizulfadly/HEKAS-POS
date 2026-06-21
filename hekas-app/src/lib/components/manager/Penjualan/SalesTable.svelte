<!--
  SalesTable — Reusable sales-by-period table.
  Used by: Manager Penjualan screen (per-day, per-week, per-month drill-down).
-->
<script lang="ts">
  import { fmtIDR, formatDate, formatPercent } from '$lib/utils/format';

  export interface SalesRow {
    period: string;          // "Hari ini" | "2026-06-19" | "Jun 2026"
    date?: string;           // ISO
    transactions: number;
    items_sold: number;
    revenue: number;
    growth: number;          // -100 .. 100
  }

  type SortField = 'period' | 'transactions' | 'items_sold' | 'revenue' | 'growth' | 'date';

  let { rows = [], title = 'Rincian Penjualan', onRowClick = (_row: SalesRow) => {} }: {
    rows?: SalesRow[];
    title?: string;
    onRowClick?: (row: SalesRow) => void;
  } = $props();

  let sortField: SortField = $state('period');
  let sortDir: 'asc' | 'desc' = $state('desc');

  const sortedRows = $derived.by(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = (a as any)[sortField] ?? '';
      const bv = (b as any)[sortField] ?? '';
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return out;
  });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDir = 'desc';
    }
  }

  function growthBadge(g: number) {
    if (g > 0) return { icon: '↑', color: 'text-green-600', bg: 'bg-green-50' };
    if (g < 0) return { icon: '↓', color: 'text-red-600', bg: 'bg-red-50' };
    return { icon: '→', color: 'text-gray-500', bg: 'bg-gray-50' };
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <h3 class="text-sm font-semibold text-gray-700">{title}</h3>
    <span class="text-xs text-gray-500">{sortedRows.length} baris</span>
  </div>

  {#if sortedRows.length === 0}
    <div class="px-4 py-8 text-center text-sm text-gray-400">
      Belum ada data penjualan untuk periode ini
    </div>
  {:else}
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
        <tr>
          {#each [
            { key: 'period' as const, label: 'Periode' },
            { key: 'transactions' as const, label: 'Transaksi' },
            { key: 'items_sold' as const, label: 'Item' },
            { key: 'revenue' as const, label: 'Pendapatan' },
            { key: 'growth' as const, label: 'Δ' }
          ] as col}
            <th
              class="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors {sortField === col.key ? 'text-blue-600' : ''}"
              onclick={() => toggleSort(col.key)}
            >
              {col.label}
              {#if sortField === col.key}
                <span class="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
              {/if}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each sortedRows as row (row.period + (row.date ?? ''))}
          <tr
            class="hover:bg-blue-50 cursor-pointer transition-colors"
            onclick={() => onRowClick(row)}
            onkeydown={(e) => e.key === 'Enter' && onRowClick(row)}
          >
            <td class="px-4 py-3">
              <div class="font-medium text-gray-800">{row.period}</div>
              {#if row.date}
                <div class="text-xs text-gray-400">{formatDate(row.date)}</div>
              {/if}
            </td>
            <td class="px-4 py-3 text-right tabular-nums">{row.transactions}</td>
            <td class="px-4 py-3 text-right tabular-nums">{row.items_sold}</td>
            <td class="px-4 py-3 text-right tabular-nums font-medium text-gray-800">
              {fmtIDR(row.revenue)}
            </td>
            <td class="px-4 py-3 text-right">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium {growthBadge(row.growth).color} {growthBadge(row.growth).bg}">
                <span>{growthBadge(row.growth).icon}</span>
                <span class="tabular-nums">{formatPercent(Math.abs(row.growth))}</span>
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>