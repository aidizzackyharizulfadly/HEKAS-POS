<script lang="ts">
	/**
	 * PosCartPanel (HEKAS POS — kasir/POS)
	 * Right-side cart "cockpit" panel — sticky total hero, member search,
	 * items list, summary breakdown, Bayar hero button.
	 *
	 * Payment method selection happens inside <PaymentForm> (opened on Bayar click),
	 * tidak ada method selector di sini.
	 *
	 * v1.1 — Fase 8: Hapus QRIS/Tunai/Kartu selector (PaymentForm handles method).
	 * Visual design 100% preserved.
	 */
	import type { Member, Product } from '$lib/types/domain';

	type PaymentMethod = 'tunai' | 'qris' | 'debit';
	// Pos-local CartItem: Product + qty + disc (matches parent `cart: CartItem[]`).
	// `id` is required di sini (parent cart selalu populate dari Product.id).
	// `image` is the emoji fallback (from Product).
	export type PosCartItem = Product & { qty: number; disc: number };

	interface Props {
		// ── State (read-only) ─────────────────────────────────────────────────
		cart: PosCartItem[];
		member: Member | null;
		memberSearch: string;
		memberResults: Member[];
		globalDisc: number;
		subtotal: number;
		discAmt: number;
		tax: number;
		total: number;
		ppnRate: number;
		totalQty: number;
		cartDrawerOpen: boolean;
		tierColor: Record<Member['tier'], { bg: string; fg: string }>;
		barcodeInputEl: HTMLInputElement | null;
		// ── Helpers ───────────────────────────────────────────────────────────
		fmt: (n: number) => string;
		// ── Callbacks ─────────────────────────────────────────────────────────
		onSetQty: (id: number, qty: number) => void;
		onOpenNumpad: (id: number, qty: number) => void;
		onRemoveItem: (id: number) => void;
		onDiscountClick: (e: MouseEvent) => void;
		onPaymentClick: (e: MouseEvent) => void;
		onHoldClick: (e: MouseEvent) => void;
		onClearCart: () => void;
		onBarcodeFocus: () => void;
		onMemberSelect: (m: Member) => void;
		onMemberRemove: () => void;
		onAddMember: (e: MouseEvent) => void;
		onMemberSearch: (v: string) => void;
	}

	let {
		cart,
		member = $bindable(),
		memberSearch = $bindable(''),
		memberResults,
		globalDisc,
		subtotal,
		discAmt,
		tax,
		total,
		ppnRate,
		totalQty,
		cartDrawerOpen,
		tierColor,
		barcodeInputEl = $bindable(null),
		fmt,
		onSetQty,
		onOpenNumpad,
		onRemoveItem,
		onDiscountClick,
		onPaymentClick,
		onHoldClick,
		onClearCart,
		onBarcodeFocus,
		onMemberSelect,
		onMemberRemove,
		onAddMember,
		onMemberSearch
	}: Props = $props();
</script>

<aside
	class="cart-panel {cartDrawerOpen ? 'open' : ''} flex flex-col shrink-0 overflow-hidden"
	style="width: 340; background: #fff; box-shadow: -4px 0 24px rgba(15,23,42,0.06)"
	aria-label="Panel keranjang belanja"
>
	<!-- Cart header: STICKY TOTAL hero -->
	<div
		class="px-4 pt-3 pb-2.5 shrink-0"
		style="background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%); border-bottom: 1px solid #F1F5F9"
	>
		<div class="flex items-baseline justify-between mb-1.5">
			<div class="flex items-center gap-2">
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#2563EB"
					stroke-width="2.4"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="9" cy="21" r="1" />
					<circle cx="20" cy="21" r="1" />
					<path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
				</svg>
				<span
					style="font-size: 11; font-weight: 800; letter-spacing: 0.1em; color: #64748B; text-transform: uppercase"
					>Keranjang</span
				>
			</div>
			{#if cart.length > 0}
				<button
					onclick={onClearCart}
					class="flex items-center gap-1 px-1.5 py-0.5 rounded transition-all tabular-nums"
					style="background: #FEF2F2; color: #DC2626; font-size: 10; font-weight: 700; border: 1px solid #FECACA"
					aria-label="Hapus semua item di keranjang"
				>
					<svg
						width="9"
						height="9"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<polyline points="1 4 1 10 7 10" />
						<path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
					</svg>
					Reset
				</button>
			{/if}
		</div>

		<!-- TOTAL HERO (sticky) -->
		<div class="flex items-baseline justify-between mt-1">
			<div class="flex flex-col">
				<span
					style="font-size: 10; color: #94A3B8; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase"
					>Total</span
				>
				<span
					class="tabular-nums"
					aria-live="polite"
					aria-atomic="true"
					style="font-size: 28; font-weight: 800; color: #0F172A; letter-spacing: -0.025em; line-height: 1.1"
				>
					{cart.length === 0 ? 'Rp 0' : fmt(total)}
				</span>
			</div>
			<div class="flex flex-col items-end">
				<span
					style="font-size: 10; color: #94A3B8; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase"
					>Item</span
				>
				<span
					class="tabular-nums"
					style="font-size: 22; font-weight: 800; color: #2563EB; letter-spacing: -0.02em; line-height: 1.1"
				>
					{totalQty}
				</span>
			</div>
		</div>
	</div>

	<!-- Member section -->
	<div class="px-3 py-2.5 shrink-0" style="border-bottom: 1px solid #F1F5F9; background: #F8FAFC">
		{#if member}
			<div class="flex items-center gap-2.5">
				<div
					class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
					style="background: var(--color-hekas-blue-pale); color: var(--color-hekas-blue-deep)"
				>
					{member.name
						.split(' ')
						.map((n: string) => n[0])
						.join('')
						.slice(0, 2)}
				</div>
				<div class="flex-1 min-w-0">
					<div
						class="truncate"
						style="font-size: 12.5; font-weight: 700; color: var(--color-hekas-text)"
					>
						{member.name}
					</div>
					<div
						class="tabular-nums"
						style="font-size: 10.5; color: var(--color-hekas-text-muted)"
					>
						{member.phone} · {member.points.toLocaleString('id-ID')} poin
					</div>
				</div>
				<span
					class="px-1.5 py-0.5 rounded shrink-0"
					style="background: {tierColor[member.tier].bg}; color: {tierColor[member.tier]
						.fg}; font-size: 9.5; font-weight: 700; letter-spacing: 0.04em"
				>
					{member.tier}
				</span>
				<button
					onclick={onMemberRemove}
					style="color: var(--color-hekas-text-muted); padding: 4px"
					aria-label="Hapus member"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		{:else}
			<div class="relative">
				<svg
					class="absolute left-3 top-1/2 -translate-y-1/2"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--color-hekas-text-subtle)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					style="pointer-events: none"
					aria-hidden="true"
				>
					<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
				<input
					bind:value={memberSearch}
					oninput={(e) => onMemberSearch((e.target as HTMLInputElement).value)}
					placeholder="Cari member / no. HP..."
					aria-label="Cari member berdasarkan nama atau nomor HP"
					class="member-search w-full pl-8 pr-9 py-1.5 rounded-md border outline-none transition-all"
					style="background: #fff; border-color: #E2E8F0; font-size: 12.5; color: var(--color-hekas-text)"
				/>
				<button
					onclick={onAddMember}
					class="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded transition-all"
					style="color: var(--color-hekas-blue)"
					aria-label="Tambah member baru"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
						<circle cx="8.5" cy="7" r="4" />
						<line x1="20" y1="8" x2="20" y2="14" />
						<line x1="23" y1="11" x2="17" y2="11" />
					</svg>
				</button>
				<!-- Dropdown results -->
				{#if memberResults.length > 0 || (memberSearch.length > 1 && memberResults.length === 0)}
					<div
						class="absolute left-0 right-0 top-full mt-1 rounded-md overflow-hidden shadow-lg z-20"
						style="background: #fff; border: 1px solid #E2E8F0"
					>
						{#if memberResults.length > 0}
							{#each memberResults as m}
								<button
									onclick={() => onMemberSelect(m)}
									class="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors member-result-btn"
									style="background: #fff"
								>
									<div
										class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
										style="background: var(--color-hekas-blue-pale); color: var(--color-hekas-blue-deep)"
									>
										{m.name
											.split(' ')
											.map((n: string) => n[0])
											.join('')
											.slice(0, 2)}
									</div>
									<div class="flex-1 min-w-0">
										<div
											class="truncate"
											style="font-size: 12.5; font-weight: 600; color: var(--color-hekas-text)"
										>
											{m.name}
										</div>
										<div
											class="tabular-nums"
											style="font-size: 10.5; color: var(--color-hekas-text-muted)"
										>
											{m.phone}
										</div>
									</div>
									<span
										class="px-1.5 py-0.5 rounded shrink-0"
										style="background: {tierColor[m.tier]
											.bg}; color: {tierColor[m.tier]
											.fg}; font-size: 10; font-weight: 700; letter-spacing: 0.02em"
									>
										{m.tier}
									</span>
								</button>
							{/each}
						{:else}
							<div class="flex flex-col items-center justify-center py-5 px-3 gap-1">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="#94A3B8"
									stroke-width="1.5"
									style="opacity: 0.5"
								>
									<circle cx="11" cy="11" r="8" />
									<line x1="21" y1="21" x2="16.65" y2="16.65" />
								</svg>
								<div style="font-size: 12; color: #64748B; font-weight: 600">
									Member tidak ditemukan
								</div>
								<div style="font-size: 10; color: #94A3B8; text-align: center">
									Coba kata kunci lain atau tambah member baru
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Cart items -->
	<div
		class="flex-1 overflow-y-auto px-2 py-1"
		role="region"
		aria-label="Daftar item di keranjang"
		aria-live="polite"
	>
		{#if cart.length === 0}
			<div
				class="flex flex-col items-center justify-center h-full gap-3 px-4"
				style="color: #94A3B8"
			>
				<div
					class="w-16 h-16 rounded-2xl flex items-center justify-center"
					style="background: var(--color-hekas-blue-tint)"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--color-hekas-blue)"
						stroke-width="1.5"
						style="opacity: 0.7"
					>
						<circle cx="9" cy="21" r="1" />
						<circle cx="20" cy="21" r="1" />
						<path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
					</svg>
				</div>
				<div class="flex flex-col items-center gap-1">
					<span
						style="font-size: 15; font-weight: 700; color: var(--color-hekas-text); letter-spacing: -0.01em"
						>Belum ada item</span
					>
					<span
						style="font-size: 12; color: var(--color-hekas-text-muted); text-align: center; line-height: 1.5; max-width: 240px"
						>Tap produk di grid, atau scan barcode untuk menambah item ke keranjang</span
					>
				</div>
				<button
					onclick={onBarcodeFocus}
					class="mt-1 flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all"
					style="background: var(--color-hekas-blue); color: #fff; font-size: 12; font-weight: 600; box-shadow: 0 1px 2px rgba(37, 99, 235, 0.2)"
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
					>
						<path d="M3 5v14" />
						<path d="M8 5v14" />
						<path d="M12 5v14" />
						<path d="M17 5v14" />
						<path d="M21 5v14" />
					</svg>
					Scan Barcode
					<kbd
						style="background: rgba(255,255,255,0.2); padding: 1px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 10; font-weight: 700"
						>B</kbd
					>
				</button>
				<div
					class="flex items-center gap-1.5 mt-0.5"
					style="font-size: 11; color: var(--color-hekas-text-muted)"
				>
					<kbd
						style="background: #fff; padding: 1px 6px; border-radius: 4px; border: 1px solid var(--color-hekas-border); font-family: 'JetBrains Mono', monospace; font-size: 10; font-weight: 700"
						>/</kbd
					>
					<span>untuk cari produk</span>
				</div>
			</div>
		{:else}
			{#each cart as item, idx}
				<div
					class="flex items-start gap-2 py-2"
					style="border-bottom: {idx < cart.length - 1
						? '1px solid #E2EBF4'
						: 'transparent'}"
				>

					<div class="flex-1 min-w-0">
						<div class="truncate" style="font-size: 12; font-weight: 500">
							{item.name}
						</div>
						<div style="font-size: 11; color: #2563EB; font-weight: 600">
							{fmt(item.price)}
						</div>

						<!-- Qty row -->
						<div class="flex items-center gap-1 mt-1.5">
							<button
								onclick={() => onSetQty(item.id, item.qty - 1)}
								class="w-6 h-6 rounded-md flex items-center justify-center border"
								style="border-color: #E2EBF4"
								aria-label="Kurangi jumlah {item.name}"
							>
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
								>
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
							</button>

							<!-- Qty — tap to open numpad -->
							<button
								onclick={() => onOpenNumpad(item.id, item.qty)}
								class="w-8 h-6 rounded-md flex items-center justify-center border"
								style="background: #F8FAFC; border-color: #E2EBF4; font-size: 12; font-weight: 700"
								aria-label="Ubah jumlah {item.name} (sekarang {item.qty})"
							>
								{item.qty}
							</button>

							<button
								onclick={() => onSetQty(item.id, item.qty + 1)}
								class="w-6 h-6 rounded-md flex items-center justify-center"
								style="background: #2563EB; color: #fff"
								aria-label="Tambah jumlah {item.name}"
							>
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
								>
									<line x1="12" y1="5" x2="12" y2="19" />
									<line x1="5" y1="12" x2="19" y2="12" />
								</svg>
							</button>

							<span
								class="ml-auto"
								style="font-size: 12; font-weight: 700; color: #0F172A"
							>
								{fmt(item.price * item.qty - item.disc)}
							</span>
						</div>
					</div>

					<button
						onclick={() => onRemoveItem(item.id)}
						class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
						style="color: #94A3B8"
						aria-label="Hapus {item.name} dari keranjang"
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			{/each}
		{/if}
	</div>
	<!-- ═══ CHECKOUT LANE (Summary + Action) ══════════════════════════ -->
	{#if cart.length > 0}
		<div class="shrink-0" style="background: #0F172A; color: #fff">
			<!-- Summary breakdown (compact inline) -->
			<div
				class="px-3 py-2 space-y-1"
				style="border-top: 1px solid rgba(255,255,255,0.08)"
			>
				<button
					onclick={onDiscountClick}
					class="w-full flex justify-between items-center group"
					aria-label="Tambah atau ubah diskon transaksi"
				>
					<span style="font-size: 11; color: rgba(226,235,248,0.6); font-weight: 500"
						>Subtotal {cart.length} item</span
					>
					<span
						class="tabular-nums"
						style="font-size: 11.5; color: rgba(226,235,248,0.9); font-weight: 600"
						>{fmt(subtotal)}</span
					>
				</button>
				<button
					onclick={onDiscountClick}
					class="w-full flex justify-between items-center"
					aria-label="Tambah atau ubah diskon transaksi"
				>
					<span
						style="font-size: 11; color: {globalDisc > 0
							? '#34D399'
							: 'rgba(226,235,248,0.6)'}; font-weight: 500"
					>
						Diskon {globalDisc > 0 ? `(${globalDisc}%)` : ''}
						{#if globalDisc === 0}
							<svg
								class="inline ml-1"
								width="9"
								height="9"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
							>
								<line x1="12" y1="5" x2="12" y2="19" />
								<line x1="5" y1="12" x2="19" y2="12" />
							</svg>
						{/if}
					</span>
					<span
						class="tabular-nums"
						style="font-size: 11.5; color: {globalDisc > 0
							? '#34D399'
							: 'rgba(226,235,248,0.4)'}; font-weight: 600"
					>
						{globalDisc > 0 ? `- ${fmt(discAmt)}` : '—'}
					</span>
				</button>
				<div class="flex justify-between items-center">
					<span style="font-size: 11; color: rgba(226,235,248,0.6); font-weight: 500"
						>PPN {ppnRate}%</span
					>
					<span
						class="tabular-nums"
						style="font-size: 11.5; color: rgba(226,235,248,0.9); font-weight: 600"
						>{fmt(tax)}</span
					>
				</div>
			</div>

			<!-- BAYAR HERO BUTTON (method selection happens in PaymentForm) -->
			<div class="px-3 pb-3 pt-2" style="border-top: 1px solid rgba(255,255,255,0.08)">
				<button
					onclick={onPaymentClick}
					aria-label={`Bayar sekarang total ${fmt(total)} (tekan F4) — buka form pembayaran`}
					class="bayar-hero w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-lg transition-all"
					style="
						background: linear-gradient(135deg, #10B981 0%, #059669 100%);
						box-shadow: 0 4px 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
					"
				>
					<div class="flex items-center gap-2">
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#fff"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<rect x="2" y="5" width="20" height="14" rx="2" />
							<line x1="2" y1="10" x2="22" y2="10" />
						</svg>
						<span
							style="font-size: 14px; font-weight: 800; color: #fff; letter-spacing: 0.02em; text-transform: uppercase"
							>Bayar Sekarang</span
						>
					</div>
					<span
						class="tabular-nums"
						style="font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.015em"
					>
						{fmt(total)}
					</span>
				</button>

				<!-- Secondary actions: Tahan + Batal -->
				<div class="flex gap-1.5 mt-1.5">
					<button
						onclick={onHoldClick}
						aria-label="Tahan transaksi (F2)"
						class="flex-1 flex items-center justify-center gap-1 py-2 rounded-md transition-all"
						style="background: rgba(255,255,255,0.06); color: rgba(226,235,248,0.7); font-size: 10.5; font-weight: 600; border: 1px solid rgba(255,255,255,0.08)"
					>
						<svg
							width="11"
							height="11"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="10" y1="15" x2="10" y2="9" />
							<line x1="14" y1="15" x2="14" y2="9" />
						</svg>
						Tahan (F2)
					</button>
					<button
						onclick={onClearCart}
						aria-label="Batalkan transaksi"
						class="flex items-center justify-center gap-1 px-3 py-2 rounded-md transition-all"
						style="background: rgba(220,38,38,0.15); color: #FCA5A5; font-size: 10.5; font-weight: 600; border: 1px solid rgba(220,38,38,0.2)"
					>
						Batal
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- Empty cart state: subtle prompt -->
		<div class="px-4 py-3 shrink-0" style="background: #F8FAFC; border-top: 1px solid #F1F5F9">
			<div class="flex items-center gap-2" style="color: #94A3B8; font-size: 11">
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<span>Pilih produk untuk memulai transaksi baru</span>
			</div>
		</div>
	{/if}
</aside>
