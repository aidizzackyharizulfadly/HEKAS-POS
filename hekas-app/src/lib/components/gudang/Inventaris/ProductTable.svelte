<!--
  ProductTable — product list table for gudang/inventaris.

  Versi simplified: read-only table (no inline restock/edit).
  Aksi restock/edit pakai callback props (`onrestock`, `onedit`).

  TODO (R3b follow-up): kalau user mau inline edit, bisa tambah
  expand row dengan form inline. Saat ini parent page handle modal.
-->
<script lang="ts">
  import type { Product } from '$lib/types/domain';
  import { fmtIDR as fmt } from '$lib/utils/format';

  type Props = {
    products: Product[];
    onedit?: (p: Product) => void;
    onrestock?: (p: Product) => void;
  };

  let { products, onedit, onrestock }: Props = $props();

  const stockColor = (qty: number, min: number) => {
    if (qty <= 0) return { bg: '#FEE2E2', fg: '#DC2626', label: 'Habis' };
    if (qty <= min) return { bg: '#FEF3C7', fg: '#D97706', label: 'Tipis' };
    return { bg: '#D1FAE5', fg: '#059669', label: 'Aktif' };
  };

  const minStockOf = (p: Product) => (p as any).minStock ?? (p as any).min_stock ?? 0;
</script>

<div class="rounded-lg border overflow-hidden" style="background: #fff; border-color: #E2E8F0">
  <table class="w-full text-sm">
    <thead style="background: #F8FAFC; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em">
      <tr>
        <th class="text-left px-4 py-2.5 font-semibold">Produk</th>
        <th class="text-left px-4 py-2.5 font-semibold">SKU</th>
        <th class="text-right px-4 py-2.5 font-semibold">Stok</th>
        <th class="text-right px-4 py-2.5 font-semibold">Min</th>
        <th class="text-right px-4 py-2.5 font-semibold">Harga Jual</th>
        <th class="text-center px-4 py-2.5 font-semibold">Status</th>
        <th class="text-right px-4 py-2.5 font-semibold">Aksi</th>
      </tr>
    </thead>
    <tbody>
      {#each products as p (p.id)}
        {@const sc = stockColor(p.stock, minStockOf(p))}
        <tr class="border-t" style="border-color: #F1F5F9">
          <td class="px-4 py-2.5">
            <div class="flex items-center gap-2.5">
              <span style="font-size: 22px">{p.image || '📦'}</span>
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #0F172A">{p.name}</div>
                <div style="font-size: 11px; color: #94A3B8">{p.category || 'Tanpa kategori'}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-2.5 tabular-nums" style="font-size: 12px; color: #475569">{p.sku}</td>
          <td class="px-4 py-2.5 text-right tabular-nums" style="font-size: 13px; font-weight: 600; color: #0F172A">{p.stock}</td>
          <td class="px-4 py-2.5 text-right tabular-nums" style="font-size: 12px; color: #94A3B8">{minStockOf(p)}</td>
          <td class="px-4 py-2.5 text-right tabular-nums" style="font-size: 12.5px; color: #0F172A">{fmt(p.price)}</td>
          <td class="px-4 py-2.5 text-center">
            <span class="inline-block px-2 py-0.5 rounded" style="background: {sc.bg}; color: {sc.fg}; font-size: 10.5px; font-weight: 700">
              {sc.label}
            </span>
          </td>
          <td class="px-4 py-2.5 text-right">
            {#if onrestock || onedit}
              <div class="flex items-center justify-end gap-1">
                {#if onrestock}
                  <button
                    onclick={() => onrestock?.(p)}
                    style="font-size: 11px; font-weight: 600; color: #2563EB; padding: 4px 8px; border-radius: 4px; border: 1px solid #BFDBFE; background: #EFF6FF"
                  >
                    Restock
                  </button>
                {/if}
                {#if onedit}
                  <button
                    onclick={() => onedit?.(p)}
                    style="font-size: 11px; font-weight: 600; color: #475569; padding: 4px 8px; border-radius: 4px; border: 1px solid #E2E8F0; background: #F8FAFC"
                  >
                    Edit
                  </button>
                {/if}
              </div>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if products.length === 0}
    <p style="text-align: center; padding: 32px; color: #94A3B8; font-size: 13px">Tidak ada produk.</p>
  {/if}
</div>
