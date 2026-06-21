<script lang="ts">
  /**
   * Product tile for grid view.
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/kasir/POS/ProductCard.svelte`.
   *
   * Used by: kasir POS product grid, kasir/produk (catalog view), gudang/inventaris grid.
   * Shows: image/emoji, name, price, stock badge.
   * Click adds to cart (kasir) or opens detail (gudang).
   */

  import type { Product } from '$lib/types/domain';

  interface Props {
    product: Product;
    /** Action when card is clicked. */
    onclick?: () => void;
    /** Show stock badge (default true). */
    showStock?: boolean;
    /** Compact variant for dense grids. */
    compact?: boolean;
    /** Disabled state (e.g. out of stock in POS). */
    disabled?: boolean;
  }

  let {
    product,
    onclick,
    showStock = true,
    compact = false,
    disabled = false
  }: Props = $props();

  // Stock status
  const stockStatus = $derived(
    product.stock <= 0
      ? { label: 'Habis', tone: 'danger' as const }
      : product.stock <= (product.min_stock ?? 5)
        ? { label: 'Tipis', tone: 'warning' as const }
        : { label: 'Tersedia', tone: 'success' as const }
  );

  const priceText = $derived(
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number(product.price ?? 0))
  );

  const toneClasses = {
    success: { bg: '#D1FAE5', text: '#065F46' },
    warning: { bg: '#FEF3C7', text: '#92400E' },
    danger:  { bg: '#FEE2E2', text: '#991B1B' }
  } as const;
  const badgeStyle = $derived(toneClasses[stockStatus.tone]);

  // Image fallback to emoji
  const imageEmoji = $derived(
    (product as any).image_emoji ?? (product as any).emoji ?? '📦'
  );
</script>

<button
  type="button"
  class="product-card"
  class:compact
  class:disabled
  onclick={() => !disabled && onclick?.()}
  aria-label="{product.name}, {priceText}{showStock ? ', stok ' + product.stock : ''}"
  {disabled}
>
  <div class="product-card__image" aria-hidden="true">
    {#if (product as any).image_url || (product as any).image}
      <img
        src={(product as any).image_url ?? (product as any).image}
        alt=""
        loading="lazy"
        decoding="async"
      />
    {:else}
      <span class="product-card__emoji">{imageEmoji}</span>
    {/if}
  </div>

  <div class="product-card__body">
    <div class="product-card__name" title={product.name}>
      {product.name}
    </div>
    {#if !compact}
      <div class="product-card__sku">{product.sku}</div>
    {/if}
    <div class="product-card__price">{priceText}</div>
  </div>

  {#if showStock}
    <div
      class="product-card__stock"
      style="background: {badgeStyle.bg}; color: {badgeStyle.text}"
    >
      {product.stock} {product.unit || 'pcs'}
    </div>
  {/if}
</button>

<style>
  .product-card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    overflow: hidden;
    text-align: left;
    font: inherit;
    color: inherit;
    cursor: pointer;
    padding: 0;
    transition: box-shadow 120ms, transform 120ms, border-color 120ms;
  }
  .product-card:hover:not(.disabled) {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
    border-color: #CBD5E1;
  }
  .product-card:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }
  .product-card.disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .product-card.compact .product-card__image {
    aspect-ratio: 1 / 1;
    background: #F8FAFC;
  }
  .product-card__image {
    aspect-ratio: 4 / 3;
    background: #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .product-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .product-card__emoji {
    font-size: 40px;
  }
  .compact .product-card__emoji {
    font-size: 32px;
  }
  .product-card__body {
    padding: 10px 12px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .product-card__name {
    font-size: 13px;
    font-weight: 600;
    color: #0F172A;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .product-card__sku {
    font-size: 10px;
    color: #94A3B8;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }
  .product-card__price {
    font-size: 14px;
    font-weight: 700;
    color: #1E40AF;
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }
  .product-card__stock {
    position: absolute;
    top: 6px;
    right: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    backdrop-filter: blur(4px);
  }
</style>
