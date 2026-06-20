<script lang="ts">
	/**
	 * Gudang route group layout.
	 *
	 * Status (R0.4 2026-06-21): Pass-through.
	 * Shared Sidebar + TopBar sudah dibuat; wire-up di fase R1.
	 * Lihat catatan di (kasir)/+layout.svelte untuk pola integrasi.
	 */
	let { children } = $props();
</script>

{@render children()}
