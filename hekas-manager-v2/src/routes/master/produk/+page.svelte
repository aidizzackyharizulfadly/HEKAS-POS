<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { produkList } from '$lib/mock/master';

  const totalRecords = 10240;
</script>

<svelte:head><title>Produk — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Produk"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari Produk / Jasa..."
  extraFilters={[
    { label: 'Kategori', options: ['Semua Kategori', 'Sembako', 'Bahan Masak', 'Snack', 'Minuman', 'Toiletries'] },
    { label: 'Tipe Produk', options: ['Semua Tipe', 'Produk', 'Jasa'] }
  ]}
/>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">SKU ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kategori ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Unit</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Harga ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Varian</th>
        <th class="px-4 py-3 text-center text-xs font-medium text-gray-500">POS</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each produkList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3">
            <div class="text-[#1E3A5F] font-medium">{row.nama}</div>
            <button class="text-[10px] text-gray-400 hover:text-[#1E3A5F] flex items-center gap-0.5 mt-0.5">
              <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 10h8M6 2v8M2 6l4-4 4 4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
              analitik
            </button>
          </td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.sku}</td>
          <td class="px-4 py-3 text-gray-700">{row.kategori}</td>
          <td class="px-4 py-3 text-right tabular-nums {row.qty < 200 ? 'text-rose-600' : row.qty < 700 ? 'text-amber-600' : 'text-blue-600'} font-semibold">{row.qty}</td>
          <td class="px-4 py-3 text-gray-700 lowercase">{row.unit}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-800">{row.harga}</td>
          <td class="px-4 py-3 text-gray-600 text-xs">{row.varian}</td>
          <td class="px-4 py-3">
            <button
              role="switch"
              aria-checked={row.pos}
              aria-label="Tampilkan {row.nama} di POS"
              class="relative inline-flex h-4 w-7 rounded-full transition-colors {row.pos ? 'bg-[#1E3A5F]' : 'bg-gray-300'}"
            >
              <span class="inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform mt-0.5 {row.pos ? 'translate-x-3.5' : 'translate-x-0.5'}"></span>
            </button>
          </td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={Math.ceil(totalRecords / 30)} totalRecords={totalRecords} />
</div>