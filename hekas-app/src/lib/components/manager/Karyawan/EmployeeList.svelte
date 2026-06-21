<script lang="ts">
	/**
	 * EmployeeList (HEKAS POS — manager/Karyawan)
	 * Pakai manager-helpers untuk filter/sort logic.
	 * Badge pakai StatusMeta + statusClasses untuk konsistensi.
	 */
	import type { Employee } from '$lib/api/employees';
	import { filterEmployees, sortEmployees, nameInitials } from '$lib/utils/manager-helpers';
	import { statusClasses } from '$lib/utils/status-classes';
	import type { StatusMeta } from '$lib/utils/status-helpers';

	interface Props {
		employees: Employee[];
		onselect?: (e: Employee) => void;
		loading?: boolean;
	}

	let { employees, onselect, loading = false }: Props = $props();

	let search = $state('');
	let roleFilter = $state<'all' | 'kasir' | 'manager' | 'gudang'>('all');
	let statusFilter = $state<'all' | 'active' | 'inactive'>('all');
	let sortKey = $state<'name' | 'role' | 'status'>('name');
	let sortDir = $state<'asc' | 'desc'>('asc');

	// Role → StatusMeta. Konsisten dengan auth/roles.ts.
	const ROLE_BADGES: Record<string, StatusMeta> = {
		kasir: { label: 'Kasir', color: 'blue', icon: '🛒', severity: 'info' },
		manager: { label: 'Manager', color: 'purple', icon: '👔', severity: 'info' },
		gudang: { label: 'Gudang', color: 'yellow', icon: '📦', severity: 'warning' },
		admin: { label: 'Admin', color: 'red', icon: '🔑', severity: 'error' }
	};
	const roleBadge = (role: string) => {
		const meta: StatusMeta = ROLE_BADGES[role] ?? { label: role, color: 'gray', icon: '•', severity: 'neutral' };
		return { label: meta.label, cls: statusClasses(meta) };
	};

	// Active/inactive status badge.
	const statusBadge = (s: Employee['status']) => {
		const meta: StatusMeta = s === 'active'
			? { label: 'Aktif', color: 'green', icon: '●', severity: 'success' }
			: { label: 'Non-aktif', color: 'gray', icon: '○', severity: 'neutral' };
		return { label: meta.label, cls: statusClasses(meta) };
	};

	const filtered = $derived(
		filterEmployees(employees, { search, role: roleFilter, status: statusFilter })
	);
	const sorted = $derived(sortEmployees(filtered, sortKey, sortDir));

	function toggleSort(key: typeof sortKey) {
		if (sortKey === key) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = key;
			sortDir = 'asc';
		}
	}

	function sortIcon(key: typeof sortKey): string {
		if (sortKey !== key) return '↕';
		return sortDir === 'asc' ? '↑' : '↓';
	}

	function handleKey(e: KeyboardEvent, e2: Employee) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onselect?.(e2);
		}
	}
</script>

<div class="space-y-3">
	<div class="flex gap-2 flex-wrap items-center">
		<label for="emp-search" class="sr-only">Cari karyawan</label>
		<input
			id="emp-search"
			type="text"
			placeholder="Cari nama/username/email..."
			bind:value={search}
			class="flex-1 min-w-[160px] px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<label for="emp-role" class="sr-only">Filter role</label>
		<select
			id="emp-role"
			bind:value={roleFilter}
			class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
		>
			<option value="all">Semua role</option>
			<option value="kasir">Kasir</option>
			<option value="manager">Manager</option>
			<option value="gudang">Gudang</option>
		</select>
		<label for="emp-status" class="sr-only">Filter status</label>
		<select
			id="emp-status"
			bind:value={statusFilter}
			class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
		>
			<option value="all">Semua status</option>
			<option value="active">Aktif</option>
			<option value="inactive">Nonaktif</option>
		</select>
	</div>

	<div class="text-xs text-slate-500">
		Menampilkan {sorted.length} dari {employees.length} karyawan
	</div>

	{#if loading}
		<div class="space-y-1">
			{#each Array(5) as _, i (i)}
				<div class="h-12 bg-slate-50 rounded-lg animate-pulse"></div>
			{/each}
		</div>
	{:else if sorted.length === 0}
		<div class="text-center py-12 text-slate-400">
			<div class="text-4xl mb-2" aria-hidden="true">👥</div>
			<p class="text-sm">
				{search || roleFilter !== 'all' || statusFilter !== 'all'
					? 'Tidak ada karyawan cocok'
					: 'Belum ada karyawan'}
			</p>
		</div>
	{:else}
		<div class="border border-slate-200 rounded-lg overflow-hidden">
			<table class="w-full text-sm">
				<thead class="bg-slate-50 text-xs uppercase text-slate-600">
					<tr>
						<th class="px-3 py-2 text-left">
							<button
								type="button"
								onclick={() => toggleSort('name')}
								class="font-semibold hover:text-slate-900"
							>
								Nama <span class="text-slate-400">{sortIcon('name')}</span>
							</button>
						</th>
						<th class="px-3 py-2 text-left hidden sm:table-cell">Username</th>
						<th class="px-3 py-2 text-center">
							<button
								type="button"
								onclick={() => toggleSort('role')}
								class="font-semibold hover:text-slate-900"
							>
								Role <span class="text-slate-400">{sortIcon('role')}</span>
							</button>
						</th>
						<th class="px-3 py-2 text-center">
							<button
								type="button"
								onclick={() => toggleSort('status')}
								class="font-semibold hover:text-slate-900"
							>
								Status <span class="text-slate-400">{sortIcon('status')}</span>
							</button>
						</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as emp (emp.id)}
						{@const badge = ROLE_BADGES[emp.role] ?? {
							label: emp.role,
							cls: 'bg-slate-100 text-slate-700'
						}}
						{@const roleB = roleBadge(emp.role)}
						{@const sB = statusBadge(emp.status)}
						<tr
							class="hover:bg-slate-50 cursor-pointer focus:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
							onclick={() => onselect?.(emp)}
							onkeydown={(e) => handleKey(e, emp)}
							tabindex="0"
							role="button"
							aria-label={`Pilih ${emp.fullName}`}
							>
							<td class="px-3 py-2">
								<div class="flex items-center gap-2.5">
									<div
										class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
										aria-hidden="true"
									>
										{nameInitials(emp.fullName)}
									</div>
									<div class="min-w-0">
										<div class="font-semibold text-slate-800 truncate">{emp.fullName}</div>
										{#if (emp as any).email}
											<div class="text-[10px] text-slate-500 truncate">
												{(emp as any).email}
											</div>
										{/if}
									</div>
								</div>
							</td>
							<td class="px-3 py-2 font-mono text-xs text-slate-600 hidden sm:table-cell">
								{emp.username}
							</td>
							<td class="px-3 py-2 text-center">
								<span class="px-2 py-0.5 rounded text-[10px] font-bold {roleB.cls}">
									{roleB.label}
								</span>
							</td>
							<td class="px-3 py-2 text-center">
								<span
									class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold {sB.cls}"
								>
									{sB.label}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
