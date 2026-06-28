<script lang="ts">
  const cards = [
    { title: 'Pengaturan Toko', desc: 'Nama toko, jam operasional, social media', href: '/pengaturan/toko', icon: 'store' },
    { title: 'Pengaturan Penjualan', desc: 'Tipe order, metode checkout, pajak', href: '/pengaturan/penjualan', icon: 'cart' },
    { title: 'Pengaturan Tampilan', desc: 'Logo, banner, tagging toko', href: '/pengaturan/tampilan', icon: 'image' },
    { title: 'Pengaturan Reservasi', desc: 'Aktifkan fitur reservasi dan jam operasional', href: '/pengaturan/reservasi', icon: 'calendar' }
  ];

  function icon(name: string): string {
    const map: Record<string, string> = {
      store: 'M3 6h12l-1 8H4L3 6zM5 6V4a3 3 0 116 0v2',
      cart: 'M2 4h2l2 9h9l2-7H5M8 18a1 1 0 100-2 1 1 0 000 2zM16 18a1 1 0 100-2 1 1 0 000 2z',
      image: 'M3 5h16v12H3zM3 13l4-4 3 3 4-5 5 6',
      calendar: 'M3 7h16v11H3zM3 11h16M7 4v4M15 4v4'
    };
    return map[name] ?? map.store;
  }
</script>

<svelte:head><title>Pengaturan — HEKAS POS Manager</title></svelte:head>

<div class="mb-6">
  <h1 class="text-xl font-bold text-gray-800">Pengaturan</h1>
  <p class="text-xs text-gray-500 mt-1">Konfigurasi toko, penjualan, tampilan, dan fitur tambahan.</p>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {#each cards as card (card.href)}
    <a href={card.href} class="bg-white rounded-lg border border-gray-200 p-5 hover:border-[#1E3A5F] hover:shadow-md transition-all group">
      <div class="w-11 h-11 rounded-lg bg-blue-50 text-[#1E3A5F] flex items-center justify-center mb-4 group-hover:bg-[#1E3A5F] group-hover:text-white transition-colors">
        <svg class="w-6 h-6" viewBox="0 0 20 20" fill="none">
          <path d={icon(card.icon)} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <div class="text-sm font-semibold text-gray-800">{card.title}</div>
      <p class="text-xs text-gray-500 mt-1 leading-relaxed">{card.desc}</p>
      <div class="text-xs text-[#1E3A5F] mt-3 font-medium">Konfigurasi →</div>
    </a>
  {/each}
</div>