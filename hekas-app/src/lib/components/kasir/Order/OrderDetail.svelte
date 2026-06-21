<script lang="ts">
	/**
	 * OrderDetail (HEKAS POS — kasir/Order)
	 * Detail panel satu order — items, customer, payment, action buttons.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Transaction } from '$lib/types/domain';
	interface Props {
		order: Transaction;
		onclose: () => void;
		onvoid?: (id: number | string, reason: string) => void;
		onreprint?: (id: number | string) => void;
	}
	let { order, onclose, onvoid, onreprint }: Props = $props();
	const fmt = (n: number) => n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex justify-between items-start">
		<div>
			<div class="text-xs text-slate-500">Invoice</div>
			<div class="text-lg font-bold font-mono">{order.invoice_no}</div>
		</div>
		<button type="button" onclick={onclose} class="text-slate-400 hover:text-slate-600" aria-label="Tutup">✕</button>
	</div>

	<div class="grid grid-cols-2 gap-3 text-sm">
		<div><div class="text-slate-500 text-xs">Tanggal</div><div class="font-medium">{new Date(order.created_at).toLocaleString('id-ID')}</div></div>
		<div><div class="text-slate-500 text-xs">Kasir</div><div class="font-medium">{order.user_name ?? order.user_id}</div></div>
		<div><div class="text-slate-500 text-xs">Member</div><div class="font-medium">{order.member_name ?? '—'}</div></div>
		<div><div class="text-slate-500 text-xs">Status</div><div class="font-medium">{order.status}</div></div>
	</div>

	{#if order.items}
		<div>
			<div class="text-xs text-slate-500 font-semibold mb-1">Items</div>
			<ul class="space-y-1 text-sm">
				{#each order.items as item (item.product_id)}
					<li class="flex justify-between"><span>{item.product_name} × {item.qty}</span><span class="font-mono">{fmt(item.subtotal)}</span></li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="border-t pt-3 space-y-1 text-sm">
		<div class="flex justify-between"><span>Subtotal</span><span class="font-mono">{fmt(order.subtotal)}</span></div>
		{#if order.discount_amt > 0}<div class="flex justify-between text-red-600"><span>Diskon</span><span>−{fmt(order.discount_amt)}</span></div>{/if}
		<div class="flex justify-between text-lg font-bold"><span>Total</span><span class="text-blue-600 font-mono">{fmt(order.total)}</span></div>
		<div class="flex justify-between text-emerald-600"><span>Dibayar ({order.payment_method})</span><span class="font-mono">{fmt(order.paid)}</span></div>
		<div class="flex justify-between"><span>Kembali</span><span class="font-mono">{fmt(order.change_amt)}</span></div>
	</div>

	<div class="flex gap-2 pt-2">
		{#if onreprint}<button type="button" onclick={() => onreprint(order.id)} class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold text-sm">🖨️ Cetak Ulang</button>{/if}
		{#if onvoid && order.status === 'completed'}<button type="button" onclick={() => onvoid(order.id, '')} class="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm">❌ Void</button>{/if}
	</div>
</div>
