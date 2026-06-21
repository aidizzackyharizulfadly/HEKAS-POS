<script lang="ts">
	/**
	 * OrderDetail (HEKAS POS — kasir/Order)
	 * Detail panel satu order — items, customer, payment, action buttons
	 * dengan status badge dan refund eligibility check.
	 *
	 * Refactor: pakai orderStatus + statusClasses + formatDateTime + ageHours helpers.
	 */
	import type { Transaction } from '$lib/types/domain';
	import { orderStatus } from '$lib/utils/status-helpers';
	import { statusClasses } from '$lib/utils/status-classes';
	import { formatDateTime, ageHours } from '$lib/utils/time-helpers';
	import { formatCurrency } from '$lib/utils/format';

	interface Props {
		order: Transaction;
		onclose: () => void;
		onvoid?: (id: number | string, reason: string) => void;
		onreprint?: (id: number | string) => void;
	}

	let { order, onclose, onvoid, onreprint }: Props = $props();

	const orderId = $derived(order.id);

	const statusBadge = $derived.by(() => {
		const meta = orderStatus(order.status ?? '');
		return { label: meta.label, cls: statusClasses(meta) };
	});

	const orderDate = $derived(formatDateTime(order.created_at));
	const hoursOld = $derived(ageHours(order.created_at));
	const orderTotal = $derived((order as any).total ?? (order as any).grand_total ?? 0);

	const canVoid = $derived(
		!!onvoid && order.status === 'completed' && hoursOld < 24
	);
	const canReprint = $derived(!!onreprint && order.status !== 'void');

	const voidBlockedReason = $derived.by(() => {
		if (!onvoid) return '';
		if (order.status !== 'completed')
			return `Order status "${order.status}" tidak bisa di-void.`;
		if (hoursOld >= 24) return 'Order > 24 jam. Hubungi manager untuk void.';
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
						<span class="font-mono tabular-nums flex-shrink-0">{formatCurrency(item.subtotal)}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="border-t pt-3 space-y-1 text-sm">
		<div class="flex justify-between">
			<span>Subtotal</span>
			<span class="font-mono tabular-nums">{formatCurrency(order.subtotal)}</span>
		</div>
		{#if order.discount_amt > 0}
			<div class="flex justify-between text-red-600">
				<span>Diskon</span>
				<span class="font-mono tabular-nums">−{formatCurrency(order.discount_amt)}</span>
			</div>
		{/if}
		<div class="flex justify-between text-lg font-bold pt-1 border-t border-slate-100">
			<span>Total</span>
			<span class="text-blue-600 font-mono tabular-nums">{formatCurrency(order.total)}</span>
		</div>
		<div class="flex justify-between text-emerald-600">
			<span>Dibayar ({order.payment_method ?? '—'})</span>
			<span class="font-mono tabular-nums">{formatCurrency(order.paid)}</span>
		</div>
		{#if order.change_amt > 0}
			<div class="flex justify-between text-slate-500">
				<span>Kembali</span>
				<span class="font-mono tabular-nums">{formatCurrency(order.change_amt)}</span>
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
