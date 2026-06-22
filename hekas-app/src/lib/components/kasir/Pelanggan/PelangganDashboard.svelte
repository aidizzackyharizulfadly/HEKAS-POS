<!--
  PelangganDashboard (HEKAS POS — kasir/Pelanggan)
  Orchestrator: KPI strip + MemberList with tier breakdown.
  Used by: /kasir/pelanggan page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import KpiStrip, { type Kpi } from '$lib/components/manager/Beranda/KpiStrip.svelte';
	import MemberList from '$lib/components/kasir/Pelanggan/MemberList.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import { showInfo } from '$lib/utils/toast';
	import type { Member } from '$lib/types/domain';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let members = $state<Member[]>([]);

	onMount(async () => {
		try {
			members = await api.members.listMembers().catch(() => [] as Member[]);
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	const goldTier = $derived(members.filter((m) => (m as any).tier === 'Gold').length);
	const platinumTier = $derived(members.filter((m) => (m as any).tier === 'Platinum').length);

	const kpis = $derived<Kpi[]>([
		{ label: 'Total Member', value: members.length, tone: 'primary', icon: '👥' },
		{ label: 'Gold', value: goldTier, tone: 'warning', icon: '🥇' },
		{ label: 'Platinum', value: platinumTier, tone: 'info', icon: '💎' },
		{
			label: 'Aktif',
			value: members.filter((m) => (m as any).status !== 'inactive').length,
			tone: 'success',
			icon: '✅'
		}
	]);

	function handleSelect(m: Member) {
		// Future: open MemberDetail panel
		showInfo(`Detail member ${m.name} (akan diimplementasi)`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat data member..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		<KpiStrip {kpis} />

		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-base font-semibold text-slate-900">Daftar Member</h2>
				<span class="text-xs text-slate-500">{members.length} total</span>
			</div>
			{#if members.length === 0}
				<EmptyState icon="👥" title="Belum ada member" description="Member terdaftar akan muncul di sini" />
			{:else}
				<MemberList {members} onselect={handleSelect} />
			{/if}
		</section>
	</div>
{/if}
