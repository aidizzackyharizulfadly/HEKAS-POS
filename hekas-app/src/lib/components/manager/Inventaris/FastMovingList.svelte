<script lang="ts">
  import { fmtIDR } from '$lib/utils/format';
  import type { FastMovingItem } from '$lib/types/domain';

  interface Props {
    items: FastMovingItem[];
    limit?: number;
    onItemClick?: (item: FastMovingItem) => void;
  }

  let { items, limit = 5, onItemClick }: Props = $props();

  let visible = $derived(items.slice(0, limit));
  let maxQty = $derived(Math.max(...visible.map((i) => i.qty_sold), 1));
</script>

<div class="bg-surface rounded-2xl border border-default overflow-hidden">
  <div class="px-5 py-4 border-b border-default flex items-center justify-between">
    <div>
      <h3 class="text-headline-sm font-semibold text-default">Produk Fast Moving</h3>
      <p class="text-body-sm text-muted mt-0.5">Top {limit} produk dengan penjualan tertinggi</p>
    </div>
  </div>

  {#if visible.length === 0}
    <div class="px-5 py-12 text-center text-muted text-body-sm">
      Belum ada data penjualan.
    </div>
  {:else}
    <ol class="divide-y divide-default">
      {#each visible as item, idx (item.product_id)}
        {@const pct = (item.qty_sold / maxQty) * 100}
        <li
          class="px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer"
          onclick={() => onItemClick?.(item)}
          onkeydown={(e) => e.key === 'Enter' && onItemClick?.(item)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-center gap-4">
            <!-- Rank -->
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold flex-shrink-0"
              class:bg-primary={idx === 0}
              class:text-on-primary={idx === 0}
              class:bg-surface-2={idx !== 0}
              class:text-default={idx !== 0}
            >
              {idx + 1}
            </div>

            <!-- Name + SKU -->
            <div class="flex-1 min-w-0">
              <p class="text-body-md font-medium text-default truncate">{item.product_name}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-label-sm text-muted">{item.sku}</span>
                <span class="text-muted">·</span>
                <span class="text-label-sm text-muted">{item.category}</span>
              </div>
            </div>

            <!-- Bar chart -->
            <div class="hidden sm:block w-32 h-2 bg-surface-2 rounded-full overflow-hidden flex-shrink-0">
              <div class="h-full bg-primary rounded-full transition-all" style:width="{pct}%"></div>
            </div>

            <!-- Stats -->
            <div class="text-right flex-shrink-0">
              <p class="text-body-md font-semibold text-default tabular-nums">{item.qty_sold} pcs</p>
              <p class="text-label-sm text-muted tabular-nums">{fmtIDR(item.revenue)}</p>
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</div>
