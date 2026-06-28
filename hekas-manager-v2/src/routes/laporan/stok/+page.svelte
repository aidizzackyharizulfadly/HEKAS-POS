<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { laporanStok } from '$lib/mock/laporan';
</script>

<svelte:head><title>Laporan Stok — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Laporan Stok"
  actions={[
    { label: 'Export Excel', variant: 'outline' }
  ]}
/>

<FilterBar searchPlaceholder="Cari kategori..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kategori ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Item</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Nilai Stok</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Perputaran</th>
      </tr>
    </thead>
    <tbody>
      {#each laporanStok as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.kategori}</td>
          <td class="px-4 py-3 text-right tabular-nums">{row.totalItem}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.nilaiStok}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-700">{row.perputaran}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={laporanStok.length} />
</div>