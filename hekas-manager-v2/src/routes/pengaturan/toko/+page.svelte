<script lang="ts">
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  let openDays = $state<Record<string, boolean>>({
    Senin: true, Selasa: true, Rabu: true, Kamis: true, Jumat: true, Sabtu: true, Minggu: false
  });
</script>

<svelte:head><title>Pengaturan Toko — HEKAS POS Manager</title></svelte:head>

<div class="mb-6 flex items-center gap-2 text-sm">
  <a href="/pengaturan" class="text-[#1E3A5F] hover:underline">← Pengaturan</a>
  <span class="text-gray-400">/</span>
  <span class="text-gray-700 font-medium">Toko</span>
</div>

<h1 class="text-xl font-bold text-gray-800 mb-6">Pengaturan Toko</h1>

<div class="bg-white rounded-lg border border-gray-200 p-5 space-y-6 max-w-3xl">
  <!-- Nama Toko -->
  <div>
    <label for="nama-toko" class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Nama Toko <span class="text-rose-500">*</span></label>
    <div class="flex gap-2">
      <span class="text-sm text-gray-500 self-center">hekas.id/</span>
      <input id="nama-toko" type="text" value="pandeansari" class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]" />
      <button class="px-3 py-1.5 text-sm border border-[#1E3A5F] text-[#1E3A5F] rounded hover:bg-blue-50">Cek Nama Toko</button>
    </div>
  </div>

  <!-- Jam Operasional -->
  <div>
    <label for="zona-waktu" class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Zona Waktu</label>
    <select id="zona-waktu" class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F] mb-4">
      <option>Asia/Jakarta (WIB) — GMT+7</option>
      <option>Asia/Makassar (WITA) — GMT+8</option>
      <option>Asia/Jayapura (WIT) — GMT+9</option>
    </select>

    <fieldset class="space-y-2">
      <legend class="sr-only">Jam Operasional per Hari</legend>
      {#each days as day (day)}
        <div class="flex items-center gap-3 py-1.5">
          <label class="flex items-center gap-2 w-32 cursor-pointer">
            <input type="checkbox" bind:checked={openDays[day]} class="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
            <span class="text-sm text-gray-700">{day}</span>
          </label>
          {#if openDays[day]}
            <label class="sr-only" for="open-{day}">Jam buka {day}</label>
            <input id="open-{day}" type="time" value="08:00" class="px-2 py-1 text-sm border border-gray-200 rounded" />
            <span class="text-gray-500">–</span>
            <label class="sr-only" for="close-{day}">Jam tutup {day}</label>
            <input id="close-{day}" type="time" value="21:00" class="px-2 py-1 text-sm border border-gray-200 rounded" />
          {:else}
            <span class="text-xs text-gray-400">Tutup</span>
          {/if}
        </div>
      {/each}
    </fieldset>

    <button class="mt-3 text-xs text-[#1E3A5F] hover:underline">+ Tambah Baris</button>
  </div>

  <!-- Social Media -->
  <fieldset>
    <legend class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Social Media</legend>
    <div class="grid grid-cols-2 gap-3">
      <label class="sr-only" for="soc-fb">Facebook URL</label>
      <input id="soc-fb" type="url" placeholder="Facebook URL" class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]" />
      <label class="sr-only" for="soc-ig">Instagram URL</label>
      <input id="soc-ig" type="url" placeholder="Instagram URL" class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]" />
      <label class="sr-only" for="soc-tt">TikTok URL</label>
      <input id="soc-tt" type="url" placeholder="TikTok URL" class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]" />
      <label class="sr-only" for="soc-yt">YouTube URL</label>
      <input id="soc-yt" type="url" placeholder="YouTube URL" class="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]" />
    </div>
  </fieldset>

  <div class="pt-4 border-t border-gray-200 flex justify-end gap-2">
    <button class="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50">Batal</button>
    <button class="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded hover:bg-[#254B7A]">Simpan Perubahan</button>
  </div>
</div>