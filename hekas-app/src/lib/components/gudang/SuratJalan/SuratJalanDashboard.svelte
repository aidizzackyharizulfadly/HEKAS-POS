<!--
  SuratJalanDashboard (HEKAS POS — gudang/SuratJalan)
  Orchestrator: KPI strip + Search/Filter bar + SJList tabel.
  Layout match referensi Role_Gudang screenshot 5.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import SJList from '$lib/components/gudang/SuratJalan/SJList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { SuratJalan, SJStatus } from '$lib/api/surat-jalan';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let items = $state<SuratJalan[]>([]);
	let search = $state('');
	let statusFilter = $state<'all' | SJStatus>('all');

	onMount(async () => {
		try {
			items = await api.suratJalan.listSuratJalan().catch(() => [] as SuratJalan[]);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const draft = $derived(items.filter((s) => s.status === 'draft'));
	const pending = $derived(items.filter((s) => s.status === 'pending_review'));
	const approved = $derived(items.filter((s) => s.status === 'approved'));
	const delivered = $derived(items.filter((s) => s.status === 'delivered'));
	const totalItems = $derived(items.reduce((sum, s) => sum + s.items.length, 0));

	const kpis = $derived<Kpi[]>([
		{ label: 'Total SJ', value: items.length, tone: 'primary', icon: '📄' },
		{ label: 'Pending Review', value: pending.length, tone: 'warning', icon: '⏳' },
		{ label: 'Approved', value: approved.length, tone: 'success', icon: '✅' },
		{ label: 'Terkirim', value: delivered.length, tone: 'info', icon: '🚚' }
	]);

	const filtered = $derived(
		items.filter((s) => {
			if (statusFilter !== 'all' && s.status !== statusFilter) return false;
			if (search.trim()) {
				const t = search.toLowerCase();
				const haystack = `${s.sjNumber} ${s.poNumber ?? ''} ${s.fromOutlet} ${s.toOutlet} ${s.driver ?? ''} ${s.vehicle ?? ''}`.toLowerCase();
				if (!haystack.includes(t)) return false;
			}
			return true;
		})
	);

	function handleSelect(sj: SuratJalan) {
		showInfo(`Detail ${sj.sjNumber} (TODO: open SJDetail panel)`);
	}

	function handleCreate() {
		showInfo('Buat Surat Jalan baru (TODO: open create modal)');
	}

	function handleDownloadReport() {
		showInfo('Unduh Laporan SJ (TODO: generate CSV/PDF)');
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data surat jalan..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<KpiStrip {kpis} />

		<!-- Search + Filter bar + Buat SJ button -->
		<div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
			<div class="relative flex-1">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
					<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
				</svg>
				<input
					bind:value={search}
					type="search"
					placeholder="Cari nomor SJ, PO, outlet, kurir, atau kendaraan..."
					class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
			</div>
			<select
				bind:value={statusFilter}
				class="px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white min-w-[160px]"
			>
				<option value="all">Status: Semua</option>
				<option value="draft">Draft</option>
				<option value="pending_review">Pending Review</option>
				<option value="approved">Approved</option>
				<option value="rejected">Rejected</option>
				<option value="in_transit">In Transit</option>
				<option value="delivered">Delivered</option>
			</select>
			<button
				type="button"
				onclick={handleCreate}
				class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm whitespace-nowrap"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="12" y1="5" x2="12" y2="19"/>
					<line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				Buat SJ
			</button>
			<button
				type="button"
				onclick={handleDownloadReport}
				class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 whitespace-nowrap"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Unduh Laporan
			</button>
		</div>

		<section>
			{#if filtered.length === 0}
				<EmptyState
					icon="📄"
					title={items.length === 0 ? 'Belum ada surat jalan' : 'Tidak ada surat jalan yang cocok'}
					description={items.length === 0
						? 'Surat jalan antar-outlet akan muncul di sini. Buat dari tombol "Buat SJ" di atas.'
						: `Pencarian "${search}" dengan filter ${statusFilter} tidak ditemukan.`}
				/>
			{:else}
				<SJList items={filtered} onSelect={handleSelect} />
			{/if}
		</section>

		{#if items.length > 0}
			<div class="text-xs text-slate-500 text-right">
				📋 Total item SJ: <span class="font-mono font-semibold">{totalItems}</span> •
				📝 Draft: <span class="font-mono font-semibold">{draft.length}</span>
			</div>
		{/if}
	</div>
{/if}