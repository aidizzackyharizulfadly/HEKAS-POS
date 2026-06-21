<script lang="ts">
  /**
   * Responsive product grid with search + category filter.
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/kasir/POS/ProductGrid.svelte`.
   *
   * Used by: kasir POS, kasir/produk (catalog), gudang/inventaris grid view.
   */

  import type { Product } from '$lib/types/domain';
  import ProductCard from './ProductCard.svelte';

  interface Props {
    products: Product[];
    /** Categories for filter (label = name, value = id or 'all'). */
    categories?: { id: string | number; name: string; icon?: string }[];
    /** Click handler (parent decides what to do: add to cart, open detail, etc). */
    onproductclick?: (product: Product) => void;
    /** Show search input. */
    showSearch?: boolean;
    /** Show category tabs. */
    showCategoryTabs?: boolean;
    /** Hide out-of-stock products. */
    hideOutOfStock?: boolean;
    /** Loading state. */
    loading?: boolean;
    /** Empty state title/desc. */
    emptyTitle?: string;
    emptyDescription?: string;
  }

  let {
    products,
    categories = [],
    onproductclick,
    showSearch = true,
    showCategoryTabs = true,
    hideOutOfStock = false,
    loading = false,
    emptyTitle = 'Tidak ada produk',
    emptyDescription = 'Coba ubah filter atau kata kunci pencarian.'
  }: Props = $props();

  let searchQuery = $state('');
  let activeCategory = $state<string | number>('all');

  const visible = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (hideOutOfStock && p.stock <= 0) return false;
      if (activeCategory !== 'all' && p.category_id !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode?.toLowerCase().includes(q) ?? false)
      );
    });
  });
</script>

<div class="product-grid">
  {#if showCategoryTabs && categories.length > 0}
    <div class="product-grid__tabs" role="tablist" aria-label="Kategori produk">
      <button
        type="button"
        role="tab"
        class="tab"
        class:active={activeCategory === 'all'}
        aria-selected={activeCategory === 'all'}
        onclick={() => (activeCategory = 'all')}
      >
        Semua
      </button>
      {#each categories as cat (cat.id)}
        <button
          type="button"
          role="tab"
          class="tab"
          class:active={activeCategory === cat.id}
          aria-selected={activeCategory === cat.id}
          onclick={() => (activeCategory = cat.id)}
        >
          {#if cat.icon}<span aria-hidden="true">{cat.icon}</span>{/if}
          {cat.name}
        </button>
      {/each}
    </div>
  {/if}

  {#if showSearch}
    <div class="product-grid__search">
      <input
        type="search"
        class="search-input"
        placeholder="Cari produk (nama/SKU/barcode)..."
        bind:value={searchQuery}
        aria-label="Cari produk"
      />
      {#if searchQuery}
        <span class="product-grid__count">
          {visible.length} dari {products.length}
        </span>
      {/if}
    </div>
  {/if}

  {#if loading}
    <div class="product-grid__skeletons" aria-label="memuat produk">
      {#each Array(8) as _, i (i)}
        <div class="product-card-skeleton"></div>
      {/each}
    </div>
  {:else if visible.length === 0}
    <div class="product-grid__empty" role="status">
      <div class="empty-icon" aria-hidden="true">🔍</div>
      <h3>{emptyTitle}</h3>
      <p>{emptyDescription}</p>
    </div>
  {:else}
    <div class="product-grid__grid">
      {#each visible as p (p.id)}
        <ProductCard
          product={p}
          onclick={() => onproductclick?.(p)}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .product-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .product-grid__tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }
  .tab {
    padding: 6px 14px;
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    white-space: nowrap;
    transition: background 120ms, color 120ms, border-color 120ms;
    font-family: inherit;
  }
  .tab:hover {
    background: #F1F5F9;
  }
  .tab.active {
    background: #2563EB;
    color: #ffffff;
    border-color: #2563EB;
  }
  .tab:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }

  .product-grid__search {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .search-input {
    flex: 1;
    padding: 8px 14px;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    font-size: 14px;
    font: inherit;
    background: #ffffff;
  }
  .search-input:focus {
    outline: 2px solid #2563EB;
    outline-offset: 1px;
    border-color: #2563EB;
  }
  .product-grid__count {
    font-size: 12px;
    color: #64748B;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .product-grid__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .product-grid__skeletons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  .product-card-skeleton {
    aspect-ratio: 3 / 4;
    background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
    background-size: 200% 100%;
    border-radius: 10px;
    animation: shimmer 1.2s ease-in-out infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .product-grid__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 48px 16px;
    color: #64748B;
  }
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.85;
  }
  .product-grid__empty h3 {
    margin: 0 0 4px;
    font-size: 15px;
    color: #334155;
  }
  .product-grid__empty p {
    margin: 0;
    font-size: 13px;
  }
</style>
