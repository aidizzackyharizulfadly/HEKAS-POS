<!--
  SuratJalanDashboard (HEKAS POS — gudang/SuratJalan)
  Orchestrator: KPI strip + SJList with status filter.
  Used by: /gudang/surat-jalan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import SJList from '$lib/components/gudang/SuratJalan/SJList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { SuratJalan } from '$lib/api/surat-jalan';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let items = $state<SuratJalan[]>([]);

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

	function handleSelect(sj: SuratJalan) {
		showInfo(`Detail ${sj.sjNumber} (TODO: open SJDetail panel)`);
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

		<section>
			{#if items.length === 0}
				<EmptyState
					icon="📄"
					title="Belum ada surat jalan"
					description="Surat jalan antar-outlet akan muncul di sini. Buat dari modul Pengiriman."
				/>
			{:else}
				<SJList {items} onSelect={handleSelect} />
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
