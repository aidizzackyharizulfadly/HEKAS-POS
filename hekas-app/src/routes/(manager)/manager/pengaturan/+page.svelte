<!--
  /manager/pengaturan — System settings (outlet, server, access rights, etc).
  Page uses shared "Under Development" placeholder pattern.
-->
<script lang="ts">
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import { Settings, ArrowRight, Building2, Database, Shield, Clock } from '@lucide/svelte';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let user = $state<{ id: string; username: string; full_name: string; role: string } | null>(null);
	onMount(async () => {
		user = (await api.auth.getCurrentUser().catch(() => null)) as any;
	});

	const sections = [
		{ icon: Building2, label: 'Profil Outlet', desc: 'Nama, alamat, NPWP, kontak' },
		{ icon: Clock, label: 'Jam Operasional', desc: 'Senin–Minggu, shift patterns' },
		{ icon: Shield, label: 'Hak Akses', desc: 'Role permissions, kasir limits' },
		{ icon: Database, label: 'Database & Backup', desc: 'Restore, archive, retention' }
	];
</script>

<svelte:head>
	<title>Pengaturan · HEKAS POS</title>
</svelte:head>

<RoleShell role="manager" title="Pengaturan" {user}>
	<div class="flex items-center justify-center px-4 py-12">
		<div class="max-w-2xl">
			<div class="mb-8 text-center">
				<div
					class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full"
					style="background: linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)"
				>
					<Settings class="size-8 text-violet-600" aria-hidden="true" />
				</div>
				<h1 class="text-foreground mb-2 text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
				<p class="text-muted-foreground mx-auto max-w-md text-sm">
					Konfigurasi outlet, operasional, keamanan, dan infrastruktur data HEKAS POS.
				</p>
			</div>

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
				{#each sections as sec (sec.label)}
					<div
						class="bg-card text-card-foreground flex items-start gap-3 rounded-xl border p-4 opacity-70 shadow-sm"
					>
						<div
							class="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md"
						>
							<sec.icon class="size-5" aria-hidden="true" />
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="text-foreground text-sm font-semibold">{sec.label}</h3>
							<p class="text-muted-foreground mt-0.5 text-xs">{sec.desc}</p>
						</div>
					</div>
				{/each}
			</div>

			<div
				class="bg-card text-card-foreground mt-6 rounded-xl border border-dashed p-4 text-center"
			>
				<p class="text-muted-foreground text-xs">
					🚧 Pengaturan advanced segera hadir. Untuk saat ini gunakan menu "Profil" di sidebar.
				</p>
			</div>

			<div class="mt-6 text-center">
				<a
					href="/manager/beranda"
					class="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
				>
					Kembali ke Beranda
					<ArrowRight class="size-3.5" />
				</a>
			</div>
		</div>
	</div>
</RoleShell>