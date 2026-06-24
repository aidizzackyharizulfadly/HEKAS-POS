<script lang="ts">
	/**
	 * Shared Sidebar component.
	 *
	 * Generic vertical navigation dengan menu-driven items + user profile
	 * di bagian bawah. Active item di-highlight berdasarkan URL pathname.
	 *
	 * Usage:
	 *   <Sidebar menu={kasirMenu} activePath={$page.url.pathname} user={{name, role, shift}} onlogout={handleLogout} />
	 */
	import { getIcon } from './icon-map';
	import type { MenuItem } from '$lib/auth/roles';
	import { LogOut, User, Clock } from '@lucide/svelte';

	let {
		menu,
		activePath = '/',
		brand = 'HEKAS POS',
		version = 'v0.0.1',
		user = null as { name: string; role: string; shift?: string; outlet?: string } | null,
		onlogout = null as (() => void) | null
	}: {
		menu: MenuItem[];
		activePath?: string;
		brand?: string;
		version?: string;
		user?: { name: string; role: string; shift?: string; outlet?: string } | null;
		onlogout?: (() => void) | null;
	} = $props();

	const initials = $derived(
		user
			? user.name
					.split(' ')
					.map((n) => n.charAt(0))
					.slice(0, 2)
					.join('')
					.toUpperCase()
			: '?'
	);

	const roleColor: Record<string, string> = {
		kasir: '#2563EB',
		manager: '#059669',
		gudang: '#7C3AED'
	};
	const roleBg: Record<string, string> = {
		kasir: '#DBEAFE',
		manager: '#D1FAE5',
		gudang: '#EDE9FE'
	};
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

	<!-- User Profile (bottom) -->
	{#if user}
		<div class="border-t" style="border-color: #E2E8F0">
			<div class="px-4 py-3">
				<div class="flex items-center gap-3">
					<div
						class="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
						style="background: linear-gradient(135deg, {roleColor[user.role] ?? '#2563EB'} 0%, {roleColor[user.role] ?? '#1D4ED8'} 100%); font-size: 11px; box-shadow: 0 2px 6px rgba(37,99,235,0.25)"
					>
						{initials}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-1.5">
							<span class="text-[13px] font-bold text-slate-800 truncate">{user.name}</span>
						</div>
						<div class="flex items-center gap-1 mt-0.5">
							<span
								class="text-[10px] font-semibold px-1.5 py-0.5 rounded"
								style="background: {roleBg[user.role] ?? '#F1F5F9'}; color: {roleColor[user.role] ?? '#475569'}"
							>
								{user.role}
							</span>
							{#if user.shift}
								<span class="text-[10px] text-slate-400 flex items-center gap-0.5">
									<Clock size={10} />
									{user.shift}
								</span>
							{/if}
						</div>
						{#if user.outlet}
							<div class="text-[10px] text-slate-400 mt-0.5 truncate">{user.outlet}</div>
						{/if}
					</div>
				</div>
				{#if onlogout}
					<button
						onclick={onlogout}
						class="logout-btn mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
					>
						<LogOut size={12} />
						Keluar
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Footer (subtle, fallback when no user) -->
		<div class="px-5 py-3 border-t" style="border-color: #E2E8F0">
			<p style="font-size: 10px; color: #94A3B8; line-height: 1.4">
				© 2026 HEKAS POS<br />Sistem kasir retail modern
			</p>
		</div>
	{/if}
</aside>

<style>
	.logout-btn {
		color: #94a3b8;
		background: #f8fafc;
		border: 1px solid #f1f5f9;
	}
	.logout-btn:hover {
		color: #dc2626;
		background: #fef2f2;
		border-color: #fecaca;
	}
</style>
