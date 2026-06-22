<script lang="ts">
	/**
	 * Kasir route group layout.
	 *
	 * Status (Fase R3 / 2026-06-22): Pass-through.
	 * Tiap page mount <RoleShell> untuk sidebar + topbar shell.
	 * Page POS punya custom header (KasirCommandBar) jadi mount shell manual.
	 *
	 * Untuk konsistensi dengan manager & gudang (juga pass-through),
	 * lihat: src/lib/components/shared/RoleShell.svelte
	 */
	let { children } = $props();
</script>

{@render children()}
