<!--
  /owner/manage — Kelola Outlet page
  Layout match Role_Owner/stitch_hekas_minimarket_pos_ui(1)/screen.png:
  - Slim sidebar (80px) via RoleShell
  - Header: "Kelola Outlet" + subtitle
  - Filter bar: search + status dropdown + Tambah Outlet button
  - Table 5 columns: Nama Outlet | Store Manager | Jumlah Karyawan | Status | Aksi
  - Pagination footer
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { clientGuard } from '$lib/auth/guard';
	import { api } from '$lib/api';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import OutletFilterBar, { type StatusFilter } from '$lib/components/owner/Manage/OutletFilterBar.svelte';
	import OutletTable, { type Outlet } from '$lib/components/owner/Manage/OutletTable.svelte';
	import OutletPagination from '$lib/components/owner/Manage/OutletPagination.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { User } from '$lib/types/domain';

	// Auth guard
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

	// ─── Mock data (replace with API when BE ready) ────────────────────────
	const allOutlets: Outlet[] = [
		{ id: 'o-001', name: 'Duamart Pusat', address: 'Yogyakarta', manager: 'Budi', employeesCount: 12, status: 'aktif' },
		{ id: 'o-002', name: 'Duamart Malioboro', address: 'Yogyakarta', manager: 'Andi', employeesCount: 9, status: 'aktif' },
		{ id: 'o-003', name: 'Duamart Sleman', address: 'Sleman', manager: 'Siti', employeesCount: 15, status: 'maintenance' },
		{ id: 'o-004', name: 'Duamart Bantul', address: 'Bantul', manager: 'Joko', employeesCount: 8, status: 'aktif' },
		{ id: 'o-005', name: 'Duamart Magelang', address: 'Magelang', manager: 'Rina', employeesCount: 11, status: 'aktif' },
		{ id: 'o-006', name: 'Duamart Solo', address: 'Surakarta', manager: 'Dedi', employeesCount: 14, status: 'aktif' },
		{ id: 'o-007', name: 'Duamart Semarang', address: 'Semarang', manager: 'Tono', employeesCount: 18, status: 'aktif' },
		{ id: 'o-008', name: 'Duamart Solo Baru', address: 'Sukoharjo', manager: 'Lia', employeesCount: 6, status: 'tutup' },
		{ id: 'o-009', name: 'Duamart Klaten', address: 'Klaten', manager: 'Yusuf', employeesCount: 10, status: 'aktif' },
		{ id: 'o-010', name: 'Duamart Wates', address: 'Wates', manager: 'Maya', employeesCount: 7, status: 'maintenance' },
		{ id: 'o-011', name: 'Duamart Cilacap', address: 'Cilacap', manager: 'Riko', employeesCount: 9, status: 'aktif' },
		{ id: 'o-012', name: 'Duamart Purwokerto', address: 'Purwokerto', manager: 'Sari', employeesCount: 13, status: 'aktif' }
	];

	// ─── State ───────────────────────────────────────────────────────────────
	let search = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let currentPage = $state(1);
	const PAGE_SIZE = 3;

	// Filtered list
	const filtered = $derived(
		allOutlets.filter((o) => {
			if (statusFilter !== 'all' && o.status !== statusFilter) return false;
			if (search.trim()) {
				const t = search.toLowerCase();
				const haystack = `${o.name} ${o.address} ${o.manager}`.toLowerCase();
				if (!haystack.includes(t)) return false;
			}
			return true;
		})
	);

	// Pagination
	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const pagedOutlets = $derived(
		filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
	);

	// Reset page when filter changes
	$effect(() => {
		// Re-derive page when search/status changes
		void search;
		void statusFilter;
		currentPage = 1;
	});

	function handleAdd() {
		showInfo('Tambah Outlet (TODO: open form modal)');
	}
</script>

<svelte:head>
	<title>Kelola Outlet · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="owner"
	title="Kelola Outlet"
	subtitle="Kelola seluruh outlet bisnis Anda dalam satu tempat."
	user={currentUser}
	onlogout={handleLogout}
>
	<div class="space-y-4">
		<OutletFilterBar
			{search}
			{statusFilter}
			onsearchChange={(v) => (search = v)}
			onstatusChange={(v) => (statusFilter = v)}
			onadd={handleAdd}
		/>

		<OutletTable outlets={pagedOutlets} />

		<OutletPagination
			{currentPage}
			{totalPages}
			totalCount={filtered.length}
			pageSize={PAGE_SIZE}
			onpageChange={(p) => (currentPage = p)}
		/>
	</div>
</RoleShell>