<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { produksiList } from '$lib/mock/stok';

  let activeTab = $state<'daftar' | 'formula'>('daftar');
</script>

<svelte:head><title>Produksi — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Produksi"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<!-- Tabs -->
<div class="flex gap-0 mb-4 border-b border-gray-200">
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'daftar' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'daftar'}
  >Daftar Transaksi</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'formula' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'formula'}
  >Formula Produksi</button>
</div>

{#if activeTab === 'daftar'}
  <FilterBar searchPlaceholder="Cari nama produksi..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Produksi</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status ⇅</th>
        </tr>
      </thead>
      <tbody>
        {#each produksiList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
            <td class="px-4 py-3 text-gray-700">{row.nama}</td>
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.qty}</td>
            <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={produksiList.length} />
  </div>
{:else}
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Formula</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Komponen</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty per Unit</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">Paket Sembako A</td>
          <td class="px-4 py-3 text-gray-700">Beras 5kg + Minyak 2L + Gula 1kg</td>
          <td class="px-4 py-3 text-right tabular-nums">1 set</td>
        </tr>
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">Paket Sembako B</td>
          <td class="px-4 py-3 text-gray-700">Beras 5kg + Minyak 2L + Telur 1kg</td>
          <td class="px-4 py-3 text-right tabular-nums">1 set</td>
        </tr>
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">Paket Snack</td>
          <td class="px-4 py-3 text-gray-700">Mie Instan × 5 + Kopi × 5</td>
          <td class="px-4 py-3 text-right tabular-nums">1 paket</td>
        </tr>
      </tbody>
    </table>
  </div>
{/if}