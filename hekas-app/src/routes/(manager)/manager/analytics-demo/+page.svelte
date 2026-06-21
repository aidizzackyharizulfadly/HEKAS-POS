<script lang="ts">
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import { logout as apiLogout } from '$lib/api/auth';
  import { goto } from '$app/navigation';
  import PaymentMethodChart from '$lib/components/manager/Penjualan/PaymentMethodChart.svelte';
  import FastMovingList from '$lib/components/manager/Inventaris/FastMovingList.svelte';
  import LabaRugiCard from '$lib/components/manager/Keuangan/LabaRugiCard.svelte';
  import PerformanceChart from '$lib/components/manager/Karyawan/PerformanceChart.svelte';
  import OrderSearch from '$lib/components/kasir/Order/OrderSearch.svelte';
  import type { User, PaymentBreakdown, FastMovingItem, LabaRugiSummary, EmployeePerformance } from '$lib/types/domain';

  const currentUser: User = {
    id: 1,
    username: 'manager01',
    full_name: 'Pak Bos Manager',
    role: 'manager',
    outlet_id: 1
  };

  let searchValue = $state('');

  const payments: PaymentBreakdown[] = [
    { label: 'Tunai', value: 245, color: '#10B981' },
    { label: 'QRIS', value: 312, color: '#3B82F6' },
    { label: 'Debit', value: 89, color: '#F59E0B' },
    { label: 'Kredit', value: 18, color: '#EF4444' }
  ];

  const fastMoving: FastMovingItem[] = [
    { product_id: 1, product_name: 'Aqua 600ml', sku: 'MNM001', category: 'Minuman', qty_sold: 248, revenue: 372000, movement_count: 89 },
    { product_id: 2, product_name: 'Indomie Goreng', sku: 'SNK001', category: 'Snack', qty_sold: 198, revenue: 594000, movement_count: 76 },
    { product_id: 3, product_name: 'Rokok Surya 12', sku: 'RKK001', category: 'Rokok', qty_sold: 156, revenue: 2808000, movement_count: 64 },
    { product_id: 4, product_name: 'Beras Premium 5kg', sku: 'SMB001', category: 'Sembako', qty_sold: 87, revenue: 6960000, movement_count: 41 },
    { product_id: 5, product_name: 'Teh Pucuk 350ml', sku: 'MNM005', category: 'Minuman', qty_sold: 142, revenue: 355000, movement_count: 58 }
  ];

  const labaRugi: LabaRugiSummary = {
    range: { from: '1 Jun 2026', to: '19 Jun 2026' },
    revenue: 128450000,
    cogs: 78420000,
    gross_profit: 50030000,
    gross_margin_pct: 38.96,
    operating_expenses: 12500000,
    net_profit: 37530000,
    net_margin_pct: 29.22,
    prev_net_profit: 32100000,
    growth_pct: 16.91
  };

  const employees: EmployeePerformance[] = [
    { employee_id: 1, full_name: 'Andi Nugraha', role: 'kasir', transactions: 142, revenue: 18750000, rating: 4.8 },
    { employee_id: 2, full_name: 'Siti Aminah', role: 'kasir', transactions: 128, revenue: 16420000, rating: 4.6 },
    { employee_id: 3, full_name: 'Budi Santoso', role: 'gudang', transactions: 45, revenue: 0, rating: 4.4 },
    { employee_id: 4, full_name: 'Dewi Lestari', role: 'manager', transactions: 12, revenue: 0, rating: 4.9 },
    { employee_id: 5, full_name: 'Rina Wati', role: 'kasir', transactions: 98, revenue: 12300000, rating: 4.2 }
  ];

  async function handleLogout() {
    await apiLogout();
    goto('/login');
  }
</script>

<RoleShell role="manager" title="Analytics Demo" user={currentUser} onlogout={handleLogout}>
  {#snippet actions()}
    <button class="px-3 py-1.5 text-body-sm font-medium rounded-lg bg-surface-2 hover:bg-default transition-colors">
      Filter
    </button>
    <button class="px-3 py-1.5 text-body-sm font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity">
      Export
    </button>
  {/snippet}

  <div class="space-y-6">
    <!-- Search bar demo -->
    <section>
      <h2 class="text-headline-sm font-semibold text-default mb-3">Reusable Search</h2>
      <OrderSearch
        bind:value={searchValue}
        placeholder="Cari order, produk, member..."
        oninput={(v) => console.log('search:', v)}
      />
      <p class="mt-2 text-label-sm text-muted">Search value: "{searchValue}"</p>
    </section>

    <!-- Row 1: Pie + Laba Rugi -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PaymentMethodChart data={payments} title="Distribusi Pembayaran" />
      <LabaRugiCard summary={labaRugi} />
    </div>

    <!-- Row 2: Fast moving (full) + Performance (full) -->
    <FastMovingList items={fastMoving} limit={5} />
    <PerformanceChart data={employees} metric="revenue" limit={5} />
  </div>
</RoleShell>
