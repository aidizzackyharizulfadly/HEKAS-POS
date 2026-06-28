<script lang="ts">
  let tagInput = $state('');
  let tags = $state(['sembako', 'pandeansari', 'promo-juni']);
</script>

<svelte:head><title>Pengaturan Tampilan — HEKAS POS Manager</title></svelte:head>

<div class="mb-6 flex items-center gap-2 text-sm">
  <a href="/pengaturan" class="text-[#1E3A5F] hover:underline">← Pengaturan</a>
  <span class="text-gray-400">/</span>
  <span class="text-gray-700 font-medium">Tampilan</span>
</div>

<h1 class="text-xl font-bold text-gray-800 mb-6">Pengaturan Tampilan</h1>

<div class="space-y-4 max-w-3xl">
  <!-- Logo -->
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <label for="upload-logo" class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Logo Toko <span class="text-gray-400 normal-case font-normal">(600 × 150 px)</span></label>
    <div class="border-2 border-dashed border-gray-300 rounded p-6 text-center hover:border-[#1E3A5F] transition-colors cursor-pointer">
      <input id="upload-logo" type="file" accept="image/*" class="sr-only" />
      <label for="upload-logo" class="cursor-pointer block">
        <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
          <path d="M12 4v12M8 8l4-4 4 4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="text-sm text-gray-600">Klik untuk upload logo</p>
        <p class="text-xs text-gray-400 mt-1">PNG/JPG maks 2MB</p>
      </label>
    </div>
  </div>

  <!-- Banner -->
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <fieldset>
      <legend class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Banner Toko <span class="text-gray-400 normal-case font-normal">(1080 × 360 px, 3 slot)</span></legend>
      <div class="grid grid-cols-3 gap-3">
        {#each [1, 2, 3] as slot (slot)}
          <div class="border-2 border-dashed border-gray-300 rounded aspect-[3/1] flex items-center justify-center hover:border-[#1E3A5F] transition-colors cursor-pointer">
            <label class="cursor-pointer text-center">
              <input type="file" accept="image/*" class="sr-only" aria-label={`Upload banner slot ${slot}`} />
              <p class="text-xs text-gray-500">Slot {slot}</p>
              <p class="text-[10px] text-gray-400">+ Upload</p>
            </label>
          </div>
        {/each}
      </div>
    </fieldset>
  </div>

  <!-- Tagging -->
  <div class="bg-white rounded-lg border border-gray-200 p-5">
    <fieldset>
      <legend class="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Tagging Toko</legend>
      <div class="flex flex-wrap gap-1.5 mb-2">
        {#each tags as tag (tag)}
          <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-[#1E3A5F] rounded-full text-xs">
            {tag}
            <button class="hover:text-rose-600" onclick={() => tags = tags.filter(t => t !== tag)} aria-label={`Hapus tag ${tag}`}>×</button>
          </span>
        {/each}
      </div>
      <input
        type="text"
        placeholder="Tambah tag..."
        bind:value={tagInput}
        onkeydown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { tags = [...tags, tagInput.trim()]; tagInput = ''; } }}
        class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#1E3A5F]"
        aria-label="Tag baru"
      />
    </fieldset>
  </div>

  <div class="flex justify-end">
    <button class="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded hover:bg-[#254B7A]">Simpan Perubahan</button>
  </div>
</div>