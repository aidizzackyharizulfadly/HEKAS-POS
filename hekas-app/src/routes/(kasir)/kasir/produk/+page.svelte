<!--
  /kasir/produk — Product catalog (read-only for kasir).
  Mount <RoleShell>.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import ProductGrid from '$lib/components/kasir/POS/ProductGrid.svelte';
	import { api } from '$lib/api';
	import { logout } from '$lib/api/auth';
	import type { Product } from '$lib/types/domain';

	let user = $state<{ full_name: string; role: string } | null>(null);
	let products = $state<Product[]>([]);
	let loading = $state(true);

	onMount(async () => {
		const u = await api.auth.getCurrentUser().catch(() => null);
		if (u) user = { full_name: u.full_name, role: u.role };
		try {
			products = await api.products.listProducts();
		} catch (e) {
			console.error('Failed to load products', e);
		} finally {
			loading = false;
		}
	});

	async function handleLogout() {
		await logout();
		location.href = '/login';
	}

	function handleProductClick(p: Product) {
		// Kasir can only VIEW — not edit/add. Could open detail modal in future.
	}
</script>

<svelte:head>
	<title>Produk · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="kasir"
	title="Produk"
	subtitle="Katalog produk (lihat saja — kelola di Gudang)"
	{user}
	onlogout={handleLogout}
>
	<div style="padding: 20px 24px">
		{#if loading}
			<div class="kasir-produk__loading" role="status" aria-label="memuat produk">
				<div class="spinner" aria-hidden="true"></div>
				<p>Memuat produk...</p>
			</div>
		{:else}
			<ProductGrid
				{products}
				onproductclick={handleProductClick}
				emptyTitle="Belum ada produk"
				emptyDescription="Tambahkan produk melalui modul Gudang."
			/>
		{/if}
	</div>
</RoleShell>

<style>
	.kasir-produk__loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 64px 16px;
		color: #64748B;
		gap: 12px;
	}
	.spinner {
		width: 28px;
		height: 28px;
		border: 3px solid #E2E8F0;
		border-top-color: #2563EB;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.kasir-produk__loading p {
		margin: 0;
		font-size: 13px;
	}
</style>
