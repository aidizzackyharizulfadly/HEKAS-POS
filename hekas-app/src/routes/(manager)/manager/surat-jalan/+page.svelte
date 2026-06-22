<!--
  /manager/surat-jalan — Surat Jalan management (Delivery Notes).
  Page uses shared "Under Development" placeholder pattern.
-->
<script lang="ts">
	import { page } from '$app/state';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import { Truck, ArrowRight, Sparkles } from '@lucide/svelte';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let user = $state<{ id: string; username: string; full_name: string; role: string } | null>(null);
	onMount(async () => {
		user = (await api.auth.getCurrentUser().catch(() => null)) as any;
	});
</script>

<svelte:head>
	<title>Surat Jalan · HEKAS POS</title>
</svelte:head>

<RoleShell role="manager" title="Surat Jalan" {user}>
	<div class="flex items-center justify-center px-4 py-16">
		<div class="max-w-lg text-center">
			<div
				class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full"
				style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)"
			>
				<Truck class="size-10 text-blue-600" aria-hidden="true" />
			</div>
			<h1 class="text-foreground mb-2 text-3xl font-bold tracking-tight">Surat Jalan</h1>
			<p class="text-muted-foreground mx-auto mb-6 max-w-md text-sm leading-relaxed">
				Modul manajemen Surat Jalan (delivery notes) untuk distribusi barang ke outlet.
				Generate, review, dan print dokumen pengiriman otomatis.
			</p>

			<div
				class="bg-card text-card-foreground mx-auto mb-6 max-w-sm rounded-xl border p-4 text-left shadow-sm"
			>
				<p class="text-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
					<Sparkles class="size-3.5 text-amber-500" />
					Rencana Fitur
				</p>
				<ul class="text-muted-foreground space-y-2 text-sm">
					<li class="flex items-start gap-2">
						<span class="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"></span>
						Generate SJ otomatis dari approved PO
					</li>
					<li class="flex items-start gap-2">
						<span class="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"></span>
						Review & approval workflow (gudang → manager)
					</li>
					<li class="flex items-start gap-2">
						<span class="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"></span>
						Print PDF A5 + signature (penerima + pengirim)
					</li>
					<li class="flex items-start gap-2">
						<span class="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"></span>
						Audit trail perubahan status
					</li>
				</ul>
			</div>

			<a
				href="/manager/beranda"
				class="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
			>
				Kembali ke Beranda
				<ArrowRight class="size-3.5" />
			</a>
		</div>
	</div>
</RoleShell>