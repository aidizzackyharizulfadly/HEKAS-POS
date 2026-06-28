<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { TransaksiRow } from '$lib/mock/transaksi';

  type Props = {
    title: string;
    typeLabel: string;
    typeOptions: string[];
    rows: TransaksiRow[];
    columnDate: string;
  };

  let { title, typeLabel, typeOptions, rows, columnDate }: Props = $props();
</script>

<svelte:head><title>{title} — HEKAS POS Manager</title></svelte:head>

<PageHeader
  {title}
  typeSelector={{ label: typeLabel, value: typeOptions[0], options: typeOptions }}
  actions={[
    { label: 'Tambah Baru', variant: 'primary', icon: true, dropdown: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<FilterBar searchPlaceholder="Cari invoice / pelanggan..." />

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">{columnDate} ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tipe</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Pelanggan ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Total ⇅</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status ⇅</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 w-24">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
          <td class="px-4 py-3 text-gray-500 tabular-nums">{row.jam}</td>
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.no}</td>
          <td class="px-4 py-3 text-gray-700">{row.tipe}</td>
          <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
          <td class="px-4 py-3 text-gray-700">{row.pelanggan}</td>
          <td class="px-4 py-3 text-right text-gray-800 tabular-nums font-semibold">{row.total}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
          <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={Math.ceil(rows.length / 10)} totalRecords={rows.length} />
</div>