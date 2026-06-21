<!--
  POList — Purchase Order list (incoming goods) with verify/reject actions.
  Used by: Gudang Barang Masuk screen.
-->
<script lang="ts">
  import { fmtIDR, formatDate } from '$lib/utils/format';
  import { purchaseOrderStatus } from '$lib/utils/status-helpers';
  import { statusClasses } from '$lib/utils/status-classes';

  export interface PO {
    id: number | string;
    po_no: string;
    supplier_name: string;
    status: 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK';
    received_at?: string;
    verified_at?: string;
    total_items: number;
    total_value?: number;
    notes?: string;
  }

  let { pos = [], onVerify = (_po: PO) => {}, onReject = (_po: PO) => {}, onView = (_po: PO) => {} }: {
    pos?: PO[];
    onVerify?: (po: PO) => void;
    onReject?: (po: PO) => void;
    onView?: (po: PO) => void;
  } = $props();

  let filter: 'all' | 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK' = $state('all');

  const filteredPos = $derived(filter === 'all' ? pos : pos.filter((p) => p.status === filter));
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <h3 class="font-semibold text-gray-800">📦 Daftar PO</h3>
    <div class="flex gap-1">
      {#each [
        { key: 'all' as const, label: 'Semua' },
        { key: 'MENUNGGU_VERIFIKASI' as const, label: 'Menunggu' },
        { key: 'TERVERIFIKASI' as const, label: 'Selesai' },
        { key: 'DITOLAK' as const, label: 'Ditolak' }
      ] as tab}
        <button
          type="button"
          class="px-3 py-1 text-xs rounded transition-colors {filter === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}"
          onclick={() => (filter = tab.key)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  {#if filteredPos.length === 0}
    <div class="px-4 py-8 text-center text-sm text-gray-400">
      Tidak ada PO untuk filter ini
    </div>
  {:else}
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-xs text-gray-600">
        <tr>
          <th class="px-4 py-2 text-left">No PO</th>
          <th class="px-4 py-2 text-left">Supplier</th>
          <th class="px-4 py-2 text-left">Tanggal</th>
          <th class="px-4 py-2 text-right">Item</th>
          <th class="px-4 py-2 text-right">Nilai</th>
          <th class="px-4 py-2 text-left">Status</th>
          <th class="px-4 py-2 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        {#each filteredPos as po (po.id)}
        {@const s = purchaseOrderStatus(po.status)}
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-2 font-mono font-medium text-gray-800">{po.po_no}</td>
            <td class="px-4 py-2">{po.supplier_name}</td>
            <td class="px-4 py-2 text-gray-600 text-xs">{formatDate(po.received_at ?? po.verified_at ?? '')}</td>
            <td class="px-4 py-2 text-right tabular-nums">{po.total_items}</td>
            <td class="px-4 py-2 text-right tabular-nums">{po.total_value != null ? fmtIDR(po.total_value) : '-'}</td>
            <td class="px-4 py-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium {statusClasses(s)}">
                <span aria-hidden="true">{s.icon}</span>
                {s.label}
              </span>
            </td>
            <td class="px-4 py-2 text-right">
              <button
                type="button"
                class="text-xs text-blue-600 hover:underline mr-2"
                onclick={() => onView(po)}
              >
                Detail
              </button>
              {#if po.status === 'MENUNGGU_VERIFIKASI'}
                <button
                  type="button"
                  class="text-xs text-green-600 hover:underline mr-2"
                  onclick={() => onVerify(po)}
                >
                  ✓ Verifikasi
                </button>
                <button
                  type="button"
                  class="text-xs text-red-600 hover:underline"
                  onclick={() => onReject(po)}
                >
                  ✕ Tolak
                </button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>