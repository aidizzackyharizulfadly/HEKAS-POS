<script lang="ts">
	/**
	 * AIControlCenter (HEKAS POS — manager/AI)
	 * Toggle settings AI Assistant.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { AIControl } from '$lib/api/ai';
	interface Props { control: AIControl; onChange: (patch: Partial<AIControl>) => void; }
	let { control, onChange }: Props = $props();
</script>

<div class="space-y-4">
	<h3 class="text-lg font-bold">AI Assistant Settings</h3>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Aktifkan AI</div><div class="text-xs text-slate-500">Master toggle untuk semua fitur AI</div></div>
		<input type="checkbox" checked={control.enabled} onchange={(e) => onChange({ enabled: (e.target as HTMLInputElement).checked })} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Auto Insights</div><div class="text-xs text-slate-500">AI generate insight otomatis dari data</div></div>
		<input type="checkbox" checked={control.autoInsights} onchange={(e) => onChange({ autoInsights: (e.target as HTMLInputElement).checked })} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Proactive Alerts</div><div class="text-xs text-slate-500">Notifikasi otomatis untuk anomali</div></div>
		<input type="checkbox" checked={control.proactiveAlerts} onchange={(e) => onChange({ proactiveAlerts: (e.target as HTMLInputElement).checked })} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Daily Summary</div><div class="text-xs text-slate-500">Kirim ringkasan harian via Telegram</div></div>
		<input type="checkbox" checked={control.dailySummary} onchange={(e) => onChange({ dailySummary: (e.target as HTMLInputElement).checked })} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="block">
		<span class="block text-sm font-semibold">Language</span>
		<select value={control.language} onchange={(e) => onChange({ language: (e.target as HTMLSelectElement).value as 'id' | 'en' })} class="w-full mt-1 px-3 py-2 border rounded-lg"><option value="id">Bahasa Indonesia</option><option value="en">English</option></select>
	</label>

	<label class="block">
		<span class="block text-sm font-semibold">Tone</span>
		<select value={control.tone} onchange={(e) => onChange({ tone: (e.target as HTMLSelectElement).value as 'formal' | 'casual' | 'friendly' })} class="w-full mt-1 px-3 py-2 border rounded-lg"><option value="formal">Formal</option><option value="casual">Casual</option><option value="friendly">Friendly</option></select>
	</label>
</div>
