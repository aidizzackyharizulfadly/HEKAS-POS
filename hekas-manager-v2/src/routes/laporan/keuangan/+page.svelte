<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { laporanKeuangan } from '$lib/mock/laporan';
</script>

<svelte:head><title>Laporan Keuangan — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Laporan Keuangan"
  actions={[
    { label: 'Export Excel', variant: 'outline' },
    { label: 'Export PDF', variant: 'primary' }
  ]}
/>

<FilterBar searchPlaceholder="Cari akun..." showOutlet={true} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Akun ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Bulan Ini</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Year-to-Date</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Growth</th>
      </tr>
    </thead>
    <tbody>
      {#each laporanKeuangan as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.akun}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.bulan}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-700">{row.ytd}</td>
          <td class="px-4 py-3 text-right tabular-nums text-emerald-600 font-semibold">{row.growth}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={laporanKeuangan.length} />
</div>