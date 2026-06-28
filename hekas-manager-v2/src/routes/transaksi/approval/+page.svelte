<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { approvalList, approvalTipeOptions } from '$lib/mock/stok';

  let activeTab = $state<'daftar' | 'aksi'>('daftar');
  let selectedTipe = $state('Semua Tipe');
</script>

<svelte:head><title>Approval — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Approval"
  typeSelector={{ label: 'Tipe', value: selectedTipe, options: approvalTipeOptions }}
  actions={[
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<div class="flex gap-0 mb-4 border-b border-gray-200">
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'daftar' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'daftar'}
  >Daftar Transaksi</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'aksi' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'aksi'}
  >Aksi Approval</button>
</div>

<FilterBar searchPlaceholder="Cari no / pengaju..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Approval ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Dibuat Oleh</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal Dibuat ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe Transaksi</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. Transaksi</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Verifikasi Oleh</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal Verifikasi ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Nominal ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each approvalList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
          <td class="px-4 py-3 text-gray-700">{row.pengaju}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
          <td class="px-4 py-3 text-gray-700">{row.tipe}</td>
          <td class="px-4 py-3 text-[#1E3A5F]">{row.no.replace('APR-', 'TRX-')}</td>
          <td class="px-4 py-3 text-gray-700">{row.verifikasiOleh ?? '—'}</td>
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggalVerifikasi ?? '—'}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.nominal}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-right">
            {#if activeTab === 'aksi'}
              <div class="flex gap-1.5 justify-end">
                <button class="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Setujui</button>
                <button class="px-2.5 py-1 text-xs bg-rose-600 text-white rounded hover:bg-rose-700">Tolak</button>
              </div>
            {:else}
              <SplitButton label="Lihat" />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={approvalList.length} />
</div>