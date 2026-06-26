<!--
  /gudang/beranda — Gudang Dashboard
  Layout match referensi Role_Gudang screenshot 1.
  Struktur: RoleShell + PageHeader + 6 KPI cards + 2-col (Tugas | Stok Menipis) + 2-col (Aktivitas | Pengiriman)
  Tab inventaris/mutasi existing functionality di-maintain di section bawah.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { api } from '$lib/api';
	import type { Product } from '$lib/types/domain';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import DashboardSummary from '$lib/components/gudang/Beranda/DashboardSummary.svelte';
	import TodayTasks from '$lib/components/gudang/Beranda/TodayTasks.svelte';
	import LowStockAlert from '$lib/components/gudang/Beranda/LowStockAlert.svelte';
	import RecentActivity from '$lib/components/gudang/Beranda/RecentActivity.svelte';
	import PengirimanSupplier from '$lib/components/gudang/Beranda/PengirimanSupplier.svelte';

	const currentUser = { full_name: 'Admin Gudang', role: 'gudang' as const };
	async function handleLogout() {
		await api.auth.logout();
		goto('/login');
	}

	type TabId = 'inventaris' | 'mutasi';
	let activeTab = $state<TabId>('inventaris');

	let products = $state<Product[]>([]);
	let categories = $state<{ id: string; label: string; name?: string; icon?: string }[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Search & filter (tab inventaris)
	let search = $state('');
	let filterCategory = $state('all');
	let filterStatus = $state<'all' | 'low' | 'critical' | 'ok'>('all');

	// Edit modal
	let editingId = $state<number | null>(null);
	let editForm = $state<Partial<Product>>({});
	let editError = $state<string | null>(null);

	// Create modal
	let showCreate = $state(false);
	let createForm = $state<Partial<Product> & { barcode?: string }>({});
	let createError = $state<string | null>(null);

	// Mutasi form
	let mutasiProductId = $state<number | ''>('');
	let mutasiDelta = $state(0);
	let mutasiReason = $state('restock');

	let toast = $state<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);

	const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

	function statusOf(p: Product): 'ok' | 'low' | 'critical' {
		if (p.stock === 0) return 'critical';
		if (p.stock <= 10) return 'low';
		return 'ok';
	}

	const STATUS_CFG = {
		ok: { label: 'Normal', bg: '#D1FAE5', fg: '#065F46' },
		low: { label: 'Hampir Habis', bg: '#FEF3C7', fg: '#92400E' },
		critical: { label: 'Kritis', bg: '#FEE2E2', fg: '#991B1B' }
	} as const;

	function showToast(kind: 'success' | 'error' | 'info', text: string) {
		toast = { kind, text };
		setTimeout(() => { if (toast?.text === text) toast = null; }, 3500);
	}

	async function loadAll() {
		try {
			loading = true;
			error = null;
			const [prods, cats] = await Promise.all([
				api.products.listProducts(),
				api.products.listCategories()
			]);
			products = prods;
			categories = cats.map((cat) => ({ id: cat.id, label: cat.name, name: cat.name, icon: cat.icon }));
		} catch (e: any) {
			error = e.message ?? 'Gagal memuat data';
		} finally {
			loading = false;
		}
	}

	onMount(loadAll);

	const filtered = $derived(products.filter((p) => {
		const st = statusOf(p);
		if (filterStatus !== 'all' && st !== filterStatus) return false;
		if (filterCategory !== 'all' && p.category !== filterCategory) return false;
		if (search.trim()) {
			const t = search.toLowerCase();
			if (!p.name.toLowerCase().includes(t) && !p.sku.toLowerCase().includes(t) && !p.barcode.includes(t)) return false;
		}
		return true;
	}));

	// ─── KPI computation (ringkasan) ────────────────────────────────────
	const kpiBarangMasukMenunggu = 12;
	const kpiBarangKeluarMenunggu = 8;
	const kpiSuratJalanPending = 3;
	const kpiStokMenipis = $derived(products.filter((p) => statusOf(p) !== 'ok').length);
	const kpiRestockDisetujui = 8;
	const kpiTotalSkuAktif = $derived(products.filter((p) => p.is_active).length);

	// ─── Mock data for new sections (bisa diganti API real nanti) ──────
	const todayTasks = [
		{
			id: 't1',
			type: 'unloading' as const,
			title: 'Unloading: Supplier Maju Jaya',
			supplier: 'PT Maju Jaya',
			location: 'Area Loading Dock A',
			timeAgo: '15 Menit yang lalu',
			status: 'proses' as const
		},
		{
			id: 't2',
			type: 'pickup' as const,
			title: 'Pick-up: Kurir J&T (Order #4928)',
			location: 'Area Pengiriman',
			schedule: 'Estimasi 14:00',
			status: 'menunggu' as const
		},
		{
			id: 't3',
			type: 'stockopname' as const,
			title: 'Stock Opname: Rak B-12 s/d B-20',
			supplier: 'Auditor: Budi',
			schedule: 'Jadwal Mingguan',
			status: 'terjadwal' as const
		}
	];

	const lowStockItems = $derived(
		products
			.filter((p) => p.stock <= (p.min_stock ?? 10))
			.slice(0, 3)
			.map((p) => ({
				id: String(p.id),
				name: p.name,
				sku: p.sku,
				current: p.stock,
				min: p.min_stock ?? 10,
				unit: p.unit ?? 'pcs',
				severity: (p.stock === 0 ? 'KRITIS' : 'RENDAH') as 'KRITIS' | 'RENDAH'
			}))
	);

	const recentActivities = [
		{ id: 'a1', user: 'Namira', action: 'menambahkan 50 unit ke Rak A-04 untuk', target: 'Minyak Goreng 2L', at: Date.now() - 15 * 60 * 1000 },
		{ id: 'a2', user: 'Budi', action: 'menyelesaikan stock opname', target: 'Rak B-01 s/d B-10', at: Date.now() - 75 * 60 * 1000 }
	];

	const shipments = [
		{ id: 's1', courier: 'J&T Express', packageCount: 8, schedule: 'Pickup 16:00', status: 'SIAP' as const },
		{ id: 's2', courier: 'SiCepat', packageCount: 3, schedule: 'Pickup 17:30', status: 'PENDING' as const }
	];

	function goToTab(tab: TabId) {
		activeTab = tab;
		// Scroll to tab content
		setTimeout(() => {
			document.getElementById('tab-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 50);
	}

	// ─── Tab content (existing logic) ────────────────────────────────
	function openEdit(p: Product) {
		editingId = p.id;
		editForm = { ...p };
	}
	function closeEdit() {
		editingId = null;
		editForm = {};
		editError = null;
	}
	async function saveEdit() {
		if (editingId == null) return;
		try {
			saving = true;
			editError = null;
			await api.products.updateProduct(String(editingId), editForm);
			showToast('success', 'Produk berhasil diperbarui');
			closeEdit();
			await loadAll();
		} catch (e: any) {
			editError = e.message ?? 'Gagal menyimpan';
		} finally {
			saving = false;
		}
	}

	function openCreate() {
		showCreate = true;
		createForm = { unit: 'pcs' };
	}
	function closeCreate() {
		showCreate = false;
		createForm = {};
		createError = null;
	}
	async function saveCreate() {
		try {
			saving = true;
			createError = null;
			if (!createForm.name || !createForm.sku || createForm.price == null) {
				throw new Error('Field wajib belum diisi');
			}
			await api.products.createProduct({
				...createForm,
				is_active: true
			} as any);
			showToast('success', 'Produk baru ditambahkan');
			closeCreate();
			await loadAll();
		} catch (e: any) {
			createError = e.message ?? 'Gagal menambah';
		} finally {
			saving = false;
		}
	}

	async function saveMutasi() {
		if (mutasiProductId === '') {
			showToast('error', 'Pilih produk terlebih dahulu');
			return;
		}
		if (mutasiDelta === 0) {
			showToast('error', 'Delta mutasi tidak boleh 0');
			return;
		}
		try {
			saving = true;
			await api.products.updateStock(String(mutasiProductId), mutasiDelta);
			showToast('success', `Mutasi stok ${mutasiDelta > 0 ? '+' : ''}${mutasiDelta} berhasil`);
			mutasiProductId = '';
			mutasiDelta = 0;
			await loadAll();
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal mutasi');
		} finally {
			saving = false;
		}
	}
</script>

<RoleShell role="gudang" title="Ringkasan Gudang Hari Ini" subtitle="Operasional: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Status Gudang: Optimal" user={currentUser} onlogout={handleLogout}>

	<!-- KPI Strip (6 cards) -->
	<DashboardSummary
		barangMasukMenunggu={kpiBarangMasukMenunggu}
		barangKeluarMenunggu={kpiBarangKeluarMenunggu}
		suratJalanPending={kpiSuratJalanPending}
		stokMenipis={kpiStokMenipis}
		restockPerluDisetujui={kpiRestockDisetujui}
		totalSkuAktif={kpiTotalSkuAktif}
	/>

	<!-- Row 2: Tugas Gudang + Stok Menipis -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
		<TodayTasks tasks={todayTasks} onTaskClick={() => {}} onViewAll={() => {}} />
		<LowStockAlert items={lowStockItems} onRestockItem={() => {}} onRestockMassal={() => {}} />
	</div>

	<!-- Row 3: Aktivitas + Pengiriman -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
		<div class="bg-white border border-slate-200 rounded-lg shadow-sm">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="12" cy="12" r="10"/>
							<polyline points="12 6 12 12 16 14"/>
						</svg>
					</div>
					<h3 class="text-base font-semibold text-slate-900">Aktivitas Gudang Terbaru</h3>
				</div>
				<button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Lihat Log</button>
			</div>
			<div class="p-4">
				<RecentActivity activities={recentActivities} limit={10} />
			</div>
		</div>
		<PengirimanSupplier shipments={shipments} onViewLog={() => {}} />
	</div>

	<!-- Tab section (Inventaris + Mutasi Stok) -->
	<div id="tab-section" class="mt-8">
		<div class="flex items-center gap-6 border-b border-slate-200 mb-4">
			<button
				type="button"
				class="pb-3 text-sm font-semibold border-b-2 transition-colors {activeTab === 'inventaris' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}"
				onclick={() => goToTab('inventaris')}
			>
				📦 Inventaris ({products.length})
			</button>
			<button
				type="button"
				class="pb-3 text-sm font-semibold border-b-2 transition-colors {activeTab === 'mutasi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}"
				onclick={() => goToTab('mutasi')}
			>
				🔄 Mutasi Stok
			</button>
		</div>

		{#if activeTab === 'inventaris'}
			<!-- Inventaris tab -->
			<div class="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
				<div class="flex items-center justify-between mb-4">
					<div class="flex items-center gap-3 flex-1 max-w-2xl">
						<input bind:value={search} type="search" placeholder="Cari nama, SKU, atau barcode..." class="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
						<select bind:value={filterCategory} class="px-3 py-2 rounded-lg border border-slate-200 text-sm">
							<option value="all">Semua Kategori</option>
							{#each categories.filter((c) => c.id !== 'all') as c}
								<option value={c.id}>{c.label}</option>
							{/each}
						</select>
						<select bind:value={filterStatus} class="px-3 py-2 rounded-lg border border-slate-200 text-sm">
							<option value="all">Semua Status</option>
							<option value="ok">Normal</option>
							<option value="low">Hampir Habis</option>
							<option value="critical">Kritis</option>
						</select>
					</div>
					<button type="button" onclick={openCreate} class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
						+ Tambah Produk
					</button>
				</div>

				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
								<th class="py-3 px-2">SKU</th>
								<th class="py-3 px-2">Nama</th>
								<th class="py-3 px-2">Kategori</th>
								<th class="py-3 px-2 text-right">Stok</th>
								<th class="py-3 px-2 text-right">Harga Jual</th>
								<th class="py-3 px-2">Status</th>
								<th class="py-3 px-2 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody>
							{#each filtered as p (p.id)}
								{@const st = STATUS_CFG[statusOf(p)]}
								<tr class="border-b border-slate-100 hover:bg-slate-50">
									<td class="py-2.5 px-2 font-mono text-xs text-slate-600">{p.sku}</td>
									<td class="py-2.5 px-2 font-semibold text-slate-900">{p.name}</td>
									<td class="py-2.5 px-2 text-slate-600">{p.category}</td>
									<td class="py-2.5 px-2 text-right font-semibold">{p.stock}</td>
									<td class="py-2.5 px-2 text-right">{fmt(p.price)}</td>
									<td class="py-2.5 px-2">
										<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style="background: {st.bg}; color: {st.fg}">{st.label}</span>
									</td>
									<td class="py-2.5 px-2 text-right">
										<button type="button" onclick={() => openEdit(p)} class="text-blue-600 hover:text-blue-700 text-xs font-semibold">Edit</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<!-- Mutasi tab -->
			<div class="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
				<h3 class="text-base font-semibold text-slate-900 mb-4">Mutasi Stok Manual</h3>
				<div class="grid grid-cols-1 md:grid-cols-4 gap-3">
					<select bind:value={mutasiProductId} class="px-3 py-2 rounded-lg border border-slate-200 text-sm">
						<option value="">Pilih produk...</option>
						{#each products as p}
							<option value={p.id}>{p.name} ({p.sku})</option>
						{/each}
					</select>
					<input type="number" bind:value={mutasiDelta} placeholder="Delta (mis: +50)" class="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
					<select bind:value={mutasiReason} class="px-3 py-2 rounded-lg border border-slate-200 text-sm">
						<option value="restock">Restock</option>
						<option value="sale">Penjualan</option>
						<option value="damage">Kerusakan</option>
						<option value="correction">Koreksi</option>
					</select>
					<button type="button" onclick={saveMutasi} disabled={saving} class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
						{saving ? 'Menyimpan…' : 'Simpan Mutasi'}
					</button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Edit Modal -->
	{#if editingId !== null}
		<div class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)" onclick={(e) => { if (e.target === e.currentTarget) closeEdit(); }} onkeydown={(e) => { if (e.key === 'Escape') closeEdit(); }} transition:fade={{ duration: 150 }} role="dialog" aria-modal="true" tabindex="-1">
			<div class="rounded-3xl overflow-hidden shadow-2xl" style="background: #fff; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto" transition:scale={{ duration: 200, start: 0.92, easing: cubicOut }}>
				<div class="flex items-center justify-between px-5 py-4 bg-blue-600">
					<span class="text-white text-[15px] font-bold">Edit Produk</span>
					<button onclick={closeEdit} aria-label="Close">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); saveEdit(); }} class="p-5 space-y-3">
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Nama Produk</span>
						<input bind:value={editForm.name} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" />
					</label>
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Harga (Rp)</span>
						<input type="number" bind:value={editForm.price} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" />
					</label>
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Stok</span>
						<input type="number" bind:value={editForm.stock} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" />
					</label>
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Kategori</span>
						<select bind:value={editForm.category} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white">
							{#each categories.filter((c) => c.id !== 'all') as c}
								<option value={c.id}>{c.label}</option>
							{/each}
						</select>
					</label>
					{#if editError}
						<div class="px-3 py-2 rounded-lg flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
							{editError}
						</div>
					{/if}
					<div class="flex gap-2 pt-2">
						<button type="button" onclick={closeEdit} class="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-semibold">Batal</button>
						<button type="submit" disabled={saving} class="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-bold disabled:opacity-60">
							{saving ? 'Menyimpan…' : 'Simpan'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Create Modal -->
	{#if showCreate}
		<div class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)" onclick={(e) => { if (e.target === e.currentTarget) closeCreate(); }} onkeydown={(e) => { if (e.key === 'Escape') closeCreate(); }} transition:fade={{ duration: 150 }} role="dialog" aria-modal="true" tabindex="-1">
			<div class="rounded-3xl overflow-hidden shadow-2xl" style="background: #fff; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto" transition:scale={{ duration: 200, start: 0.92, easing: cubicOut }}>
				<div class="flex items-center justify-between px-5 py-4 bg-emerald-600">
					<span class="text-white text-[15px] font-bold">Tambah Produk Baru</span>
					<button onclick={closeCreate} aria-label="Close">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); saveCreate(); }} class="p-5 space-y-3">
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Nama Produk</span>
						<input bind:value={createForm.name} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" placeholder="Contoh: Teh Pucuk 350ml" />
					</label>
					<div class="grid grid-cols-2 gap-3">
						<label class="block">
							<span class="text-[11px] font-semibold text-slate-500 uppercase">SKU</span>
							<input bind:value={createForm.sku} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200 font-mono" placeholder="MNM006" />
						</label>
						<label class="block">
							<span class="text-[11px] font-semibold text-slate-500 uppercase">Barcode</span>
							<input bind:value={createForm.barcode} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200 font-mono" placeholder="8991234567890" />
						</label>
					</div>
					<label class="block">
						<span class="text-[11px] font-semibold text-slate-500 uppercase">Kategori</span>
						<select bind:value={createForm.category} required class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white">
							{#each categories.filter((c) => c.id !== 'all') as c}
								<option value={c.id}>{c.label}</option>
							{/each}
						</select>
					</label>
					<div class="grid grid-cols-3 gap-3">
						<label class="block">
							<span class="text-[11px] font-semibold text-slate-500 uppercase">Harga (Rp)</span>
							<input type="number" bind:value={createForm.price} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" />
						</label>
						<label class="block">
							<span class="text-[11px] font-semibold text-slate-500 uppercase">Stok Awal</span>
							<input type="number" bind:value={createForm.stock} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200" />
						</label>
						<label class="block">
							<span class="text-[11px] font-semibold text-slate-500 uppercase">Unit</span>
							<select bind:value={createForm.unit} class="w-full mt-1 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white">
								<option value="pcs">pcs</option>
								<option value="btl">btl</option>
								<option value="kg">kg</option>
								<option value="ltr">ltr</option>
								<option value="bks">bks</option>
							</select>
						</label>
					</div>
					{#if createError}
						<div class="px-3 py-2 rounded-lg flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
							{createError}
						</div>
					{/if}
					<div class="flex gap-2 pt-2">
						<button type="button" onclick={closeCreate} class="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 text-[13px] font-semibold">Batal</button>
						<button type="submit" disabled={saving} class="flex-1 py-2.5 rounded-lg bg-emerald-600 text-white text-[13px] font-bold disabled:opacity-60">
							{saving ? 'Menyimpan…' : 'Tambah Produk'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Toast -->
	{#if toast}
		<div role="status" aria-live="polite" class="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg min-w-[240px] max-w-[360px] text-[13px] font-semibold"
			style="background: {toast.kind === 'error' ? '#FEF2F2' : toast.kind === 'success' ? '#F0FDF4' : '#EFF6FF'};
			border: 1px solid {toast.kind === 'error' ? '#FECACA' : toast.kind === 'success' ? '#BBF7D0' : '#BFDBFE'};
			color: {toast.kind === 'error' ? '#991B1B' : toast.kind === 'success' ? '#166534' : '#1E40AF'};">
			{toast.text}
		</div>
	{/if}
</RoleShell>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
