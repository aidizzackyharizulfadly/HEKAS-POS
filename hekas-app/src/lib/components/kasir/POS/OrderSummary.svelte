<script lang="ts">
	/**
	 * OrderSummary (HEKAS POS — kasir/POS)
	 * Order summary panel — subtotal, discount, tax, total dengan derived consistency check.
	 */
	interface Props {
		subtotal: number;
		discount: number;
		tax: number;
		total: number;
		memberName?: string;
		memberTier?: string;
		itemCount?: number;
	}

	let {
		subtotal,
		discount,
		tax,
		total,
		memberName,
		memberTier,
		itemCount
	}: Props = $props();

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const expectedTotal = $derived(Math.max(0, subtotal - discount + tax));
	const diff = $derived(total - expectedTotal);
	const hasInconsistency = $derived(Math.abs(diff) > 1);

	const tierBadge = $derived(
		{
			bronze: { label: 'Bronze', cls: 'bg-amber-100 text-amber-800' },
			silver: { label: 'Silver', cls: 'bg-slate-200 text-slate-800' },
			gold: { label: 'Gold', cls: 'bg-yellow-100 text-yellow-800' },
			platinum: { label: 'Platinum', cls: 'bg-purple-100 text-purple-800' }
		}[(memberTier ?? '').toLowerCase()] ?? null
	);
</script>

<div class="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
	{#if memberName}
		<div class="flex items-center gap-2 pb-2 border-b border-slate-100">
			<span class="text-base" aria-hidden="true">👤</span>
			<div class="flex-1 min-w-0">
				<div class="font-semibold text-slate-800 truncate">{memberName}</div>
				{#if itemCount !== undefined}
					<div class="text-xs text-slate-500">{itemCount} item</div>
				{/if}
			</div>
			{#if tierBadge}
				<span class="text-[10px] px-1.5 py-0.5 rounded font-bold {tierBadge.cls}">
					{tierBadge.label}
				</span>
			{/if}
		</div>
	{/if}

	<div class="flex justify-between">
		<span class="text-slate-600">Subtotal</span>
		<span class="font-medium tabular-nums">{fmt(subtotal)}</span>
	</div>

	{#if discount > 0}
		<div class="flex justify-between text-red-600">
			<span>Diskon</span>
			<span class="tabular-nums">−{fmt(discount)}</span>
		</div>
	{/if}

	{#if tax > 0}
		<div class="flex justify-between">
			<span class="text-slate-600">Pajak</span>
			<span class="tabular-nums">{fmt(tax)}</span>
		</div>
	{/if}

	<div class="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
		<span>Total</span>
		<span class="text-blue-600 tabular-nums" aria-live="polite">{fmt(total)}</span>
	</div>

	{#if hasInconsistency}
		<div
			role="alert"
			class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5"
		>
			⚠️ Kalkulasi tidak konsisten (Δ {fmt(diff)}). Hubungi admin.
		</div>
	{/if}
</div>
