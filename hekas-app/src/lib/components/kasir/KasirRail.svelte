<!--
  KasirRail — narrow 60px icon-only sidebar rail (POS-specific).

  Layout:
  - 60px wide, dark theme (#0F172A background)
  - Brand monogram di top + live status dot (pulsing)
  - Vertical nav (8 items: POS, Order, Produk, Pelanggan, Shift, Laporan, Setting)
  - Held badge (jika ada)
  - Spacer + Logout button at bottom

  Props:
    - heldCount: number — jumlah transaksi ditahan (untuk badge)
    - onholdclick: () => void — handler saat held badge diklik
    - onlogout: () => void — handler logout
    - userName: string — inisial user untuk tooltip logout

  Usage:
    <KasirRail
      heldCount={held.length}
      onholdclick={openHoldModal}
      onlogout={handleLogout}
      userName={currentUser?.full_name ?? 'Kasir'}
    />
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		heldCount: number;
		onholdclick: () => void;
		onlogout: () => void;
		userName: string;
	}

	let { heldCount, onholdclick, onlogout, userName }: Props = $props();

	const navItems: { label: string; path: string }[] = [
		{ label: 'POS',       path: '/kasir/pos' },
		{ label: 'Order',     path: '/kasir/order' },
		{ label: 'Produk',    path: '/kasir/produk' },
		{ label: 'Pelanggan', path: '/kasir/pelanggan' },
		{ label: 'Shift',     path: '/kasir/shift' },
		{ label: 'Laporan',   path: '/kasir/laporan' },
		{ label: 'Setting',   path: '/kasir/setting' }
	];

	const activePath = $derived(page.url.pathname);
	function checkActive(itemPath: string): boolean {
		return activePath === itemPath || activePath.startsWith(itemPath + '/');
	}

	async function navTo(path: string) {
		try {
			await goto(path);
		} catch (e) {
			console.error('[KasirRail] nav failed:', e);
		}
	}
</script>

<aside
	class="w-[60px] flex flex-col items-center py-2.5 shrink-0 z-10 relative"
	style="background: #0F172A; box-shadow: 1px 0 0 0 rgba(255,255,255,0.06), 4px 0 24px rgba(0,0,0,0.15)"
>
	<!-- Brand monogram -->
	<div
		class="w-9 h-9 rounded-lg flex items-center justify-center mb-3 relative"
		style="background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); box-shadow: 0 2px 8px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
	>
		<span style="color: #fff; font-size: 12px; font-weight: 800; letter-spacing: -0.04em; font-family: 'Inter', system-ui">H</span>
		<div
			class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
			style="background: #10B981; box-shadow: 0 0 0 2px #0F172A, 0 0 6px rgba(16,185,129,0.6); animation: pulse 2s infinite"
			aria-hidden="true"
		></div>
	</div>

	<!-- Section divider -->
	<div class="w-7 h-px mb-2" style="background: rgba(255,255,255,0.08)"></div>

	<!-- Nav: 7 items with tooltip reveal on hover -->
	<nav class="flex flex-col items-center w-full px-1.5 gap-0.5" aria-label="Menu utama">
		{#each navItems as item}
			{@const isActive = checkActive(item.path)}
			<button
				onclick={() => navTo(item.path)}
				aria-label={item.label}
				aria-current={isActive ? 'page' : undefined}
				title={item.label}
				class="rail-item relative w-10 h-10 rounded-md flex items-center justify-center transition-all"
				style="
					background: {isActive ? 'rgba(37, 99, 235, 0.2)' : 'transparent'};
					color: {isActive ? '#fff' : 'rgba(226,235,248,0.5)'};
				"
			>
				{#if item.label === 'POS'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<rect x="2" y="3" width="20" height="14" rx="2" />
						<line x1="8" y1="21" x2="16" y2="21" />
						<line x1="12" y1="17" x2="12" y2="21" />
					</svg>
				{:else if item.label === 'Order'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
						<polyline points="14 2 14 8 20 8" />
						<line x1="9" y1="13" x2="15" y2="13" />
						<line x1="9" y1="17" x2="15" y2="17" />
					</svg>
				{:else if item.label === 'Produk'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
						<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
						<line x1="12" y1="22.08" x2="12" y2="12" />
					</svg>
				{:else if item.label === 'Pelanggan'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<path d="M23 21v-2a4 4 0 00-3-3.87" />
						<path d="M16 3.13a4 4 0 010 7.75" />
					</svg>
				{:else if item.label === 'Shift'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="10" />
						<polyline points="12 6 12 12 16 14" />
					</svg>
				{:else if item.label === 'Laporan'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="18" y1="20" x2="18" y2="10" />
						<line x1="12" y1="20" x2="12" y2="4" />
						<line x1="6" y1="20" x2="6" y2="14" />
					</svg>
				{:else if item.label === 'Lainnya'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="5" cy="12" r="1" />
						<circle cx="12" cy="12" r="1" />
						<circle cx="19" cy="12" r="1" />
					</svg>
				{:else if item.label === 'Setting'}
					<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={isActive ? 2.4 : 1.7} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="12" r="3" />
						<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001 1.51H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
					</svg>
				{/if}
				{#if isActive}
					<div
						class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
						style="background: #60A5FA"
					></div>
				{/if}
			</button>
		{/each}
	</nav>

	<!-- Spacer -->
	<div class="flex-1"></div>

	<!-- Held transactions badge -->
	{#if heldCount > 0}
		<button
			onclick={onholdclick}
			aria-label="Lihat {heldCount} transaksi yang ditahankan"
			class="group relative w-10 h-10 rounded-md flex items-center justify-center mb-1 transition-all"
			style="background: rgba(245, 158, 11, 0.15); color: #F59E0B"
		>
			<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<circle cx="12" cy="12" r="10" />
				<polyline points="12 6 12 12 16 14" />
			</svg>
			<span
				class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
				style="background: #F59E0B; color: #fff"
			>{heldCount}</span>
		</button>
	{/if}

	<!-- Spacer kecil -->
	<div class="h-1"></div>

	<!-- Logout button -->
	<button
		onclick={onlogout}
		aria-label="Logout {userName}"
		title="Logout {userName}"
		class="w-10 h-10 rounded-md flex items-center justify-center transition-all mb-1"
		style="background: transparent; color: rgba(226,235,248,0.5)"
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
			<polyline points="16 17 21 12 16 7" />
			<line x1="21" y1="12" x2="9" y2="12" />
		</svg>
	</button>
</aside>

<style>
	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.2); opacity: 0.7; }
	}
</style>