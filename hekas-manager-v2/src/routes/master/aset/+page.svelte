<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { asetList } from '$lib/mock/master';
</script>

<svelte:head><title>Aset — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Aset"
  actions={[
    { label: 'Tambah Aset', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari aset..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kode ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Aset ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Nilai ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each asetList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.kode}</td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.nilai}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={asetList.length} />
</div>