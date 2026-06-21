<script lang="ts">
  import { fmtIDR, formatDate, formatTime } from '$lib/utils/format';
  import EmptyState from '$lib/components/shared/EmptyState.svelte';

  /**
   * StockMovement — one stock ledger entry (in/out adjustment).
   * Mirrors `stock_movements` table per PRD DATABASE_DESIGN §4.3.
   */
  export interface StockMovement {
    id: number;
    product_id: number;
    product_name?: string;
    movement_type: 'in_purchase' | 'in_adjustment' | 'in_return' | 'out_sale' | 'out_transfer' | 'out_void_restore' | 'out_adjustment';
    quantity_delta: number; // + masuk, - keluar
    quantity_after: number;
    reference_type?: string;
    reference_id?: number;
    notes?: string;
    created_by?: string;
    created_at: string; // ISO
  }

  interface Props {
    movements?: StockMovement[];
    onAddMovement?: () => void;
  }

  let { movements = [], onAddMovement }: Props = $props();

  const typeConfig: Record<StockMovement['movement_type'], { label: string; color: string; icon: string }> = {
    in_purchase:       { label: 'Pembelian',  color: '#059669', icon: '📥' },
    in_adjustment:     { label: 'Adjustment', color: '#2563EB', icon: '🔧' },
    in_return:         { label: 'Retur',      color: '#7C3AED', icon: '↩️' },
    out_sale:          { label: 'Penjualan',  color: '#DC2626', icon: '🛒' },
    out_transfer:      { label: 'Transfer',   color: '#D97706', icon: '📦' },
    out_void_restore:  { label: 'Void Restore', color: '#94A3B8', icon: '↩️' },
    out_adjustment:    { label: 'Adjustment', color: '#94A3B8', icon: '🔧' }
  };

  const sorted = $derived(
    [...movements].sort((a, b) => b.created_at.localeCompare(a.created_at))
  );

  const totalIn  = $derived(movements.filter(m => m.quantity_delta > 0).reduce((s, m) => s + m.quantity_delta, 0));
  const totalOut = $derived(movements.filter(m => m.quantity_delta < 0).reduce((s, m) => s + m.quantity_delta, 0));
</script>

<div class="flex flex-col h-full">
  <!-- Summary header -->
  <div class="grid grid-cols-3 gap-3 mb-4">
    <div class="rounded-xl p-3" style="background: #F0FDF4; border: 1px solid #BBF7D0">
      <div class="text-xs font-semibold" style="color: #16A34A">Stok Masuk</div>
      <div class="text-2xl font-black" style="color: #16A34A">+{totalIn}</div>
    </div>
    <div class="rounded-xl p-3" style="background: #FEF2F2; border: 1px solid #FECACA">
      <div class="text-xs font-semibold" style="color: #DC2626">Stok Keluar</div>
      <div class="text-2xl font-black" style="color: #DC2626">{totalOut}</div>
    </div>
    <div class="rounded-xl p-3 flex flex-col items-center justify-center" style="background: #F8FAFC; border: 1px solid #E2EBF4">
      <div class="text-xs" style="color: #64748B">Selisih</div>
      <div class="text-2xl font-black" style="color: #0F172A">{totalIn + totalOut}</div>
    </div>
  </div>

  {#if onAddMovement}
    <button
      onclick={onAddMovement}
      class="self-end mb-3 px-3 py-1.5 rounded-lg text-sm font-semibold"
      style="background: #2563EB; color: #fff"
    >
      + Mutasi Manual
    </button>
  {/if}

  {#if sorted.length === 0}
    <EmptyState
      icon="🔄"
      title="Belum ada mutasi"
      description="Aktivitas stok (masuk/keluar) akan tercatat otomatis di sini."
    />
  {:else}
    <div class="flex flex-col gap-2 overflow-y-auto">
      {#each sorted as m (m.id)}
        {@const cfg = typeConfig[m.movement_type]}
        {@const positive = m.quantity_delta > 0}
        <div class="rounded-xl border p-3" style="border-color: #E2EBF4; background: #fff">
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">{cfg.icon}</span>
              <span class="text-sm font-semibold" style="color: #0F172A">{cfg.label}</span>
              {#if m.product_name}
                <span class="text-xs" style="color: #64748B">· {m.product_name}</span>
              {/if}
            </div>
            <span
              class="text-sm font-black"
              style="color: {positive ? cfg.color : cfg.color}; font-family: 'SF Mono', monospace"
            >
              {positive ? '+' : ''}{m.quantity_delta}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs" style="color: #94A3B8">
            <span>Sisa stok: <strong style="color: #475569">{m.quantity_after}</strong></span>
            <span>{formatDate(m.created_at)} {formatTime(m.created_at)} · {m.created_by ?? 'sistem'}</span>
          </div>
          {#if m.notes}
            <div class="mt-1 text-xs italic" style="color: #64748B">"{m.notes}"</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
