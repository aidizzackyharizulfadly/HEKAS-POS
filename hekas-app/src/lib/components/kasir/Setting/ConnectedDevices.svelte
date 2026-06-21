<script lang="ts">
	/**
	 * ConnectedDevices (HEKAS POS — kasir/Setting)
	 * List connected devices — printer, scanner, scale.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	interface Device { id: string; name: string; type: 'printer' | 'scanner' | 'scale' | 'cash_drawer'; status: 'connected' | 'disconnected'; }
	interface Props { devices: Device[]; onDisconnect?: (id: string) => void; }
	let { devices, onDisconnect }: Props = $props();
	const iconMap = { printer: '🖨️', scanner: '🔍', scale: '⚖️', cash_drawer: '💰' };
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Perangkat Terhubung</h3>
	{#if devices.length === 0}
		<p class="text-sm text-slate-400 text-center py-6">Tidak ada perangkat terhubung</p>
	{:else}
		<ul class="space-y-2" role="list">
			{#each devices as d (d.id)}
				<li class="flex items-center gap-3 p-3 border rounded-lg">
					<span class="text-2xl" aria-hidden="true">{iconMap[d.type]}</span>
					<div class="flex-1">
						<div class="font-semibold text-sm">{d.name}</div>
						<div class="text-xs text-slate-500 capitalize">{d.type}</div>
					</div>
					<span class="w-2 h-2 rounded-full {d.status === 'connected' ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
					{#if onDisconnect && d.status === 'connected'}
						<button type="button" onclick={() => onDisconnect(d.id)} class="text-xs text-red-600 hover:underline">Putuskan</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
