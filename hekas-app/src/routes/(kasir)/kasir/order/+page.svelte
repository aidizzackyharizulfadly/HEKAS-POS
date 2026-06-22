<!--
  /kasir/order — Daftar order/transaksi untuk kasir.
  Mount <RoleShell> (shared Sidebar + TopBar).
-->
<script lang="ts">
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import OrderList from '$lib/components/kasir/Order/OrderList.svelte';
	import { onMount } from 'svelte';
	import type { Transaction } from '$lib/types/domain';
	import { listTransactions } from '$lib/api/transactions';
	import { getCurrentUser, logout } from '$lib/api/auth';
	import { showInfo } from '$lib/utils/toast';

	let user = $state<any>(null);
	let orders = $state<Transaction[]>([]);
	let loading = $state(true);

	onMount(async () => {
		user = await getCurrentUser();
		try {
			orders = await listTransactions({ limit: 50 });
		} catch {
			orders = [];
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await logout();
		location.href = '/login';
	}

	function handleSelect(t: Transaction) {
		showInfo(`Order ${t.invoice_no} dipilih`);
	}

	function handleVoid(t: Transaction) {
		if (confirm(`Void order ${t.invoice_no}?`)) {
			showInfo(`Order ${t.invoice_no} di-void`);
		}
	}

	function handlePrint(t: Transaction) {
		showInfo(`Mencetak ${t.invoice_no}`);
		window.print();
	}
</script>

<svelte:head>
	<title>Daftar Order · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="kasir"
	title="Daftar Order"
	subtitle="Riwayat transaksi shift ini"
	{user}
	onlogout={handleLogout}
>
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
</RoleShell>
