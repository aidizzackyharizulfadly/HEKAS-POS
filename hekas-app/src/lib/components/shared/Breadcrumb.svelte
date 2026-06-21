<script lang="ts">
	/**
	 * Breadcrumb navigation.
	 *
	 * Usage:
	 *   <Breadcrumb
	 *     items={[
	 *       { label: 'Beranda', href: '/manager/beranda' },
	 *       { label: 'Penjualan' },
	 *       { label: 'Detail' }
	 *     ]}
	 *   />
	 */
	interface Crumb {
		label: string;
		href?: string;
	}

	interface Props {
		items: Crumb[];
		separator?: string;
	}

	let { items, separator = '›' }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm flex-wrap">
	{#each items as item, i (item.label)}
		{#if item.href && i < items.length - 1}
			<a
				href={item.href}
				class="text-slate-500 hover:text-blue-600 transition-colors font-medium"
			>
				{item.label}
			</a>
		{:else}
			<span class="text-slate-800 font-semibold" aria-current="page">
				{item.label}
			</span>
		{/if}

		{#if i < items.length - 1}
			<span class="text-slate-300 select-none" aria-hidden="true">{separator}</span>
		{/if}
	{/each}
</nav>
