<!--
  OutletTable (HEKAS POS — owner/Manage)
  Table of outlets — 5 columns per Role_Owner/screen.png design.
  Wraps OutletRow for each outlet entry.
-->
<script lang="ts">
	import OutletRow, { type OutletStatus } from './OutletRow.svelte';

	export type Outlet = {
		id: string;
		name: string;
		address: string;
		manager: string;
		employeesCount: number;
		status: OutletStatus;
	};

	type Props = {
		outlets: Outlet[];
	};

	let { outlets }: Props = $props();
</script>

<div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
					<th class="py-4 px-6">Nama Outlet</th>
					<th class="py-4 px-6">Store Manager</th>
					<th class="py-4 px-6">Jumlah Karyawan</th>
					<th class="py-4 px-6">Status</th>
					<th class="py-4 px-6 text-right">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#each outlets as o (o.id)}
					<OutletRow
						name={o.name}
						address={o.address}
						manager={o.manager}
						employeesCount={o.employeesCount}
						status={o.status}
					/>
				{/each}
				{#if outlets.length === 0}
					<tr>
						<td colspan="5" class="py-12 text-center text-sm text-slate-400">
							Tidak ada outlet yang cocok dengan filter
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>