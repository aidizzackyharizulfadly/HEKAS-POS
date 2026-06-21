<script lang="ts">
	/**
	 * Numpad (HEKAS POS — kasir/POS)
	 * Numpad untuk input numerik (qty, paid amount, dll).
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { onpress: (key: string) => void; disabled?: boolean; }
	let { onpress, disabled = false }: Props = $props();
	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'del'] as const;
</script>

<div class="grid grid-cols-3 gap-2" role="group" aria-label="Numpad">
	{#each keys as k (k)}
		<button type="button" {disabled}
			onclick={() => onpress(k)}
			class="aspect-square rounded-lg bg-slate-100 hover:bg-slate-200 text-xl font-bold text-slate-800 transition-colors disabled:opacity-50"
			aria-label={k === 'del' ? 'Hapus' : k === 'clear' ? 'Bersihkan' : k}>
			{k === 'del' ? '⌫' : k === 'clear' ? 'C' : k}
		</button>
	{/each}
</div>


