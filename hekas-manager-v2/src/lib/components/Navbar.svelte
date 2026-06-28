<script lang="ts">
  type Menu = {
    key: string;
    label: string;
    href?: string;
    children?: Menu[];
    dividerAfter?: boolean;
  };

  const menus: Menu[] = [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },

    {
      key: 'transaksi',
      label: 'Transaksi',
      children: [
        { key: 'penjualan', label: 'Penjualan', href: '/transaksi/penjualan' },
        { key: 'pembelian', label: 'Pembelian', href: '/transaksi/pembelian' },
        { key: 'pendapatan', label: 'Pendapatan Lain-lain', href: '/transaksi/pendapatan' },
        { key: 'pengeluaran', label: 'Pengeluaran Lain-lain', href: '/transaksi/pengeluaran' },
        { key: 'div-stok', label: '', dividerAfter: true },
        { key: 'penyesuaian-stok', label: 'Penyesuaian Stok', href: '/transaksi/penyesuaian-stok' },
        { key: 'mutasi', label: 'Mutasi Barang', href: '/transaksi/mutasi' },
        { key: 'produksi', label: 'Produksi', href: '/transaksi/produksi' },
        { key: 'waste', label: 'Waste Goods', href: '/transaksi/waste' },
        { key: 'reservasi', label: 'Reservasi', href: '/transaksi/reservasi' },
        { key: 'div-fin', label: '', dividerAfter: true },
        { key: 'komisi', label: 'Komisi', href: '/transaksi/komisi' },
        { key: 'kas-bank', label: 'Kas & Bank', href: '/transaksi/kas-bank' },
        { key: 'coa', label: 'Chart of Account', href: '/transaksi/coa' },
        { key: 'approval', label: 'Approval', href: '/transaksi/approval' }
      ]
    },

    {
      key: 'master',
      label: 'Master',
      children: [
        { key: 'kontak', label: 'Kontak', href: '/master/kontak' },
        { key: 'pelanggan', label: 'Pelanggan', href: '/master/pelanggan' },
        { key: 'supplier', label: 'Supplier', href: '/master/supplier' },
        { key: 'karyawan', label: 'Karyawan', href: '/master/karyawan' },
        { key: 'produk', label: 'Produk', href: '/master/produk' },
        { key: 'aset', label: 'Aset', href: '/master/aset' },
        { key: 'div-outlet', label: '', dividerAfter: true },
        { key: 'outlet', label: 'Outlet', href: '/master/outlet' },
        { key: 'target-outlet', label: 'Target Outlet', href: '/master/target-outlet' },
        { key: 'grup-komisi', label: 'Grup Komisi', href: '/master/grup-komisi' },
        { key: 'toko-hekas', label: 'TokoHEKAS', href: '/master/toko-hekas' },
        { key: 'qpon', label: 'QPON', href: '/master/qpon' }
      ]
    },

    {
      key: 'laporan',
      label: 'Laporan',
      children: [
        { key: 'laporan-penjualan', label: 'Laporan Penjualan', href: '/laporan' },
        { key: 'laporan-stok', label: 'Laporan Stok', href: '/laporan/stok' },
        { key: 'laporan-keuangan', label: 'Laporan Keuangan', href: '/laporan/keuangan' }
      ]
    },

    { key: 'pengaturan', label: 'Pengaturan', href: '/pengaturan' }
  ];

  type Props = {
    session: { name: string; role: string; outlet: string };
  };

  let { session }: Props = $props();

  let openMenu = $state<string | null>(null);
  let currentPath = $state<string>(typeof window !== 'undefined' ? window.location.pathname : '/dashboard');
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    if (typeof window === 'undefined') return;
    const update = () => (currentPath = window.location.pathname);
    window.addEventListener('popstate', update);
    update();
    return () => window.removeEventListener('popstate', update);
  });

  function isActive(href?: string): boolean {
    if (!href) return false;
    return currentPath === href || currentPath.startsWith(href + '/');
  }

  function isMenuActive(menu: Menu): boolean {
    if (menu.href) return isActive(menu.href);
    if (menu.children) return menu.children.some((c) => isActive(c.href));
    return false;
  }

  // Open immediately, cancel any pending close
  function openDropdown(menu: string) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    openMenu = menu;
  }

  // Schedule close with small delay so mouse can travel from trigger to menu panel
  // (gap between button bottom and menu top is ~2px = `mt-0.5`)
  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      openMenu = null;
      closeTimer = null;
    }, 120);
  }

  function closeNow() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    openMenu = null;
  }

  // Click handler — explicit toggle (works on touch devices too)
  function handleClick(menu: string, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openMenu = openMenu === menu ? null : menu;
  }

  // Close on click outside (uses real click, not mousemove)
  function handleDocumentClick(e: MouseEvent) {
    if (!openMenu) return;
    const target = e.target as Element;
    const navbar = target?.closest('[data-navbar]');
    // If click is inside navbar, ignore — let button's own onclick handle toggle/close
    if (navbar) return;
    closeNow();
  }

  // Close on Escape
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && openMenu) closeNow();
  }

  function initials(name: string): string {
    return name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
</script>

<svelte:document onclick={handleDocumentClick} onkeydown={handleKeydown} />

<nav data-navbar class="h-10 bg-[#1E3A5F] flex items-center px-4 gap-1 sticky top-0 z-50 shadow-sm text-white">
  <!-- Logo -->
  <a
    href="/dashboard"
    class="text-white font-bold text-sm mr-2 tracking-wide hover:text-white/90"
    onmouseenter={closeNow}
    onclick={closeNow}
  >HEKAS</a>
  <span class="bg-green-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-3">What's New!</span>

  <!-- Nav items -->
  {#each menus as menu (menu.key)}
    {#if menu.children}
      <div
        class="relative"
        onmouseenter={() => openDropdown(menu.key)}
        onmouseleave={scheduleClose}
        role="none"
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={openMenu === menu.key}
          class="flex items-center gap-1 text-sm font-medium px-3 h-10 transition-colors {isMenuActive(menu) ? 'bg-[#2E5B96] text-white' : 'text-white/90 hover:bg-[#254B7A]'}"
          onclick={(e) => handleClick(menu.key, e)}
        >
          {menu.label}
          <svg class="w-3 h-3 opacity-80 transition-transform {openMenu === menu.key ? 'rotate-180' : ''}" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        {#if openMenu === menu.key}
          <div
            class="absolute top-full left-0 mt-0.5 min-w-[210px] bg-white text-gray-700 rounded-md shadow-lg border border-gray-200 py-1 z-50"
            role="menu"
            tabindex="-1"
            onmouseenter={() => openDropdown(menu.key)}
            onmouseleave={scheduleClose}
          >
            {#each menu.children as child (child.key)}
              {#if child.dividerAfter}
                <div class="my-1 border-t border-gray-100"></div>
              {:else}
                <a
                  href={child.href}
                  class="block px-4 py-2 text-sm hover:bg-gray-50 {isActive(child.href) ? 'text-[#1E3A5F] font-semibold bg-blue-50' : 'text-gray-700'}"
                  role="menuitem"
                  onclick={closeNow}
                >
                  {child.label}
                </a>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <a
        href={menu.href}
        class="flex items-center text-sm font-medium px-3 h-10 transition-colors {isActive(menu.href) ? 'bg-[#2E5B96] text-white' : 'text-white/90 hover:bg-[#254B7A]'}"
        onmouseenter={closeNow}
        onclick={closeNow}
      >
        {menu.label}
      </a>
    {/if}
  {/each}

  <div class="flex-1"></div>

  <!-- Outlet selector -->
  <button
    type="button"
    class="flex items-center gap-1.5 text-white/90 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
    onmouseenter={closeNow}
    onclick={closeNow}
  >
    <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
      <path d="M2 6h12l-1 8H3L2 6zM5 6V4a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    {session.outlet}
    <svg class="w-3 h-3 opacity-80" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  <!-- User badge -->
  <div
    class="relative"
    onmouseenter={() => openDropdown('user')}
    onmouseleave={scheduleClose}
    role="none"
  >
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={openMenu === 'user'}
      class="flex items-center gap-2 text-white/90 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors ml-1"
      onclick={(e) => handleClick('user', e)}
    >
      <span class="w-6 h-6 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center">
        {initials(session.name)}
      </span>
      <span class="text-left leading-tight">
        <div class="font-medium">{session.name}</div>
        <div class="text-[10px] text-white/70 -mt-0.5">{session.role}</div>
      </span>
      <svg class="w-3 h-3 opacity-80 transition-transform {openMenu === 'user' ? 'rotate-180' : ''}" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    {#if openMenu === 'user'}
      <div
        class="absolute top-full right-0 mt-0.5 w-44 bg-white text-gray-700 rounded-md shadow-lg border border-gray-200 py-1 z-50"
        role="menu"
        tabindex="-1"
        onmouseenter={() => openDropdown('user')}
        onmouseleave={scheduleClose}
      >
        <a href="/pengaturan" class="block px-4 py-2 text-sm hover:bg-gray-50" onclick={closeNow}>Pengaturan Akun</a>
        <a href="/dashboard" class="block px-4 py-2 text-sm hover:bg-gray-50" onclick={closeNow}>Ganti Outlet</a>
        <div class="my-1 border-t border-gray-100"></div>
        <a href="/" class="block px-4 py-2 text-sm hover:bg-gray-50 text-red-600" onclick={closeNow}>Keluar</a>
      </div>
    {/if}
  </div>
</nav>