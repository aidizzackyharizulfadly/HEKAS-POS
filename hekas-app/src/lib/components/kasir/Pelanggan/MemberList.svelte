<script lang="ts">
	/**
	 * MemberList (HEKAS POS — kasir/Pelanggan)
	 * List member — search by nama/telp/email, tier badge, pilih untuk transaksi.
	 */
	import type { Member } from '$lib/types/domain';
	import MemberTierBadge from './MemberTierBadge.svelte';

	interface Props {
		members: Member[];
		onselect: (m: Member) => void;
		onaddnew?: () => void;
		loading?: boolean;
	}

	let { members, onselect, onaddnew, loading = false }: Props = $props();

	let search = $state('');
	let lastSelectedId = $state<number | null>(null);

	const filtered = $derived(
		members.filter((m) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			const phone = String((m as any).phone ?? '');
			return (
				m.name.toLowerCase().includes(q) ||
				phone.includes(search) ||
				((m as any).email ?? '').toLowerCase().includes(q)
			);
		})
	);

	function handleSelect(m: Member) {
		lastSelectedId = m.id !== undefined ? Number(m.id) : null;
		onselect(m);
	}

	function handleKey(e: KeyboardEvent, m: Member) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleSelect(m);
		}
	}

	function memberInitials(name: string): string {
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((s) => s[0]?.toUpperCase() ?? '')
			.join('');
	}
</script>

<div class="space-y-3">
	<div class="flex gap-2">
		<label for="member-search" class="sr-only">Cari member</label>
		<input
			id="member-search"
			type="text"
			placeholder="Cari member (nama/telp/email)..."
			bind:value={search}
			class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		{#if onaddnew}
			<button
				type="button"
				onclick={onaddnew}
				class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
			>
				+ Baru
			</button>
		{/if}
	</div>

	{#if loading}
		<div class="space-y-1">
			{#each Array(5) as _, i (i)}
				<div class="p-3 bg-slate-50 rounded-lg animate-pulse h-14"></div>
			{/each}
		</div>
	{:else if filtered.length === 0}
		<div class="text-center py-8 text-sm text-slate-400">
			<div class="text-3xl mb-2" aria-hidden="true">👤</div>
			{search ? 'Tidak ada member cocok' : 'Belum ada member'}
			{#if onaddnew && !search}
				<button
					type="button"
					onclick={onaddnew}
					class="block mx-auto mt-2 text-xs text-blue-600 hover:underline"
				>
					+ Tambah member pertama
				</button>
			{/if}
		</div>
	{:else}
		<ul class="space-y-1 max-h-[60vh] overflow-y-auto" role="list">
			{#each filtered as m (m.id)}
				{@const isSelected = lastSelectedId !== null && m.id !== undefined && lastSelectedId === Number(m.id)}
				<li>
					<button
						type="button"
						onclick={() => handleSelect(m)}
						onkeydown={(e) => handleKey(e, m)}
						aria-pressed={isSelected}
						aria-label={`Pilih member ${m.name}`}
						class="w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3
							{isSelected
								? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
								: 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}"
					>
						<div
							class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
							aria-hidden="true"
						>
							{memberInitials(m.name)}
						</div>
						<div class="flex-1 min-w-0">
							<div class="font-semibold text-sm text-slate-800 truncate">{m.name}</div>
							<div class="text-xs text-slate-500 truncate">
								{(m as any).phone ?? ''}
								{#if (m as any).email}
									· {(m as any).email}
								{/if}
							</div>
						</div>
						<div class="flex flex-col items-end gap-0.5 flex-shrink-0">
							<MemberTierBadge tier={(m as any).tier ?? 'bronze'} />
							{#if (m as any).points !== undefined}
								<span class="text-[10px] text-slate-500 tabular-nums">
									{(m as any).points.toLocaleString('id-ID')} poin
								</span>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if filtered.length > 0 && !search}
		<div class="text-xs text-slate-500 text-center pt-2 border-t">
			{filtered.length} member terdaftar
		</div>
	{/if}
</div>
