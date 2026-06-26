<!--
  OutletPagination (HEKAS POS — owner/Manage)
  Pagination footer per Role_Owner/screen.png design.
  Pattern: "Menampilkan X dari Y Outlet terdaftar" + Previous/[1]/2/Next.
-->
<script lang="ts">
	type Props = {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		pageSize: number;
		onpageChange: (page: number) => void;
	};

	let { currentPage, totalPages, totalCount, pageSize, onpageChange }: Props = $props();

	// Build compact page list (1, 2, ..., N) — show all if N <= 5
	const pages = $derived.by(() => {
		const arr: (number | '...')[] = [];
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) arr.push(i);
		} else {
			arr.push(1);
			if (currentPage > 3) arr.push('...');
			const start = Math.max(2, currentPage - 1);
			const end = Math.min(totalPages - 1, currentPage + 1);
			for (let i = start; i <= end; i++) arr.push(i);
			if (currentPage < totalPages - 2) arr.push('...');
			arr.push(totalPages);
		}
		return arr;
	});

	const startItem = $derived((currentPage - 1) * pageSize + 1);
	const endItem = $derived(Math.min(currentPage * pageSize, totalCount));
</script>

<div class="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
	<div class="text-xs text-slate-500">
		Menampilkan <span class="font-semibold tabular-nums">{startItem}–{endItem}</span>
		dari <span class="font-semibold tabular-nums">{totalCount}</span> Outlet terdaftar
	</div>

	<div class="flex items-center gap-1">
		<button
			type="button"
			disabled={currentPage === 1}
			onclick={() => onpageChange(currentPage - 1)}
			class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
		>
			Previous
		</button>
		{#each pages as p, i (i + '-' + p)}
			{#if p === '...'}
				<span class="px-2 text-slate-400">...</span>
			{:else}
				<button
					type="button"
					onclick={() => onpageChange(p)}
					class="min-w-[2rem] h-8 rounded-md text-sm font-bold transition-colors {p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'}"
				>
					{p}
				</button>
			{/if}
		{/each}
		<button
			type="button"
			disabled={currentPage === totalPages}
			onclick={() => onpageChange(currentPage + 1)}
			class="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
		>
			Next
		</button>
	</div>
</div>