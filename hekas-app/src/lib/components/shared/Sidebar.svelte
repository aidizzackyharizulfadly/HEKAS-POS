<script lang="ts">
	/**
	 * Shared Sidebar component.
	 *
	 * Generic vertical navigation dengan menu-driven items.
	 * Active item di-highlight berdasarkan URL pathname.
	 *
	 * Design (per HEKAS POS Stitch Design v1.0):
	 * - Width 240px, sticky/fixed height
	 * - Light background (white), primary-blue active state (rounded)
	 * - Lucide icons (via icon-map registry)
	 *
	 * Usage (di role layout):
	 *   <Sidebar menu={kasirMenu} activePath={$page.url.pathname} />
	 *
	 * MenuItem shape (lihat auth/roles.ts):
	 *   { label: string; path: string; icon?: string } // icon: lucide name
	 */
	import { getIcon } from './icon-map';
	import type { MenuItem } from '$lib/auth/roles';

	let {
		menu,
		activePath = '/',
		brand = 'HEKAS POS',
		version = 'v0.0.1'
	}: {
		menu: MenuItem[];
		activePath?: string;
		brand?: string;
		version?: string;
	} = $props();
</script>

<aside
	class="flex flex-col shrink-0 sticky top-0 h-screen"
	style="width: 240px; background: #ffffff; border-right: 1px solid #E2E8F0"
	aria-label="Menu utama"
>
	<!-- Brand -->
	<div class="px-5 py-4 border-b" style="border-color: #E2E8F0">
		<a href="/" class="flex items-center gap-2.5" aria-label="Beranda">
			<div
				class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
				style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); font-size: 16px"
			>
				H
			</div>
			<div class="leading-tight">
				<div style="font-size: 14px; font-weight: 700; color: #0F172A; letter-spacing: -0.01em">
					{brand}
				</div>
				<div style="font-size: 10px; color: #64748B; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase">
					{version}
				</div>
			</div>
		</a>
	</div>

	<!-- Nav -->
	<nav class="flex-1 p-3 overflow-y-auto" aria-label="Menu utama">
		<ul class="space-y-0.5">
			{#each menu as item (item.path)}
				{@const isActive = item.path === activePath}
				{@const Icon = item.icon ? getIcon(item.icon) : null}
				<li>
					<a
						href={item.path}
						data-sveltekit-preload-data="hover"
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
						style="font-size: 13.5px; font-weight: {isActive ? 600 : 500}; color: {isActive
							? '#2563EB'
							: '#475569'}; background: {isActive ? '#EFF6FF' : 'transparent'}"
						aria-current={isActive ? 'page' : undefined}
					>
						{#if Icon}
							<span
								class="w-5 h-5 flex items-center justify-center shrink-0"
								aria-hidden="true"
							>
								<Icon
									size={18}
									strokeWidth={isActive ? 2.25 : 1.75}
									color={isActive ? '#2563EB' : '#94A3B8'}
								/>
							</span>
						{/if}
						<span class="truncate">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer (subtle) -->
	<div class="px-5 py-3 border-t" style="border-color: #E2E8F0">
		<p style="font-size: 10px; color: #94A3B8; line-height: 1.4">
			© 2026 HEKAS POS<br />Sistem kasir retail modern
		</p>
	</div>
</aside>
