<script lang="ts">
  import type { Transaction } from '$lib/types/domain';
  import { fmtIDR, formatDate, formatTime } from '$lib/utils/format';
  import EmptyState from '$lib/components/shared/EmptyState.svelte';

  interface Props {
    orders?: Transaction[];
    onSelect?: (order: Transaction) => void;
    onVoid?: (order: Transaction) => void;
    onPrint?: (order: Transaction) => void;
  }

  let { orders = [], onSelect, onVoid, onPrint }: Props = $props();

  const statusConfig: Record<Transaction['status'], { label: string; bg: string; color: string }> = {
    completed: { label: 'Selesai', bg: '#D1FAE5', color: '#065F46' },
    void:      { label: 'Void',    bg: '#FEE2E2', color: '#991B1B' },
    held:      { label: 'Draft',   bg: '#FEF3C7', color: '#92400E' }
  };

  let filter = $state<'all' | Transaction['status']>('all');
  let query = $state('');

  const itemCount = (o: Transaction) => (o.items ?? []).reduce((s, i) => s + i.qty, 0);

  const filtered = $derived(
    orders.filter(o => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (query) {
        const haystack = `${o.invoice_no} ${o.member_name ?? ''} ${o.user_name ?? ''}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      return true;
    })
  );
</script>

<div class="flex flex-col h-full">
  <!-- Filter bar -->
  <div class="flex items-center gap-2 mb-4">
    <input
      type="search"
      placeholder="Cari no / kasir / member…"
      bind:value={query}
      class="flex-1 px-3 py-2 rounded-lg border text-sm"
      style="border-color: #E2EBF4; background: #F8FAFC"
    />
    <div class="flex gap-1">
      {#each [
        { id: 'all',       label: 'Semua' },
        { id: 'completed', label: 'Selesai' },
        { id: 'void',      label: 'Void' },
        { id: 'held',      label: 'Draft' }
      ] as f}
        <button
          onclick={() => filter = f.id as typeof filter}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style="
            background: {filter === f.id ? '#2563EB' : '#F8FAFC'};
            color:      {filter === f.id ? '#fff' : '#475569'};
          "
        >
          {f.label}
        </button>
      {/each}
    </div>
  </div>

  {#if filtered.length === 0}
    <EmptyState
      icon="📋"
      title={orders.length === 0 ? 'Belum ada order' : 'Tidak ada hasil'}
      description={orders.length === 0 ? 'Order akan muncul di sini setelah transaksi pertama.' : 'Coba ubah filter atau kata kunci.'}
    />
  {:else}
    <div class="flex flex-col gap-2 overflow-y-auto">
      {#each filtered as order (order.id)}
        {@const cfg = statusConfig[order.status]}
        {@const count = itemCount(order)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class="rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md"
          style="border-color: #E2EBF4; background: #fff"
          onclick={() => onSelect?.(order)}
          role="button"
          tabindex="0"
          onkeydown={(e) => { if (e.key === 'Enter') onSelect?.(order); }}
        >
          <div class="flex items-center justify-between mb-1">
            <span class="font-mono text-xs" style="color: #64748B">{order.invoice_no}</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-semibold"
              style="background: {cfg.bg}; color: {cfg.color}"
            >
              {cfg.label}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-sm" style="color: #0F172A">
              {order.member_name ?? 'Tanpa member'} • {count} item
            </div>
            <div class="text-sm font-bold" style="color: #2563EB">{fmtIDR(order.total)}</div>
          </div>
          <div class="flex items-center justify-between mt-1 text-xs" style="color: #94A3B8">
            <span>{formatDate(order.created_at)} {formatTime(order.created_at)}</span>
            <span>{order.user_name ?? '-'}</span>
          </div>
          {#if order.status === 'completed'}
            <div
              class="flex gap-2 mt-2 pt-2"
              style="border-top: 1px solid #F1F5F9"
            >
              <button
                onclick={(e) => { e.stopPropagation(); onPrint?.(order); }}
                class="text-xs font-semibold"
                style="color: #2563EB"
              >🖨 Cetak</button>
              <button
                onclick={(e) => { e.stopPropagation(); onVoid?.(order); }}
                class="text-xs font-semibold"
                style="color: #DC2626"
              >⨯ Void</button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
