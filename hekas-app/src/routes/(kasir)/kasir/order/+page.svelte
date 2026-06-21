<script lang="ts">
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import OrderList from '$lib/components/kasir/Order/OrderList.svelte';
  import { onMount } from 'svelte';
  import type { Transaction } from '$lib/types/domain';
  import { getCurrentUser, logout } from '$lib/api/auth';
  import { listTransactions } from '$lib/api/transactions';

  // Dual-type: api.ts uses id:number; domain.ts uses id:number|string. Cast at boundary.
  let user = $state<any>(null);
  let orders = $state<Transaction[]>([]);
  let loading = $state(true);

  onMount(async () => {
    user = await getCurrentUser();
    try {
      orders = await listTransactions({ limit: 50 });
    } catch {
      orders = [];
    } finally {
      loading = false;
    }
  });

  async function handleLogout() {
    await logout();
    location.href = '/login';
  }

  function handleSelect(t: Transaction) {
    console.log('Selected:', t.invoice_no);
  }

  function handleVoid(t: Transaction) {
    if (confirm(`Void order ${t.invoice_no}?`)) {
      console.log('Void:', t.invoice_no);
    }
  }

  function handlePrint(t: Transaction) {
    console.log('Print:', t.invoice_no);
    window.print();
  }
</script>

<RoleShell
  role="kasir"
  title="Daftar Order"
  {user}
  onlogout={handleLogout}
>
  {#if loading}
    <div class="text-center py-12" style="color: #94A3B8">Memuat…</div>
  {:else}
    <OrderList
      {orders}
      onSelect={handleSelect}
      onVoid={handleVoid}
      onPrint={handlePrint}
    />
  {/if}
</RoleShell>
