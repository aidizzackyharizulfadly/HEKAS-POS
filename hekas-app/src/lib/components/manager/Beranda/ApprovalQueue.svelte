<script lang="ts">
  /**
   * ApprovalQueue — Pending Surat Jalan yang perlu approval
   *
   * Uses: Manager Beranda (sidebar widget), Manager Surat Jalan (filter pending)
   *
   * @prop items - array of SuratJalan dengan status MENUNGGU_APPROVAL
   * @prop maxItems - berapa item yang ditampilkan (default 5)
   * @prop onapprove - callback saat manager klik Setujui
   * @prop onreject - callback saat manager klik Tolak
   * @prop onview - callback saat user klik item (lihat detail)
   */
  type SuratJalan = {
    id: string | number;
    sj_no: string;
    destination: string;
    total_items: number;
    created_by_name?: string;
    created_at: string;
    urgent?: boolean;
  };

  let {
    items = [],
    maxItems = 5,
    onapprove,
    onreject,
    onview,
  }: {
    items?: SuratJalan[];
    maxItems?: number;
    onapprove?: (sj: any) => void;
    onreject?: (sj: any) => void;
    onview?: (sj: any) => void;
  } = $props();

  let showAll = $state(false);
  const visible = $derived(showAll ? items : items.slice(0, maxItems));
  const hidden = $derived(Math.max(0, items.length - maxItems));

  // Hitung umur (relatif: "5m", "2j", "3h")
  function relativeTime(iso: string): string {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const min = Math.floor(diffMs / 60_000);
    if (min < 1) return 'baru saja';
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}j`;
    const day = Math.floor(hr / 24);
    return `${day}h`;
  }
</script>

<section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-base font-semibold text-gray-900">⏳ Perlu Persetujuan</h2>
    {#if items.length > 0}
      <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        {items.length} pending
      </span>
    {/if}
  </header>

  {#if items.length === 0}
    <p class="py-6 text-center text-sm text-gray-500">
      Tidak ada SJ menunggu persetujuan 👍
    </p>
  {:else}
    <ul class="space-y-2">
      {#each visible as sj (sj.id)}
        <li
          class="rounded-md border p-2.5 transition hover:border-amber-300 hover:bg-amber-50"
          class:border-amber-300={sj.urgent}
          class:bg-amber-50={sj.urgent}
          class:border-gray-200={!sj.urgent}
        >
          <!-- Header: SJ no + time -->
          <div class="mb-1.5 flex items-center justify-between">
            <button
              type="button"
              class="text-sm font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              onclick={() => onview?.(sj)}
            >
              {sj.sj_no}
            </button>
            <span class="text-[10px] uppercase text-gray-500">
              {relativeTime(sj.created_at)}
            </span>
          </div>

          <!-- Body: tujuan + items -->
          <div class="mb-2 text-xs text-gray-600">
            <p class="truncate">
              <span class="font-medium">📍 {sj.destination}</span>
            </p>
            <p class="text-gray-500">
              {sj.total_items} item · oleh {sj.created_by_name ?? 'Unknown'}
            </p>
          </div>

          <!-- Actions -->
          {#if onapprove || onreject}
            <div class="flex gap-1.5">
              {#if onapprove}
                <button
                  type="button"
                  class="flex-1 rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
                  onclick={() => onapprove(sj)}
                >
                  ✓ Setujui
                </button>
              {/if}
              {#if onreject}
                <button
                  type="button"
                  class="flex-1 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                  onclick={() => onreject(sj)}
                >
                  ✕ Tolak
                </button>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>

    {#if hidden > 0 && !showAll}
      <button
        type="button"
        class="mt-2 w-full rounded-md py-1.5 text-center text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onclick={() => (showAll = true)}
      >
        Lihat semua ({hidden} lagi)
      </button>
    {/if}
  {/if}
</section>