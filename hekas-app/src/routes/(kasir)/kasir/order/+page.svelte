<!-- /kasir/order — uses RoleShell (Sidebar + TopBar + content area) -->
<!-- R1.1: Demonstrate shared shell works for sub-route pages -->
<script lang="ts">
	import RoleShell from '$lib/components/shared/RoleShell.svelte';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';

	const user = { full_name: 'Kasir Demo', role: 'kasir' };

	function handleLogout() {
		api.auth.logout();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Order · HEKAS POS</title>
</svelte:head>

<RoleShell
	role="kasir"
	title="Order"
	subtitle="Daftar transaksi hari ini · klik untuk detail"
	{user}
	onlogout={handleLogout}
>
	<div class="p-6">
		<div class="rounded-xl p-8 text-center" style="background: #fff; border: 1px solid #E2E8F0">
			<div class="text-5xl mb-4">🧾</div>
			<h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 8px">
				Halaman Order
			</h2>
			<p style="font-size: 13px; color: #64748B; margin: 0">
				RoleShell bekerja: Sidebar di kiri, TopBar di atas, konten di tengah.
				<br />
				Implementasi penuh (list order, void, draft counter) akan diekstrak dari
				monolithic page di fase R3.
			</p>
		</div>
	</div>
</RoleShell>
