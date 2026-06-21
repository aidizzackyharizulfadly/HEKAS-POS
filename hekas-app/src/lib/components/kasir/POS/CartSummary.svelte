<!--
  CartSummary — simplified cart panel for sub-route pages (e.g. /kasir/order).

  Untuk versi lengkap dengan member search inline, item list inline,
  discount modal inline, payment modal inline → lihat
  src/routes/(kasir)/kasir/pos/+page.svelte (cart panel lines ~850-1230).

  TODO (R3b follow-up): extract full cart panel ke component ini.
  Untuk sekarang, ini adalah simplified version untuk sub-routes.
-->
<script lang="ts">
  import type { CartItem } from '$lib/types/domain';

  type Props = {
    items: CartItem[];
    memberName?: string | null;
    onpay?: () => void;
    onclear?: () => void;
  };

  let { items, memberName = null, onpay, onclear }: Props = $props();

  const subtotal = $derived(items.reduce((s, i) => s + i.price * i.qty - i.disc, 0));
  const totalQty = $derived(items.reduce((s, i) => s + i.qty, 0));

  const fmt = (n: number) =>
    n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
</script>

<div class="flex flex-col rounded-lg border" style="background: #fff; border-color: #E2E8F0">
  <div class="px-4 py-3 border-b" style="border-color: #F1F5F9">
    <div class="flex items-baseline justify-between mb-1">
      <span style="font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: #64748B; text-transform: uppercase">Keranjang</span>
      {#if items.length > 0 && onclear}
        <button
          onclick={onclear}
          style="background: #FEF2F2; color: #DC2626; font-size: 10px; font-weight: 700; border: 1px solid #FECACA; padding: 2px 6px; border-radius: 4px"
        >
          Reset
        </button>
      {/if}
    </div>

    <div class="flex items-baseline justify-between mt-1">
      <div class="flex flex-col">
        <span style="font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase">Total</span>
        <span class="tabular-nums" aria-live="polite" style="font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.025em; line-height: 1.1">
          {items.length === 0 ? 'Rp 0' : fmt(subtotal)}
        </span>
      </div>
      <div class="flex flex-col items-end">
        <span style="font-size: 10px; color: #94A3B8; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase">Item</span>
        <span class="tabular-nums" style="font-size: 22px; font-weight: 800; color: #2563EB; line-height: 1.1">
          {totalQty}
        </span>
      </div>
    </div>
  </div>

  <div class="px-4 py-3">
    {#if items.length === 0}
      <p style="font-size: 12px; color: #94A3B8; text-align: center; padding: 12px 0">
        Keranjang kosong. Pilih produk di POS.
      </p>
    {:else}
      <ul class="flex flex-col gap-1.5">
        {#each items as item (item.id)}
          <li class="flex items-center gap-2 text-sm">
            <span style="font-size: 18px">{(item as any).image || '📦'}</span>
            <div class="flex-1 min-w-0">
              <div class="truncate" style="font-size: 12.5px; font-weight: 600; color: #0F172A">{item.name}</div>
              <div style="font-size: 11px; color: #94A3B8" class="tabular-nums">
                {item.qty} × {fmt(item.price)}
              </div>
            </div>
            <span class="tabular-nums" style="font-size: 12.5px; font-weight: 700; color: #0F172A">
              {fmt(item.price * item.qty - item.disc)}
            </span>
          </li>
        {/each}
      </ul>
    {/if}

    {#if memberName}
      <div class="mt-3 pt-3" style="border-top: 1px solid #F1F5F9">
        <span style="font-size: 11px; color: #94A3B8">Member: </span>
        <span style="font-size: 12px; font-weight: 600; color: #0F172A">{memberName}</span>
      </div>
    {/if}

    {#if onpay}
      <button
        onclick={onpay}
        disabled={items.length === 0}
        class="w-full mt-3 py-3 rounded-md font-bold text-white transition-opacity"
        style="background: {items.length === 0 ? '#94A3B8' : '#2563EB'}; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase"
      >
        Bayar
      </button>
    {/if}
  </div>
</div>
