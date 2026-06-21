<script lang="ts">
	/**
	 * SearchBar (HEKAS POS — kasir/POS)
	 * Search bar dengan debounce, keyboard shortcut focus, dan clear button.
	 */
	interface Props {
		value: string;
		oninput: (v: string) => void;
		placeholder?: string;
		shortcut?: string;
		debounceMs?: number;
	}

	let {
		value,
		oninput,
		placeholder = 'Cari produk (nama/SKU/barcode)...',
		shortcut = '/',
		debounceMs = 0
	}: Props = $props();

	let inputEl: HTMLInputElement | undefined = $state();
	let localValue = $state(value);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;
	let isFocused = $state(false);

	$effect(() => {
		// sync external value -> local
		if (value !== localValue && document.activeElement !== inputEl) {
			localValue = value;
		}
	});

	function emit(v: string) {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (debounceMs > 0) {
			debounceTimer = setTimeout(() => oninput(v), debounceMs);
		} else {
			oninput(v);
		}
	}

	function handleInput(e: Event) {
		const v = (e.target as HTMLInputElement).value;
		localValue = v;
		emit(v);
	}

	function clear() {
		localValue = '';
		if (debounceTimer) clearTimeout(debounceTimer);
		oninput('');
		inputEl?.focus();
	}

	function handleGlobalKey(e: KeyboardEvent) {
		if (e.key === shortcut && !isFocused) {
			const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
			if (tag === 'input' || tag === 'textarea') return;
			e.preventDefault();
			inputEl?.focus();
			inputEl?.select();
		}
		if (e.key === 'Escape' && isFocused) {
			inputEl?.blur();
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKey} />

<label
	class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg transition-colors
		{isFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''}"
>
	<span class="text-lg" aria-hidden="true">🔍</span>
	<input
		bind:this={inputEl}
		type="text"
		value={localValue}
		{placeholder}
		oninput={handleInput}
		onfocus={() => (isFocused = true)}
		onblur={() => (isFocused = false)}
		aria-label={placeholder}
		class="flex-1 bg-transparent outline-none text-sm"
	/>
	{#if localValue}
		<button
			type="button"
			onclick={clear}
			aria-label="Bersihkan pencarian"
			class="text-slate-400 hover:text-slate-700 text-lg leading-none w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100"
		>
			✕
		</button>
	{/if}
	<kbd
		class="px-1.5 py-0.5 text-xs bg-slate-100 text-slate-600 rounded font-mono border border-slate-200"
		aria-label="Pintasan keyboard {shortcut}"
	>{shortcut}</kbd>
</label>
