<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import LineChart from '$lib/components/LineChart.svelte';
  import { laporanPenjualan } from '$lib/mock/laporan';

  const chartValues = laporanPenjualan.map((r) => Number(r.gross.replace(/[^0-9]/g, '')) / 1_000_000);
  const chartLabels = laporanPenjualan.map((r) => r.periode.slice(0, 5));
</script>

<svelte:head><title>Laporan Penjualan — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Laporan Penjualan"
  actions={[
    { label: 'Export Excel', variant: 'outline' },
    { label: 'Export PDF', variant: 'primary' }
  ]}
/>

<!-- Trend Chart -->
<div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Trend Penjualan Mingguan (Rp juta)</div>
  <LineChart values={chartValues} labels={chartLabels} color="#1E3A5F" height={180} />
</div>

<FilterBar searchPlaceholder="Cari periode..." showOutlet={true} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Periode ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Invoice</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Gross Sales</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Net Sales</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Profit</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Margin</th>
      </tr>
    </thead>
    <tbody>
      {#each laporanPenjualan as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.periode}</td>
          <td class="px-4 py-3 text-right tabular-nums">{row.invoice}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.gross}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-700">{row.net}</td>
          <td class="px-4 py-3 text-right tabular-nums text-emerald-600 font-semibold">{row.profit}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-700">{row.margin}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={laporanPenjualan.length} />
</div>