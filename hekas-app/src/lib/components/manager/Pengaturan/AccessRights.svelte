<script lang="ts">
	/**
	 * AccessRights (HEKAS POS — manager/Pengaturan)
	 * Hak akses — manager approval limits.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { AppSettings } from '$lib/api/settings';
	interface Props { settings: AppSettings; onSave: (rights: AppSettings['accessRights']) => void; }
	let { settings, onSave }: Props = $props();
	let voidTx = $state(settings.accessRights.managerApproval.voidTx);
	let refund = $state(settings.accessRights.managerApproval.refund);
	let discountLimit = $state(settings.accessRights.managerApproval.discountLimit);
	let handover = $state(settings.accessRights.shiftHandover);
</script>

<form onsubmit={(e) => { e.preventDefault(); onSave({ managerApproval: { voidTx, refund, discountLimit }, shiftHandover: handover }); }} class="space-y-3">
	<h3 class="text-lg font-bold">Hak Akses</h3>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Manager approval untuk void</div><div class="text-xs text-slate-500">Void transaksi butuh approval manager</div></div>
		<input type="checkbox" checked={voidTx} onchange={(e) => (voidTx = (e.target as HTMLInputElement).checked)} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Manager approval untuk refund</div><div class="text-xs text-slate-500">Refund butuh approval manager</div></div>
		<input type="checkbox" checked={refund} onchange={(e) => (refund = (e.target as HTMLInputElement).checked)} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<label class="block">
		<div class="font-semibold text-sm mb-1">Limit diskon kasir (%)</div>
		<input type="number" bind:value={discountLimit} min="0" max="100" class="w-full px-3 py-2 border rounded-lg" />
		<div class="text-xs text-slate-500 mt-1">Diskon di atas limit butuh approval</div>
	</label>

	<label class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
		<div><div class="font-semibold text-sm">Serah terima shift</div><div class="text-xs text-slate-500">Aktifkan handover antar shift</div></div>
		<input type="checkbox" checked={handover} onchange={(e) => (handover = (e.target as HTMLInputElement).checked)} class="w-5 h-5 rounded text-blue-600" />
	</label>

	<button type="submit" class="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold">Simpan</button>
</form>
