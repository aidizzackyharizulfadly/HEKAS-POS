<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { outletList } from '$lib/mock/master';

  function initials(name: string): string {
    return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<svelte:head><title>Outlet — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Outlet"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari outlet..." showDate={false} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Logo</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Email ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Telpon ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Fax</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Masa Berlaku</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each outletList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white flex items-center justify-center text-xs font-bold">{initials(row.nama)}</div>
          </td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700">{row.email}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.telpon}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.fax}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.masaBerlaku}</td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={outletList.length} />
</div>