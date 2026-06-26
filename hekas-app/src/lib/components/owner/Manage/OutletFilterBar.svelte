<!--
  OutletFilterBar (HEKAS POS — owner/Manage)
  Filter bar dengan search input + status dropdown + Tambah Outlet button.
  Per Role_Owner/screen.png design.
-->
<script lang="ts">
	import { Search, Plus, ChevronDown } from '@lucide/svelte';
	import type { OutletStatus } from './OutletRow.svelte';

	export type StatusFilter = 'all' | OutletStatus;

	type Props = {
		search: string;
		statusFilter: StatusFilter;
		onsearchChange: (v: string) => void;
		onstatusChange: (v: StatusFilter) => void;
		onadd: () => void;
	};

	let { search, statusFilter, onsearchChange, onstatusChange, onadd }: Props = $props();

	const statusOptions: Array<{ value: StatusFilter; label: string }> = [
		{ value: 'all', label: 'Semua Status' },
		{ value: 'aktif', label: 'Aktif' },
		{ value: 'maintenance', label: 'Maintenance' },
		{ value: 'tutup', label: 'Tutup' }
	];
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
	<div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
		<!-- Search input -->
		<div class="relative flex-1">
			<Search
				class="text-slate-400 pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
				strokeWidth={2}
			/>
			<input
				type="search"
				value={search}
				oninput={(e) => onsearchChange((e.target as HTMLInputElement).value)}
				placeholder="Cari Outlet..."
				aria-label="Cari outlet berdasarkan nama"
				class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
			/>
		</div>

		<!-- Status dropdown -->
		<div class="relative">
			<select
				value={statusFilter}
				onchange={(e) => onstatusChange((e.target as HTMLSelectElement).value as StatusFilter)}
				aria-label="Filter status outlet"
				class="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
			>
				{#each statusOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			<ChevronDown
				class="text-slate-400 pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
				strokeWidth={2}
			/>
		</div>

		<!-- Add outlet button -->
		<button
			type="button"
			onclick={onadd}
			class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
		>
			<Plus size={16} strokeWidth={2.5} />
			Tambah Outlet
		</button>
	</div>
</div>