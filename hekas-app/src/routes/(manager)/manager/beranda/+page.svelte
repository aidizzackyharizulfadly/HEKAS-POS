<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { api } from '$lib/api';
	import type { DashboardSummary, ClosingReport } from '$lib/types/api';
	import type { Product, Member, User, Transaction } from '$lib/types/domain';
	import PrintPreview from '$lib/components/PrintPreview.svelte';
	import BackupRestore from '$lib/components/BackupRestore.svelte';
	import MemberForm from '$lib/components/MemberForm.svelte';
	import MemberDetail from '$lib/components/MemberDetail.svelte';
	import TierBadge from '$lib/components/kasir/Pelanggan/TierBadge.svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import { exportTransactionsCSV, fmtIDR, printReport } from '$lib/utils/export';
	import { isBackupStale } from '$lib/utils/backup';

	// ─── Auth (resolve current manager) ────────────────────────────────────────
	const STORAGE_USER_KEY = 'hekas:current_user';
	let currentUser = $state<User | null>(null);
	$effect(() => {
		(async () => {
			try {
				const raw = localStorage.getItem(STORAGE_USER_KEY);
				if (raw) {
					currentUser = JSON.parse(raw);
				} else {
					const users = await api.auth.listUsers();
					currentUser = users.find((u) => u.role === 'manager') ?? null;
				}
			} catch {
				currentUser = null;
			}
		})();
	});
	async function handleLogout() {
		try { await api.auth.logout(); } catch {}
		await goto('/login');
	}

	// ─── State ──────────────────────────────────────────────────────────────────
	type TabId = 'ringkasan' | 'outlet' | 'shift' | 'persetujuan' | 'telegram' | 'member';
	let activeTab = $state<TabId>('ringkasan');
	let now = $state(new Date());

	let summary = $state<DashboardSummary | null>(null);
	let transactions = $state<Transaction[]>([]);
	let products = $state<Product[]>([]);
	let users = $state<User[]>([]);
	let members = $state<Member[]>([]);

	let loading = $state(true);
	let error = $state<string | null>(null);
	let refreshing = $state(false);

	// Reprint state
	let reprintTx = $state<Transaction | null>(null);
	let reprintOpen = $state(false);
	let reprintLoading = $state(false);
	let showBackup = $state(false);
	let backupStale = $state(false);

	// Date range filter
	let rangeMode = $state<'today' | '7d' | '30d' | 'custom'>('today');
	let customFrom = $state('');
	let customTo = $state('');

	// Telegram settings (mock for now)
	let telegram = $state({
		botToken: '',
		chatId: '',
		notifLowStock: true,
		notifBigSale: true,
		notifVoid: true,
		notifShiftEnd: false,
		threshold: 1_000_000,
	});

	// ─── Helpers ────────────────────────────────────────────────────────────────
	const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
	const fmtCompact = (n: number) => {
		if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1) + ' M';
		if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + ' Jt';
		if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(0) + ' rb';
		return 'Rp ' + n.toLocaleString('id-ID');
	};

	const dateStr = (d: Date) =>
		d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

	function getRange(): { from: string; to: string } {
		const today = new Date().toISOString().slice(0, 10);
		if (rangeMode === 'today') return { from: today, to: today };
		if (rangeMode === '7d') {
			const d = new Date(); d.setDate(d.getDate() - 6);
			return { from: d.toISOString().slice(0, 10), to: today };
		}
		if (rangeMode === '30d') {
			const d = new Date(); d.setDate(d.getDate() - 29);
			return { from: d.toISOString().slice(0, 10), to: today };
		}
		return { from: customFrom || today, to: customTo || today };
	}

	// ─── Data loaders ──────────────────────────────────────────────────────────
	async function loadAll() {
		try {
			refreshing = true;
			error = null;
			const range = getRange();
			const [s, t, p, u, m] = await Promise.all([
				api.analytics.getSummary(range),
				api.orders.listTransactions({ from: range.from, to: range.to, limit: 200 }),
				api.products.listProducts(),
				api.auth.listUsers(),
				api.members.listMembers(),
			]);
			summary = s;
			transactions = t;
			products = p;
			users = u;
			members = m;
		} catch (e: any) {
			error = e.message ?? 'Gagal memuat data';
		} finally {
			loading = false;
			refreshing = false;
		}
	}

	onMount(loadAll);

	$effect(() => {
		backupStale = isBackupStale(7);
	});

	async function openReprint(t: Transaction) {
		reprintLoading = true;
		try {
			// Fetch full tx with items
			const full = await api.orders.getTransaction(t.id);
			if (full) {
				reprintTx = full;
				reprintOpen = true;
			}
		} catch (e: any) {
			showToast('error', `Gagal memuat transaksi: ${e.message}`);
		} finally {
			reprintLoading = false;
		}
	}

	function handleExportCSV() {
		if (!transactions.length) {
			showToast('error', 'Tidak ada transaksi untuk di-export');
			return;
		}
		try {
			exportTransactionsCSV(transactions);
			showToast('success', `Berhasil export ${transactions.length} transaksi ke CSV`);
		} catch (e: any) {
			showToast('error', `Export gagal: ${e.message}`);
		}
	}

	function handlePrintReport() {
		if (!summary || !transactions.length) {
			showToast('error', 'Belum ada data laporan untuk dicetak');
			return;
		}
		const rangeLabel =
			rangeMode === 'today'
				? 'Hari Ini'
				: rangeMode === '7d'
					? '7 Hari Terakhir'
					: rangeMode === '30d'
						? '30 Hari Terakhir'
						: `${customFrom} → ${customTo}`;

		printReport({
			title: 'LAPORAN PENJUALAN HARIAN',
			subtitle: `HEKAS POS • ${rangeLabel}`,
			rows: [
				{ label: 'Periode', value: rangeLabel },
				{ label: 'Total Penjualan', value: fmtIDR(summary.kpi.revenue), bold: true },
				{ label: 'Jumlah Transaksi', value: summary.kpi.transactions.toString() },
				{ label: 'Rata-rata Transaksi', value: fmtIDR(summary.kpi.avg_transaction) },
				{ label: 'Item Terjual', value: summary.kpi.transactions > 0 ? 'Lihat tabel' : '—' },
			],
			table: summary.top_products?.length
				? {
						headers: ['#', 'Produk', 'Qty Terjual', 'Pendapatan'],
						rows: summary.top_products.slice(0, 10).map((p: any, i: number) => [
							i + 1,
							p.name,
							p.qty ?? '—',
							fmtIDR(p.revenue ?? 0),
						]),
					}
				: undefined,
			footer: 'Laporan dicetak otomatis oleh HEKAS POS Manager Dashboard.',
		});
		showToast('info', 'Membuka dialog cetak laporan…');
	}

	function showToast(kind: 'success' | 'error' | 'info', text: string) {
		// Minimal toast — bisa di-extend nanti dengan state proper
		console.log(`[toast ${kind}]`, text);
		alert(text);
	}

	// Reload when range changes
	$effect(() => {
		// Touch reactive deps
		void rangeMode; void customFrom; void customTo;
		loadAll();
	});

	// Clock
	$effect(() => {
		const t = setInterval(() => { now = new Date(); }, 1000);
		return () => clearInterval(t);
	});

	// ─── Derived ────────────────────────────────────────────────────────────────
	const totalItemsSold = $derived(
		summary?.top_products.reduce((s, p) => s + p.qty_sold, 0) ?? 0,
	);

	const voidTx = $derived(transactions.filter((t) => t.status === 'void'));

	const memberTxCount = $derived(
		transactions.reduce<Record<string, { count: number; total: number }>>((acc, t) => {
			if (!t.member_id) return acc;
			const cur = acc[t.member_id] ?? { count: 0, total: 0 };
			cur.count += 1; cur.total += t.total;
			acc[t.member_id] = cur;
			return acc;
		}, {}),
	);

	// Hourly chart: max revenue for scale
	const maxHourly = $derived(Math.max(1, ...(summary?.hourly_distribution.map((h) => h.revenue) ?? [0])));

	// Payment method: total for pie %
	const totalByMethod = $derived(
		(summary?.by_payment_method.reduce((s, m) => s + m.total, 0)) ?? 1,
	);
	const methodColors: Record<string, string> = {
		tunai: '#059669', qris: '#2563EB', debit: '#7C3AED',
	};
	const methodLabel: Record<string, string> = {
		tunai: 'Tunai', qris: 'QRIS', debit: 'Kartu Debit',
	};

	// Active shift = users with transactions today
	const userPerformance = $derived(
		users.map((u) => {
			const ut = transactions.filter((t) => t.user_id === u.id);
			return {
				user: u,
				transactions: ut.length,
				revenue: ut.reduce((s, t) => s + t.total, 0),
			};
		}).sort((a, b) => b.revenue - a.revenue),
	);

	// Tabs config
	const TABS: { id: TabId; label: string; badge?: () => number | null }[] = [
		{ id: 'ringkasan', label: 'Ringkasan' },
		{ id: 'outlet', label: 'Outlet' },
		{ id: 'shift', label: 'Shift' },
		{ id: 'persetujuan', label: 'Persetujuan', badge: () => voidTx.length || null },
		{ id: 'member', label: 'Member' },
		{ id: 'telegram', label: 'Telegram' },
	];

	// ─── Member tab state (Fase E) ──────────────────────────────────────────────
	let memberSearch = $state('');
	let memberTierFilter = $state<'all' | Member['tier']>('all');
	let memberSortBy = $state<'name' | 'points' | 'lifetime' | 'recent'>('name');
	let editingMember = $state<Member | null>(null);
	let viewingMember = $state<Member | null>(null);
	let showMemberForm = $state(false);
	let memberToast = $state<{ kind: 'success' | 'error' | 'info'; msg: string } | null>(null);
	let memberToastTimer: number | null = null;

	function showMemberToast(kind: 'success' | 'error' | 'info', msg: string) {
		memberToast = { kind, msg };
		if (memberToastTimer) clearTimeout(memberToastTimer);
		memberToastTimer = window.setTimeout(() => (memberToast = null), 3000);
	}

	const filteredMembers = $derived(
		members
			.filter((m) => memberTierFilter === 'all' || m.tier === memberTierFilter)
			.filter((m) => {
				if (!memberSearch.trim()) return true;
				const term = memberSearch.toLowerCase();
				return (
					m.name.toLowerCase().includes(term) ||
					m.phone.includes(term) ||
					m.id.toLowerCase().includes(term) ||
					(m.email?.toLowerCase().includes(term) ?? false)
				);
			})
			.sort((a, b) => {
				switch (memberSortBy) {
					case 'points':
						return b.points - a.points;
					case 'lifetime':
						return (b.lifetime_spend ?? 0) - (a.lifetime_spend ?? 0);
					case 'recent':
						return (b.last_transaction_at ?? '').localeCompare(a.last_transaction_at ?? '');
					default:
						return a.name.localeCompare(b.name);
				}
			})
	);

	const memberStats = $derived({
		total: members.length,
		silver: members.filter((m) => m.tier === 'Silver').length,
		gold: members.filter((m) => m.tier === 'Gold').length,
		platinum: members.filter((m) => m.tier === 'Platinum').length,
		totalPoints: members.reduce((s, m) => s + m.points, 0),
		totalLifetime: members.reduce((s, m) => s + (m.lifetime_spend ?? 0), 0),
	});

	async function handleDeleteMember(m: Member) {
		const txCount = transactions.filter((t) => t.member_id === m.id).length;
		const confirmMsg =
			txCount > 0
				? `Hapus member ${m.name}? ${txCount} transaksi terkait akan kehilangan referensi member.`
				: `Hapus member ${m.name}?`;
		if (!confirm(confirmMsg)) return;
		try {
			await api.members.deleteMember(m.id);
			members = members.filter((x) => x.id !== m.id);
			showMemberToast('success', `Member ${m.name} berhasil dihapus`);
		} catch (e) {
			showMemberToast('error', e instanceof Error ? e.message : 'Gagal menghapus');
		}
	}

	async function handleSaveMember(saved: Member) {
		// Update list
		const idx = members.findIndex((m) => m.id === saved.id);
		if (idx >= 0) {
			members[idx] = saved;
		} else {
			members = [...members, saved];
		}
	}

	function openCreateMember() {
		editingMember = null;
		showMemberForm = true;
	}
	function openEditMember(m: Member) {
		editingMember = m;
		showMemberForm = true;
	}
	function openViewMember(m: Member) {
		viewingMember = m;
	}
</script>

<RoleShell
	role="manager"
	title="Dashboard Manager"
	subtitle={`${dateStr(now)} • ${now.toLocaleTimeString('id-ID')} • ${users.length} akun • ${products.length} produk`}
	user={currentUser}
	onlogout={handleLogout}
>
	{#snippet actions()}
		<!-- Range selector -->
		<div class="flex items-center rounded-xl overflow-hidden" style="border: 1px solid #E2E8F0">
			{#each [['today', 'Hari ini'], ['7d', '7 hari'], ['30d', '30 hari'], ['custom', 'Custom']] as [val, label]}
				<button
					onclick={() => rangeMode = val as any}
					class="px-3 py-1.5 transition-all"
					style="
						font-size: 12px;
						font-weight: 600;
						background: {rangeMode === val ? '#2563EB' : '#fff'};
						color: {rangeMode === val ? '#fff' : '#475569'};
					"
				>{label}</button>
			{/each}
		</div>

		{#if rangeMode === 'custom'}
			<input type="date" bind:value={customFrom} class="px-2 py-1.5 rounded-lg" style="font-size: 12px; border: 1px solid #E2E8F0" />
			<input type="date" bind:value={customTo} class="px-2 py-1.5 rounded-lg" style="font-size: 12px; border: 1px solid #E2E8F0" />
		{/if}

		<button
			onclick={loadAll}
			disabled={refreshing}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
			style="font-size: 12px; font-weight: 600; background: #F1F5F9; color: #475569; opacity: {refreshing ? 0.6 : 1}"
			aria-label="Refresh data"
		>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: {refreshing ? 'spin 0.8s linear infinite' : 'none'}">
				<path d="M3 12a9 9 0 0114.93-6.82M21 12a9 9 0 01-14.93 6.82" />
				<polyline points="21 4 21 9 16 9" />
				<polyline points="3 20 3 15 8 15" />
			</svg>
			Refresh
		</button>

		<button
			onclick={handlePrintReport}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
			style="font-size: 12px; font-weight: 600; background: #fff; color: #2563EB; border: 1px solid #2563EB"
			aria-label="Cetak laporan (PDF)"
		>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="6 9 6 2 18 2 18 9" />
				<path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
				<rect x="6" y="14" width="12" height="8" />
			</svg>
			Cetak
		</button>

		<button
			onclick={handleExportCSV}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
			style="font-size: 12px; font-weight: 600; background: #2563EB; color: #fff"
			aria-label="Export transaksi ke CSV"
		>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
			</svg>
			Export CSV
		</button>

		<button
			onclick={() => { showBackup = true; }}
			class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg relative"
			style="font-size: 12px; font-weight: 600; background: transparent; color: {backupStale ? '#DC2626' : '#6366F1'}; border: 1px solid {backupStale ? '#FCA5A5' : '#C7D2FE'}"
			aria-label="Backup & Restore data"
		>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<ellipse cx="12" cy="5" rx="9" ry="3" />
				<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
				<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
			</svg>
			Backup
			{#if backupStale}
				<span
					style="position: absolute; top: -4px; right: -4px; background: #DC2626; color: white; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 8px; box-shadow: 0 0 0 2px white;"
					title="Sudah lama tidak backup"
				>!</span>
			{/if}
		</button>
	{/snippet}

	<!-- ── Tab navigation ───────────────────────────────────────────────── -->
	<nav class="shrink-0 flex items-center gap-1 px-6" style="background: #fff; border-bottom: 1px solid #E2E8F0">
		{#each TABS as tab}
			{@const isActive = activeTab === tab.id}
			{@const badge = tab.badge?.() ?? null}
			<button
				onclick={() => activeTab = tab.id}
				class="relative px-4 py-3 transition-all"
				style="
					font-size: 13px;
					font-weight: {isActive ? 700 : 500};
					color: {isActive ? '#2563EB' : '#64748B'};
					border-bottom: 2px solid {isActive ? '#2563EB' : 'transparent'};
				"
			>
				{tab.label}
				{#if badge !== null}
					<span
						class="ml-1.5 px-1.5 py-0.5 rounded-full tabular-nums"
						style="font-size: 10px; font-weight: 800; background: #EF4444; color: #fff"
					>{badge}</span>
				{/if}
			</button>
		{/each}
	</nav>

	<!-- ── Content ──────────────────────────────────────────────────────── -->
	<main class="flex-1 overflow-y-auto p-6">
		{#if loading && !summary}
			<div class="flex items-center justify-center py-20">
				<div class="flex flex-col items-center gap-3">
					<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" style="animation: spin 0.8s linear infinite">
						<path d="M21 12a9 9 0 11-6.219-8.56" />
					</svg>
					<div style="font-size: 13px; color: #64748B">Memuat dashboard...</div>
				</div>
			</div>
		{:else if error}
			<div class="flex flex-col items-center justify-center py-20">
				<div class="w-12 h-12 rounded-full flex items-center justify-center mb-3" style="background: #FEE2E2">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
				</div>
				<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4">{error}</div>
				<button onclick={loadAll} class="mt-3 px-4 py-2 rounded-lg" style="background: #2563EB; color: #fff; font-size: 12px; font-weight: 600">Coba lagi</button>
			</div>
		{:else if summary}
			{#if activeTab === 'ringkasan'}
				<div in:fade={{ duration: 150 }}>
					<!-- KPI Cards -->
					<div class="grid grid-cols-4 gap-4 mb-6">
						{#each [
							{ label: 'Total Revenue', value: fmtCompact(summary.kpi.revenue), sub: `Rata-rata ${fmtCompact(summary.kpi.avg_transaction)}/tx`, color: '#2563EB', bg: '#EFF6FF', trend: summary.kpi.revenue > 0 ? '+12.4%' : '—' },
							{ label: 'Transaksi', value: summary.kpi.transactions.toString(), sub: `${totalItemsSold} item terjual`, color: '#059669', bg: '#F0FDF4', trend: '+8.1%' },
							{ label: 'Rata-rata', value: fmtCompact(summary.kpi.avg_transaction), sub: 'per transaksi', color: '#7C3AED', bg: '#F5F3FF', trend: '—' },
							{ label: 'Stok Kritis', value: (summary.low_stock.length).toString(), sub: '≤ 10 pcs', color: summary.low_stock.length > 0 ? '#DC2626' : '#64748B', bg: summary.low_stock.length > 0 ? '#FEF2F2' : '#F1F5F9', trend: summary.low_stock.length > 0 ? 'Perhatian!' : 'Aman' },
						] as kpi}
							<div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #E2E8F0; box-shadow: 0 1px 3px rgba(15,23,42,0.04)">
								<div class="flex items-center justify-between mb-2">
									<div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px">{kpi.label}</div>
									<div class="px-2 py-0.5 rounded-md" style="font-size: 10px; font-weight: 700; color: {kpi.color}; background: {kpi.bg}">{kpi.trend}</div>
								</div>
								<div style="font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.1">{kpi.value}</div>
								<div style="font-size: 11px; color: #94A3B8; margin-top: 4px">{kpi.sub}</div>
							</div>
						{/each}
					</div>

					<div class="grid gap-4" style="grid-template-columns: 2fr 1fr">
						<!-- Hourly Revenue Chart -->
						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div class="flex items-center justify-between mb-4">
								<div>
									<div style="font-size: 14px; font-weight: 700; color: #0F172A">Distribusi Penjualan per Jam</div>
									<div style="font-size: 11px; color: #64748B">Hari ini, 24 jam</div>
								</div>
								<div class="flex items-center gap-3" style="font-size: 11px; color: #64748B">
									<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm" style="background: #2563EB"></span> Revenue</span>
								</div>
							</div>
							<svg viewBox="0 0 480 160" style="width: 100%; height: 160px">
								<!-- Grid lines -->
								{#each [0, 40, 80, 120] as y}
									<line x1="30" y1={y + 10} x2="470" y2={y + 10} stroke="#F1F5F9" stroke-width="1" />
								{/each}
								<!-- Bars -->
								{#each summary.hourly_distribution as h, i}
									{@const barHeight = (h.revenue / maxHourly) * 130}
									{@const x = 32 + i * 18}
									<rect
										x={x}
										y={140 - barHeight}
										width="14"
										height={barHeight}
										rx="2"
										fill={h.revenue > 0 ? '#2563EB' : '#E2E8F0'}
										opacity={h.revenue > 0 ? 0.85 : 1}
									>
										<title>{h.hour}:00 — {fmtCompact(h.revenue)} ({h.tx_count} tx)</title>
									</rect>
								{/each}
								<!-- X axis labels (every 4 hours) -->
								{#each [0, 4, 8, 12, 16, 20] as hr}
									<text x={32 + hr * 18 + 7} y="156" font-size="9" fill="#94A3B8" text-anchor="middle">{String(hr).padStart(2, '0')}</text>
								{/each}
							</svg>
						</div>

						<!-- Payment Method -->
						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Metode Pembayaran</div>
							{#if summary.by_payment_method.length === 0}
								<div class="py-8 text-center" style="font-size: 12px; color: #94A3B8">Belum ada transaksi</div>
							{:else}
								<!-- Donut chart -->
								{@const donutData = summary!.by_payment_method.map((m, i) => {
									const startAngle = summary!.by_payment_method.slice(0, i).reduce((s, x) => s + (x.total / totalByMethod) * 360, 0);
									const endAngle = startAngle + (m.total / totalByMethod) * 360;
									return { ...m, startAngle, endAngle };
								})}
								<svg viewBox="0 0 120 120" style="width: 140px; height: 140px; margin: 0 auto; display: block">
									<circle cx="60" cy="60" r="40" fill="none" stroke="#F1F5F9" stroke-width="20" />
									{#each donutData as seg}
										{@const startRad = (seg.startAngle - 90) * Math.PI / 180}
										{@const endRad = (seg.endAngle - 90) * Math.PI / 180}
										{@const x1 = 60 + 40 * Math.cos(startRad)}
										{@const y1 = 60 + 40 * Math.sin(startRad)}
										{@const x2 = 60 + 40 * Math.cos(endRad)}
										{@const y2 = 60 + 40 * Math.sin(endRad)}
										{@const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0}
										{#if seg.endAngle - seg.startAngle >= 360}
											<circle cx="60" cy="60" r="40" fill="none" stroke={methodColors[seg.payment_method] ?? '#94A3B8'} stroke-width="20" />
										{:else if seg.endAngle - seg.startAngle > 0}
											<path
												d="M {x1} {y1} A 40 40 0 {largeArc} 1 {x2} {y2}"
												fill="none"
												stroke={methodColors[seg.payment_method] ?? '#94A3B8'}
												stroke-width="20"
												stroke-linecap="butt"
											/>
										{/if}
									{/each}
									<text x="60" y="56" text-anchor="middle" font-size="11" fill="#94A3B8">Total</text>
									<text x="60" y="72" text-anchor="middle" font-size="14" font-weight="700" fill="#0F172A">{summary.kpi.transactions}</text>
								</svg>
								<div class="mt-3 space-y-1.5">
									{#each summary.by_payment_method as m}
										<div class="flex items-center justify-between" style="font-size: 12px">
											<div class="flex items-center gap-2">
												<span class="w-2.5 h-2.5 rounded-sm" style="background: {methodColors[m.payment_method] ?? '#94A3B8'}"></span>
												<span style="color: #475569">{methodLabel[m.payment_method] ?? m.payment_method}</span>
											</div>
											<span style="font-weight: 700; color: #0F172A">{m.count}× · {fmtCompact(m.total)}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 mt-4">
						<!-- Top Products -->
						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div class="flex items-center justify-between mb-3">
								<div style="font-size: 14px; font-weight: 700; color: #0F172A">Top 10 Produk Terlaris</div>
								<span style="font-size: 11px; color: #94A3B8">{summary.top_products.length} SKU</span>
							</div>
							{#if summary.top_products.length === 0}
								<div class="py-8 text-center" style="font-size: 12px; color: #94A3B8">Belum ada data penjualan</div>
							{:else}
								<div class="space-y-2">
									{#each summary.top_products.slice(0, 8) as p, i}
										{@const pct = summary.top_products[0].qty_sold > 0 ? (p.qty_sold / summary.top_products[0].qty_sold) * 100 : 0}
										<div class="flex items-center gap-3">
											<div class="w-6 h-6 rounded-md flex items-center justify-center" style="background: #F1F5F9; color: #64748B; font-size: 10px; font-weight: 700">{i + 1}</div>
											<div class="flex-1 min-w-0">
												<div class="flex items-center justify-between mb-1">
													<div class="truncate" style="font-size: 12px; font-weight: 600; color: #0F172A">{p.product_name}</div>
													<div style="font-size: 11px; color: #64748B; white-space: nowrap; margin-left: 8px">{p.qty_sold} × {fmtCompact(p.revenue)}</div>
												</div>
												<div class="h-1.5 rounded-full overflow-hidden" style="background: #F1F5F9">
													<div class="h-full rounded-full" style="width: {pct}%; background: linear-gradient(90deg, #2563EB, #60A5FA)"></div>
												</div>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>

						<!-- Low Stock -->
						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div class="flex items-center justify-between mb-3">
								<div style="font-size: 14px; font-weight: 700; color: #0F172A">Stok Kritis</div>
								<a href="/gudang" class="text-xs font-semibold" style="color: #2563EB; text-decoration: none">Kelola →</a>
							</div>
							{#if summary.low_stock.length === 0}
								<div class="py-8 text-center">
									<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style="background: #D1FAE5">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
									</div>
									<div style="font-size: 13px; font-weight: 600; color: #059669">Semua stok aman ✓</div>
									<div style="font-size: 11px; color: #94A3B8; margin-top: 2px">Tidak ada produk dengan stok ≤ 10</div>
								</div>
							{:else}
								<div class="space-y-1.5">
									{#each summary.low_stock as p}
										<div class="flex items-center justify-between p-2 rounded-lg" style="background: {p.stock === 0 ? '#FEF2F2' : '#FFFBEB'}">
											<div class="flex items-center gap-2 min-w-0">
												<span style="font-size: 11px; font-weight: 700; color: {p.stock === 0 ? '#DC2626' : '#92400E'}; background: {p.stock === 0 ? '#FECACA' : '#FDE68A'}; padding: 1px 6px; border-radius: 4px">{p.stock}</span>
												<span class="truncate" style="font-size: 12px; color: #0F172A">{p.name}</span>
											</div>
											<span style="font-size: 10px; color: #94A3B8">{p.sku}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- Recent transactions -->
					<div class="rounded-2xl p-5 mt-4" style="background: #fff; border: 1px solid #E2E8F0">
						<div class="flex items-center justify-between mb-3">
							<div style="font-size: 14px; font-weight: 700; color: #0F172A">Transaksi Terbaru</div>
							<span style="font-size: 11px; color: #94A3B8">{transactions.length} dalam periode</span>
						</div>
						{#if transactions.length === 0}
							<div class="py-8 text-center" style="font-size: 12px; color: #94A3B8">Belum ada transaksi dalam periode ini</div>
						{:else}
							<div class="overflow-x-auto">
								<table style="width: 100%; font-size: 12px; border-collapse: collapse">
									<thead>
										<tr style="text-align: left; color: #64748B">
											<th class="py-2 px-3" style="font-weight: 600">Invoice</th>
											<th class="py-2 px-3" style="font-weight: 600">Waktu</th>
											<th class="py-2 px-3" style="font-weight: 600">Kasir</th>
											<th class="py-2 px-3" style="font-weight: 600">Member</th>
											<th class="py-2 px-3" style="font-weight: 600">Metode</th>
											<th class="py-2 px-3 text-right" style="font-weight: 600">Total</th>
											<th class="py-2 px-3" style="font-weight: 600">Status</th>
											<th class="py-2 px-3 text-right" style="font-weight: 600">Aksi</th>
											</tr>
											</thead>
											<tbody>
											{#each transactions.slice(0, 10) as t (t.id)}
											<tr style="border-top: 1px solid #F1F5F9">
												<td class="py-2 px-3" style="font-family: 'SF Mono', Monaco, monospace; color: #475569">{t.invoice_no}</td>
												<td class="py-2 px-3" style="color: #64748B">{new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
												<td class="py-2 px-3" style="color: #0F172A">{t.user_name ?? '—'}</td>
												<td class="py-2 px-3" style="color: #64748B">{t.member_name ?? '—'}</td>
												<td class="py-2 px-3">
													<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: {methodColors[t.payment_method] ?? '#94A3B8'}; color: #fff; font-weight: 600; text-transform: uppercase">{methodLabel[t.payment_method] ?? t.payment_method}</span>
												</td>
												<td class="py-2 px-3 text-right" style="font-weight: 700; color: #0F172A">{fmt(t.total)}</td>
												<td class="py-2 px-3">
													{#if t.status === 'void'}
														<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #FEE2E2; color: #991B1B; font-weight: 700">VOID</span>
													{:else}
														<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #D1FAE5; color: #065F46; font-weight: 700">OK</span>
													{/if}
												</td>
												<td class="py-2 px-3 text-right">
													{#if t.status !== 'void'}
														<button
															onclick={() => openReprint(t)}
															disabled={reprintLoading}
															class="inline-flex items-center gap-1 px-2 py-1 rounded transition-all"
															style="font-size: 11px; background: #EFF6FF; color: #2563EB; font-weight: 600; opacity: {reprintLoading ? 0.6 : 1}"
														>
															<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
																<polyline points="6 9 6 2 18 2 18 9" />
																<path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
																<rect x="6" y="14" width="12" height="8" />
															</svg>
															Cetak
														</button>
													{/if}
												</td>
											</tr>
											{/each}
											</tbody>
								</table>
							</div>
						{/if}
					</div>
				</div>

			{:else if activeTab === 'outlet'}
				<div in:fade={{ duration: 150 }}>
					<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
						<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Performa per Outlet</div>
						{#if users.length === 0}
							<div class="py-8 text-center" style="font-size: 12px; color: #94A3B8">Belum ada data outlet</div>
						{:else}
							{@const byOutlet = users.reduce<Record<string, { users: User[]; tx: number; revenue: number }>>((acc, u) => {
								const key = `outlet_${u.outlet_id ?? 0}`;
								const cur = acc[key] ?? { users: [], tx: 0, revenue: 0 };
								cur.users.push(u);
								const userTx = transactions.filter((t) => t.user_id === u.id);
								cur.tx += userTx.length;
								cur.revenue += userTx.reduce((s, t) => s + t.total, 0);
								acc[key] = cur;
								return acc;
							}, {})}
							<div class="space-y-3">
								{#each Object.entries(byOutlet) as [key, data]}
									<div class="rounded-xl p-4" style="background: #F8FAFC; border: 1px solid #E2E8F0">
										<div class="flex items-center justify-between mb-3">
											<div>
												<div style="font-size: 13px; font-weight: 700; color: #0F172A">Outlet #{key.split('_')[1]}</div>
												<div style="font-size: 11px; color: #64748B">{data.users.length} akun</div>
											</div>
											<div class="text-right">
												<div style="font-size: 16px; font-weight: 800; color: #059669">{fmt(data.revenue)}</div>
												<div style="font-size: 11px; color: #64748B">{data.tx} transaksi</div>
											</div>
										</div>
										<div class="grid grid-cols-3 gap-2">
											{#each data.users as u}
												<div class="rounded-lg p-2" style="background: #fff">
													<div style="font-size: 12px; font-weight: 600; color: #0F172A">{u.full_name}</div>
													<div style="font-size: 10px; color: #64748B">{u.role} · @{u.username}</div>
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

			{:else if activeTab === 'shift'}
				<div in:fade={{ duration: 150 }}>
					<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
						<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Performa Kasir</div>
						{#if users.length === 0}
							<div class="py-8 text-center" style="font-size: 12px; color: #94A3B8">Belum ada akun</div>
						{:else}
							<table style="width: 100%; font-size: 12px; border-collapse: collapse">
								<thead>
									<tr style="text-align: left; color: #64748B; border-bottom: 1px solid #E2E8F0">
										<th class="py-2 px-3" style="font-weight: 600">Nama</th>
										<th class="py-2 px-3" style="font-weight: 600">Role</th>
										<th class="py-2 px-3" style="font-weight: 600">Outlet</th>
										<th class="py-2 px-3 text-right" style="font-weight: 600">Transaksi</th>
										<th class="py-2 px-3 text-right" style="font-weight: 600">Revenue</th>
									</tr>
								</thead>
								<tbody>
									{#each userPerformance as perf}
										<tr style="border-top: 1px solid #F1F5F9">
											<td class="py-2 px-3" style="font-weight: 600; color: #0F172A">{perf.user.full_name}</td>
											<td class="py-2 px-3">
												<span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: {perf.user.role === 'kasir' ? '#DBEAFE' : perf.user.role === 'manager' ? '#D1FAE5' : '#EDE9FE'}; color: {perf.user.role === 'kasir' ? '#1E40AF' : perf.user.role === 'manager' ? '#065F46' : '#5B21B6'}; font-weight: 700; text-transform: uppercase">{perf.user.role}</span>
											</td>
											<td class="py-2 px-3" style="color: #64748B">#{perf.user.outlet_id ?? '—'}</td>
											<td class="py-2 px-3 text-right" style="font-weight: 600; color: #0F172A">{perf.transactions}</td>
											<td class="py-2 px-3 text-right" style="font-weight: 700; color: #059669">{fmt(perf.revenue)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{/if}
					</div>
				</div>

			{:else if activeTab === 'persetujuan'}
				<div in:fade={{ duration: 150 }}>
					<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
						<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4">Antrean Persetujuan</div>
						<div style="font-size: 11px; color: #64748B; margin-bottom: 16px">Transaksi void menunggu audit · {voidTx.length} item</div>
						{#if voidTx.length === 0}
							<div class="py-8 text-center">
								<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style="background: #D1FAE5">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
								</div>
								<div style="font-size: 13px; font-weight: 600; color: #059669">Tidak ada antrean</div>
								<div style="font-size: 11px; color: #94A3B8; margin-top: 2px">Semua transaksi sudah diaudit</div>
							</div>
						{:else}
							<div class="space-y-2">
								{#each voidTx as t (t.id)}
									<div class="rounded-xl p-3 flex items-center gap-3" style="background: #FEF2F2; border: 1px solid #FECACA">
										<div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: #FEE2E2">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
										</div>
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-0.5">
												<div style="font-family: 'SF Mono', Monaco, monospace; font-size: 12px; font-weight: 700; color: #991B1B">{t.invoice_no}</div>
												<span style="font-size: 10px; padding: 1px 5px; border-radius: 3px; background: #DC2626; color: #fff; font-weight: 700">VOID</span>
											</div>
											<div style="font-size: 11px; color: #64748B">
												{new Date(t.created_at).toLocaleString('id-ID')} · {t.user_name ?? '—'} · {t.note ?? 'Tanpa alasan'}
											</div>
										</div>
										<div style="font-size: 13px; font-weight: 700; color: #991B1B">−{fmt(t.total)}</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

			{:else if activeTab === 'telegram'}
				<div in:fade={{ duration: 150 }}>
					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Konfigurasi Bot Telegram</div>
							<div class="space-y-3">
								<label class="block">
									<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Bot Token</span>
									<input
										type="password"
										bind:value={telegram.botToken}
										placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz"
										class="w-full mt-1 px-3 py-2 rounded-lg"
										style="font-size: 12px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace"
									/>
								</label>
								<label class="block">
									<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Chat ID</span>
									<input
										type="text"
										bind:value={telegram.chatId}
										placeholder="-1001234567890"
										class="w-full mt-1 px-3 py-2 rounded-lg"
										style="font-size: 12px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace"
									/>
								</label>
								<button
									onclick={() => alert('Test notifikasi akan dikirim (fitur demo, belum tersambung ke Telegram API)')}
									class="w-full py-2 rounded-lg"
									style="background: #0088CC; color: #fff; font-size: 12px; font-weight: 700"
								>
									Kirim Test Notification
								</button>
							</div>
						</div>

						<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
							<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 12px">Notifikasi Otomatis</div>
							<div class="space-y-2">
								{#each [
									{ key: 'notifLowStock', label: 'Stok kritis', desc: 'Alert jika stok ≤ 10' },
									{ key: 'notifBigSale', label: 'Transaksi besar', desc: 'Transaksi di atas threshold' },
									{ key: 'notifVoid', label: 'Void / Pembatalan', desc: 'Semua transaksi yang di-void' },
									{ key: 'notifShiftEnd', label: 'Akhir shift', desc: 'Laporan saat kasir logout' },
								] as opt}
									<label class="flex items-center justify-between p-3 rounded-lg cursor-pointer" style="background: #F8FAFC">
										<div>
											<div style="font-size: 12px; font-weight: 600; color: #0F172A">{opt.label}</div>
											<div style="font-size: 11px; color: #64748B">{opt.desc}</div>
										</div>
										<input type="checkbox" bind:checked={telegram[opt.key as keyof typeof telegram] as boolean} class="w-4 h-4" />
									</label>
								{/each}

								<div class="pt-3 mt-3" style="border-top: 1px solid #E2E8F0">
																	<label for="telegram-threshold" style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Threshold "Transaksi Besar"</label>
																	<input
																		id="telegram-threshold"
																		type="number"
																		bind:value={telegram.threshold}
																		class="w-full mt-1 px-3 py-2 rounded-lg"
																		style="font-size: 12px; border: 1px solid #E2E8F0"
																	/>
																	<div style="font-size: 10px; color: #94A3B8; margin-top: 4px">Saat ini: {fmt(telegram.threshold)}</div>
																</div>
							</div>
						</div>
					</div>

					<div class="rounded-2xl p-5 mt-4" style="background: #FEF3C7; border: 1px solid #FCD34D">
						<div class="flex items-start gap-3">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2" style="margin-top: 2px; flex-shrink: 0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
							<div>
								<div style="font-size: 13px; font-weight: 700; color: #92400E">Fitur Telegram masih demo</div>
								<div style="font-size: 12px; color: #78350F; margin-top: 4px">UI tersedia, tapi belum tersambung ke Telegram Bot API. Untuk integrasi penuh, nanti tinggal swap `telegram.send()` di API layer dengan `fetch('https://api.telegram.org/...')`.</div>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'member'}
				<div in:fade={{ duration: 150 }}>
					<!-- KPI cards -->
					<div class="grid grid-cols-4 gap-4 mb-5">
						<div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #E2E8F0">
							<div style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase">Total Member</div>
							<div style="font-size: 24px; font-weight: 700; color: #0F172A; margin-top: 4px">{memberStats.total}</div>
						</div>
						<div class="rounded-2xl p-4" style="background: #F8FAFC; border: 1px solid #E2E8F0">
							<div style="font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase">🥈 Silver</div>
							<div style="font-size: 24px; font-weight: 700; color: #64748B; margin-top: 4px">{memberStats.silver}</div>
						</div>
						<div class="rounded-2xl p-4" style="background: #FEF3C7; border: 1px solid #FCD34D">
							<div style="font-size: 11px; color: #92400E; font-weight: 600; text-transform: uppercase">🥇 Gold</div>
							<div style="font-size: 24px; font-weight: 700; color: #B45309; margin-top: 4px">{memberStats.gold}</div>
						</div>
						<div class="rounded-2xl p-4" style="background: #DBEAFE; border: 1px solid #93C5FD">
							<div style="font-size: 11px; color: #1E40AF; font-weight: 600; text-transform: uppercase">💎 Platinum</div>
							<div style="font-size: 24px; font-weight: 700; color: #1E40AF; margin-top: 4px">{memberStats.platinum}</div>
						</div>
					</div>

					<!-- Toolbar -->
					<div class="rounded-2xl p-4 mb-4 flex items-center gap-3" style="background: #fff; border: 1px solid #E2E8F0">
						<input
							type="text"
							bind:value={memberSearch}
							placeholder="🔍 Cari nama, HP, ID, email..."
							class="flex-1 px-3 py-2 rounded-lg"
							style="font-size: 13px; border: 1px solid #E2E8F0"
						/>
						<select
							bind:value={memberTierFilter}
							class="px-3 py-2 rounded-lg"
							style="font-size: 13px; border: 1px solid #E2E8F0; min-width: 120px"
						>
							<option value="all">Semua Tier</option>
							<option value="Silver">🥈 Silver</option>
							<option value="Gold">🥇 Gold</option>
							<option value="Platinum">💎 Platinum</option>
						</select>
						<select
							bind:value={memberSortBy}
							class="px-3 py-2 rounded-lg"
							style="font-size: 13px; border: 1px solid #E2E8F0; min-width: 140px"
						>
							<option value="name">Urut: Nama (A-Z)</option>
							<option value="points">Urut: Poin Terbanyak</option>
							<option value="lifetime">Urut: Lifetime Terbanyak</option>
							<option value="recent">Urut: Transaksi Terbaru</option>
						</select>
						<button
							onclick={openCreateMember}
							class="px-4 py-2 rounded-lg text-white font-semibold"
							style="background: #2563EB; font-size: 13px"
						>
							➕ Tambah Member
						</button>
					</div>

					<!-- Member table -->
					<div class="rounded-2xl" style="background: #fff; border: 1px solid #E2E8F0; overflow: hidden">
						<div class="overflow-x-auto">
							<table class="w-full" style="font-size: 13px">
								<thead>
									<tr style="background: #F8FAFC; border-bottom: 1px solid #E2E8F0">
										<th class="text-left py-3 px-4" style="font-weight: 600; color: #475569">ID</th>
										<th class="text-left py-3 px-4" style="font-weight: 600; color: #475569">Nama</th>
										<th class="text-left py-3 px-4" style="font-weight: 600; color: #475569">No. HP</th>
										<th class="text-left py-3 px-4" style="font-weight: 600; color: #475569">Tier</th>
										<th class="text-right py-3 px-4" style="font-weight: 600; color: #475569">Poin</th>
										<th class="text-right py-3 px-4" style="font-weight: 600; color: #475569">Lifetime</th>
										<th class="text-left py-3 px-4" style="font-weight: 600; color: #475569">Tx Terakhir</th>
										<th class="text-center py-3 px-4" style="font-weight: 600; color: #475569">Aksi</th>
									</tr>
								</thead>
								<tbody>
									{#each filteredMembers as m (m.id)}
										<tr style="border-bottom: 1px solid #F1F5F9" class="hover:bg-gray-50">
											<td class="py-3 px-4">
												<code style="background: #F1F5F9; padding: 2px 6px; border-radius: 3px; font-size: 11px">{m.id}</code>
											</td>
											<td class="py-3 px-4" style="font-weight: 600; color: #0F172A">{m.name}</td>
											<td class="py-3 px-4" style="color: #64748B">{m.phone}</td>
											<td class="py-3 px-4">
												<TierBadge tier={m.tier} size="sm" />
											</td>
											<td class="py-3 px-4 text-right" style="font-weight: 600; color: #2563EB">{m.points}</td>
											<td class="py-3 px-4 text-right" style="color: #64748B">{fmtIDR(m.lifetime_spend ?? 0)}</td>
											<td class="py-3 px-4" style="color: #64748B; font-size: 12px">
												{m.last_transaction_at
													? new Date(m.last_transaction_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' })
													: '—'}
											</td>
											<td class="py-3 px-4">
												<div class="flex items-center justify-center gap-1">
													<button
														onclick={() => openViewMember(m)}
														class="px-2 py-1 rounded text-xs"
														style="background: #DBEAFE; color: #1E40AF; font-weight: 600"
														title="Lihat detail"
													>
														👁️
													</button>
													<button
														onclick={() => openEditMember(m)}
														class="px-2 py-1 rounded text-xs"
														style="background: #FEF3C7; color: #92400E; font-weight: 600"
														title="Edit"
													>
														✏️
													</button>
													<button
														onclick={() => handleDeleteMember(m)}
														class="px-2 py-1 rounded text-xs"
														style="background: #FEE2E2; color: #991B1B; font-weight: 600"
														title="Hapus"
													>
														🗑️
													</button>
												</div>
											</td>
										</tr>
									{/each}
									{#if filteredMembers.length === 0}
										<tr>
											<td colspan="8" class="py-8 text-center" style="color: #94A3B8">
												{memberSearch || memberTierFilter !== 'all'
													? 'Tidak ada member yang cocok dengan filter'
													: 'Belum ada member. Klik "➕ Tambah Member" untuk membuat.'}
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</main>

	<!-- ── Reprint preview modal ────────────────────────────────────────────────── -->
	{#if reprintOpen && reprintTx}
		<PrintPreview
			bind:open={reprintOpen}
			transaction={reprintTx}
			isReprint
			onclose={() => { reprintOpen = false; }}
		/>
	{/if}

	<!-- ── Backup & Restore modal ────────────────────────────────────────────── -->
	<BackupRestore
		open={showBackup}
		onClose={() => {
			showBackup = false;
			// Refresh stale badge setelah modal close (mis. baru export)
			backupStale = isBackupStale(7);
		}}
		showToast={showToast}
	/>

	<!-- ── Member Form modal (Fase E) ─────────────────────────────────────────── -->
	{#if showMemberForm}
		<MemberForm
			member={editingMember}
			onsave={handleSaveMember}
			onclose={() => {
				showMemberForm = false;
				editingMember = null;
			}}
			showToast={showMemberToast}
		/>
	{/if}

	<!-- ── Member Detail modal (Fase E) ───────────────────────────────────────── -->
	{#if viewingMember}
		<MemberDetail
			member={viewingMember}
			onclose={() => (viewingMember = null)}
			onedit={(m) => {
				viewingMember = null;
				editingMember = m;
				showMemberForm = true;
			}}
			showToast={showMemberToast}
		/>
	{/if}

	<!-- ── Member toast (Fase E) ──────────────────────────────────────────────── -->
	{#if memberToast}
		<div
			class="fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-2xl"
			style="
				background: {memberToast.kind === 'success' ? '#10B981' : memberToast.kind === 'error' ? '#DC2626' : '#2563EB'};
				color: white;
				font-size: 13px;
				font-weight: 600;
				z-index: 2000;
				max-width: 400px;
			"
		>
			{memberToast.kind === 'success' ? '✓' : memberToast.kind === 'error' ? '✕' : 'ⓘ'} {memberToast.msg}
		</div>
	{/if}
</RoleShell>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
