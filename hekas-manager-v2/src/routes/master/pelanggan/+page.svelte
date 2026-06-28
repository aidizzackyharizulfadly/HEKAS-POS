<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { kontakList } from '$lib/mock/master';

  // Filter hanya Pelanggan (PRD §4.14)
  const filtered = kontakList.filter((k) => k.tipe === 'Pelanggan');
</script>

<svelte:head><title>Pelanggan — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Pelanggan"
  typeSelector={{ label: 'Tipe', value: 'Pelanggan', options: ['Pelanggan', 'Supplier', 'Karyawan', 'Semua'] }}
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari pelanggan / perusahaan..." showDate={false} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Telp ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Email ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tingkat Harga</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Saldo</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.hp}</td>
          <td class="px-4 py-3 text-gray-700">{row.email}</td>
          <td class="px-4 py-3 text-gray-700">{row.tingkatHarga ?? 'Retail'}</td>
          <td class="px-4 py-3 text-right tabular-nums {row.saldo === 'Rp 0' ? 'text-gray-400' : 'text-gray-800'}">{row.saldo ?? 'Rp 0'}</td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={filtered.length} />
</div>