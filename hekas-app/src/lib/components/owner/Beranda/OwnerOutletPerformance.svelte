<!--
  OwnerOutletPerformance (HEKAS POS — owner/Beranda)
  Performa Outlet table per Role_Owner/screen.png design.
  Table top 5 outlets: name + revenue (slate) + profit (emerald).
-->
<script lang="ts">
	type Outlet = {
		name: string;
		revenue: string;
		profit: string;
	};

	type Props = {
		outlets?: Outlet[];
	};

	let {
		outlets = [
			{ name: 'Outlet Bekasi', revenue: 'Rp 45M', profit: 'Rp 12M' },
			{ name: 'Outlet Jakarta', revenue: 'Rp 38M', profit: 'Rp 10M' },
			{ name: 'Outlet Depok', revenue: 'Rp 32M', profit: 'Rp 8M' },
			{ name: 'Outlet Bogor', revenue: 'Rp 27M', profit: 'Rp 7M' },
			{ name: 'Outlet Tangerang', revenue: 'Rp 25M', profit: 'Rp 6M' }
		]
	}: Props = $props();
</script>

<div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
	<h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
		Performa Outlet
	</h3>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead>
				<tr class="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
					<th class="py-3 px-4">Outlet Name</th>
					<th class="py-3 px-4 text-right">Revenue</th>
					<th class="py-3 px-4 text-right">Profit</th>
				</tr>
			</thead>
			<tbody>
				{#each outlets as o}
					<tr class="border-b border-slate-100 last:border-b-0">
						<td class="py-3 px-4">
							<div class="bg-slate-50 rounded-full px-4 py-2 inline-block font-semibold text-slate-900">
								{o.name}
							</div>
						</td>
						<td class="py-3 px-4 text-right tabular-nums text-slate-700 font-semibold">
							{o.revenue}
						</td>
						<td class="py-3 px-4 text-right tabular-nums text-emerald-600 font-semibold">
							{o.profit}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>