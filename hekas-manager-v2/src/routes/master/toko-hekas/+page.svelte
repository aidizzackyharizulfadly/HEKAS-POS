<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte';
</script>

<svelte:head><title>TokoHEKAS — HEKAS POS Manager</title></svelte:head>

<div class="mb-6">
  <h1 class="text-xl font-bold text-gray-800">TokoHEKAS</h1>
  <p class="text-xs text-gray-500 mt-1">Konfigurasi toko online HEKAS untuk customer belanja dari rumah.</p>
</div>

<EmptyState
  title="Toko Online Belum Diaktifkan"
  message="Aktifkan TokoHEKAS untuk menerima pesanan online dari pelanggan. Konfigurasi subdomain, jam operasional, dan integrasi ekspedisi di sini."
/>