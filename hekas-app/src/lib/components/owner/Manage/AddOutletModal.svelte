<!--
  AddOutletModal (HEKAS POS — owner/Manage)
  Modal form untuk tambah outlet baru.
  Pattern: backdrop + card (sesuai PaymentForm/ClosingShift style).
  Fields: Nama Outlet, Alamat, Store Manager, Jumlah Karyawan, Status.
-->
<script lang="ts">
	import { X, Save } from '@lucide/svelte';
	import type { Outlet } from './OutletTable.svelte';
	import type { OutletStatus } from './OutletRow.svelte';

	type Props = {
		open: boolean;
		onclose: () => void;
		onsave: (outlet: Omit<Outlet, 'id'>) => void;
	};

	let { open, onclose, onsave }: Props = $props();

	// Form state
	let name = $state('');
	let address = $state('');
	let manager = $state('');
	let employeesCount = $state<number>(0);
	let status = $state<OutletStatus>('aktif');

	// Validation
	const isValid = $derived(
		name.trim().length > 0 &&
			address.trim().length > 0 &&
			manager.trim().length > 0 &&
			employeesCount >= 0
	);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!isValid) return;
		onsave({
			name: name.trim(),
			address: address.trim(),
			manager: manager.trim(),
			employeesCount,
			status
		});
		// Reset form
		name = '';
		address = '';
		manager = '';
		employeesCount = 0;
		status = 'aktif';
		onclose();
	}

	function handleCancel() {
		onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px);"
		role="dialog"
		aria-modal="true"
		aria-labelledby="add-outlet-title"
		onclick={(e) => {
			if (e.target === e.currentTarget) onclose();
		}}
	>
		<form
			onsubmit={handleSubmit}
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
				<h2 id="add-outlet-title" class="text-base font-bold text-slate-900">
					Tambah Outlet Baru
				</h2>
				<button
					type="button"
					onclick={handleCancel}
					aria-label="Tutup"
					class="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
				>
					<X size={18} strokeWidth={2} />
				</button>
			</div>

			<!-- Body -->
			<div class="px-6 py-5 space-y-4 overflow-y-auto">
				<label class="block">
					<span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
						Nama Outlet <span class="text-rose-500">*</span>
					</span>
					<input
						type="text"
						bind:value={name}
						required
						placeholder="Contoh: Duamart Jakarta"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</label>

				<label class="block">
					<span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
						Alamat <span class="text-rose-500">*</span>
					</span>
					<input
						type="text"
						bind:value={address}
						required
						placeholder="Contoh: Jakarta Selatan"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</label>

				<label class="block">
					<span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
						Store Manager <span class="text-rose-500">*</span>
					</span>
					<input
						type="text"
						bind:value={manager}
						required
						placeholder="Nama lengkap manager"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</label>

				<label class="block">
					<span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
						Jumlah Karyawan
					</span>
					<input
						type="number"
						bind:value={employeesCount}
						min="0"
						step="1"
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
				</label>

				<label class="block">
					<span class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
						Status
					</span>
					<select
						bind:value={status}
						class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
					>
						<option value="aktif">Aktif</option>
						<option value="maintenance">Maintenance</option>
						<option value="tutup">Tutup</option>
					</select>
				</label>
			</div>

			<!-- Footer -->
			<div class="flex gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl">
				<button
					type="button"
					onclick={handleCancel}
					class="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
				>
					Batal
				</button>
				<button
					type="submit"
					disabled={!isValid}
					class="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<Save size={14} strokeWidth={2.5} />
					Simpan
				</button>
			</div>
		</form>
	</div>
{/if}