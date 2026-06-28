<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { komisiList } from '$lib/mock/stok';

  let activeTab = $state<'dasbor' | 'transaksi'>('dasbor');

  // Summary cards (PRD §4.10)
  const totalProduk = 847;
  const totalInvoice = 284;
  const totalNilai = komisiList.reduce((s, r) => s + Number(r.total.replace(/[^0-9]/g, '')), 0);
</script>

<svelte:head><title>Komisi — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Komisi"
  actions={[
    { label: 'Hitung Komisi', variant: 'primary' },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<!-- Tabs (PRD §4.10) -->
<div class="flex gap-0 mb-4 border-b border-gray-200">
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'dasbor' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'dasbor'}
  >Dasbor Komisi</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'transaksi' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'transaksi'}
  >Daftar Transaksi Komisi</button>
</div>

{#if activeTab === 'dasbor'}
  <!-- 3 Summary Cards (PRD §4.10) -->
  <div class="grid grid-cols-3 gap-4 mb-4">
    <div class="bg-white rounded-lg border border-gray-200 border-l-4 border-l-[#1E3A5F] p-5">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Produk Terjual</div>
      <div class="text-2xl font-extrabold text-gray-900 tabular-nums">{totalProduk}</div>
      <div class="text-xs text-gray-500 mt-1">produk</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 border-l-4 border-l-violet-500 p-5">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Invoice/Bill</div>
      <div class="text-2xl font-extrabold text-gray-900 tabular-nums">{totalInvoice}</div>
      <div class="text-xs text-gray-500 mt-1">invoice</div>
    </div>
    <div class="bg-white rounded-lg border border-gray-200 border-l-4 border-l-emerald-500 p-5">
      <div class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Nilai Komisi</div>
      <div class="text-2xl font-extrabold text-gray-900 tabular-nums">Rp {totalNilai.toLocaleString('id-ID')}</div>
      <div class="text-xs text-gray-500 mt-1">Juni 2026</div>
    </div>
  </div>

  <FilterBar searchPlaceholder="Cari karyawan..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Karyawan</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Produk Terjual</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Invoice</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total Komisi</th>
        </tr>
      </thead>
      <tbody>
        {#each komisiList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
            <td class="px-4 py-3 text-right tabular-nums">{210 - i * 15}</td>
            <td class="px-4 py-3 text-right tabular-nums">{71 - i * 5}</td>
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.total}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={komisiList.length} />
  </div>
{:else}
  <FilterBar searchPlaceholder="Cari karyawan..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Karyawan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Periode</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each komisiList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
            <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
            <td class="px-4 py-3 text-gray-700">{row.periode}</td>
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.total}</td>
            <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={komisiList.length} />
  </div>
{/if}