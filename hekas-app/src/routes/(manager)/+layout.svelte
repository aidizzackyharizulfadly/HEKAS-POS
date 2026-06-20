<script lang="ts">
	/**
	 * Manager route group layout (placeholder)
	 *
	 * Akan berisi:
	 * - Sidebar Manager (Beranda, Penjualan, Keuangan, dll)
	 * - TopBar manager (dengan export, notifications, profile)
	 * - RBAC guard (cek role = 'manager')
	 */
	let { children } = $props();
</script>

{@render children()}
