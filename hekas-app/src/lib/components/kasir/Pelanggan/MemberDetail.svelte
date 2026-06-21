<script lang="ts">
	/**
	 * MemberDetail (HEKAS POS — kasir/Pelanggan)
	 * Detail member panel — info, tier, poin, history transaksi.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Member } from '$lib/types/domain';
	interface Props {
		member: Member;
		onclose: () => void;
		onedit?: () => void;
	}
	let { member, onclose, onedit }: Props = $props();
</script>

<div class="p-4 space-y-3">
	<div class="flex justify-between items-start">
		<div>
			<div class="text-lg font-bold">{member.name}</div>
			<div class="text-sm text-slate-500">{(member as any).phone ?? ''}</div>
		</div>
		<button type="button" onclick={onclose} class="text-slate-400 hover:text-slate-600" aria-label="Tutup">✕</button>
	</div>

	<div class="grid grid-cols-3 gap-2 text-center">
		<div class="p-3 bg-slate-50 rounded-lg"><div class="text-xs text-slate-500">Tier</div><div class="font-bold text-blue-600">{(member as any).tier ?? 'Silver'}</div></div>
		<div class="p-3 bg-slate-50 rounded-lg"><div class="text-xs text-slate-500">Poin</div><div class="font-bold">{(member as any).points ?? 0}</div></div>
		<div class="p-3 bg-slate-50 rounded-lg"><div class="text-xs text-slate-500">Diskon</div><div class="font-bold text-emerald-600">{(member as any).tier === 'Platinum' ? '10%' : (member as any).tier === 'Gold' ? '5%' : '0%'}</div></div>
	</div>

	<div>
		<div class="text-xs font-semibold text-slate-600 mb-1">Alamat</div>
		<div class="text-sm text-slate-800">{(member as any).address ?? '—'}</div>
	</div>

	{#if onedit}<button type="button" onclick={onedit} class="w-full py-2 rounded-lg border border-slate-300 font-semibold text-sm">Edit</button>{/if}
</div>
