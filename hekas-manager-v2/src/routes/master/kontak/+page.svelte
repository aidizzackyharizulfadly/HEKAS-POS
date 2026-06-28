<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { kontakList } from '$lib/mock/master';

  let selectedTipe = $state('Semua');

  const tipeOptions = ['Semua', 'Pelanggan', 'Supplier', 'Karyawan', 'Pemegang Saham'];

  const filtered = $derived(
    selectedTipe === 'Semua' ? kontakList : kontakList.filter((k) => k.tipe === selectedTipe)
  );

  // Show "Tingkat Harga" + "Saldo" only for Pelanggan & Supplier (PRD §4.14 + §4.15)
  const showPricing = $derived(selectedTipe === 'Semua' || selectedTipe === 'Pelanggan' || selectedTipe === 'Supplier');
  // Outlet column for Supplier/Karyawan
  const showOutlet = $derived(selectedTipe === 'Supplier' || selectedTipe === 'Karyawan' || selectedTipe === 'Semua');
</script>

<svelte:head><title>Kontak — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Kontak"
  typeSelector={{ label: 'Tipe', value: selectedTipe, options: tipeOptions }}
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari nama / no telp / email..." showDate={false} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        {#if selectedTipe === 'Semua'}
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe ⇅</th>
        {/if}
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Telp ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Email ⇅</th>
        {#if showPricing}
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tingkat Harga</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Saldo</th>
        {/if}
        {#if showOutlet}
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
        {/if}
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each filtered as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          {#if selectedTipe === 'Semua'}
            <td class="px-4 py-3 text-gray-700">{row.tipe}</td>
          {/if}
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.hp}</td>
          <td class="px-4 py-3 text-gray-700">{row.email}</td>
          {#if showPricing}
            <td class="px-4 py-3 text-gray-700">{row.tingkatHarga ?? '—'}</td>
            <td class="px-4 py-3 text-right tabular-nums {row.saldo === 'Rp 0' ? 'text-gray-400' : 'text-gray-800'}">{row.saldo ?? '—'}</td>
          {/if}
          {#if showOutlet}
            <td class="px-4 py-3 text-gray-700">{row.outlet ?? '—'}</td>
          {/if}
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={filtered.length} />
</div>