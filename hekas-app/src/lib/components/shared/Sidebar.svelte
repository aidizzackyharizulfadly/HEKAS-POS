<script lang="ts">
	/**
	 * Shared Sidebar component.
	 *
	 * Generic vertical navigation with menu-driven items.
	 * Active item di-highlight berdasarkan URL pathname.
	 *
	 * Usage (di role layout):
	 *   <Sidebar menu={kasirMenu} activePath={$page.url.pathname} />
	 *
	 * MenuItem shape (lihat auth/roles.ts):
	 *   { label: string; path: string; icon?: string }
	 *
	 * Status (R0.4 2026-06-21): Komponen dibuat, siap dipakai.
	 * Wiring ke role layouts akan dilakukan di fase R1 (page refactor)
	 * untuk menghindari duplikasi dengan inline UI yang sudah ada.
	 */
	interface MenuItem {
		label: string;
		path: string;
		icon?: string;
	}

	let { menu, activePath = '/' }: { menu: MenuItem[]; activePath?: string } = $props();
</script>

<aside
	class="flex flex-col shrink-0"
	style="width: 240px; background: #fff; border-right: 1px solid #E2E8F0; height: 100vh"
	aria-label="Menu utama"
>
	<div class="px-5 py-4 border-b" style="border-color: #E2E8F0">
		<div class="flex items-center gap-2">
			<div
				class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
				style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
			>
				H
			</div>
			<div>
				<div style="font-size: 14px; font-weight: 700; color: #0F172A">HEKAS POS</div>
				<div style="font-size: 10px; color: #64748B">v0.0.1</div>
			</div>
		</div>
	</div>

	<nav class="flex-1 p-3 overflow-y-auto" aria-label="Menu utama">
		<ul class="space-y-1">
			{#each menu as item (item.path)}
				{@const isActive = item.path === activePath}
				<li>
					<a
						href={item.path}
						data-sveltekit-preload-data="hover"
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
						style="font-size: 13px; font-weight: {isActive ? 600 : 500}; color: {isActive
							? '#2563EB'
							: '#475569'}; background: {isActive ? '#EFF6FF' : 'transparent'}"
						aria-current={isActive ? 'page' : undefined}
					>
						{#if item.icon}
							<span class="w-5 h-5 flex items-center justify-center text-base" aria-hidden="true">
								{item.icon}
							</span>
						{/if}
						<span>{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
