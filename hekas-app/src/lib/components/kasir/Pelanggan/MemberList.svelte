<script lang="ts">
	/**
	 * MemberList (HEKAS POS — kasir/Pelanggan)
	 * List member — search + pilih untuk transaksi.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { Member } from '$lib/types/domain';
	interface Props {
		members: Member[];
		onSelect: (m: Member) => void;
		onAddNew?: () => void;
	}
	let { members, onSelect, onAddNew }: Props = $props();
	let search = $state('');
	const filtered = $derived(members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || (m as any).phone?.includes(search)));
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<input type="text" placeholder="Cari member (nama/telp)..." bind:value={search}
			class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
		{#if onAddNew}<button type="button" onclick={onAddNew} class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">+ Baru</button>{/if}
	</div>

	<ul class="space-y-1 max-h-[60vh] overflow-y-auto" role="list">
		{#each filtered as m (m.id)}
			<li>
				<button type="button" onclick={() => onSelect(m)}
					class="w-full text-left p-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors">
					<div class="font-semibold text-sm text-slate-800">{m.name}</div>
					<div class="text-xs text-slate-500">{(m as any).phone ?? ''} · Poin: {(m as any).points ?? 0}</div>
				</button>
			</li>
		{/each}
		{#if filtered.length === 0}
			<li class="text-center py-8 text-sm text-slate-400">Tidak ada member cocok</li>
		{/if}
	</ul>
</div>
