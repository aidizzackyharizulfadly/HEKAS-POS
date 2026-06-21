<script lang="ts">
	/**
	 * Numpad (HEKAS POS — kasir/POS)
	 * Numpad untuk input numerik (qty, paid amount, dll) dengan keyboard support.
	 */
	interface Props {
		onpress: (key: NumpadKey) => void;
		disabled?: boolean;
	}

	type NumpadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'clear' | 'del';

	let { onpress, disabled = false }: Props = $props();

	const keys: NumpadKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'];

	const KEY_TO_PHYSICAL: Record<string, NumpadKey> = {
		'0': '0',
		'1': '1',
		'2': '2',
		'3': '3',
		'4': '4',
		'5': '5',
		'6': '6',
		'7': '7',
		'8': '8',
		'9': '9',
		Backspace: 'del',
		Delete: 'del',
		Escape: 'clear',
		Enter: '0'
	};

	function handleGlobalKey(e: KeyboardEvent) {
		if (disabled) return;
		const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
		if (tag === 'input' || tag === 'textarea') return;

		const key = KEY_TO_PHYSICAL[e.key];
		if (key !== undefined) {
			e.preventDefault();
			onpress(key);
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKey} />

<div class="grid grid-cols-3 gap-2" role="group" aria-label="Numpad">
	{#each keys as k (k)}
		{@const isAction = k === 'clear' || k === 'del'}
		<button
			type="button"
			{disabled}
			onclick={() => onpress(k)}
			aria-label={k === 'del' ? 'Hapus digit terakhir' : k === 'clear' ? 'Bersihkan input' : `Angka ${k}`}
			class="aspect-square rounded-lg text-xl font-bold transition-colors disabled:opacity-50
				{isAction
					? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
					: 'bg-slate-100 hover:bg-slate-200 text-slate-800'}"
		>
			{k === 'del' ? '⌫' : k === 'clear' ? 'C' : k}
		</button>
	{/each}
</div>

<p class="text-[10px] text-slate-400 text-center mt-2">
	Pintasan: <kbd class="px-1 bg-slate-100 rounded">0-9</kbd>
	<kbd class="px-1 bg-slate-100 rounded ml-1">Backspace</kbd>
	<kbd class="px-1 bg-slate-100 rounded ml-1">Esc</kbd>
</p>
