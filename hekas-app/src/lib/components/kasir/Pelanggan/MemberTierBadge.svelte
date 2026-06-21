<script lang="ts">
	/**
	 * MemberTierBadge (HEKAS POS — kasir/Pelanggan)
	 * Badge tier member (Silver/Gold/Platinum) — colored chip.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Props { tier: 'Silver' | 'Gold' | 'Platinum' | string; size?: 'sm' | 'md'; }
	let { tier, size = 'md' }: Props = $props();
	const config = $derived({
		Silver: { bg: 'bg-slate-100', text: 'text-slate-700', icon: '⚪' },
		Gold: { bg: 'bg-amber-100', text: 'text-amber-800', icon: '🥇' },
		Platinum: { bg: 'bg-violet-100', text: 'text-violet-800', icon: '💎' }
	}[tier] ?? { bg: 'bg-slate-100', text: 'text-slate-700', icon: '⚪' });
</script>

<span class="inline-flex items-center gap-1 rounded-full font-semibold {config.bg} {config.text} {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'}">
	<span aria-hidden="true">{config.icon}</span>
	{tier}
</span>
