<!--
  SettingDashboard (HEKAS POS — kasir/Setting)
  Orchestrator: Profile + Printer config + Connected devices.
  Used by: /kasir/setting page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import ProfileSection from '$lib/components/kasir/Setting/ProfileSection.svelte';
	import PrinterConfig from '$lib/components/kasir/Setting/PrinterConfig.svelte';
	import ConnectedDevices from '$lib/components/kasir/Setting/ConnectedDevices.svelte';
	import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import type { RoleId } from '$lib/auth/roles';

	let loading = $state(true);
	let error = $state<string | null>(null);
	let user = $state<{ username: string; full_name: string; role: RoleId } | null>(null);

	onMount(async () => {
		try {
			const u = await api.auth.getCurrentUser().catch(() => null);
			if (u) {
				user = {
					username: u.username,
					full_name: u.full_name,
					role: (u.role as RoleId) ?? 'kasir'
				};
			}
		} catch (err) {
			error = (err as Error).message;
		} finally {
			loading = false;
		}
	});

	// Static demo devices (no real device API yet)
	const devices = $state([
		{ id: 'printer-01', name: 'Epson TM-T82 (Browser Print)', type: 'printer' as const, status: 'connected' as const },
		{ id: 'scanner-01', name: 'Honeywell Barcode Scanner', type: 'scanner' as const, status: 'connected' as const },
		{ id: 'cash-drawer-01', name: 'Cash Drawer RJ11', type: 'cash_drawer' as const, status: 'disconnected' as const }
	]);

	function handleSavePrinter(config: { paperSize: '58mm' | '80mm'; mode: 'browser' | 'thermal'; deviceName?: string }) {
		console.log('[SettingDashboard] save printer config', config);
		alert('Konfigurasi printer disimpan (demo)');
	}

	function handleDisconnect(id: string) {
		console.log('[SettingDashboard] disconnect device', id);
		alert(`Putuskan device ${id} (demo)`);
	}
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-[40vh]">
		<LoadingSpinner size="lg" label="Memuat pengaturan..." />
	</div>
{:else if error}
	<EmptyState icon="⚠️" title="Gagal memuat data" description={error} />
{:else}
	<div class="space-y-6">
		{#if user}
			<section class="bg-white rounded-lg border border-slate-200 p-4">
				<ProfileSection
					username={user.username}
					fullName={user.full_name}
					role={user.role}
					outletName="Outlet Pusat"
				/>
			</section>
		{/if}

		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<PrinterConfig onSave={handleSavePrinter} />
		</section>

		<section class="bg-white rounded-lg border border-slate-200 p-4">
			<ConnectedDevices {devices} onDisconnect={handleDisconnect} />
		</section>
	</div>
{/if}
