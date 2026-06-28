<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { membershipList } from '$lib/mock/pengaturan';
</script>

<svelte:head><title>Membership — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Membership"
  actions={[
    { label: 'Tambah Program', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Program Membership</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet Ketersediaan</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Level Membership</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
      </tr>
    </thead>
    <tbody>
      {#each membershipList as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
          <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
          <td class="px-4 py-3 text-gray-700">{row.level}</td>
          <td class="px-4 py-3"><StatusBadge status={row.status} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={1} totalRecords={membershipList.length} />
</div>