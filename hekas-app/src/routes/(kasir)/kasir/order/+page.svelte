<!--
  /kasir/order — Daftar order/transaksi untuk kasir.

  Catatan (Fase R3 / 2026-06-22): <KasirRail> di-render oleh (kasir)/+layout.svelte.
  Tidak perlu <RoleShell> lagi. Halaman ini cukup render konten.
-->
<script lang="ts">
	import OrderList from '$lib/components/kasir/Order/OrderList.svelte';
	import { onMount } from 'svelte';
	import type { Transaction } from '$lib/types/domain';
	import { listTransactions } from '$lib/api/transactions';

	let orders = $state<Transaction[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			orders = await listTransactions({ limit: 50 });
		} catch {
			orders = [];
		} finally {
			loading = false;
		}
	});

	function handleSelect(t: Transaction) {
		console.log('Selected:', t.invoice_no);
	}

	function handleVoid(t: Transaction) {
		if (confirm(`Void order ${t.invoice_no}?`)) {
			console.log('Void:', t.invoice_no);
		}
	}

	function handlePrint(t: Transaction) {
		console.log('Print:', t.invoice_no);
		window.print();
	}
</script>

<svelte:head>
	<title>Daftar Order · HEKAS POS</title>
</svelte:head>

<div class="kasir-order" style="padding: 20px 24px">
	<header style="margin-bottom: 16px">
		<h1 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0">Daftar Order</h1>
		<p style="font-size: 12px; color: #64748B; margin: 4px 0 0">Riwayat transaksi shift ini</p>
	</header>
	{#if loading}
		<div class="text-center py-12" style="color: #94A3B8">Memuat…</div>
	{:else}
		<OrderList
			{orders}
			onSelect={handleSelect}
			onVoid={handleVoid}
			onPrint={handlePrint}
		/>
	{/if}
</div>
