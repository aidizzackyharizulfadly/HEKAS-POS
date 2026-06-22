<script lang="ts">
	/**
	 * MutasiList — Stock movement log widget untuk gudang inventaris.
	 * Menampilkan ringkasan in/out + daftar mutasi dengan reference type.
	 *
	 * v2.0 — refactored ke shadcn-svelte (Table + Badge + Button + lucide icons)
	 */

	import { formatDate, formatTime } from '$lib/utils/format';
	import EmptyState from '$lib/components/shared/EmptyState.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import {
		Package,
		ShoppingCart,
		ArrowLeftRight,
		Wrench,
		Undo2,
		Plus,
		TrendingDown,
		TrendingUp
	} from '@lucide/svelte';

	/**
	 * StockMovement — one stock ledger entry (in/out adjustment).
	 * Mirrors `stock_movements` table per PRD DATABASE_DESIGN §4.3.
	 */
	export interface StockMovement {
		id: number;
		product_id: number;
		product_name?: string;
		movement_type:
			| 'in_purchase'
			| 'in_adjustment'
			| 'in_return'
			| 'out_sale'
			| 'out_transfer'
			| 'out_void_restore'
			| 'out_adjustment';
		quantity_delta: number; // + masuk, - keluar
		quantity_after: number;
		reference_type?: string;
		reference_id?: number;
		notes?: string;
		created_by?: string;
		created_at: string; // ISO
	}

	interface Props {
		movements?: StockMovement[];
		onAddMovement?: () => void;
	}

	let { movements = [], onAddMovement }: Props = $props();

	const typeConfig: Record<
		StockMovement['movement_type'],
		{ label: string; variant: 'success' | 'info' | 'warning' | 'destructive' | 'secondary' }
	> = {
		in_purchase: { label: 'Pembelian', variant: 'success' },
		in_adjustment: { label: 'Adjustment', variant: 'info' },
		in_return: { label: 'Retur', variant: 'warning' },
		out_sale: { label: 'Penjualan', variant: 'destructive' },
		out_transfer: { label: 'Transfer', variant: 'warning' },
		out_void_restore: { label: 'Void Restore', variant: 'secondary' },
		out_adjustment: { label: 'Adjustment', variant: 'secondary' }
	};

	const sorted = $derived([...movements].sort((a, b) => b.created_at.localeCompare(a.created_at)));

	const totalIn = $derived(
		movements.filter((m) => m.quantity_delta > 0).reduce((s, m) => s + m.quantity_delta, 0)
	);
	const totalOut = $derived(
		movements.filter((m) => m.quantity_delta < 0).reduce((s, m) => s + m.quantity_delta, 0)
	);

	function iconFor(type: StockMovement['movement_type']) {
		if (type.startsWith('in_')) return TrendingUp;
		return TrendingDown;
	}
</script>

<div class="flex h-full flex-col gap-3">
	<!-- Summary header -->
	<div class="grid grid-cols-3 gap-3">
		<Card.Root class="border-emerald-200 bg-emerald-50">
			<Card.Content class="p-3">
				<div class="text-xs font-semibold text-emerald-700">Stok Masuk</div>
				<div class="text-2xl font-black text-emerald-600 tabular-nums">+{totalIn}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border-red-200 bg-red-50">
			<Card.Content class="p-3">
				<div class="text-xs font-semibold text-red-700">Stok Keluar</div>
				<div class="text-2xl font-black text-red-600 tabular-nums">{totalOut}</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="border-slate-200 bg-slate-50">
			<Card.Content class="flex flex-col items-center justify-center p-3">
				<div class="text-xs text-muted-foreground">Selisih</div>
				<div class="text-2xl font-black text-foreground tabular-nums">{totalIn + totalOut}</div>
			</Card.Content>
		</Card.Root>
	</div>

	{#if onAddMovement}
		<div class="flex justify-end">
			<Button onclick={onAddMovement} size="sm">
				<Plus class="size-3.5" />
				Mutasi Manual
			</Button>
		</div>
	{/if}

	{#if sorted.length === 0}
		<EmptyState
			icon="🔄"
			title="Belum ada mutasi"
			description="Aktivitas stok (masuk/keluar) akan tercatat otomatis di sini."
		/>
	{:else}
		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[120px]">Tipe</Table.Head>
						<Table.Head>Produk</Table.Head>
						<Table.Head class="text-right">Δ</Table.Head>
						<Table.Head class="text-right">Sisa</Table.Head>
						<Table.Head class="text-right">Waktu · Oleh</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each sorted as m (m.id)}
						{@const cfg = typeConfig[m.movement_type]}
						{@const positive = m.quantity_delta > 0}
						<Table.Row>
							<Table.Cell>
								<Badge variant={cfg.variant}>
									{cfg.label}
								</Badge>
							</Table.Cell>
							<Table.Cell class="font-medium">
								{m.product_name ?? `SKU #${m.product_id}`}
								{#if m.notes}
									<div class="text-muted-foreground mt-0.5 text-xs italic">"{m.notes}"</div>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right">
								<span
									class="font-black tabular-nums"
									class:text-emerald-600={positive}
									class:text-red-600={!positive}
								>
									{positive ? '+' : ''}{m.quantity_delta}
								</span>
							</Table.Cell>
							<Table.Cell class="text-right text-sm font-semibold tabular-nums">
								{m.quantity_after}
							</Table.Cell>
							<Table.Cell class="text-right text-xs text-muted-foreground">
								{formatDate(m.created_at)} {formatTime(m.created_at)} · {m.created_by ?? 'sistem'}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	{/if}
</div>