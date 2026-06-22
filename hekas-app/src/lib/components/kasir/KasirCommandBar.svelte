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

  v2.0 — refactored ke shadcn-svelte (Badge, Separator, Button) + lucide icons
-->
<script lang="ts">
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		TrendingUp,
		CreditCard,
		Clock,
		ShoppingCart,
		HelpCircle
	} from '@lucide/svelte';

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
	class="bg-card flex h-16 shrink-0 items-stretch border-b"
	style="box-shadow: 0 1px 0 0 rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.04)"
>
	<!-- ZONE A: Shift context (kiri, fixed width) -->
	<div
		class="flex shrink-0 items-center gap-3 border-r pr-6 pl-5"
		style="border-color: #F1F5F9; min-width: 280px"
	>
		<div
			class="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white tabular-nums"
			style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); font-size: 12px; box-shadow: 0 2px 8px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
		>
			{initials}
		</div>
		<div class="flex min-w-0 flex-col">
			<div class="flex items-center gap-1.5">
				<span class="text-[13.5px] font-bold tracking-tight text-foreground">{cashierName}</span>
				<Badge variant="info" class="text-[9.5px] font-bold tracking-wider">
					{role}
				</Badge>
			</div>
			<div
				class="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium tabular-nums"
			>
				<span>{outletName}</span>
				<span class="text-border-strong">/</span>
				<span class="font-semibold text-blue-700 dark:text-blue-400">Shift {shiftNo}</span>
			</div>
		</div>
	</div>

	<!-- ZONE B: Live metrics (tengah, fills space) -->
	<div class="flex min-w-0 flex-1 items-center justify-center gap-6 px-6">
		<!-- Sales today -->
		<div class="flex items-center gap-2.5">
			<div
				class="flex size-9 items-center justify-center rounded-md"
				style="background: #ECFDF5; color: #059669"
			>
				<TrendingUp size={16} aria-hidden="true" />
			</div>
			<div class="flex flex-col">
				<span
					class="text-muted-foreground text-[9.5px] font-semibold tracking-widest uppercase"
				>Penjualan hari ini</span>
				<span class="text-[15px] font-extrabold tracking-tight text-foreground tabular-nums"
					>{salesTodayFmt}</span
				>
			</div>
		</div>

		<Separator orientation="vertical" class="h-9" />

		<!-- Transactions count -->
		<div class="flex items-center gap-2.5">
			<div
				class="flex size-9 items-center justify-center rounded-md"
				style="background: #EFF6FF; color: #2563EB"
			>
				<CreditCard size={16} aria-hidden="true" />
			</div>
			<div class="flex flex-col">
				<span
					class="text-muted-foreground text-[9.5px] font-semibold tracking-widest uppercase"
				>Transaksi</span>
				<span class="text-[15px] font-extrabold tracking-tight text-foreground tabular-nums">
					{txCount}
					<span class="text-[11px] font-semibold opacity-60"
						>/ {txTarget} target</span
					>
				</span>
			</div>
		</div>

		<Separator orientation="vertical" class="h-9" />

		<!-- Shift timer -->
		<div class="flex items-center gap-2.5">
			<div
				class="relative flex size-9 items-center justify-center rounded-md"
				style="background: #FEF3C7; color: #D97706"
			>
				<Clock size={16} aria-hidden="true" />
				<div
					class="absolute -top-0.5 -right-0.5 size-2 rounded-full"
					style="background: #10B981; box-shadow: 0 0 0 1.5px #FEF3C7; animation: pulse 2s infinite"
				></div>
			</div>
			<div class="flex flex-col">
				<span
					class="text-muted-foreground text-[9.5px] font-semibold tracking-widest uppercase"
				>Shift berjalan</span>
				<span class="text-[15px] font-extrabold tracking-tight text-foreground tabular-nums"
					>{timeStr}</span
				>
			</div>
		</div>
	</div>

	<!-- ZONE C: Hardware + actions (kanan) -->
	<div
		class="flex shrink-0 items-center gap-2 border-l px-5"
		style="border-color: #F1F5F9"
	>
		<!-- Hardware status strip -->
		<div
			class="mr-1 flex items-center gap-1.5 rounded-md border px-2 py-1.5"
			style="background: #F8FAFC; border-color: #E2E8F0"
			title="Status perangkat keras"
			role="status"
			aria-label="Status perangkat keras"
		>
			<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
				<span
					class="size-1.5 rounded-full"
					style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"
				></span>
				PRN
			</Badge>
			<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
				<span
					class="size-1.5 rounded-full"
					style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"
				></span>
				SCN
			</Badge>
			<Badge variant="success" class="gap-1 px-1.5 text-[10px]">
				<span
					class="size-1.5 rounded-full"
					style="background: #10B981; box-shadow: 0 0 4px rgba(16,185,129,0.6)"
				></span>
				CD
			</Badge>
			<Badge variant="secondary" class="gap-1 px-1.5 text-[10px]">
				<span class="bg-border-strong size-1.5 rounded-full"></span>
				CDP
			</Badge>
		</div>

		<!-- Mobile/tablet cart FAB -->
		<Button
			variant="outline"
			size="sm"
			aria-label="Buka keranjang belanja"
			aria-expanded={cartDrawerOpen}
			onclick={onToggleCart}
			class="tabular-nums"
		>
			<ShoppingCart class="size-3.5" />
			{cartItemCount}
		</Button>

		<Separator orientation="vertical" class="h-7" />

		<!-- Help button -->
		<Button
			variant="outline"
			size="icon"
			aria-label="Bantuan & pintasan keyboard"
			onclick={onShowShortcuts}
		>
			<HelpCircle class="size-4" />
		</Button>
	</div>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.7;
		}
	}
</style>