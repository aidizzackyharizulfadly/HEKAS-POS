<!--
  InventoryAnalytics (HEKAS POS — manager/Inventaris)
  Orchestrator: compose FastMovingList + low stock alerts + category breakdown.
  Used by: /manager/inventaris page.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '$lib/api';
	import FastMovingList from '$lib/components/manager/Inventaris/FastMovingList.svelte';
	import { stockStatus } from '$lib/utils/status-helpers';
	import type { FastMovingItem } from '$lib/types/domain';

	interface Props {
		initial?: {
			fastMoving?: FastMovingItem[];
			lowStock?: { name: string; stock: number; min: number }[];
		};
	}

	let { initial }: Props = $props();

	let loading = $state(true);
	let fastMoving = $state<FastMovingItem[]>([]);
	let lowStock = $state<{ name: string; stock: number; min: number }[]>([]);

	onMount(async () => {
		if (initial) {
			fastMoving = initial.fastMoving ?? [];
			lowStock = initial.lowStock ?? [];
			loading = false;
			return;
		}

		try {
			// @ts-expect-error - optional method, may not exist
			const data: any = await api.analytics.getFastMoving?.();
			if (Array.isArray(data)) fastMoving = data;
		} catch (e) {
			console.warn('[InventoryAnalytics] fetch failed:', e);
		}
		loading = false;
	});
</script>

{#if loading}
	<p style="color: #94A3B8; font-size: 13px; text-align: center; padding: 32px">Memuat data…</p>
{:else}
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<section class="lg:col-span-2">
			<FastMovingList items={fastMoving} limit={10} />
		</section>

		<section class="bg-surface rounded-2xl border border-default overflow-hidden">
			<div class="px-5 py-4 border-b border-default">
				<h3 class="text-headline-sm font-semibold text-default">Stok Kritis</h3>
				<p class="text-body-sm text-muted mt-0.5">Produk dengan stok di bawah minimum</p>
			</div>
			{#if lowStock.length === 0}
				<div class="px-5 py-12 text-center text-muted text-body-sm">
					<div class="text-4xl mb-2" aria-hidden="true">✅</div>
					Semua stok aman.
				</div>
			{:else}
				<ul class="divide-y divide-default">
					{#each lowStock as item (item.name)}
						{@const meta = stockStatus(item.stock, item.min)}
						<li class="px-5 py-3 flex items-center justify-between">
							<span class="text-body-sm font-medium text-default truncate">{item.name}</span>
							<span
								class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-semibold bg-{meta.color}-100 text-{meta.color}-700"
							>
								{meta.icon} {meta.label} · {item.stock}/{item.min}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
{/if}
