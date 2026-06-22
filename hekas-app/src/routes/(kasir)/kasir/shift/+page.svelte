<!--
  /kasir/shift — Shift history & status.
  Per FRONTEND_ARCHITECTURE §4.2 (kasir routes).
  Uses R3a orchestrator: ShiftDashboard.

  Catatan (Fase R3 / 2026-06-22): <KasirRail> di-render oleh (kasir)/+layout.svelte.
-->
<script lang="ts">
	import ShiftDashboard from '$lib/components/kasir/Shift/ShiftDashboard.svelte';
</script>

<svelte:head>
	<title>Shift · HEKAS POS</title>
</svelte:head>

<div class="kasir-shift" style="padding: 20px 24px">
	<header style="margin-bottom: 16px">
		<h1 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0">Shift</h1>
		<p style="font-size: 12px; color: #64748B; margin: 4px 0 0">Riwayat shift & status kasir</p>
	</header>
	<ShiftDashboard />
</div>
