<!--
  /kasir/produk — Product catalog (read-only for kasir).
  Per FRONTEND_ARCHITECTURE §4.2 (kasir routes).
  Uses R3a components: ProductGrid, ProductCard.

  Catatan (Fase R3 / 2026-06-22): <KasirRail> di-render oleh (kasir)/+layout.svelte.
  Tidak perlu <RoleShell> lagi di sini. Cukup render konten utama.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import ProductGrid from '$lib/components/kasir/POS/ProductGrid.svelte';
	import { api } from '$lib/api';
	import type { Product } from '$lib/types/domain';

	let products = $state<Product[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			products = await api.products.listProducts();
		} catch (e) {
			console.error('Failed to load products', e);
		} finally {
			loading = false;
		}
	});

	function handleProductClick(p: Product) {
		// Kasir can only VIEW — not edit/add. Could open detail modal in future.
		console.log('[kasir/produk] viewed product', p.id, p.name);
	}
</script>

<svelte:head>
	<title>Produk · HEKAS POS</title>
</svelte:head>

<div class="kasir-produk">
	<header class="kasir-produk__header">
		<h1 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0">Produk</h1>
		<p style="font-size: 12px; color: #64748B; margin: 4px 0 0">Katalog produk (lihat saja — kelola di Gudang)</p>
	</header>
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

<style>
	.kasir-produk {
		width: 100%;
		padding: 20px 24px;
	}
	.kasir-produk__header {
		margin-bottom: 16px;
	}
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
