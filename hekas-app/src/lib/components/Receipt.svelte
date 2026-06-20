<script lang="ts">
	import type { Transaction } from '$lib/api';
	import type { StoreSettings } from '$lib/print';
	import { DEFAULT_STORE_SETTINGS } from '$lib/print';
	import { PAYMENT_METHOD_LABEL } from '$lib/payment';

	interface Props {
		transaction: Transaction;
		settings?: StoreSettings;
		compact?: boolean;       // smaller text (untuk thermal preview)
		showWatermark?: boolean; // watermark "COPY" untuk reprint
	}

	let { transaction: tx, settings = DEFAULT_STORE_SETTINGS, compact = false, showWatermark = false }: Props = $props();

	const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
	const dateStr = (iso: string) => new Date(iso).toLocaleString('id-ID', {
		day: '2-digit', month: 'short', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	});

	const legacyMethodLabel: Record<string, string> = {
		tunai: 'TUNAI', qris: 'QRIS', debit: 'KARTU DEBIT',
	};

	// Fase 5: payments selalu ter-inflate (legacy single di-translate jadi array 1-entry)
	// oleh transactions.listTransactions/getTransaction, jadi kita aman baca tx.payments
	const payments = $derived(tx.payments ?? []);
	const isSplit = $derived(tx.is_split ?? payments.length > 1);
</script>

<!-- Receipt rendered as thermal-style receipt. CSS print rules in app.css handle window.print(). -->
<div
	id="hekas-receipt-print"
	class="receipt"
	class:compact
	style="
		font-family: 'SF Mono', 'Courier New', monospace;
		background: #fff;
		color: #000;
		padding: 12px;
		max-width: {settings.paper_width === '58mm' ? '58mm' : '80mm'};
		margin: 0 auto;
		font-size: {compact ? '11px' : '12px'};
		line-height: 1.4;
		position: relative;
	"
>
	{#if showWatermark}
		<div
			style="
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%) rotate(-20deg);
				font-size: 48px;
				font-weight: 900;
				color: rgba(220, 38, 38, 0.12);
				letter-spacing: 0.2em;
				pointer-events: none;
				user-select: none;
			"
		>COPY</div>
	{/if}

	<!-- Header -->
	<div style="text-align: center; margin-bottom: 8px">
		{#if settings.show_logo}
			<div style="font-size: 18px; font-weight: 900; letter-spacing: 0.05em">
				{settings.store_name.toUpperCase()}
			</div>
		{:else}
			<div style="font-size: 14px; font-weight: 800">{settings.store_name}</div>
		{/if}
		<div style="font-size: 10px; margin-top: 2px">{settings.address}</div>
		<div style="font-size: 10px">Telp: {settings.phone}</div>
	</div>

	<div class="ruler">- - - - - - - - - - - - - - - - - - -</div>

	<!-- Meta -->
	<div style="margin-bottom: 4px">
		<div style="display: flex; justify-content: space-between">
			<span>No</span><span>{tx.invoice_no}</span>
		</div>
		<div style="display: flex; justify-content: space-between">
			<span>Tgl</span><span>{dateStr(tx.created_at)}</span>
		</div>
		<div style="display: flex; justify-content: space-between">
			<span>Kasir</span><span>{tx.user_name ?? '—'}</span>
		</div>
		{#if tx.member_name}
			<div style="display: flex; justify-content: space-between">
				<span>Member</span><span>{tx.member_name}</span>
			</div>
		{/if}
	</div>

	<div class="ruler">- - - - - - - - - - - - - - - - - - -</div>

	<!-- Items -->
	<div style="margin: 6px 0">
		{#each tx.items ?? [] as it}
			<div style="margin-bottom: 4px">
				<div style="font-weight: 700">{it.product_name}</div>
				<div style="display: flex; justify-content: space-between; padding-left: 8px; font-size: 0.92em">
					<span>{it.qty} × {fmt(it.price)}</span>
					<span style="font-weight: 700">{fmt(it.subtotal)}</span>
				</div>
			</div>
		{/each}
	</div>

	<div class="ruler">- - - - - - - - - - - - - - - - - - -</div>

	<!-- Totals -->
	<div style="margin: 6px 0">
		<div style="display: flex; justify-content: space-between">
			<span>Subtotal</span><span>{fmt(tx.subtotal)}</span>
		</div>
		{#if tx.discount_pct > 0}
			<div style="display: flex; justify-content: space-between; color: #DC2626">
				<span>Diskon ({tx.discount_pct}%)</span><span>−{fmt(tx.discount_amt)}</span>
			</div>
		{/if}
		<div style="display: flex; justify-content: space-between; font-size: 1.3em; font-weight: 900; margin: 4px 0">
			<span>TOTAL</span><span>{fmt(tx.total)}</span>
		</div>
		<!-- Fase 5: payment breakdown (single ATAU multi-split) -->
		{#if isSplit}
			<div style="font-size: 0.92em; font-weight: 700; margin-top: 4px">Pembayaran (Split):</div>
			{#each payments as p}
				<div style="display: flex; justify-content: space-between; font-size: 0.92em; padding-left: 6px">
					<span>• {PAYMENT_METHOD_LABEL[p.kind] ?? legacyMethodLabel[p.kind] ?? p.kind}{p.label ? ` (${p.label})` : ''}</span>
					<span>{fmt(p.amount)}</span>
				</div>
				{#if p.reference}
					<div style="font-size: 0.78em; color: #64748B; padding-left: 12px">Ref: {p.reference}</div>
				{/if}
			{/each}
			<div style="display: flex; justify-content: space-between; margin-top: 2px">
				<span>Total Bayar</span><span>{fmt(tx.paid)}</span>
			</div>
		{:else if payments.length === 1}
			{@const p = payments[0]}
			<div style="display: flex; justify-content: space-between">
				<span>Bayar ({PAYMENT_METHOD_LABEL[p.kind] ?? legacyMethodLabel[p.kind] ?? p.kind})</span>
				<span>{fmt(p.amount)}</span>
			</div>
			{#if p.reference}
				<div style="font-size: 0.85em; color: #64748B">Ref: {p.reference}</div>
			{/if}
			{#if p.tendered !== undefined && p.tendered > p.amount}
				<div style="display: flex; justify-content: space-between; font-size: 0.92em">
					<span style="padding-left: 8px">Disetor</span>
					<span>{fmt(p.tendered)}</span>
				</div>
			{/if}
		{:else}
			<!-- Fallback (legacy tx, payments belum ter-inflate) -->
			<div style="display: flex; justify-content: space-between">
				<span>Bayar ({legacyMethodLabel[tx.payment_method] ?? tx.payment_method})</span>
				<span>{fmt(tx.paid)}</span>
			</div>
		{/if}
		{#if tx.change_amt > 0}
			<div style="display: flex; justify-content: space-between">
				<span>Kembali</span><span>{fmt(tx.change_amt)}</span>
			</div>
		{/if}
	</div>

	<div class="ruler">= = = = = = = = = = = = = = = = = = =</div>

	<!-- Footer -->
	<div style="text-align: center; margin-top: 10px; font-size: 10px; line-height: 1.5">
		<div style="font-weight: 700">{settings.footer_message}</div>
		{#if tx.note}
			<div style="margin-top: 6px; font-style: italic; color: #64748B">{tx.note}</div>
		{/if}
		<div style="margin-top: 10px; color: #94A3B8">
			{dateStr(tx.created_at).split(',')[1] ?? ''} • {tx.invoice_no}
		</div>
	</div>

	<div style="text-align: center; margin-top: 14px">
		<div style="font-size: 9px; color: #CBD5E1">— powered by HEKAS POS —</div>
	</div>
</div>

<style>
	.ruler {
		text-align: center;
		color: #000;
		font-size: 10px;
		letter-spacing: -1px;
		margin: 4px 0;
		overflow: hidden;
		white-space: nowrap;
	}
</style>
