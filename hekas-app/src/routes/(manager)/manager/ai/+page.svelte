<!--
  /manager/ai — AI Assistant control center.
  Page uses shared "Under Development" placeholder pattern.
-->
<script lang="ts">
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import { Sparkles, ArrowRight, MessageSquare, LineChart, Shield } from '@lucide/svelte';
	import { api } from '$lib/api';
	import { onMount } from 'svelte';

	let user = $state<{ id: string; username: string; full_name: string; role: string } | null>(null);
	onMount(async () => {
		user = (await api.auth.getCurrentUser().catch(() => null)) as any;
	});

	const features = [
		{
			icon: MessageSquare,
			color: 'blue',
			title: 'AI Chat Assistant',
			desc: 'Tanya tentang penjualan, stok, shift — natural language ke Bahasa Indonesia.'
		},
		{
			icon: LineChart,
			color: 'emerald',
			title: 'Predictive Insights',
			desc: 'Forecast penjualan 7 hari ke depan, deteksi anomali, rekomendasi restock.'
		},
		{
			icon: Shield,
			color: 'violet',
			title: 'Anomaly Detection',
			desc: 'Alert otomatis untuk transaksi tidak wajar (void beruntun, diskon besar).'
		}
	];
</script>

<svelte:head>
	<title>AI Assistant · HEKAS POS</title>
</svelte:head>

<RoleShell role="manager" title="AI Assistant" {user}>
	<div class="flex items-center justify-center px-4 py-16">
		<div class="max-w-2xl text-center">
			<div
				class="mx-auto mb-6 flex size-20 items-center justify-center rounded-full"
				style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
			>
				<Sparkles class="size-10 text-amber-600" aria-hidden="true" />
			</div>
			<h1 class="text-foreground mb-2 text-3xl font-bold tracking-tight">AI Assistant</h1>
			<p class="text-muted-foreground mx-auto mb-8 max-w-md text-sm leading-relaxed">
				Asisten AI terintegrasi untuk analisis data, prediksi, dan otomatisasi laporan
				manajemen toko retail.
			</p>

			<div class="mx-auto mb-8 grid max-w-xl grid-cols-1 gap-3 md:grid-cols-3">
				{#each features as feat (feat.title)}
					<div
						class="bg-card text-card-foreground rounded-xl border p-4 text-left shadow-sm transition-shadow hover:shadow-md"
					>
						<div
							class="mb-3 flex size-9 items-center justify-center rounded-md"
							style="background: {feat.color === 'blue'
								? '#DBEAFE'
								: feat.color === 'emerald'
									? '#D1FAE5'
									: '#EDE9FE'}; color: {feat.color === 'blue'
								? '#2563EB'
								: feat.color === 'emerald'
									? '#059669'
									: '#7C3AED'}"
						>
							<feat.icon class="size-5" aria-hidden="true" />
						</div>
						<h3 class="text-foreground mb-1 text-sm font-semibold">{feat.title}</h3>
						<p class="text-muted-foreground text-xs leading-relaxed">{feat.desc}</p>
					</div>
				{/each}
			</div>

			<div
				class="bg-card text-card-foreground mx-auto mb-6 max-w-md rounded-xl border border-dashed p-4"
			>
				<p class="text-muted-foreground text-xs">
					🚧 Modul ini dalam tahap desain. Backend endpoint <code class="text-foreground">/api/ai/*</code>
					belum ada di FE_HANDOFF v2.0.0.
				</p>
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