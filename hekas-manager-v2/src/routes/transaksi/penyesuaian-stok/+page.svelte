<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { penyesuaianStokList } from '$lib/mock/stok';
</script>

<svelte:head><title>Penyesuaian Stok — HEKAS POS Manager</title></svelte:head>

<PageHeader
  title="Penyesuaian Stok"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari produk..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Gudang</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Qty (dari → ke)</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Alasan</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each penyesuaianStokList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
          <td class="px-4 py-3 text-gray-700">{row.produk}</td>
          <td class="px-4 py-3 text-gray-700">{row.gudang}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.qty}</td>
          <td class="px-4 py-3 text-gray-700">{row.alasan}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={penyesuaianStokList.length} />
</div>