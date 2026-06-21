<script lang="ts">
	/**
	 * EmployeeList (HEKAS POS — manager/Karyawan)
	 * List karyawan — table dengan filter role.
	 *
	 * Status: SCAFFOLD.
	 */
	import type { Employee } from '$lib/api/employees';
	interface Props { employees: Employee[]; onSelect?: (e: Employee) => void; }
	let { employees, onSelect }: Props = $props();
	let role = $state<'all' | 'kasir' | 'manager' | 'gudang'>('all');
	const filtered = $derived(role === 'all' ? employees : employees.filter(e => e.role === role));
</script>

<div class="space-y-3">
	<div class="flex gap-2 items-center">
		<select bind:value={role} class="px-3 py-2 border rounded-lg text-sm"><option value="all">Semua role</option><option value="kasir">Kasir</option><option value="manager">Manager</option><option value="gudang">Gudang</option></select>
		<span class="text-sm text-slate-500">{filtered.length} orang</span>
	</div>
	<table class="w-full text-sm">
		<thead class="bg-slate-50 text-xs uppercase text-slate-600"><tr><th class="px-3 py-2 text-left">Nama</th><th class="px-3 py-2 text-left">Username</th><th class="px-3 py-2">Role</th><th class="px-3 py-2">Status</th></tr></thead>
		<tbody>
			{#each filtered as e (e.id)}
				<tr class="border-t hover:bg-slate-50 cursor-pointer" onclick={() => onSelect?.(e)}>
					<td class="px-3 py-2 font-semibold">{e.fullName}</td>
					<td class="px-3 py-2 font-mono text-xs">{e.username}</td>
					<td class="px-3 py-2 text-center"><span class="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 capitalize">{e.role}</span></td>
					<td class="px-3 py-2 text-center"><span class="w-2 h-2 inline-block rounded-full {e.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}"></span></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
