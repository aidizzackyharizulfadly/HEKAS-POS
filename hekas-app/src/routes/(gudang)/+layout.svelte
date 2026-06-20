<script lang="ts">
	/**
	 * Gudang route group layout (placeholder)
	 *
	 * Akan berisi:
	 * - Sidebar Gudang (Beranda, Inventaris, Barang Masuk, dll)
	 * - TopBar gudang
	 * - RBAC guard (cek role = 'gudang')
	 */
	let { children } = $props();
</script>

{@render children()}
