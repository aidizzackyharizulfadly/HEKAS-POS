<!--
  /kasir/pelanggan — Member loyalty management.
  Per FRONTEND_ARCHITECTURE §4.2 (kasir routes).
  Uses R3a orchestrator: PelangganDashboard.

  Catatan (Fase R3 / 2026-06-22): <KasirRail> di-render oleh (kasir)/+layout.svelte.
  Tidak perlu <RoleShell> lagi. Cukup render konten utama.
-->
<script lang="ts">
	import PelangganDashboard from '$lib/components/kasir/Pelanggan/PelangganDashboard.svelte';
</script>

<svelte:head>
	<title>Pelanggan · HEKAS POS</title>
</svelte:head>

<div class="kasir-pelanggan" style="padding: 20px 24px">
	<header style="margin-bottom: 16px">
		<h1 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0">Pelanggan</h1>
		<p style="font-size: 12px; color: #64748B; margin: 4px 0 0">Member loyalty & data pelanggan</p>
	</header>
	<PelangganDashboard />
</div>
