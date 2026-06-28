<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import { reservasiList } from '$lib/mock/stok';
  import { paketReservasiList as paket } from '$lib/mock/pengaturan';

  let activeTab = $state<'reservasi' | 'paket'>('reservasi');
</script>

<svelte:head><title>Reservasi — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Reservasi"
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true }
  ]}
/>

<div class="flex gap-0 mb-4 border-b border-gray-200">
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'reservasi' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'reservasi'}
  >Daftar Reservasi</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'paket' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'paket'}
  >Paket Reservasi</button>
</div>

{#if activeTab === 'reservasi'}
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Pemesan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Paket</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Sesi</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each reservasiList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
            <td class="px-4 py-3 text-gray-700">{row.nama}</td>
            <td class="px-4 py-3 text-gray-700">{row.paket}</td>
            <td class="px-4 py-3 text-right tabular-nums">{row.sesi}</td>
            <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else}
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Paket</th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Harga Paket</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Sesi</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Ketentuan Pembayaran</th>
        </tr>
      </thead>
      <tbody>
        {#each paket as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
            <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.harga}</td>
            <td class="px-4 py-3 text-gray-700">{row.sesi}</td>
            <td class="px-4 py-3 text-gray-700">{row.ketentuan}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}