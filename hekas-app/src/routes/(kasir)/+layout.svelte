<script lang="ts">
	/**
	 * Kasir route group layout.
	 *
	 * Status (R0.4 2026-06-21):
	 * - Layout pass-through saat ini
	 * - Shared Sidebar + TopBar sudah dibuat di components/shared/
	 * - Menu definitions sudah ditambah di auth/roles.ts (kasirMenu)
	 * - Wire-up ke layout akan dilakukan di fase R1 (page refactor)
	 *   untuk menghindari duplikasi dengan inline UI di
	 *   src/routes/(kasir)/kasir/pos/+page.svelte
	 *
	 * Fase R1 nanti:
	 *   import Sidebar from '$lib/components/shared/Sidebar.svelte';
	 *   import TopBar from '$lib/components/shared/TopBar.svelte';
	 *   import { kasirMenu } from '$lib/auth/roles';
	 *   import { page } from '$app/state';
	 *
	 *   <div class="flex h-screen">
	 *     <Sidebar menu={kasirMenu} activePath={page.url.pathname} />
	 *     <main class="flex-1">
	 *       <TopBar title="..." user={...} role="kasir" />
	 *       {@render children()}
	 *     </main>
	 *   </div>
	 */
	let { children } = $props();
</script>

{@render children()}
