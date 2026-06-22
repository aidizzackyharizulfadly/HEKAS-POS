<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
	import Input from '$lib/components/ui/input/input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { ShoppingCart, Plus, Trash2, Save, Search } from '@lucide/svelte';
</script>

<svelte:head>
	<title>shadcn-svelte Fase 1 — Smoke Test</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 p-8">
	<div>
		<h1 class="text-2xl font-bold text-foreground">shadcn-svelte Fase 1 — Smoke Test</h1>
		<p class="text-muted-foreground mt-1 text-sm">
			Verify Button, Card, Input, Badge, Separator render dengan HEKAS tokens.
		</p>
	</div>

	<Separator />

	<!-- ── Button ─────────────────────────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Button</h2>
		<div class="flex flex-wrap items-center gap-2">
			<Button>Default Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">
				<Trash2 />
				Delete
			</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
			<Button size="sm">
				<Plus />
				Small
			</Button>
			<Button size="lg">
				<Save />
				Large
			</Button>
		</div>
	</section>

	<Separator />

	<!-- ── Card ───────────────────────────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Card</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Penjualan Hari Ini</Card.Title>
					<Card.Description>Real-time POS data</Card.Description>
				</Card.Header>
				<Card.Content>
					<p class="text-2xl font-bold">Rp 1.250.000</p>
					<p class="text-muted-foreground text-sm">+12% dari kemarin</p>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Transaksi</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-2xl font-bold">48</p>
					<p class="text-muted-foreground text-sm">15 dalam proses</p>
				</Card.Content>
				<Card.Footer>
					<Button variant="outline" size="sm">Lihat Detail</Button>
				</Card.Footer>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Stok Rendah</Card.Title>
				</Card.Header>
				<Card.Content>
					<p class="text-2xl font-bold text-destructive">5</p>
					<p class="text-muted-foreground text-sm">SKU perlu restock</p>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<Separator />

	<!-- ── Input ──────────────────────────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Input</h2>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			<div class="space-y-1">
				<label for="search" class="text-sm font-medium">Search produk</label>
				<div class="relative">
					<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input id="search" placeholder="Cari SKU atau nama produk..." class="pl-9" />
				</div>
			</div>
			<div class="space-y-1">
				<label for="qty" class="text-sm font-medium">Jumlah</label>
				<Input id="qty" type="number" placeholder="0" value="1" />
			</div>
		</div>
	</section>

	<Separator />

	<!-- ── Badge ──────────────────────────────────────────────────────── -->
	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Badge (HEKAS extended variants)</h2>
		<div class="flex flex-wrap items-center gap-2">
			<Badge>Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="success">Success</Badge>
			<Badge variant="warning">Warning</Badge>
			<Badge variant="info">Info</Badge>
			<Badge variant="roleKasir">
				<ShoppingCart />
				Kasir
			</Badge>
			<Badge variant="roleManager">Manager</Badge>
			<Badge variant="roleGudang">Gudang</Badge>
		</div>
	</section>

	<Separator />

	<div class="text-muted-foreground text-xs">
		✅ Fase 1 complete — Button, Card, Input, Badge, Separator ready for use.
	</div>
</div>