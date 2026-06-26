<!--
  PosSearchBar (HEKAS POS — kasir/POS)
  Search input + barcode input row for POS product area.
  Extracted from pos/+page.svelte monolith for better maintainability.
  Compatible with shadcn-svelte Input + lucide icons.
-->
<script lang="ts">
	import Input from '$lib/components/ui/input/input.svelte';
	import { Search, X, Barcode } from '@lucide/svelte';

	type Props = {
		bindValue: string; // search text (use $bindable())
		bindBarcodeValue: string; // barcode text
		bindSearchInputEl: HTMLInputElement | null | undefined; // parent ref
		bindBarcodeInputEl: HTMLInputElement | null | undefined; // parent ref
		onbarcodeKey: (e: KeyboardEvent) => void;
	};

	let {
		bindValue = $bindable(''),
		bindBarcodeValue = $bindable(''),
		bindSearchInputEl = $bindable(),
		bindBarcodeInputEl = $bindable(),
		onbarcodeKey
	}: Props = $props();
</script>

<div class="bg-background flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
	<!-- Product search -->
	<div class="group relative flex-1">
		<Search
			class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 transition-colors"
		/>
		<Input
			bind:ref={bindSearchInputEl}
			bind:value={bindValue}
			placeholder="Cari produk atau SKU...  (tekan / untuk fokus)"
			aria-label="Cari produk berdasarkan nama atau SKU, tekan / untuk fokus"
			class="h-9 pl-9 pr-20 text-[13px]"
		/>
		<kbd
			class="bg-background text-muted-foreground absolute top-1/2 right-3 hidden h-5 -translate-y-1/2 items-center justify-center rounded border px-1.5 font-mono text-[10.5px] font-semibold leading-none md:inline-flex"
			>/</kbd
		>
		{#if bindValue}
			<button
				type="button"
				onclick={() => (bindValue = '')}
				aria-label="Bersihkan pencarian"
				class="bg-muted-foreground text-background absolute top-1/2 right-9 flex size-5 -translate-y-1/2 items-center justify-center rounded-full transition-all hover:opacity-80"
			>
				<X class="size-2.5" strokeWidth={3} />
			</button>
		{/if}
	</div>

	<!-- Barcode input -->
	<div class="relative">
		<Barcode
			class="text-primary pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
			strokeWidth={2.2}
		/>
		<Input
			bind:ref={bindBarcodeInputEl}
			bind:value={bindBarcodeValue}
			onkeydown={onbarcodeKey}
			placeholder="Scan barcode..."
			aria-label="Scan barcode produk"
			class="caret-primary h-9 w-44 pl-9 text-[13px]"
		/>
	</div>
</div>