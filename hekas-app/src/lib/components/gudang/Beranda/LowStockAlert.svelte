<script lang="ts">
  import type { Product } from '$lib/types/domain';

  interface Props {
    products?: Product[];
    /** Threshold ratio (current_stock / min_stock). Default 1.5. */
    threshold?: number;
    onViewAll?: () => void;
    onRestock?: (product: Product) => void;
  }

  let { products = [], threshold = 1.5, onViewAll, onRestock }: Props = $props();

  const lowStock = $derived(
    products
      .filter(p => {
        if (!p.is_active) return false;
        const min = p.min_stock ?? 0;
        if (min === 0) return false; // no threshold set
        return p.stock <= min * threshold;
      })
      .sort((a, b) => a.stock - b.stock)
  );

  const habis   = $derived(lowStock.filter(p => p.stock === 0));
  const menipis = $derived(lowStock.filter(p => p.stock > 0));
</script>

{#if lowStock.length === 0}
  <div
    class="rounded-2xl p-4 flex items-center gap-3"
    style="background: #F0FDF4; border: 1px solid #BBF7D0"
  >
    <div class="text-2xl">✅</div>
    <div>
      <div class="text-sm font-bold" style="color: #166534">Stok Aman</div>
      <div class="text-xs" style="color: #16A34A">Semua produk di atas minimum</div>
    </div>
  </div>
{:else}
  <div class="rounded-2xl" style="background: #FEF2F2; border: 1px solid #FECACA">
    <!-- Header -->
    <div class="px-4 py-3 flex items-center justify-between" style="border-bottom: 1px solid #FECACA">
      <div class="flex items-center gap-2">
        <span class="text-xl">⚠️</span>
        <div>
          <div class="text-sm font-bold" style="color: #991B1B">Stok Kritis</div>
          <div class="text-xs" style="color: #DC2626">
            {habis.length} habis · {menipis.length} hampir habis
          </div>
        </div>
      </div>
      {#if onViewAll}
        <button
          onclick={onViewAll}
          class="text-xs font-semibold"
          style="color: #2563EB"
        >Lihat semua →</button>
      {/if}
    </div>

    <!-- Top 5 alerts -->
    <div class="divide-y" style="border-color: #FECACA">
      {#each lowStock.slice(0, 5) as p (p.id)}
        <div class="px-4 py-2.5 flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style="background: {p.stock === 0 ? '#FEE2E2' : '#FEF3C7'}"
          >
            {p.image ?? '📦'}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold truncate" style="color: #0F172A">{p.name}</div>
            <div class="text-xs" style="color: #64748B">
              <span style="color: {p.stock === 0 ? '#DC2626' : '#D97706'}; font-weight: 700">
                {p.stock}
              </span>
              / {p.min_stock} {p.unit}
            </div>
          </div>
          {#if onRestock}
            <button
              onclick={() => onRestock?.(p)}
              class="px-2.5 py-1 rounded-lg text-xs font-semibold"
              style="background: #2563EB; color: #fff"
            >+ Restock</button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}
