<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { kontakList } from '$lib/mock/master';

  // Filter hanya Supplier (PRD §4.15)
  const filtered = kontakList.filter((k) => k.tipe === 'Supplier');
</script>

<svelte:head><title>Supplier — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Supplier"
  typeSelector={{ label: 'Tipe', value: 'Supplier', options: ['Supplier', 'Pelanggan', 'Karyawan', 'Semua'] }}
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari supplier / perusahaan..." showDate={false} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Telp ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Email ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tingkat Harga</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.hp}</td>
          <td class="px-4 py-3 text-gray-700">{row.email}</td>
          <td class="px-4 py-3 text-gray-700">Distributor</td>
          <td class="px-4 py-3 text-gray-700">{row.outlet ?? '—'}</td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={filtered.length} />
</div>