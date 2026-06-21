<!-- /gudang/inventaris — sub-route page using ProductTable -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import ProductTable from '$lib/components/gudang/Inventaris/ProductTable.svelte';
  import EmptyState from '$lib/components/shared/EmptyState.svelte';

  let user = $state<{ id: number; full_name: string; role: string } | null>(null);
  let products = $state<any[]>([]);
  let loading = $state(true);
  let searchTerm = $state('');
  let restockTarget = $state<any>(null);

  onMount(async () => {
    user = await api.auth.getCurrentUser();
    products = await api.products.listProducts();
    loading = false;
  });

  const filtered = $derived(
    searchTerm
      ? products.filter((p) =>
          (p.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      : products
  );

  function onrestock(p: any) {
    restockTarget = p;
    alert(`Restock: ${p.name} (TODO: open restock modal)`);
  }
  function onedit(p: any) {
    alert(`Edit: ${p.name} (TODO: open edit modal)`);
  }
</script>

<RoleShell role="gudang" title="Inventaris" {user}>
  {#snippet actions()}
    <button
      onclick={() => location.reload()}
      style="font-size: 12px; font-weight: 600; color: #475569; padding: 6px 12px; border-radius: 6px; border: 1px solid #E2E8F0; background: #fff"
    >
      Refresh
    </button>
    <button
      onclick={() => alert('TODO: open add product modal')}
      style="font-size: 12px; font-weight: 600; color: #fff; padding: 6px 12px; border-radius: 6px; background: #2563EB; border: none"
    >
      + Tambah Produk
    </button>
  {/snippet}

  <div class="mb-4">
    <input
      type="search"
      bind:value={searchTerm}
      placeholder="Cari nama atau SKU…"
      style="width: 100%; padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 13px; background: #fff"
    />
  </div>

  {#if loading}
    <p style="color: #94A3B8; text-align: center; padding: 32px">Memuat produk…</p>
  {:else if filtered.length === 0}
    <EmptyState
      icon="📦"
      title="Tidak ada produk"
      description={searchTerm ? `Pencarian "${searchTerm}" tidak ditemukan.` : 'Belum ada produk di database.'}
    />
  {:else}
    <ProductTable products={filtered} {onrestock} {onedit} />
  {/if}
</RoleShell>
