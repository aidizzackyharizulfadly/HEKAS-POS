<script lang="ts">
  /**
   * BestSellersCard — Top 3 produk terlaris dengan medal ranking
   *
   * Uses: Manager Beranda, Penjualan Analytics, Kasir Laporan
   *
   * @prop products - array of { name, sold, revenue } sorted by sold desc
   * @prop currencyPrefix - prefix mata uang, default "Rp"
   * @prop variant - 'gold' (medal emoji) | 'compact' (no medal), default 'gold'
   */
  type BestSeller = { name: string; sold: number; revenue: number };

  type Props = {
    products?: BestSeller[];
    currencyPrefix?: string;
    variant?: 'gold' | 'compact';
  };

  let {
    products = [],
    currencyPrefix = 'Rp',
    variant = 'gold',
  }: Props = $props();

  // Medal emoji untuk 3 teratas
  const medals = ['🥇', '🥈', '🥉'];

  // Format angka ke ringkas (1.2k, 1.5jt, dst) untuk sold
  function formatSold(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'jt';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'rb';
    return String(n);
  }

  // Format revenue ke IDR (full)
  function formatRevenue(n: number): string {
    return currencyPrefix + ' ' + n.toLocaleString('id-ID');
  }
</script>

<section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-base font-semibold text-gray-900">🏆 Best Sellers</h2>
    <span class="text-xs text-gray-500">Top {products.length || 0}</span>
  </header>

  {#if products.length === 0}
    <p class="py-6 text-center text-sm text-gray-500">
      Belum ada data penjualan
    </p>
  {:else}
    <ol class="space-y-2">
      {#each products as product, i (product.name + i)}
        <li
          class="flex items-center gap-3 rounded-md p-2 transition hover:bg-amber-50"
          class:bg-amber-50={i === 0}
        >
          {#if variant === 'gold'}
            <span class="text-xl leading-none" aria-hidden="true">
              {medals[i] || '·'}
            </span>
          {:else}
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600"
              aria-hidden="true"
            >
              {i + 1}
            </span>
          {/if}

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">
              {product.name}
            </p>
            <p class="text-xs text-gray-500">
              {formatSold(product.sold)} terjual ·
              <span class="font-medium text-gray-700">
                {formatRevenue(product.revenue)}
              </span>
            </p>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</section>