<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { coaList } from '$lib/mock/stok';
</script>

<svelte:head><title>Chart of Account — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Chart of Account"
  actions={[
    { label: 'Tambah Akun', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari akun / kode..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kode ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Akun ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Saldo ⇅</th>
        <th class="px-4 py-3 text-right w-32">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each coaList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.kode}</td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700">{row.tipe}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.saldo}</td>
          <td class="px-4 py-3 text-right">
            <div class="inline-flex rounded-full overflow-hidden shadow-sm">
              <button class="px-3 py-1 text-xs bg-[#1E3A5F] text-white font-medium hover:bg-[#254B7A] transition-colors">Ledger</button>
              <button class="px-1.5 py-1 bg-[#1E3A5F] text-white hover:bg-[#254B7A] border-l border-white/20 transition-colors" aria-label="More ledger options">
                <svg class="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={coaList.length} />
</div>