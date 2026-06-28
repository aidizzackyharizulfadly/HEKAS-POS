<script lang="ts">
  let enabled = $state(false);
</script>

<svelte:head><title>Pengaturan Reservasi — HEKAS POS Manager</title></svelte:head>

<div class="mb-6 flex items-center gap-2 text-sm">
  <a href="/pengaturan" class="text-[#1E3A5F] hover:underline">← Pengaturan</a>
  <span class="text-gray-400">/</span>
  <span class="text-gray-700 font-medium">Reservasi</span>
</div>

<h1 class="text-xl font-bold text-gray-800 mb-6">Pengaturan Reservasi</h1>

<div class="bg-white rounded-lg border border-gray-200 p-5 max-w-3xl">
  <div class="flex items-start justify-between mb-4">
    <div>
      <h3 class="text-sm font-semibold text-gray-800">Aktifkan Fitur Reservasi</h3>
      <p class="text-xs text-gray-500 mt-1">Customer bisa memesan slot waktu untuk paket meeting, ruang rapat, atau servis khusus.</p>
    </div>
    <button
      onclick={() => enabled = !enabled}
      role="switch"
      aria-checked={enabled}
      aria-label="Aktifkan Fitur Reservasi"
      class="relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 {enabled ? 'bg-[#1E3A5F]' : 'bg-gray-300'}"
    >
      <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 {enabled ? 'translate-x-5' : 'translate-x-0.5'}"></span>
    </button>
  </div>

  {#if enabled}
    <div class="pt-4 border-t border-gray-200">
      <p class="text-sm text-gray-700">Fitur reservasi aktif. Atur slot waktu dan paket reservasi di halaman <a href="/transaksi/reservasi" class="text-[#1E3A5F] hover:underline">Reservasi →</a></p>
    </div>
  {:else}
    <div class="pt-4 border-t border-gray-200">
      <button
        onclick={() => enabled = true}
        class="w-full px-4 py-2.5 text-sm bg-[#1E3A5F] text-white rounded hover:bg-[#254B7A] font-medium"
      >Aktifkan Fitur Reservasi dan Atur Jam Reservasi</button>
    </div>
  {/if}
</div>