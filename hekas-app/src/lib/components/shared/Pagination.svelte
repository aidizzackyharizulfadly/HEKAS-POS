<script lang="ts">
	/**
	 * Pagination control.
	 *
	 * Usage:
	 *   <Pagination
	 *     current={page}
	 *     total={totalPages}
	 *     onchange={(p) => loadPage(p)}
	 *   />
	 *
	 *   <Pagination
	 *     current={page}
	 *     total={totalPages}
	 *     showFirstLast
	 *     siblingCount={1}
	 *     onchange={(p) => loadPage(p)}
	 *   />
	 */

	interface Props {
		current: number; // 1-indexed
		total: number;
		siblingCount?: number;
		showFirstLast?: boolean;
		size?: 'sm' | 'md';
		onchange: (page: number) => void;
	}

	let {
		current,
		total,
		siblingCount = 1,
		showFirstLast = true,
		size = 'md',
		onchange
	}: Props = $props();

	const btnBase =
		'inline-flex items-center justify-center font-semibold transition-colors border';
	const sizeMap = {
		sm: 'h-7 min-w-7 px-2 text-xs rounded',
		md: 'h-9 min-w-9 px-3 text-sm rounded-lg'
	} as const;
	const sizeCls = $derived(sizeMap[size]);

	const pages = $derived(buildPageList(current, total, siblingCount));

	function buildPageList(c: number, t: number, s: number): Array<number | 'ellipsis'> {
		if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
		const out: Array<number | 'ellipsis'> = [];
		const left = Math.max(2, c - s);
		const right = Math.min(t - 1, c + s);
		out.push(1);
		if (left > 2) out.push('ellipsis');
		for (let i = left; i <= right; i++) out.push(i);
		if (right < t - 1) out.push('ellipsis');
		out.push(t);
		return out;
	}

	function go(p: number) {
		if (p < 1 || p > total || p === current) return;
		onchange(p);
	}
</script>

{#if total > 1}
	<nav
		aria-label="Pagination"
		class="flex items-center gap-1 flex-wrap"
	>
		{#if showFirstLast}
			<button
				type="button"
				class="{btnBase} {sizeCls} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
				onclick={() => go(1)}
				disabled={current === 1}
				aria-label="Halaman pertama"
			>
				«
			</button>
		{/if}

		<button
			type="button"
			class="{btnBase} {sizeCls} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
			onclick={() => go(current - 1)}
			disabled={current === 1}
			aria-label="Halaman sebelumnya"
		>
			‹
		</button>

		{#each pages as p, i (i)}
			{#if p === 'ellipsis'}
				<span class="px-2 text-slate-400" aria-hidden="true">…</span>
			{:else}
				<button
					type="button"
					class="{btnBase} {sizeCls}"
					class:bg-blue-600={p === current}
					class:text-white={p === current}
					class:border-blue-600={p === current}
					class:bg-white={p !== current}
					class:text-slate-700={p !== current}
					class:border-slate-200={p !== current}
					class:hover:bg-slate-50={p !== current}
					onclick={() => go(p)}
					aria-current={p === current ? 'page' : undefined}
					aria-label="Halaman {p}"
				>
					{p}
				</button>
			{/if}
		{/each}

		<button
			type="button"
			class="{btnBase} {sizeCls} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
			onclick={() => go(current + 1)}
			disabled={current === total}
			aria-label="Halaman berikutnya"
		>
			›
		</button>

		{#if showFirstLast}
			<button
				type="button"
				class="{btnBase} {sizeCls} bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
				onclick={() => go(total)}
				disabled={current === total}
				aria-label="Halaman terakhir"
			>
				»
			</button>
		{/if}
	</nav>
{/if}
