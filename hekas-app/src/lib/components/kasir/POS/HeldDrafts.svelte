<script lang="ts">
	/**
	 * HeldDrafts (HEKAS POS — kasir/POS)
	 * List transaksi yang di-hold — recall atau hapus.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { HeldTransaction } from '$lib/types/domain';
	interface Props {
		drafts: HeldTransaction[];
		onrecall: (id: string) => void;
		ondelete: (id: string) => void;
	}
	let { drafts, onrecall, ondelete }: Props = $props();
</script>

{#if drafts.length === 0}
	<div class="text-center py-8 text-slate-400 text-sm">Tidak ada draft tertahan</div>
{:else}
	<ul class="space-y-2" role="list">
		{#each drafts as d (d.id)}
			<li class="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
				<div class="flex-1 min-w-0">
					<div class="text-xs text-amber-700 font-mono">{d.id.slice(0, 8)}</div>
					<div class="text-sm text-slate-800">{d.cart.length} item</div>
				</div>
				<button type="button" onclick={() => onrecall(d.id)} class="px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700">Recall</button>
				<button type="button" onclick={() => ondelete(d.id)} class="text-red-500 hover:text-red-700 text-lg" aria-label="Hapus draft">✕</button>
			</li>
		{/each}
	</ul>
{/if}


