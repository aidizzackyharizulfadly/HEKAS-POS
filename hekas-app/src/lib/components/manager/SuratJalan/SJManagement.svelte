<!--
  SJManagement— Full Surat Jalan approval view with 2-stage workflow.
  Used by: Manager Surat Jalan screen.
-->
<script lang="ts">
  import { fmtIDR, formatDateTime } from '$lib/utils/format';

  export interface SJItem {
    product_id: number | string;
    product_name: string;
    qty: number;
    unit: string;
  }

  export interface SJApprovalRecord {
    stage: string;
    decision: string;
    decided_by: string;
    decided_at: string;
    reason?: string;
  }

  export interface SuratJalan {
    id: number | string;
    sj_no: string;
    destination: string;
    status: 'MENUNGGU_PICKING' | 'MENUNGGU_APPROVAL' | 'DISETUJUI' | 'DITOLAK' | 'SUDAH_DICETAK' | 'TERKIRIM' | 'TERTUNDA';
    items: SJItem[];
    total_items: number;
    notes?: string;
    order_reference?: string;
    created_at: string;
    created_by_name: string;
    approvals: SJApprovalRecord[];
    approved_by_name?: string;
    approved_at?: string;
    rejected_by_name?: string;
    rejected_at?: string;
    rejection_reason?: string;
    printed_at?: string;
    sent_at?: string;
  }

  let { sj, canApprove = false, onApprove = (_sj: any) => {}, onReject = (_reason: string) => {} }: {
    sj: SuratJalan;
    canApprove?: boolean;
    onApprove?: (sj: any) => void;
    onReject?: (reason: string) => void;
  } = $props();

  let showRejectDialog = $state(false);
  let rejectReason = $state('');

  const statusMap: Record<string, { label: string; bg: string; text: string }> = {
    MENUNGGU_PICKING:  { label: 'Menunggu Picking',  bg: 'bg-yellow-50', text: 'text-yellow-800' },
    MENUNGGU_APPROVAL: { label: 'Menunggu Approval', bg: 'bg-orange-50', text: 'text-orange-800' },
    DISETUJUI:         { label: 'Disetujui',         bg: 'bg-green-50',  text: 'text-green-800'  },
    DITOLAK:           { label: 'Ditolak',           bg: 'bg-red-50',    text: 'text-red-800'    },
    SUDAH_DICETAK:     { label: 'Sudah Dicetak',     bg: 'bg-blue-50',   text: 'text-blue-800'   },
    TERKIRIM:          { label: 'Terkirim',          bg: 'bg-purple-50', text: 'text-purple-800' },
    TERTUNDA:          { label: 'Tertunda',          bg: 'bg-gray-50',   text: 'text-gray-800'   }
  };

  const status = $derived(statusMap[sj.status] ?? statusMap.MENUNGGU_APPROVAL);

  function handleReject() {
    if (rejectReason.trim().length < 3) return;
    onReject(rejectReason.trim());
    rejectReason = '';
    showRejectDialog = false;
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <!-- Header -->
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <div>
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-bold text-gray-800">{sj.sj_no}</h3>
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium {status.bg} {status.text}">
          {status.label}
        </span>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Tujuan: <span class="font-medium text-gray-700">{sj.destination}</span>
        · {sj.total_items} item · Dibuat {formatDateTime(sj.created_at)}
      </div>
    </div>

    {#if canApprove && sj.status === 'MENUNGGU_APPROVAL'}
      <div class="flex gap-2">
        <button
          type="button"
          class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
          onclick={() => onApprove(sj)}
        >
          ✓ Setujui
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded hover:bg-red-50 transition-colors"
          onclick={() => (showRejectDialog = true)}
        >
          ✕ Tolak
        </button>
      </div>
    {/if}
  </div>

  <!-- Items table -->
  <table class="w-full text-sm">
    <thead class="bg-gray-50 text-xs text-gray-600">
      <tr>
        <th class="px-4 py-2 text-left">Produk</th>
        <th class="px-4 py-2 text-right">Qty</th>
        <th class="px-4 py-2 text-left">Unit</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      {#each sj.items as item}
        <tr>
          <td class="px-4 py-2">{item.product_name}</td>
          <td class="px-4 py-2 text-right tabular-nums font-medium">{item.qty}</td>
          <td class="px-4 py-2 text-gray-600">{item.unit}</td>
        </tr>
      {/each}
    </tbody>
  </table>

  <!-- Notes -->
  {#if sj.notes}
    <div class="px-4 py-3 border-t border-gray-100 text-sm">
      <span class="text-gray-500 text-xs">Catatan:</span>
      <p class="text-gray-700 mt-1">{sj.notes}</p>
    </div>
  {/if}

  <!-- Approval history -->
  {#if sj.approvals.length > 0}
    <div class="px-4 py-3 border-t border-gray-100 bg-gray-50">
      <div class="text-xs font-semibold text-gray-600 mb-2">Riwayat Approval</div>
      <div class="space-y-2">
        {#each sj.approvals as a}
          <div class="flex items-start gap-3 text-xs">
            <span class="font-mono text-gray-500 w-32 flex-shrink-0">{formatDateTime(a.decided_at)}</span>
            <span class="px-2 py-0.5 rounded {a.decision === 'APPROVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {a.stage} · {a.decision}
            </span>
            <span class="text-gray-700">{a.decided_by}</span>
            {#if a.reason}
              <span class="text-gray-500 italic">— {a.reason}</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Reject dialog -->
{#if showRejectDialog}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    role="dialog"
    aria-modal="true" tabindex="-1"
    aria-labelledby="reject-title"
    onclick={() => (showRejectDialog = false)}
    onkeydown={(e) => e.key === 'Escape' && (showRejectDialog = false)}
  >
    <div
      class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
      role="document"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 id="reject-title" class="text-lg font-bold text-gray-800 mb-2">Tolak Surat Jalan?</h3>
      <p class="text-sm text-gray-600 mb-3">Berikan alasan penolakan (wajib, minimal 3 karakter):</p>
      <textarea
        bind:value={rejectReason}
        placeholder="Cth: Stok tidak cukup untuk cabang tujuan"
        class="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        rows="3"
      ></textarea>
      <div class="flex justify-end gap-2 mt-4">
        <button
          type="button"
          class="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
          onclick={() => (showRejectDialog = false)}
        >
          Batal
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
          disabled={rejectReason.trim().length < 3}
          onclick={handleReject}
        >
          Tolak
        </button>
      </div>
    </div>
  </div>
{/if}