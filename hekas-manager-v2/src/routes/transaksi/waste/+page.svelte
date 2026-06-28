<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import { wasteList } from '$lib/mock/stok';

  const totalQty = wasteList.reduce((s, x) => s + x.qty, 0);
  const totalNominal = wasteList.reduce((s, x) => s + Number(x.nominal.replace(/[^0-9]/g, '')), 0);
</script>

<svelte:head><title>Waste Goods — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Waste Goods"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<!-- Summary -->
<div class="grid grid-cols-2 gap-4 mb-4">
  <div class="bg-white rounded-lg border border-gray-200 border-l-4 border-l-[#1E3A5F] p-4">
    <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Jumlah Barang</div>
    <div class="text-xl font-extrabold text-gray-900 tabular-nums">{totalQty} unit</div>
  </div>
  <div class="bg-white rounded-lg border border-gray-200 border-l-4 border-l-rose-500 p-4">
    <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nominal Total Modal</div>
    <div class="text-xl font-extrabold text-gray-900 tabular-nums">Rp {totalNominal.toLocaleString('id-ID')}</div>
  </div>
</div>

<FilterBar searchPlaceholder="Cari produk waste..." showOutlet={false} extraFilters={[{ label: 'Gudang', options: ['Semua Gudang', 'Pandeansari', 'Panjen', 'Sulfat'] }]} />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Nominal Modal</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Gudang</th>
      </tr>
    </thead>
    <tbody>
      {#each wasteList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
          <td class="px-4 py-3 text-gray-700">{row.produk}</td>
          <td class="px-4 py-3 text-right tabular-nums">{row.qty}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-rose-600">{row.nominal}</td>
          <td class="px-4 py-3 text-gray-700">{row.gudang}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="px-4 py-3 text-xs text-gray-500 border-t border-gray-200">Total {wasteList.length} records</div>
</div>