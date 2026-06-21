<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { api } from '$lib/api';
	import type { Product } from '$lib/types/domain';
	import type { ProductImageMeta } from '$lib/types/api';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import { getStorageQuota, formatBytes } from '$lib/utils/image';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';

	// ─── Current user (untuk RoleShell TopBar) ────────────────────────────────
	const currentUser = { name: 'Admin Gudang', role: 'gudang' as const };
	async function handleLogout() {
		await api.auth.logout();
		goto('/login');
	}

	// ─── State ──────────────────────────────────────────────────────────────────
	type TabId = 'inventaris' | 'mutasi';
	let activeTab = $state<TabId>('inventaris');

	let products = $state<Product[]>([]);
	let categories = $state<{ id: string; label: string; name?: string; icon?: string }[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// Search & filter
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

	// Mutasi form (bulk adjustment)
	let mutasiProductId = $state<number | ''>('');
	let mutasiDelta = $state(0);
	let mutasiReason = $state('restock');

	let toast = $state<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);

	// ─── Fase F: Image upload state ─────────────────────────────────────────────
	let imageUploadingFor = $state<number | null>(null);
	let lightboxImage = $state<string | null>(null);
	const storageQuota = $derived(getStorageQuota());
	const quotaPercent = $derived(Math.round(storageQuota.percentUsed * 100));

	// ─── Helpers ────────────────────────────────────────────────────────────────
	const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

	function statusOf(p: Product): 'ok' | 'low' | 'critical' {
		if (p.stock === 0) return 'critical';
		if (p.stock <= 10) return 'low';
		return 'ok';
	}

	const STATUS_CFG = {
		ok:       { label: 'Normal',     bg: '#D1FAE5', fg: '#065F46' },
		low:      { label: 'Hampir Habis', bg: '#FEF3C7', fg: '#92400E' },
		critical: { label: 'Kritis',     bg: '#FEE2E2', fg: '#991B1B' },
	} as const;

	function showToast(kind: 'success' | 'error' | 'info', text: string) {
		toast = { kind, text };
		setTimeout(() => { if (toast?.text === text) toast = null; }, 3500);
	}

	// ─── Loaders ────────────────────────────────────────────────────────────────
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

	// ─── Fase F: Image upload handlers ──────────────────────────────────────────
	async function handleSaveImage(productId: number, meta: ProductImageMeta) {
		try {
			const updated = await api.products.setProductImage(productId, meta);
			// Update local list
			const idx = products.findIndex((p) => p.id === productId);
			if (idx >= 0) products[idx] = updated;
			imageUploadingFor = null;
			showToast('success', `Image produk #${productId} berhasil disimpan (${formatBytes(meta.image_size)})`);
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal menyimpan image');
		}
	}

	async function handleRemoveImage(productId: number) {
		try {
			const updated = await api.products.removeProductImage(productId);
			const idx = products.findIndex((p) => p.id === productId);
			if (idx >= 0) products[idx] = updated;
			imageUploadingFor = null;
			showToast('success', 'Image dihapus, kembali ke emoji');
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal menghapus image');
		}
	}

	function openImageUploader(productId: number) {
		imageUploadingFor = productId;
	}

	function showLightbox(imageData: string) {
		lightboxImage = imageData;
	}

	onMount(loadAll);

	// ─── Derived ────────────────────────────────────────────────────────────────
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

	const stats = $derived({
		total: products.filter((p) => p.is_active).length,
		lowStock: products.filter((p) => p.is_active && p.stock <= 10 && p.stock > 0).length,
		outOfStock: products.filter((p) => p.is_active && p.stock === 0).length,
		totalValue: products.reduce((s, p) => s + p.price * p.stock, 0),
	});

	// ─── Edit ───────────────────────────────────────────────────────────────────
	function openEdit(p: Product) {
		editingId = p.id;
		editForm = { ...p };
		editError = null;
	}

	function closeEdit() {
		editingId = null;
		editForm = {};
		editError = null;
	}

	async function saveEdit() {
		if (editingId == null) return;
		editError = null;
		// Validasi ringan
		if (!editForm.name?.trim()) { editError = 'Nama produk wajib diisi'; return; }
		if (!editForm.category?.trim()) { editError = 'Kategori wajib diisi'; return; }
		if (!editForm.sku?.trim()) { editError = 'SKU wajib diisi'; return; }
		if (!editForm.barcode?.trim()) { editError = 'Barcode wajib diisi'; return; }
		if ((editForm.price ?? 0) <= 0) { editError = 'Harga harus > 0'; return; }
		if ((editForm.stock ?? 0) < 0) { editError = 'Stok tidak boleh negatif'; return; }
		// Edge: SKU uniqueness (exclude self)
		const skuOwner = products.find((p) => p.sku === editForm.sku && p.id !== editingId);
		if (skuOwner) { editError = `SKU "${editForm.sku}" sudah dipakai oleh "${skuOwner.name}"`; return; }
		// Edge: Barcode uniqueness (exclude self)
		const barcodeOwner = products.find((p) => p.barcode === editForm.barcode && p.id !== editingId);
		if (barcodeOwner) { editError = `Barcode sudah dipakai oleh "${barcodeOwner.name}"`; return; }

		saving = true;
		try {
			await api.products.updateProduct(editingId, {
				name: editForm.name,
				price: Number(editForm.price),
				category: editForm.category,
				sku: editForm.sku,
				barcode: editForm.barcode,
				stock: Number(editForm.stock),
				unit: editForm.unit,
				image: editForm.image,
			});
			await loadAll();
			closeEdit();
			showToast('success', 'Produk berhasil diperbarui');
		} catch (e: any) {
			editError = e.message ?? 'Gagal menyimpan';
		} finally {
			saving = false;
		}
	}

	async function quickStockAdjust(p: Product, delta: number) {
		try {
			await api.products.updateStock(p.id, delta);
			await loadAll();
			showToast('success', `${delta > 0 ? '+' : ''}${delta} stok ${p.name}`);
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal update stok');
		}
	}

	async function deactivateProduct(p: Product) {
		if (!confirm(`Nonaktifkan ${p.name}? Produk akan hilang dari kasir tapi history transaksi tetap ada.`)) return;
		try {
			await api.products.deactivateProduct(p.id);
			await loadAll();
			showToast('info', `${p.name} dinonaktifkan`);
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal');
		}
	}

	// ─── Create ─────────────────────────────────────────────────────────────────
	function openCreate() {
		showCreate = true;
		createForm = {
			name: '',
			category: 'lainnya',
			sku: '',
			barcode: '',
			price: 0,
			stock: 0,
			unit: 'pcs',
			image: '📦',
			is_active: true,
		};
		createError = null;
	}

	function closeCreate() {
		showCreate = false;
		createForm = {};
		createError = null;
	}

	async function saveCreate() {
		createError = null;
		if (!createForm.name?.trim()) { createError = 'Nama wajib diisi'; return; }
		if (!createForm.sku?.trim()) { createError = 'SKU wajib diisi'; return; }
		if (!createForm.barcode?.trim()) { createError = 'Barcode wajib diisi'; return; }
		if ((createForm.price ?? 0) <= 0) { createError = 'Harga harus > 0'; return; }
		if ((createForm.stock ?? 0) < 0) { createError = 'Stok tidak boleh negatif'; return; }
		// Edge: SKU uniqueness
		const skuOwner = products.find((p) => p.sku === createForm.sku);
		if (skuOwner) { createError = `SKU "${createForm.sku}" sudah dipakai oleh "${skuOwner.name}"`; return; }
		// Edge: Barcode uniqueness
		const barcodeOwner = products.find((p) => p.barcode === createForm.barcode);
		if (barcodeOwner) { createError = `Barcode sudah dipakai oleh "${barcodeOwner.name}"`; return; }

		saving = true;
		try {
			await api.products.createProduct({
				name: createForm.name!,
				price: Number(createForm.price),
				category: createForm.category!,
				sku: createForm.sku!,
				barcode: createForm.barcode!,
				stock: Number(createForm.stock),
				unit: createForm.unit ?? 'pcs',
				image: createForm.image ?? '📦',
				is_active: true,
			});
			await loadAll();
			closeCreate();
			showToast('success', `Produk ${createForm.name} ditambahkan`);
		} catch (e: any) {
			createError = e.message ?? 'Gagal menambah produk';
		} finally {
			saving = false;
		}
	}

	// ─── Mutasi ─────────────────────────────────────────────────────────────────
	async function applyMutasi() {
		if (mutasiProductId === '' || mutasiDelta === 0) {
			showToast('error', 'Pilih produk dan isi delta stok');
			return;
		}
		const product = products.find((p) => p.id === Number(mutasiProductId));
		if (!product) return;
		try {
			await api.products.updateStock(product.id, mutasiDelta);
			await loadAll();
			showToast('success', `${mutasiDelta > 0 ? '+' : ''}${mutasiDelta} stok ${product.name}`);
			mutasiDelta = 0;
		} catch (e: any) {
			showToast('error', e.message ?? 'Gagal mutasi');
		}
	}
</script>

<RoleShell
	role="gudang"
	title="Manajemen Gudang"
	subtitle="Gudang Utama · {stats.total} produk aktif · {stats.outOfStock} habis · {stats.lowStock} hampir habis · 🖼️ {storageQuota.productsImageCount} dengan foto"
	user={currentUser}
	onlogout={handleLogout}
>
	{#snippet actions()}
		<button onclick={loadAll} aria-label="Refresh data" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style="font-size: 12px; font-weight: 600; background: #F1F5F9; color: #475569">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
				<path d="M3 12a9 9 0 0114.93-6.82M21 12a9 9 0 01-14.93 6.82" />
				<polyline points="21 4 21 9 16 9" /><polyline points="3 20 3 15 8 15" />
			</svg>
			Refresh
		</button>
		<button onclick={openCreate} aria-label="Tambah produk baru" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style="font-size: 12px; font-weight: 600; background: #2563EB; color: #fff">
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
				<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
			</svg>
			Tambah Produk
		</button>
	{/snippet}

	<!-- ── KPI Strip ─────────────────────────────────────────────────────── -->
	<div class="shrink-0 grid grid-cols-4 gap-3 px-6 py-4" style="background: #fff; border-bottom: 1px solid #E2E8F0">
		{#each [
			{ label: 'Total Produk',   value: stats.total,                sub: 'SKU aktif',           color: '#2563EB', bg: '#EFF6FF' },
			{ label: 'Nilai Inventaris', value: fmt(stats.totalValue),      sub: 'Stok × harga jual',   color: '#059669', bg: '#F0FDF4' },
			{ label: 'Hampir Habis',   value: stats.lowStock,             sub: 'Stok ≤ 10',           color: stats.lowStock > 0 ? '#F59E0B' : '#94A3B8', bg: stats.lowStock > 0 ? '#FEF3C7' : '#F1F5F9' },
			{ label: 'Stok Habis',     value: stats.outOfStock,           sub: 'Stok = 0',            color: stats.outOfStock > 0 ? '#DC2626' : '#94A3B8', bg: stats.outOfStock > 0 ? '#FEE2E2' : '#F1F5F9' },
		] as kpi}
			<div class="rounded-xl p-3 flex items-center gap-3" style="background: {kpi.bg}; border: 1px solid #E2E8F0">
				<div class="flex-1">
					<div style="font-size: 11px; font-weight: 600; color: {kpi.color}; text-transform: uppercase; letter-spacing: 0.5px">{kpi.label}</div>
					<div style="font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.1; margin-top: 2px">{kpi.value}</div>
					<div style="font-size: 10px; color: #64748B; margin-top: 2px">{kpi.sub}</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- ── Tabs + Filter ────────────────────────────────────────────────── -->
	<nav class="shrink-0 flex items-center gap-1 px-6" style="background: #fff; border-bottom: 1px solid #E2E8F0">
		{#each [['inventaris', '📦 Inventaris'], ['mutasi', '🔄 Mutasi Stok']] as [id, label]}
			{@const isActive = activeTab === id}
			<button
				onclick={() => activeTab = id as TabId}
				class="px-4 py-3 transition-all"
				style="font-size: 13px; font-weight: {isActive ? 700 : 500}; color: {isActive ? '#2563EB' : '#64748B'}; border-bottom: 2px solid {isActive ? '#2563EB' : 'transparent'}"
			>{label}</button>
		{/each}
	</nav>

	<main class="flex-1 overflow-y-auto p-6">
		{#if loading}
			<div class="flex items-center justify-center py-20">
				<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" style="animation: spin 0.8s linear infinite">
					<path d="M21 12a9 9 0 11-6.219-8.56" />
				</svg>
			</div>
		{:else if error}
			<div class="text-center py-20">
				<div style="font-size: 14px; color: #DC2626; margin-bottom: 12px">{error}</div>
				<button onclick={loadAll} class="px-4 py-2 rounded-lg" style="background: #2563EB; color: #fff; font-size: 12px; font-weight: 600">Coba lagi</button>
			</div>
		{:else if activeTab === 'inventaris'}
			<div in:fade={{ duration: 150 }}>
				<!-- Search + Filter row -->
				<div class="flex items-center gap-2 mb-4">
					<div class="flex-1 relative">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="2.5" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%)">
							<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
						</svg>
						<input
							bind:value={search}
							placeholder="Cari nama / SKU / barcode..."
							class="w-full pl-9 pr-3 py-2 rounded-lg"
							style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff"
						/>
					</div>
					<select bind:value={filterCategory} class="px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
						<option value="all">Semua kategori</option>
						{#each categories.filter((c) => c.id !== 'all') as c}
							<option value={c.id}>{c.label}</option>
						{/each}
					</select>
					<select bind:value={filterStatus} class="px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
						<option value="all">Semua status</option>
						<option value="ok">Normal</option>
						<option value="low">Hampir habis</option>
						<option value="critical">Kritis</option>
					</select>
				</div>

				<!-- Table -->
				<div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #E2E8F0">
					<div class="overflow-x-auto">
						<table style="width: 100%; font-size: 12px; border-collapse: collapse">
							<thead>
								<tr style="text-align: left; color: #64748B; background: #F8FAFC; border-bottom: 1px solid #E2E8F0">
									<th class="py-3 px-3" style="font-weight: 600">Produk</th>
									<th class="py-3 px-3" style="font-weight: 600">SKU</th>
									<th class="py-3 px-3" style="font-weight: 600">Kategori</th>
									<th class="py-3 px-3 text-right" style="font-weight: 600">Harga</th>
									<th class="py-3 px-3 text-center" style="font-weight: 600">Stok</th>
									<th class="py-3 px-3" style="font-weight: 600">Status</th>
									<th class="py-3 px-3 text-right" style="font-weight: 600">Aksi</th>
								</tr>
							</thead>
							<tbody>
								{#each filtered as p (p.id)}
									{@const st = statusOf(p)}
									<tr style="border-top: 1px solid #F1F5F9; opacity: {p.is_active ? 1 : 0.45}">
										<td class="py-2 px-3">
											<div class="flex items-center gap-2">
												{#if p.image_data}
													<button
														onclick={() => showLightbox(p.image_data!)}
														class="shrink-0 rounded-md overflow-hidden"
														style="width: 36px; height: 36px; background: #F1F5F9; border: 1px solid #E2E8F0; padding: 0; cursor: zoom-in"
														title="Klik untuk zoom"
													>
														<img src={p.image_data} alt={p.name} style="width: 100%; height: 100%; object-fit: cover; display: block" />
													</button>
												{:else}
													<span style="font-size: 18px">{p.image}</span>
												{/if}
												<div>
													<div style="font-weight: 600; color: #0F172A">{p.name}</div>
													<div style="font-size: 10px; color: #94A3B8; font-family: 'SF Mono', Monaco, monospace">{p.barcode}</div>
												</div>
											</div>
										</td>
										<td class="py-2 px-3" style="font-family: 'SF Mono', Monaco, monospace; color: #475569">{p.sku}</td>
										<td class="py-2 px-3" style="color: #64748B">{p.category}</td>
										<td class="py-2 px-3 text-right" style="font-weight: 600; color: #0F172A">{fmt(p.price)}</td>
										<td class="py-2 px-3 text-center">
											<div class="inline-flex items-center gap-1 rounded-lg" style="background: #F8FAFC; padding: 2px">
												<button onclick={() => quickStockAdjust(p, -1)} class="w-5 h-5 rounded flex items-center justify-center" style="background: #FEE2E2; color: #DC2626; font-weight: 700" aria-label="Kurangi stok">−</button>
												<span class="px-2 min-w-[40px] inline-block" style="font-weight: 700; color: {p.stock === 0 ? '#DC2626' : p.stock <= 10 ? '#F59E0B' : '#0F172A'}">{p.stock}</span>
												<button onclick={() => quickStockAdjust(p, +1)} class="w-5 h-5 rounded flex items-center justify-center" style="background: #D1FAE5; color: #059669; font-weight: 700" aria-label="Tambah stok">+</button>
											</div>
										</td>
										<td class="py-2 px-3">
											<span style="font-size: 10px; padding: 2px 8px; border-radius: 999px; background: {STATUS_CFG[st].bg}; color: {STATUS_CFG[st].fg}; font-weight: 700">{STATUS_CFG[st].label}</span>
										</td>
										<td class="py-2 px-3 text-right">
											<button
												onclick={() => openImageUploader(p.id)}
												class="px-2 py-1 rounded"
												style="font-size: 11px; background: {p.image_data ? '#D1FAE5' : '#FEF3C7'}; color: {p.image_data ? '#065F46' : '#92400E'}; font-weight: 600"
												title={p.image_data ? 'Ganti image' : 'Upload image'}
											>
												{p.image_data ? '🖼️ Ganti' : '🖼️ Upload'}
											</button>
											<button onclick={() => openEdit(p)} class="px-2 py-1 rounded ml-1" style="font-size: 11px; background: #EFF6FF; color: #2563EB; font-weight: 600">Edit</button>
											{#if p.is_active}
												<button onclick={() => deactivateProduct(p)} class="px-2 py-1 rounded ml-1" style="font-size: 11px; background: #FEE2E2; color: #DC2626; font-weight: 600">Nonaktif</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					{#if filtered.length === 0}
						<div class="py-12 text-center" style="color: #94A3B8; font-size: 13px">Tidak ada produk sesuai filter</div>
					{:else}
						<div class="px-4 py-2.5" style="background: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 11px; color: #64748B">
							Menampilkan {filtered.length} dari {products.length} produk
						</div>
					{/if}
				</div>
			</div>

		{:else if activeTab === 'mutasi'}
			<div in:fade={{ duration: 150 }} class="grid grid-cols-2 gap-4">
				<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
					<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4">Mutasi Stok Cepat</div>
					<div style="font-size: 11px; color: #64748B; margin-bottom: 16px">Tambah / kurangi stok satu produk</div>

					<div class="space-y-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Produk</span>
							<select bind:value={mutasiProductId} class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
								<option value="">— Pilih produk —</option>
								{#each products.filter((p) => p.is_active) as p}
									<option value={p.id}>{p.image} {p.name} (stok: {p.stock})</option>
								{/each}
							</select>
						</label>

						<div>
												<label for="mutasi-delta" style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Delta Stok</label>
												<div class="flex items-center gap-2 mt-1">
													<button onclick={() => mutasiDelta = -10} class="px-3 py-2 rounded-lg" style="font-size: 12px; font-weight: 600; background: #FEE2E2; color: #DC2626">−10</button>
													<button onclick={() => mutasiDelta = -1} class="px-3 py-2 rounded-lg" style="font-size: 12px; font-weight: 600; background: #FEE2E2; color: #DC2626">−1</button>
													<input id="mutasi-delta" type="number" bind:value={mutasiDelta} class="flex-1 px-3 py-2 rounded-lg text-center" style="font-size: 16px; font-weight: 800; border: 1px solid #E2E8F0" />
													<button onclick={() => mutasiDelta = 1} class="px-3 py-2 rounded-lg" style="font-size: 12px; font-weight: 600; background: #D1FAE5; color: #059669">+1</button>
													<button onclick={() => mutasiDelta = 10} class="px-3 py-2 rounded-lg" style="font-size: 12px; font-weight: 600; background: #D1FAE5; color: #059669">+10</button>
												</div>
												<div style="font-size: 10px; color: #94A3B8; margin-top: 6px">Positif = tambah (restock), negatif = kurangi (rusak/expired)</div>
											</div>

						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Alasan</span>
							<select bind:value={mutasiReason} class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
								<option value="restock">Restock dari supplier</option>
								<option value="rusak">Barang rusak</option>
								<option value="expired">Kedaluwarsa</option>
								<option value="opname">Stok opname</option>
								<option value="retur">Retur pelanggan</option>
								<option value="transfer">Transfer antar gudang</option>
								<option value="lainnya">Lainnya</option>
							</select>
						</label>

						{#if mutasiProductId !== ''}
							{@const p = products.find((x) => x.id === Number(mutasiProductId))}
							{#if p}
								<div class="p-3 rounded-lg" style="background: #F8FAFC; border: 1px solid #E2E8F0">
									<div class="flex items-center justify-between" style="font-size: 12px">
										<span style="color: #64748B">Stok saat ini</span>
										<span style="font-weight: 700; color: #0F172A">{p.stock} {p.unit}</span>
									</div>
									<div class="flex items-center justify-between" style="font-size: 12px; margin-top: 4px">
										<span style="color: #64748B">Setelah mutasi</span>
										<span style="font-weight: 800; color: {p.stock + mutasiDelta < 0 ? '#DC2626' : p.stock + mutasiDelta <= 10 ? '#F59E0B' : '#059669'}">{p.stock + mutasiDelta} {p.unit}</span>
									</div>
								</div>
							{/if}
						{/if}

						<button onclick={applyMutasi} disabled={mutasiProductId === '' || mutasiDelta === 0} class="w-full py-2.5 rounded-lg" style="background: #2563EB; color: #fff; font-size: 13px; font-weight: 700; opacity: {mutasiProductId === '' || mutasiDelta === 0 ? 0.5 : 1}">
							Terapkan Mutasi
						</button>
					</div>
				</div>

				<!-- Recent activity (mock for now) -->
				<div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #E2E8F0">
					<div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 4">Riwayat Mutasi</div>
					<div style="font-size: 11px; color: #64748B; margin-bottom: 16px">Log perubahan stok terbaru</div>
					<div class="py-12 text-center">
						<div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style="background: #F1F5F9">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" stroke-width="1.5"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
						</div>
						<div style="font-size: 13px; color: #64748B; font-weight: 600">Riwayat belum tersedia</div>
						<div style="font-size: 11px; color: #94A3B8; margin-top: 4px">Butuh tambahan endpoint API: stock_movements table</div>
					</div>
				</div>
			</div>
		{/if}
	</main>

	<!-- ── Edit Modal ──────────────────────────────────────────────────────── -->
	{#if editingId !== null}
		<div class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)" onclick={(e) => { if (e.target === e.currentTarget) closeEdit(); }} onkeydown={(e) => { if (e.key === 'Escape') { /* TODO close */ } }} transition:fade={{ duration: 150 }} role="dialog" aria-modal="true">
			<div class="rounded-3xl overflow-hidden shadow-2xl" style="background: #fff; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto" transition:scale={{ duration: 200, start: 0.92, easing: cubicOut }}>
				<div class="flex items-center justify-between px-5 py-4" style="background: #1E3A5F">
					<span style="color: #fff; font-size: 15; font-weight: 700">Edit Produk</span>
					<button onclick={closeEdit}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); saveEdit(); }} class="p-5 space-y-3">
					<label class="block">
						<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Nama</span>
						<input bind:value={editForm.name} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" />
					</label>
					<div class="grid grid-cols-2 gap-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">SKU</span>
							<input bind:value={editForm.sku} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace" />
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Barcode</span>
							<input bind:value={editForm.barcode} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace" />
						</label>
					</div>
					<label class="block">
						<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Kategori</span>
						<select bind:value={editForm.category} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
							{#each categories.filter((c) => c.id !== 'all') as c}
								<option value={c.id}>{c.label}</option>
							{/each}
						</select>
					</label>
					<div class="grid grid-cols-2 gap-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Harga (Rp)</span>
							<input type="number" bind:value={editForm.price} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" />
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Stok</span>
							<input type="number" bind:value={editForm.stock} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" />
						</label>
					</div>
					<div class="grid grid-cols-2 gap-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Unit</span>
							<select bind:value={editForm.unit} class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
								<option value="pcs">pcs</option><option value="btl">btl</option><option value="kg">kg</option><option value="ltr">ltr</option><option value="bks">bks</option>
							</select>
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Icon</span>
							<input bind:value={editForm.image} maxlength="4" class="w-full mt-1 px-3 py-2 rounded-lg text-center" style="font-size: 18px; border: 1px solid #E2E8F0" />
						</label>
					</div>
					{#if editError}
						<div class="px-3 py-2 rounded-lg flex items-start gap-2" style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-size: 12px">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-top: 2px; flex-shrink: 0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
							{editError}
						</div>
					{/if}
					<div class="flex gap-2 pt-2">
						<button type="button" onclick={closeEdit} class="flex-1 py-2.5 rounded-lg" style="background: #F1F5F9; color: #475569; font-size: 13px; font-weight: 600">Batal</button>
						<button type="submit" disabled={saving} class="flex-1 py-2.5 rounded-lg" style="background: #2563EB; color: #fff; font-size: 13px; font-weight: 700; opacity: {saving ? 0.6 : 1}">
							{saving ? 'Menyimpan…' : 'Simpan'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- ── Create Modal ────────────────────────────────────────────────────── -->
	{#if showCreate}
		<div class="fixed inset-0 flex items-center justify-center z-50 p-4" style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)" onclick={(e) => { if (e.target === e.currentTarget) closeCreate(); }} onkeydown={(e) => { if (e.key === 'Escape') { /* TODO close */ } }} transition:fade={{ duration: 150 }} role="dialog" aria-modal="true">
			<div class="rounded-3xl overflow-hidden shadow-2xl" style="background: #fff; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto" transition:scale={{ duration: 200, start: 0.92, easing: cubicOut }}>
				<div class="flex items-center justify-between px-5 py-4" style="background: #059669">
					<span style="color: #fff; font-size: 15; font-weight: 700">Tambah Produk Baru</span>
					<button onclick={closeCreate}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
				</div>
				<form onsubmit={(e) => { e.preventDefault(); saveCreate(); }} class="p-5 space-y-3">
					<label class="block">
						<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Nama Produk</span>
						<input bind:value={createForm.name} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" placeholder="Contoh: Teh Pucuk 350ml" />
					</label>
					<div class="grid grid-cols-2 gap-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">SKU</span>
							<input bind:value={createForm.sku} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace" placeholder="MNM006" />
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Barcode</span>
							<input bind:value={createForm.barcode} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; font-family: 'SF Mono', Monaco, monospace" placeholder="8991234567890" />
						</label>
					</div>
					<label class="block">
						<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Kategori</span>
						<select bind:value={createForm.category} required class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
							{#each categories.filter((c) => c.id !== 'all') as c}
								<option value={c.id}>{c.label}</option>
							{/each}
						</select>
					</label>
					<div class="grid grid-cols-3 gap-3">
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Harga (Rp)</span>
							<input type="number" bind:value={createForm.price} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" />
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Stok Awal</span>
							<input type="number" bind:value={createForm.stock} required min="0" class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0" />
						</label>
						<label class="block">
							<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Unit</span>
							<select bind:value={createForm.unit} class="w-full mt-1 px-3 py-2 rounded-lg" style="font-size: 13px; border: 1px solid #E2E8F0; background: #fff">
								<option value="pcs">pcs</option><option value="btl">btl</option><option value="kg">kg</option><option value="ltr">ltr</option><option value="bks">bks</option>
							</select>
						</label>
					</div>
					<label class="block">
						<span style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase">Icon (emoji)</span>
						<input bind:value={createForm.image} maxlength="4" class="w-full mt-1 px-3 py-2 rounded-lg text-center" style="font-size: 18px; border: 1px solid #E2E8F0" placeholder="📦" />
					</label>
					{#if createError}
						<div class="px-3 py-2 rounded-lg flex items-start gap-2" style="background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; font-size: 12px">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-top: 2px; flex-shrink: 0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
							{createError}
						</div>
					{/if}
					<div class="flex gap-2 pt-2">
						<button type="button" onclick={closeCreate} class="flex-1 py-2.5 rounded-lg" style="background: #F1F5F9; color: #475569; font-size: 13px; font-weight: 600">Batal</button>
						<button type="submit" disabled={saving} class="flex-1 py-2.5 rounded-lg" style="background: #059669; color: #fff; font-size: 13px; font-weight: 700; opacity: {saving ? 0.6 : 1}">
							{saving ? 'Menyimpan…' : 'Tambah Produk'}
						</button>
						</div>
						</form>
						</div>
						</div>
						{/if}

	<!-- ── Toast ───────────────────────────────────────────────────────────── -->
	{#if toast}
		<div role="status" aria-live="polite" class="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg" style="
			background: {toast.kind === 'error' ? '#FEF2F2' : toast.kind === 'success' ? '#F0FDF4' : '#EFF6FF'};
			border: 1px solid {toast.kind === 'error' ? '#FECACA' : toast.kind === 'success' ? '#BBF7D0' : '#BFDBFE'};
			color: {toast.kind === 'error' ? '#991B1B' : toast.kind === 'success' ? '#166534' : '#1E40AF'};
			font-size: 13px; font-weight: 600; min-width: 240px; max-width: 360px;
		">
			{#if toast.kind === 'success'}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
			{:else if toast.kind === 'error'}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
			{:else}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{/if}
				<span style="flex: 1">{toast.text}</span>
			</div>
			{/if}

			<!-- ── Fase F: Image Uploader modal ─────────────────────────────────────────── -->
			{#if imageUploadingFor !== null}
			{@const uploadProduct = products.find((p) => p.id === imageUploadingFor)}
			{#if uploadProduct}
				<ImageUploader
					productId={imageUploadingFor}
					currentImage={uploadProduct.image_data ?? null}
					onsave={(meta) => handleSaveImage(imageUploadingFor!, meta)}
					onremove={() => handleRemoveImage(imageUploadingFor!)}
					onclose={() => (imageUploadingFor = null)}
					showToast={(kind, msg) => showToast(kind, msg)}
				/>
			{/if}
			{/if}

			<!-- ── Fase F: Lightbox modal ───────────────────────────────────────────────── -->
			{#if lightboxImage}
				<div
					class="fixed inset-0 z-[2000] flex items-center justify-center"
					style="background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); cursor: zoom-out"
					onclick={() => (lightboxImage = null)}
					onkeydown={(e) => { if (e.key === 'Escape') lightboxImage = null; }}
					role="button"
					tabindex="-1"
				>
					<img
						src={lightboxImage}
						alt="Product"
						style="max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); cursor: default"
					/>
			</div>
		{/if}
	</RoleShell>

	<style>
@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}
</style>
