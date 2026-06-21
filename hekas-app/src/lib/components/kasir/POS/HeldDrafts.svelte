<script lang="ts">
	/**
	 * HeldDrafts (HEKAS POS — kasir/POS)
	 * List transaksi yang di-hold — pakai relativeAge dari time-helpers.
	 */
	import type { HeldTransaction } from '$lib/types/domain';
	import { relativeAge } from '$lib/utils/time-helpers';
	import { formatIDR } from '$lib/utils/cart-totals';

	interface Props {
		drafts: HeldTransaction[];
		onrecall: (id: string) => void;
		ondelete: (id: string) => void;
		loading?: boolean;
	}

	let { drafts, onrecall, ondelete, loading = false }: Props = $props();

	function draftTotal(d: HeldTransaction): number {
		return d.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
	}

	function draftAge(d: HeldTransaction): string {
		return relativeAge((d as any).heldAt);
	}

	function handleDelete(d: HeldTransaction) {
		const items = d.cart.length;
		if (confirm(`Hapus draft ini (${items} item)? Tindakan tidak bisa dibatalkan.`)) {
			ondelete(d.id);
		}
	}

	function handleKey(e: KeyboardEvent, d: HeldTransaction) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onrecall(d.id);
		}
		if (e.key === 'Delete') {
			e.preventDefault();
			handleDelete(d);
		}
	}
</script>

{#if loading}
	<div class="space-y-2">
		{#each Array(3) as _, i (i)}
			<div class="p-3 bg-slate-50 rounded-lg animate-pulse h-14"></div>
		{/each}
	</div>
{:else if drafts.length === 0}
	<div class="text-center py-8 text-slate-400 text-sm">
		<div class="text-3xl mb-2" aria-hidden="true">📋</div>
		Tidak ada draft tertahan
		<p class="text-xs mt-1 text-slate-400">Tekan tombol Hold untuk menahan transaksi</p>
	</div>
{:else}
	<ul class="space-y-2" role="list" aria-label="Transaksi tertahan">
		{#each drafts as d (d.id)}
			{@const total = draftTotal(d)}
			{@const age = draftAge(d)}
			<li
				class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
				tabindex="0"
				role="button"
				aria-label={`Recall draft ${d.id.slice(0, 8)}`}
				onkeydown={(e) => handleKey(e, d)}
			>
				<div class="flex-1 min-w-0">
					<div class="flex items-center gap-2">
						<span class="text-xs text-amber-800 font-mono font-semibold">
							#{d.id.slice(0, 8)}
						</span>
						{#if age}
							<span class="text-[10px] text-amber-700">· {age}</span>
						{/if}
					</div>
					<div class="text-sm text-slate-800 mt-0.5">
						{d.cart.length} item · <span class="font-semibold">{formatIDR(total)}</span>
					</div>
					{#if (d as any).customerName}
						<div class="text-xs text-slate-500 truncate">👤 {(d as any).customerName}</div>
					{/if}
				</div>
				<button
					type="button"
					onclick={() => onrecall(d.id)}
					class="px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
				>
					Recall
				</button>
				<button
					type="button"
					onclick={() => handleDelete(d)}
					aria-label={`Hapus draft ${d.id.slice(0, 8)}`}
					title="Hapus"
					class="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 rounded text-lg leading-none"
				>
					✕
				</button>
			</li>
		{/each}
	</ul>
{/if}
