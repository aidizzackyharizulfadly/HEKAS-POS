<script lang="ts">
  import PageHeader from '$lib/components/PageHeader.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import StatusBadge from '$lib/components/StatusBadge.svelte';
  import SplitButton from '$lib/components/SplitButton.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { karyawanList, absensiList, shiftList } from '$lib/mock/master';

  let activeTab = $state<'daftar' | 'absensi' | 'shift'>('daftar');
</script>

<svelte:head><title>Karyawan — HEKAS POS Manager</title></svelte:head>

<PageHeader title="Karyawan"
  actions={[
    { label: 'Tambah Karyawan', variant: 'primary', icon: true },
    { label: 'Tindakan', variant: 'outline', dropdown: true }
  ]}
/>

<!-- 3 tabs sesuai PRD §4.16 -->
<div class="flex gap-0 mb-4 border-b border-gray-200">
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'daftar' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'daftar'}
  >Daftar Karyawan</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'absensi' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'absensi'}
  >Riwayat Absensi</button>
  <button
    class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px {activeTab === 'shift' ? 'border-[#1E3A5F] text-[#1E3A5F]' : 'border-transparent text-gray-500 hover:text-gray-700'}"
    onclick={() => activeTab = 'shift'}
  >Sesi Shift</button>
</div>

{#if activeTab === 'daftar'}
  <FilterBar searchPlaceholder="Cari karyawan / perusahaan..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Karyawan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jabatan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">No. HP</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam Shift</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
          <th class="px-4 py-3 text-right w-24">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {#each karyawanList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
            <td class="px-4 py-3 text-gray-700">{row.jabatan}</td>
            <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
            <td class="px-4 py-3 text-gray-700">{row.email}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.hp}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.jamMasuk} – {row.jamKeluar}</td>
            <td class="px-4 py-3"><StatusBadge status={row.statusAktif ? 'Aktif' : 'Tidak Aktif'} /></td>
            <td class="px-4 py-3 text-right"><SplitButton label="Ubah" /></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={karyawanList.length} />
  </div>
{:else if activeTab === 'absensi'}
  <FilterBar searchPlaceholder="Cari nama / tanggal..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal ⇅</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Nama Karyawan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam Masuk</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam Keluar</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {#each absensiList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.nama}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.jamMasuk}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.jamKeluar}</td>
            <td class="px-4 py-3">
              <StatusBadge status={row.status === 'Hadir' ? 'Aktif' : row.status === 'Terlambat' ? 'Pending' : 'Ditolak'} />
              <span class="ml-1.5 text-gray-700">{row.status}</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={absensiList.length} />
  </div>
{:else}
  <FilterBar searchPlaceholder="Cari shift / outlet..." />
  <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-white border-b border-gray-200">
        <tr>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Sesi</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Jam</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Outlet</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Karyawan</th>
          <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Tanggal</th>
        </tr>
      </thead>
      <tbody>
        {#each shiftList as row, i (i)}
          <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-[#1E3A5F] font-medium">{row.sesi}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.jam}</td>
            <td class="px-4 py-3 text-gray-700">{row.outlet}</td>
            <td class="px-4 py-3 text-gray-700">{row.karyawan}</td>
            <td class="px-4 py-3 text-gray-700 tabular-nums">{row.tanggal}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <Pagination currentPage={1} totalPages={1} totalRecords={shiftList.length} />
  </div>
{/if}