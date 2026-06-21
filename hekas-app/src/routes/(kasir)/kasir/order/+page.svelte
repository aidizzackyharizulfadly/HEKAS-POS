<!-- /kasir/order — sub-route page using CartSummary -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import CartSummary from '$lib/components/kasir/POS/CartSummary.svelte';
  import EmptyState from '$lib/components/shared/EmptyState.svelte';

  let user = $state<{ id: number; full_name: string; role: string } | null>(null);
  let orders = $state<any[]>([]);
  let loading = $state(true);
  let cart = $state<any[]>([]); // demo cart (unused in real flow, but for showcase)
  let member = $state<any | null>(null);

  onMount(async () => {
    user = await api.auth.getCurrentUser();
    try {
      orders = await api.orders.listOrders();
    } catch {
      orders = [];
    }
    loading = false;
  });

  function formatRupiah(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }
</script>

<RoleShell role="kasir" title="Order" subtitle="Daftar transaksi Anda" {user}>
  {#snippet actions()}
    <button
      onclick={() => location.reload()}
      style="font-size: 12px; font-weight: 600; color: #475569; padding: 6px 12px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff"
    >
      Refresh
    </button>
  {/snippet}

  <div style="display: grid; gap: 16px; grid-template-columns: 1fr 360px; align-items: start">
    <!-- LEFT: order list -->
    <div>
      {#if loading}
        <p style="color: #94A3B8; text-align: center; padding: 32px">Memuat order…</p>
      {:else if orders.length === 0}
        <EmptyState
          icon="🧾"
          title="Belum ada order"
          description="Transaksi yang Anda buat akan muncul di sini."
        />
      {:else}
        <ul style="display: flex; flex-direction: column; gap: 8px">
          {#each orders as o (o.id)}
            <li
              style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border: 1px solid #E2E8F0; border-radius: 8px"
            >
              <div style="flex: 1">
                <div style="font-size: 13px; font-weight: 700; color: #0F172A">{o.orderNumber ?? o.order_no ?? `Order #${o.id}`}</div>
                <div style="font-size: 11.5px; color: #94A3B8">
                  {o.createdAt ?? o.created_at ?? '—'} · {o.status ?? 'selesai'}
                </div>
              </div>
              <div class="tabular-nums" style="font-size: 14px; font-weight: 700; color: #0F172A">
                {formatRupiah(Number(o.total ?? 0))}
              </div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <!-- RIGHT: cart summary (demo, normally empty here) -->
    <div>
      <CartSummary
        items={cart}
        memberName={member?.name}
        onpay={() => alert('TODO: open payment flow')}
        onclear={() => (cart = [])}
      />
    </div>
  </div>
</RoleShell>
