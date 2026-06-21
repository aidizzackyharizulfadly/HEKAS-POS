<script lang="ts">
  /**
   * /manager/beranda — Manager dashboard dengan semua 5 R3d widgets
   * Demo integration RevenueChart + KpiStrip + BestSellersCard +
   *              ApprovalQueue + NotificationFeed + ShiftTimeline
   */
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import KpiStrip from '$lib/components/manager/Beranda/KpiStrip.svelte';
  import BestSellersCard from '$lib/components/manager/Beranda/BestSellersCard.svelte';
  import ApprovalQueue from '$lib/components/manager/Beranda/ApprovalQueue.svelte';
  import NotificationFeed from '$lib/components/manager/Beranda/NotificationFeed.svelte';
  import ShiftTimeline from '$lib/components/manager/Beranda/ShiftTimeline.svelte';
  import RevenueChart from '$lib/components/manager/Beranda/RevenueChart.svelte';

  import { goto } from '$app/navigation';

  // Mock user (akan diganti currentUser dari auth store)
  const user = {
    full_name: 'Manajer Demo',
    role: 'manager' as const,
  };

  // --- Mock KPI data ---
  const kpis = [
    { label: 'Total Revenue', value: 'Rp 12.450.000', delta: '+12.5%', deltaDirection: 'up' as const, tone: 'primary' as const, icon: '💰' },
    { label: 'Transaksi', value: '142', delta: '+8.2%', deltaDirection: 'up' as const, tone: 'success' as const, icon: '🧾' },
    { label: 'Rata-rata', value: 'Rp 87.676', delta: '+3.1%', deltaDirection: 'up' as const, tone: 'info' as const, icon: '📊' },
    { label: 'Stok Kritis', value: '3', delta: '-1', deltaDirection: 'down' as const, tone: 'warning' as const, icon: '⚠️' },
  ];

  // --- Mock revenue 7 hari ---
  const revenueSeries = [
    { date: '2026-06-13', label: 'Sab', revenue: 1_500_000 },
    { date: '2026-06-14', label: 'Min', revenue: 2_100_000 },
    { date: '2026-06-15', label: 'Sen', revenue: 1_200_000 },
    { date: '2026-06-16', label: 'Sel', revenue: 1_800_000 },
    { date: '2026-06-17', label: 'Rab', revenue: 2_300_000 },
    { date: '2026-06-18', label: 'Kam', revenue: 1_950_000 },
    { date: '2026-06-19', label: 'Jum', revenue: 2_400_000 },
  ];

  // --- Mock best sellers ---
  const bestSellers = [
    { name: 'Aqua 600ml', sold: 48, revenue: 192_000 },
    { name: 'Indomie Goreng', sold: 36, revenue: 180_000 },
    { name: 'Rokok Surya 16', sold: 24, revenue: 480_000 },
  ];

  // --- Mock approval queue ---
  const approvals = [
    { id: 1, sj_no: 'SJ-2406015', destination: 'Cabang Bandung', total_items: 12, created_by_name: 'Andi', created_at: new Date(Date.now() - 5 * 60_000).toISOString(), urgent: true },
    { id: 2, sj_no: 'SJ-2406014', destination: 'Cabang Bogor', total_items: 8, created_by_name: 'Andi', created_at: new Date(Date.now() - 30 * 60_000).toISOString() },
    { id: 3, sj_no: 'SJ-2406013', destination: 'Cabang Depok', total_items: 15, created_by_name: 'Budi', created_at: new Date(Date.now() - 2 * 3_600_000).toISOString() },
  ];

  // --- Mock notifications ---
  const notifications = [
    { id: 'n1', icon: '📋', title: 'SJ-2406015 perlu approval', preview: 'Cabang Bandung · 12 item', time: '5m lalu', status: 'sent' as const, chat_id: 'manager-chat' },
    { id: 'n2', icon: '⚠️', title: 'Stok kritis: Indomie Goreng', preview: 'Stok: 3 · Min: 50', time: '12m lalu', status: 'sent' as const },
    { id: 'n3', icon: '✅', title: 'PO-2406012 verified', preview: 'PT Indofood · 15 item', time: '1j lalu', status: 'sent' as const },
    { id: 'n4', icon: '🟢', title: 'Shift kasir dimulai', preview: 'Andi · SHF-2406010', time: '2j lalu', status: 'sent' as const },
    { id: 'n5', icon: '🔴', title: 'Telegram delivery failed', preview: 'Retrying... attempt 2/5', time: '3j lalu', status: 'failed' as const },
    { id: 'n6', icon: '📊', title: 'Laporan harian tersedia', preview: '9 Juni 2026 · 142 trx', time: '5j lalu', status: 'pending' as const },
  ];

  // --- Mock shifts ---
  const shifts = [
    { id: 's1', cashier_name: 'Andi Nugraha', shift_no: 'SHF-2406010', started_at: new Date(new Date().setHours(8, 2, 0, 0)).toISOString(), ended_at: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(), total_transactions: 87, total_sales: 4_250_000, status: 'SELESAI' as const },
    { id: 's2', cashier_name: 'Siti Rahayu', shift_no: 'SHF-2406011', started_at: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(), ended_at: null, total_transactions: 55, total_sales: 2_800_000, status: 'AKTIF' as const },
  ];

  // Handlers
  function handleLogout() {
    goto('/login');
  }
  function handleApprove(sj: typeof approvals[number]) {
    alert(`Setujui ${sj.sj_no}`);
  }
  function handleReject(sj: typeof approvals[number]) {
    const reason = prompt(`Alasan tolak ${sj.sj_no}:`);
    if (reason) alert(`Ditolak: ${reason}`);
  }
  function handleViewSJ(sj: typeof approvals[number]) {
    alert(`Lihat detail ${sj.sj_no}`);
  }
  function handleNotifClick(n: typeof notifications[number]) {
    alert(`Notif: ${n.title}`);
  }
</script>

<RoleShell
  role="manager"
  user={user}
  title="Dashboard Manager"
  subtitle="{revenueSeries.length} hari revenue · {approvals.length} pending approval"
  onlogout={handleLogout}
>
  {#snippet actions()}
    <button type="button" class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
      🔄 Refresh
    </button>
    <button type="button" class="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
      📤 Export
    </button>
  {/snippet}

  <!-- Section 1: KPI Strip (full width) -->
  <div class="mb-4">
    <KpiStrip kpis={kpis} />
  </div>

  <!-- Section 2: Revenue Chart (full width) -->
  <div class="mb-4">
    <RevenueChart series={revenueSeries} />
  </div>

  <!-- Section 3: 3-column grid (BestSellers | Approvals | Notif) -->
  <div class="mb-4 grid gap-4 lg:grid-cols-3">
    <BestSellersCard products={bestSellers} />
    <ApprovalQueue
      items={approvals}
      onapprove={handleApprove}
      onreject={handleReject}
      onview={handleViewSJ}
    />
    <NotificationFeed
      messages={notifications}
      onitemclick={handleNotifClick}
    />
  </div>

  <!-- Section 4: Shift timeline (full width) -->
  <div class="mb-4">
    <ShiftTimeline shifts={shifts} />
  </div>
</RoleShell>