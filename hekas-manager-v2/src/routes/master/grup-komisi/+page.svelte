<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { grupKomisiList } from '$lib/mock/master';
</script>

<svelte:head><title>Grup Komisi — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Grup Komisi"
  actions={[
    { label: 'Tambah Grup', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari Grup Komisi..."
  extraFilters={[{ label: 'Pilih Outlet', options: ['Semua Outlet', 'Pandeansari', 'Panjen', 'Sulfat'] }]} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Grup</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Karyawan</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Item Komisi</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kategori</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Metode</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
      </tr>
    </thead>
    <tbody>
      {#each grupKomisiList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
          <td class="px-4 py-3 text-gray-700">{row.karyawan}</td>
          <td class="px-4 py-3 text-gray-700">{row.item}</td>
          <td class="px-4 py-3 text-gray-700">{row.kategori}</td>
          <td class="px-4 py-3 text-gray-700">{row.tipe}</td>
          <td class="px-4 py-3 text-gray-700">{row.metode}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={grupKomisiList.length} />
</div>