<!--
  BarangMasukDashboard (HEKAS POS — gudang/BarangMasuk)
  Layout match referensi Role_Gudang screenshot 2.
  Pattern: 3 KPI cards (Menunggu Verifikasi/Terverifikasi/Ditolak) + Search + Filter dropdown +
  Tabel 6 kolom (No. SJ/PO, Supplier, Tanggal Kirim, Jumlah Item, Status, Aksi) + Pagination.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';

	type StatusPO = 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK';

	interface PODashboard {
		id: string | number;
		po_no: string;
		sj_no?: string;
		supplier: string;
		supplier_avatar?: string;
		date: string;
		item_count: number;
		sku_count: number;
		status: StatusPO;
	}

	let loading = $state(true);
	let error = $state<string | null>(null);
	let pos = $state<PODashboard[]>([]);
	let search = $state('');
	let statusFilter = $state<'all' | StatusPO>('all');
	let currentPage = $state(1);
	const PER_PAGE = 4;

	onMount(async () => {
		try {
			const raw = await api.incomingGoods.listIncomingGoods().catch(() => [] as any[]);
			pos = raw.map((p, idx) => ({
				id: p.id,
				po_no: p.po_no ?? p.id,
				sj_no: p.sj_no ?? `SJ-IM-${String(Date.now()).slice(0, 10).replace(/-/g, '')}-${String(idx + 1).padStart(4, '0')}`,
				supplier: p.supplier_name ?? p.supplier ?? 'Unknown Supplier',
				supplier_avatar: (p.supplier_name ?? p.supplier ?? '?')[0]?.toUpperCase() ?? '?',
				date: p.received_at ? new Date(p.received_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : (p.date ?? new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })),
				item_count: p.total_items ?? p.totalItems ?? p.item_count ?? 0,
				sku_count: p.sku_count ?? p.skuCount ?? 1,
				status: p.status ?? 'MENUNGGU_VERIFIKASI'
			}));
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const pending = $derived(pos.filter((p) => p.status === 'MENUNGGU_VERIFIKASI'));
	const verified = $derived(pos.filter((p) => p.status === 'TERVERIFIKASI'));
	const rejected = $derived(pos.filter((p) => p.status === 'DITOLAK'));

	const filtered = $derived(
		pos.filter((p) => {
			if (statusFilter !== 'all' && p.status !== statusFilter) return false;
			if (search.trim()) {
				const t = search.toLowerCase();
				const haystack = `${p.sj_no ?? ''} ${p.po_no} ${p.supplier}`.toLowerCase();
				if (!haystack.includes(t)) return false;
			}
			return true;
		})
	);

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
	const paginatedItems = $derived(
		filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)
	);

	function statusBadgeClass(s: StatusPO): string {
		switch (s) {
			case 'MENUNGGU_VERIFIKASI': return 'bg-amber-50 text-amber-700';
			case 'TERVERIFIKASI': return 'bg-emerald-50 text-emerald-700';
			case 'DITOLAK': return 'bg-rose-50 text-rose-700';
		}
	}

	function statusLabel(s: StatusPO): string {
		switch (s) {
			case 'MENUNGGU_VERIFIKASI': return 'Menunggu Verifikasi';
			case 'TERVERIFIKASI': return 'Terverifikasi';
			case 'DITOLAK': return 'Ditolak';
		}
	}

	function actionLabel(s: StatusPO): string {
		switch (s) {
			case 'MENUNGGU_VERIFIKASI': return 'Verifikasi';
			case 'TERVERIFIKASI': return 'Lihat Detail';
			case 'DITOLAK': return 'Lihat Alasan';
		}
	}

	function actionClass(s: StatusPO): string {
		switch (s) {
			case 'MENUNGGU_VERIFIKASI': return 'bg-blue-600 text-white hover:bg-blue-700';
			default: return 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
		}
	}

	function handleAction(po: PODashboard) {
		if (po.status === 'MENUNGGU_VERIFIKASI') {
			api.incomingGoods.verifyIncomingGood(String(po.id)).catch((e) => alert(`Gagal: ${e.message}`));
		}
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data PO..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<!-- KPI Strip (3 cards) -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Menunggu Verifikasi -->
			<div class="bg-white border-2 border-amber-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
				<div>
					<div class="text-[10px] font-bold text-amber-700 tracking-wider uppercase">Menunggu Verifikasi</div>
					<div class="text-3xl font-bold text-amber-700 mt-2">{pending.length}</div>
				</div>
				<div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
						<path d="M15 18H9"/>
						<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
						<circle cx="17" cy="18" r="2"/>
						<circle cx="7" cy="18" r="2"/>
					</svg>
				</div>
			</div>

			<!-- Terverifikasi -->
			<div class="bg-white border-2 border-emerald-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
				<div>
					<div class="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">Terverifikasi Hari Ini</div>
					<div class="text-3xl font-bold text-emerald-700 mt-2">{verified.length}</div>
				</div>
				<div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
			</div>

			<!-- Ditolak -->
			<div class="bg-white border-2 border-rose-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
				<div>
					<div class="text-[10px] font-bold text-rose-700 tracking-wider uppercase">Ditolak / Bermasalah</div>
					<div class="text-3xl font-bold text-rose-700 mt-2">{rejected.length}</div>
				</div>
				<div class="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
					<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
						<line x1="12" y1="9" x2="12" y2="13"/>
						<line x1="12" y1="17" x2="12.01" y2="17"/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Search + Filter bar -->
		<div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
			<div class="relative flex-1">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
				</svg>
				<input
					bind:value={search}
					type="search"
					placeholder="Cari supplier atau nomor surat jalan..."
					class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<select
				bind:value={statusFilter}
				class="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white min-w-[140px]"
			>
				<option value="all">Status: Semua</option>
				<option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
				<option value="TERVERIFIKASI">Terverifikasi</option>
				<option value="DITOLAK">Ditolak</option>
			</select>
			<button
				type="button"
				class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
					<line x1="16" y1="2" x2="16" y2="6"/>
					<line x1="8" y1="2" x2="8" y2="6"/>
					<line x1="3" y1="10" x2="21" y2="10"/>
				</svg>
				Hari Ini
			</button>
		</div>

		<!-- Tabel -->
		<div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
				<div class="flex items-center gap-3">
					<div class="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
						</svg>
					</div>
					<h3 class="text-base font-semibold text-slate-900">Daftar Barang Masuk</h3>
				</div>
				<button type="button" class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
					Unduh Laporan
				</button>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-left text-[10px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 bg-slate-50">
							<th class="py-3 px-6">No. Surat Jalan / PO</th>
							<th class="py-3 px-6">Supplier</th>
							<th class="py-3 px-6">Tanggal Kirim</th>
							<th class="py-3 px-6">Jumlah Item</th>
							<th class="py-3 px-6">Status</th>
							<th class="py-3 px-6 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each paginatedItems as p (p.id)}
							<tr class="border-b border-slate-100 hover:bg-slate-50">
								<td class="py-4 px-6">
									<div class="font-bold text-slate-900">{p.sj_no ?? p.po_no}</div>
									<div class="text-xs text-slate-500 font-mono mt-0.5">{p.po_no}</div>
								</td>
								<td class="py-4 px-6">
									<div class="flex items-center gap-2.5">
										<div class="w-8 h-8 rounded-md bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
											{p.supplier_avatar}
										</div>
										<span class="text-sm font-medium text-slate-900">{p.supplier}</span>
									</div>
								</td>
								<td class="py-4 px-6 text-sm text-slate-700">{p.date}</td>
								<td class="py-4 px-6 text-sm text-slate-900 font-semibold">
									{(p.item_count ?? 0).toLocaleString('id-ID')} Unit
									<span class="text-xs text-slate-500 font-normal">({p.sku_count} SKU)</span>
								</td>
								<td class="py-4 px-6">
									<span class="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold {statusBadgeClass(p.status)}">
										{statusLabel(p.status)}
									</span>
								</td>
								<td class="py-4 px-6 text-right">
									<button
										type="button"
										onclick={() => handleAction(p)}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold {actionClass(p.status)}"
									>
										{actionLabel(p.status)}
										<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
											<polyline points="9 18 15 12 9 6"/>
										</svg>
									</button>
								</td>
							</tr>
						{/each}
						{#if paginatedItems.length === 0}
							<tr>
								<td colspan="6" class="py-12 text-center text-sm text-slate-400">
									Tidak ada data barang masuk
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Footer: showing + pagination -->
			{#if filtered.length > 0}
				<div class="flex items-center justify-between px-6 py-3 border-t border-slate-100">
					<div class="text-xs text-slate-500">
						Menampilkan {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} dari {filtered.length} Data
					</div>
					<div class="flex items-center gap-1">
						<button
							type="button"
							disabled={currentPage === 1}
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							class="w-8 h-8 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
						>
							‹
						</button>
						{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
							<button
								type="button"
								onclick={() => (currentPage = p)}
								class="w-8 h-8 rounded text-xs font-semibold {currentPage === p ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}"
							>
								{p}
							</button>
						{/each}
						<button
							type="button"
							disabled={currentPage === totalPages}
							onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
							class="w-8 h-8 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
						>
							›
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
