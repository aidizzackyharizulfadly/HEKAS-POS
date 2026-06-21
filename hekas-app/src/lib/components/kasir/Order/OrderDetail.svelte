<script lang="ts">
	/**
	 * OrderDetail (HEKAS POS — kasir/Order)
	 * Detail panel satu order — items, customer, payment, action buttons
	 * dengan status badge dan refund eligibility check.
	 */
	import type { Transaction } from '$lib/types/domain';

	interface Props {
		order: Transaction;
		onclose: () => void;
		onvoid?: (id: number | string, reason: string) => void;
		onreprint?: (id: number | string) => void;
	}

	let { order, onclose, onvoid, onreprint }: Props = $props();

	const fmt = (n: number) =>
		n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

	const orderId = $derived(order.id);

	const statusBadge = $derived.by(() => {
		const s = (order.status ?? '').toLowerCase();
		if (s === 'completed')
			return { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-800' };
		if (s === 'void') return { label: 'Void', cls: 'bg-red-100 text-red-800' };
		if (s === 'held') return { label: 'Pending', cls: 'bg-amber-100 text-amber-800' };
		return { label: order.status ?? '—', cls: 'bg-slate-100 text-slate-700' };
	});

	const orderDate = $derived.by(() => {
		try {
			return new Date(order.created_at).toLocaleString('id-ID', {
				dateStyle: 'medium',
				timeStyle: 'short'
			});
		} catch {
			return String(order.created_at);
		}
	});

	const ageHours = $derived.by(() => {
		try {
			const ms = Date.now() - new Date(order.created_at).getTime();
			return ms / 3_600_000;
		} catch {
			return 0;
		}
	});

	const canVoid = $derived(
		!!onvoid && order.status === 'completed' && ageHours < 24
	);
	const canReprint = $derived(!!onreprint && order.status !== 'void');

	const voidBlockedReason = $derived.by(() => {
		if (!onvoid) return '';
		if (order.status !== 'completed')
			return `Order status "${order.status}" tidak bisa di-void.`;
		if (ageHours >= 24) return 'Order > 24 jam. Hubungi manager untuk void.';
		return '';
	});

	function handleVoid() {
		if (!onvoid) return;
		const reason = prompt('Alasan void (wajib):', '') ?? '';
		if (reason.trim().length < 3) {
			alert('Alasan void minimal 3 karakter.');
			return;
		}
		onvoid(orderId, reason.trim());
	}
</script>

<div class="flex flex-col gap-4 p-4">
	<div class="flex justify-between items-start">
		<div>
			<div class="text-xs text-slate-500">Invoice</div>
			<div class="text-lg font-bold font-mono">{order.invoice_no}</div>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-[10px] px-2 py-0.5 rounded-full font-bold {statusBadge.cls}">
				{statusBadge.label}
			</span>
			<button
				type="button"
				onclick={onclose}
				aria-label="Tutup detail order"
				class="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"
			>
				✕
			</button>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3 text-sm">
		<div>
			<div class="text-slate-500 text-xs">Tanggal</div>
			<div class="font-medium">{orderDate}</div>
		</div>
		<div>
			<div class="text-slate-500 text-xs">Kasir</div>
			<div class="font-medium">{order.user_name ?? order.user_id}</div>
		</div>
		<div>
			<div class="text-slate-500 text-xs">Member</div>
			<div class="font-medium">{order.member_name ?? '—'}</div>
		</div>
		<div>
			<div class="text-slate-500 text-xs">Payment</div>
			<div class="font-medium">{order.payment_method ?? '—'}</div>
		</div>
	</div>

	{#if order.items && order.items.length > 0}
		<div>
			<div class="text-xs text-slate-500 font-semibold mb-1">Items ({order.items.length})</div>
			<ul class="space-y-1 text-sm">
				{#each order.items as item (item.product_id)}
					<li class="flex justify-between gap-2">
						<span class="truncate">
							{item.product_name}
							<span class="text-slate-500">× {item.qty}</span>
						</span>
						<span class="font-mono tabular-nums flex-shrink-0">{fmt(item.subtotal)}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="border-t pt-3 space-y-1 text-sm">
		<div class="flex justify-between">
			<span>Subtotal</span>
			<span class="font-mono tabular-nums">{fmt(order.subtotal)}</span>
		</div>
		{#if order.discount_amt > 0}
			<div class="flex justify-between text-red-600">
				<span>Diskon</span>
				<span class="font-mono tabular-nums">−{fmt(order.discount_amt)}</span>
			</div>
		{/if}
		<div class="flex justify-between text-lg font-bold pt-1 border-t border-slate-100">
			<span>Total</span>
			<span class="text-blue-600 font-mono tabular-nums">{fmt(order.total)}</span>
		</div>
		<div class="flex justify-between text-emerald-600">
			<span>Dibayar ({order.payment_method ?? '—'})</span>
			<span class="font-mono tabular-nums">{fmt(order.paid)}</span>
		</div>
		{#if order.change_amt > 0}
			<div class="flex justify-between text-slate-500">
				<span>Kembali</span>
				<span class="font-mono tabular-nums">{fmt(order.change_amt)}</span>
			</div>
		{/if}
	</div>

	{#if voidBlockedReason}
		<div
			role="alert"
			class="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5"
		>
			{voidBlockedReason}
		</div>
	{/if}

	<div class="flex gap-2 pt-2">
		{#if onreprint}
			<button
				type="button"
				onclick={() => onreprint(orderId)}
				disabled={!canReprint}
				class="flex-1 py-2 rounded-lg border border-slate-300 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
			>
				🖨️ Cetak Ulang
			</button>
		{/if}
		{#if onvoid}
			<button
				type="button"
				onclick={handleVoid}
				disabled={!canVoid}
				title={voidBlockedReason || 'Void transaksi'}
				class="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				❌ Void
			</button>
		{/if}
	</div>
</div>
