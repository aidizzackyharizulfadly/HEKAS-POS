<!--
  ShiftDashboard (HEKAS POS — kasir/Shift)
  Orchestrator: KPI strip (active/today/lifetime) + ShiftList.
  Used by: /kasir/shift page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import ShiftList from '$lib/components/kasir/Shift/ShiftList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { Shift } from '$lib/api/shifts';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let shifts = $state<Shift[]>([]);

	onMount(async () => {
		try {
			shifts = await api.shifts.listShifts().catch(() => [] as Shift[]);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const open = $derived(shifts.filter((s) => s.status === 'open'));
	const today = $derived(
		shifts.filter((s) => {
			const d = new Date(s.openedAt);
			const now = new Date();
			return d.toDateString() === now.toDateString();
		})
	);
	const lifetimeSales = $derived(shifts.reduce((sum, s) => sum + s.totalSales, 0));

	const kpis = $derived<Kpi[]>([
		{ label: 'Shift Aktif', value: open.length, tone: 'success', icon: '🟢' },
		{ label: 'Shift Hari Ini', value: today.length, tone: 'primary', icon: '📅' },
		{ label: 'Total Shift', value: shifts.length, tone: 'info', icon: '🕐' },
		{
			label: 'Total Penjualan',
			value: lifetimeSales.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }),
			tone: 'warning',
			icon: '💰'
		}
	]);

	function handleSelect(s: Shift) {
		showInfo(`Detail shift #${s.id} (akan diimplementasi)`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data shift..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<KpiStrip {kpis} />

		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-base font-semibold text-slate-900">Riwayat Shift</h2>
				<span class="text-xs text-slate-500">{shifts.length} total</span>
			</div>
			{#if shifts.length === 0}
				<EmptyState icon="🕐" title="Belum ada shift" description="Mulai shift dari menu POS" />
			{:else}
				<ShiftList {shifts} onSelect={handleSelect} />
			{/if}
		</section>
	</div>
{/if}
