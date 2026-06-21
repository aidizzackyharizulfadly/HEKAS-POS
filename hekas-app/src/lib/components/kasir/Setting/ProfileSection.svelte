<script lang="ts">
	/**
	 * ProfileSection (HEKAS POS — kasir/Setting)
	 * Section profil kasir — info user, role, outlet.
	 *
	 * Status: SCAFFOLD — TypeScript props + Tailwind styling siap.
	 * Logic detail akan diisi di iterasi berikutnya.
	 */
	import type { RoleId } from '$lib/auth/roles';
	interface Props {
		username: string;
		fullName?: string;
		role: RoleId;
		outletName?: string;
	}
	let { username, fullName, role, outletName }: Props = $props();
	const roleLabel = { kasir: 'Kasir', manager: 'Manager', gudang: 'Admin Gudang' }[role];
</script>

<div class="space-y-3">
	<h3 class="text-lg font-bold">Profil</h3>
	<div class="grid grid-cols-2 gap-3 text-sm">
		<div><div class="text-xs text-slate-500">Username</div><div class="font-semibold">{username}</div></div>
		<div><div class="text-xs text-slate-500">Nama</div><div class="font-semibold">{fullName ?? '—'}</div></div>
		<div><div class="text-xs text-slate-500">Role</div><div class="font-semibold">{roleLabel}</div></div>
		<div><div class="text-xs text-slate-500">Outlet</div><div class="font-semibold">{outletName ?? '—'}</div></div>
	</div>
</div>
