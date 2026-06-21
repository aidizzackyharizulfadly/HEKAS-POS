<script lang="ts">
	/**
	 * CategoryTabs (HEKAS POS — kasir/POS)
	 * Tab kategori produk di POS. Click untuk filter product grid.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Category { id: string; label: string; emoji?: string; count?: number; }
	interface Props { categories: Category[]; activeId: string; onchange: (id: string) => void; }
	let { categories, activeId, onchange }: Props = $props();
</script>

<div class="flex gap-2 overflow-x-auto pb-2" role="tablist">
	{#each categories as cat (cat.id)}
		<button
			type="button"
			role="tab"
			aria-selected={cat.id === activeId}
			onclick={() => onchange(cat.id)}
			class="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors {cat.id === activeId
				? 'bg-blue-600 text-white'
				: 'bg-slate-100 text-slate-700 hover:bg-slate-200'}"
		>
			{#if cat.emoji}<span aria-hidden="true">{cat.emoji}</span>{/if}
			{cat.label}
			{#if cat.count !== undefined}<span class="ml-1 opacity-70">({cat.count})</span>{/if}
		</button>
	{/each}
</div>


