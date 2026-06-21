<script lang="ts">
	/**
	 * SystemSummary (HEKAS POS — manager/Pengaturan)
	 * Ringkasan sistem — stats, version, environment.
	 *
	 * Status: SCAFFOLD.
	 */
	interface Props { stats: { totalProducts: number; totalMembers: number; totalTransactions: number; totalUsers: number; }; }
	let { stats }: Props = $props();
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Sistem</h3>

	<div class="grid grid-cols-2 gap-3">
		<div class="p-3 bg-blue-50 rounded-lg"><div class="text-xs text-blue-700">Produk</div><div class="text-2xl font-bold text-blue-900">{stats.totalProducts}</div></div>
		<div class="p-3 bg-violet-50 rounded-lg"><div class="text-xs text-violet-700">Member</div><div class="text-2xl font-bold text-violet-900">{stats.totalMembers}</div></div>
		<div class="p-3 bg-emerald-50 rounded-lg"><div class="text-xs text-emerald-700">Transaksi</div><div class="text-2xl font-bold text-emerald-900">{stats.totalTransactions}</div></div>
		<div class="p-3 bg-amber-50 rounded-lg"><div class="text-xs text-amber-700">User</div><div class="text-2xl font-bold text-amber-900">{stats.totalUsers}</div></div>
	</div>

	<div class="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
		<div class="flex justify-between"><span class="text-slate-500">App</span><span class="font-mono">HEKAS POS v0.0.1</span></div>
		<div class="flex justify-between"><span class="text-slate-500">SvelteKit</span><span class="font-mono">2.63.x</span></div>
		<div class="flex justify-between"><span class="text-slate-500">Svelte</span><span class="font-mono">5.56.x</span></div>
		<div class="flex justify-between"><span class="text-slate-500">Tailwind</span><span class="font-mono">4.3.x</span></div>
		<div class="flex justify-between"><span class="text-slate-500">Mode</span><span class="font-mono">{import.meta.env.MODE}</span></div>
	</div>
</div>
