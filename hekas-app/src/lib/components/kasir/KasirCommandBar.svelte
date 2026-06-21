<!--
  KasirCommandBar — 3-zone command bar (POS-specific).

  Layout:
  - ZONE A (kiri, 280px): Shift context (avatar + name + role badge + outlet + shift #)
  - ZONE B (tengah, flex): Live metrics (Sales today + Tx count + Shift timer)
  - ZONE C (kanan): Hardware status pills + Cart FAB + Help button

  Props:
    - cashierName: string
    - outletName: string
    - shiftNo: string
    - role: string (badge text)
    - salesTodayFmt: string (pre-formatted IDR)
    - txCount: number
    - txTarget: number
    - timeStr: string (pre-formatted HH:MM:SS)
    - cartItemCount: number
    - cartDrawerOpen: boolean
    - onToggleCart: () => void
    - onShowShortcuts: () => void

  Usage:
    <KasirCommandBar
      cashierName="Siti Wulandari"
      outletName="Duamart Panjen"
      shiftNo="#12345"
      role="CASHIER"
      salesTodayFmt={fmt(847500)}
      txCount={23}
      txTarget={35}
      timeStr={timeStr}
      cartItemCount={totalQty}
      cartDrawerOpen={cartDrawerOpen}
      onToggleCart={() => (cartDrawerOpen = !cartDrawerOpen)}
      onShowShortcuts={() => (showShortcuts = true)}
    />
-->
<script lang="ts">
	interface Props {
		cashierName: string;
		outletName: string;
		shiftNo: string;
		role: string;
		salesTodayFmt: string;
		txCount: number;
		txTarget: number;
		timeStr: string;
		cartItemCount: number;
		cartDrawerOpen: boolean;
		onToggleCart: () => void;
		onShowShortcuts: () => void;
	}

	let {
		cashierName,
		outletName,
		shiftNo,
		role,
		salesTodayFmt,
		txCount,
		txTarget,
		timeStr,
		cartItemCount,
		cartDrawerOpen,
		onToggleCart,
		onShowShortcuts
	}: Props = $props();

	const initials = $derived(
		cashierName
			.split(' ')
			.map((n) => n.charAt(0))
			.slice(0, 2)
			.join('')
			.toUpperCase()
	);
</script>

<div
	class="flex items-stretch shrink-0"
	style="background: #fff; border-bottom: 1px solid #E2E8F0; box-shadow: 0 1px 0 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04); height: 64px"
>
	<!-- ZONE A: Shift context (kiri, fixed width) -->
	<div class="flex items-center gap-3 pl-5 pr-6 shrink-0" style="border-right: 1px solid #F1F5F9; min-width: 280px">
		<div
			class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 tabular-nums"
			style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #fff; font-size: 12px; box-shadow: 0 2px 8px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
		>
			{initials}
		</div>
		<div class="flex flex-col min-w-0">
			<div class="flex items-center gap-1.5">
				<span style="font-size: 13.5px; font-weight: 700; color: #0F172A; letter-spacing: -0.005em">{cashierName}</span>
				<span class="px-1.5 py-0.5 rounded" style="background: #DBEAFE; color: #1D4ED8; font-size: 9.5px; font-weight: 700; letter-spacing: 0.06em">{role}</span>
			</div>
			<div class="flex items-center gap-1.5 tabular-nums" style="font-size: 11px; color: #64748B; font-weight: 500">
				<span>{outletName}</span>
				<span style="color: #CBD5E1">/</span>
				<span style="color: #1E40AF; font-weight: 600">Shift {shiftNo}</span>
			</div>
		</div>
	</div>

	<!-- ZONE B: Live metrics (tengah, fills space) -->
	<div class="flex-1 flex items-center justify-center gap-6 px-6 min-w-0">
		<!-- Sales today -->
		<div class="flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-md flex items-center justify-center" style="background: #ECFDF5; color: #059669">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
					<polyline points="16 7 22 7 22 13" />
				</svg>
			</div>
			<div class="flex flex-col">
				<span style="font-size: 9.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em">Penjualan hari ini</span>
				<span class="tabular-nums" style="font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em">{salesTodayFmt}</span>
			</div>
		</div>

		<div class="w-px h-9" style="background: #E2E8F0"></div>

		<!-- Transactions count -->
		<div class="flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-md flex items-center justify-center" style="background: #EFF6FF; color: #2563EB">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="2" y="5" width="20" height="14" rx="2" />
					<line x1="2" y1="10" x2="22" y2="10" />
				</svg>
			</div>
			<div class="flex flex-col">
				<span style="font-size: 9.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em">Transaksi</span>
				<span class="tabular-nums" style="font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em">{txCount} <span style="font-size: 11px; color: #94A3B8; font-weight: 600">/ {txTarget} target</span></span>
			</div>
		</div>

		<div class="w-px h-9" style="background: #E2E8F0"></div>

		<!-- Shift timer -->
		<div class="flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-md flex items-center justify-center relative" style="background: #FEF3C7; color: #D97706">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="10" />
					<polyline points="12 6 12 12 16 14" />
				</svg>
				<div class="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full" style="background: #10B981; box-shadow: 0 0 0 1.5px #FEF3C7; animation: pulse 2s infinite"></div>
			</div>
			<div class="flex flex-col">
				<span style="font-size: 9.5px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em">Shift berjalan</span>
				<span class="tabular-nums" style="font-size: 15px; font-weight: 800; color: #0F172A; letter-spacing: -0.01em">{timeStr}</span>
			</div>
		</div>
	</div>

	<!-- ZONE C: Hardware + actions (kanan) -->
	<div class="flex items-center gap-2 px-5 shrink-0" style="border-left: 1px solid #F1F5F9">
		<!-- Hardware status strip -->
		<div
			class="flex items-center gap-1.5 px-2 py-1.5 rounded-md mr-1"
			style="background: #F8FAFC; border: 1px solid #E2E8F0"
			title="Status perangkat keras"
			role="status"
			aria-label="Status perangkat keras"
		>
			<span class="hardware-pill inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style="background: #ECFDF5; color: #059669; font-size: 10px; font-weight: 600">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
				PRN
			</span>
			<span class="hardware-pill inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style="background: #ECFDF5; color: #059669; font-size: 10px; font-weight: 600">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
				SCN
			</span>
			<span class="hardware-pill inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style="background: #ECFDF5; color: #059669; font-size: 10px; font-weight: 600">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"></span>
				CD
			</span>
			<span class="hardware-pill inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style="background: #F1F5F9; color: #94A3B8; font-size: 10px; font-weight: 600">
				<span class="w-1.5 h-1.5 rounded-full" style="background: #CBD5E1"></span>
				CDP
			</span>
		</div>

		<!-- Mobile/tablet cart FAB -->
		<button
			class="cart-fab items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all"
			style="background: #F1F5F9; color: #475569; font-size: 12px; font-weight: 600; border: 1px solid #E2E8F0"
			aria-label="Buka keranjang belanja"
			aria-expanded={cartDrawerOpen}
			onclick={onToggleCart}
		>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="9" cy="21" r="1" />
				<circle cx="20" cy="21" r="1" />
				<path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
			</svg>
			<span class="tabular-nums">{cartItemCount}</span>
		</button>

		<div class="w-px h-7" style="background: #E2E8F0"></div>

		<!-- Help button -->
		<button
			class="w-9 h-9 rounded-md flex items-center justify-center transition-all"
			style="background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0"
			aria-label="Bantuan & pintasan keyboard"
			onclick={onShowShortcuts}
		>
			<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<circle cx="12" cy="12" r="10" />
				<path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		</button>
	</div>
</div>

<style>
	@keyframes pulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.2); opacity: 0.7; }
	}
</style>