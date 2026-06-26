<!--
  /owner/beranda — Owner Dashboard
  Layout match Role_Owner/stitch_hekas_minimarket_pos_ui/screen.png:
  - Slim sidebar (80px) via Sidebar component
  - Top header: "Dashboard Owner" + username
  - 6 KPI cards strip (Omzet, Profit, Transaksi, Outlet, Manager, Karyawan)
  - Row 1: Ringkasan Keuangan (5 sub-metrics) + Revenue Trend bar chart
  - Right column: Informasi Owner card + Aktivitas Terbaru timeline
  - Bottom: Performa Outlet table (top 5)
  - Footer: Export Dashboard + Settings buttons
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { clientGuard } from '$lib/auth/guard';
	import { api } from '$lib/api';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import OwnerKpiCard from '$lib/components/owner/Beranda/OwnerKpiCard.svelte';
	import OwnerFinancialCard from '$lib/components/owner/Beranda/OwnerFinancialCard.svelte';
	import OwnerRevenueChart from '$lib/components/owner/Beranda/OwnerRevenueChart.svelte';
	import OwnerInfoCard from '$lib/components/owner/Beranda/OwnerInfoCard.svelte';
	import OwnerActivityCard from '$lib/components/owner/Beranda/OwnerActivityCard.svelte';
	import OwnerOutletPerformance from '$lib/components/owner/Beranda/OwnerOutletPerformance.svelte';
	import { showInfo, showSuccess } from '$lib/utils/toast';
	import type { User } from '$lib/types/domain';

	// Auth guard — owner only
	onMount(() => {
		clientGuard('owner');
	});

	const STORAGE_USER_KEY = 'hekas:current_user';
	let currentUser = $state<User | null>(null);
	$effect(() => {
		(async () => {
			try {
				const raw = localStorage.getItem(STORAGE_USER_KEY);
				if (raw) {
					currentUser = JSON.parse(raw);
				} else {
					const users = (await api.auth.listUsers()) as User[];
					currentUser = users.find((u) => (u.role as string) === 'owner') ?? null;
				}
			} catch {
				currentUser = null;
			}
		})();
	});

	async function handleLogout() {
		try {
			await api.auth.logout();
		} catch {}
		await goto('/login');
	}

	// Owner dashboard placeholder state (mock data — replace with API once BE ready)
	let now = $state(new Date());
	const kpiData = {
		omzetToday: 'Rp 142.500k',
		profitToday: 'Rp 42.240k',
		totalTransaksiToday: '1.842',
		totalOutlet: '12',
		totalManager: '12',
		totalKaryawan: '144'
	};
	const revenueHeights = [0.35, 0.55, 0.95, 0.7, 0.6, 0.5, 0.4];

	function handleExport() {
		showInfo('Export Dashboard (TODO: generate PDF/CSV)');
	}
	function handleSettings() {
		showInfo('Settings (TODO: open settings panel)');
	}
</script>

<svelte:head>
	<title>Dashboard Owner · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="owner"
	title="Dashboard Owner"
	subtitle={`shnsiydbuydhabyt • ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
	user={currentUser}
	onlogout={handleLogout}
>
	<div class="space-y-6">
		<!-- Row 1: 6 KPI cards horizontal -->
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			<OwnerKpiCard label="Omzet Hari Ini" value={kpiData.omzetToday} icon="wallet" />
			<OwnerKpiCard label="Profit Hari Ini" value={kpiData.profitToday} icon="trending-up" />
			<OwnerKpiCard label="Total Transaksi Hari Ini" value={kpiData.totalTransaksiToday} icon="bar-chart-3" />
			<OwnerKpiCard label="Total Outlet" value={kpiData.totalOutlet} icon="store" />
			<OwnerKpiCard label="Total Manager" value={kpiData.totalManager} icon="briefcase" />
			<OwnerKpiCard label="Total Karyawan" value={kpiData.totalKaryawan} icon="users" />
		</div>

		<!-- Row 2: 2-col main + 1-col right rail -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<!-- Left: Financial card -->
			<OwnerFinancialCard />
			<!-- Middle: Revenue chart -->
			<OwnerRevenueChart heights={revenueHeights} />

			<!-- Right rail: stack of 2 cards -->
			<div class="space-y-4">
				<OwnerInfoCard
					ownerName="Budi"
					roleLabel="Business Owner"
					outletsCount={12}
					managersCount={12}
					employeesCount={144}
					statusLabel="Aktif"
					statusTone="success"
					lastLogin="Hari Ini, 08:02 WIB"
					initials="BU"
				/>
				<OwnerActivityCard />
			</div>
		</div>

		<!-- Row 3: Performa Outlet -->
		<OwnerOutletPerformance />

		<!-- Footer: Export + Settings -->
		<div class="flex flex-col sm:flex-row gap-3 justify-end pt-2">
			<button
				type="button"
				onclick={handleSettings}
				class="px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
			>
				Settings
			</button>
			<button
				type="button"
				onclick={handleExport}
				class="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
			>
				Export Dashboard
			</button>
		</div>
	</div>
</RoleShell>