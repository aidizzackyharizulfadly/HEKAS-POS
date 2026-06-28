<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { kasBankList } from '$lib/mock/stok';
</script>

<svelte:head><title>Kas & Bank — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Kas dan bank"
  actions={[
    { label: 'Transfer Dana', variant: 'outline' },
    { label: 'Tambah Baru', variant: 'primary', icon: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari akun / kode..." />

<!-- PRD §4.11 columns: Kode | Nama | Saldo | Status | [Ubah ▾] -->
<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Kode ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Saldo ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status ⇅</th>
        <th class="px-4 py-3 text-right w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each kasBankList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium tabular-nums">{row.kode}</td>
          <td class="px-4 py-3 text-gray-700">{row.nama}</td>
          <td class="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.saldo}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={Math.ceil(kasBankList.length / 30)} totalRecords={kasBankList.length} />
</div>