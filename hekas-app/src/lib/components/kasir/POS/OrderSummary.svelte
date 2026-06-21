<script lang="ts">
	/**
	 * OrderSummary (HEKAS POS — kasir/POS)
	 * Order summary panel — subtotal, discount, tax, total.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props {
		subtotal: number;
		discount: number;
		tax: number;
		total: number;
		memberName?: string;
	}
	let { subtotal, discount, tax, total, memberName }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<div class="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
	{#if memberName}
		<div class="flex items-center gap-2 pb-2 border-b border-slate-100">
			<span class="text-base" aria-hidden="true">👤</span>
			<span class="font-semibold text-slate-800">{memberName}</span>
		</div>
	{/if}
	<div class="flex justify-between"><span class="text-slate-600">Subtotal</span><span class="font-medium">{fmt(subtotal)}</span></div>
	{#if discount > 0}
		<div class="flex justify-between text-red-600"><span>Diskon</span><span>−{fmt(discount)}</span></div>
	{/if}
	{#if tax > 0}
		<div class="flex justify-between"><span class="text-slate-600">Pajak</span><span>{fmt(tax)}</span></div>
	{/if}
	<div class="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
		<span>Total</span>
		<span class="text-blue-600">{fmt(total)}</span>
	</div>
</div>


