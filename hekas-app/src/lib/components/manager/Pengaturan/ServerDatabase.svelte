<script lang="ts">
	/**
	 * ServerDatabase (HEKAS POS — manager/Pengaturan)
	 * Status server & database connection.
	 *
	 * Status: SCAFFOLD.
	 */
	interface Props { onSwitchMode: (mode: 'http' | 'mock') => void; currentMode: 'http' | 'mock'; }
	let { onSwitchMode, currentMode }: Props = $props();
	const apiBase = $derived(import.meta.env.VITE_API_BASE ?? '(tidak diset — mode mock)');
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Server & Database</h3>

	<div class="p-3 bg-slate-50 rounded-lg">
		<div class="text-xs text-slate-500 font-semibold">Mode</div>
		<div class="flex items-center gap-2 mt-1">
			<span class="w-2 h-2 rounded-full {currentMode === 'http' ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
			<span class="font-mono text-sm">{currentMode.toUpperCase()}</span>
		</div>
	</div>

	<div class="p-3 bg-slate-50 rounded-lg">
		<div class="text-xs text-slate-500 font-semibold">API Base URL</div>
		<div class="font-mono text-sm mt-1 break-all">{apiBase}</div>
	</div>

	<div class="flex gap-2">
		<button type="button" onclick={() => onSwitchMode('mock')} class="flex-1 py-2 rounded-lg border-2 {currentMode === 'mock' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'} font-semibold text-sm">📦 Mock (localStorage)</button>
		<button type="button" onclick={() => onSwitchMode('http')} class="flex-1 py-2 rounded-lg border-2 {currentMode === 'http' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'} font-semibold text-sm">🌐 HTTP (BE)</button>
	</div>

	<div class="text-xs text-slate-500 italic">Switching mode butuh restart dev server (env variable).</div>
</div>
