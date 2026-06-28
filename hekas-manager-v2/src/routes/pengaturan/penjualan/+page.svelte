<script lang="ts">
  let orderTypes = $state({ dineIn: true, takeAway: true, delivery: false });
  let checkoutMethods = $state({ cash: true, qris: true, transfer: true, edc: false });

  const orderOptions = [
    { key: 'dineIn', label: 'Dine In (Makan di tempat)' },
    { key: 'takeAway', label: 'Take Away (Bawa pulang)' },
    { key: 'delivery', label: 'Delivery (Antar ke alamat)' }
  ];

  const checkoutOptions = [
    { key: 'cash', label: 'Tunai' },
    { key: 'qris', label: 'QRIS' },
    { key: 'transfer', label: 'Transfer Bank' },
    { key: 'edc', label: 'EDC / Kartu Kredit' }
  ];
</script>

<svelte:head><title>Pengaturan Penjualan — HEKAS POS Manager</title></svelte:head>

<div class="mb-6 flex items-center gap-2 text-sm">
  <a href="/pengaturan" class="text-[#1E3A5F] hover:underline">← Pengaturan</a>
  <span class="text-gray-400">/</span>
  <span class="text-gray-700 font-medium">Penjualan</span>
</div>

<h1 class="text-xl font-bold text-gray-800 mb-6">Pengaturan Penjualan</h1>

<div class="bg-white rounded-lg border border-gray-200 p-5 space-y-6 max-w-3xl">
  <div>
    <fieldset>
      <legend class="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Tipe Order</legend>
      <div class="space-y-2">
        {#each orderOptions as opt (opt.key)}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={orderTypes[opt.key as keyof typeof orderTypes]} class="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
            <span class="text-sm text-gray-700">{opt.label}</span>
          </label>
        {/each}
      </div>
    </fieldset>
  </div>

  <div class="pt-4 border-t border-gray-200">
    <fieldset>
      <legend class="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">Metode Checkout</legend>
      <div class="grid grid-cols-2 gap-3">
        {#each checkoutOptions as opt (opt.key)}
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" bind:checked={checkoutMethods[opt.key as keyof typeof checkoutMethods]} class="w-4 h-4 rounded border-gray-300 text-[#1E3A5F] focus:ring-[#1E3A5F]" />
            <span class="text-sm text-gray-700">{opt.label}</span>
          </label>
        {/each}
      </div>
    </fieldset>
  </div>

  <div class="pt-4 border-t border-gray-200 flex justify-end gap-2">
    <button class="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded hover:bg-[#254B7A]">Simpan Perubahan</button>
  </div>
</div>