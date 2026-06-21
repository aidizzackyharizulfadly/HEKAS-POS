<script lang="ts">
  /**
   * ShiftTimeline — Visual timeline shift kasir hari ini (horizontal bars)
   *
   * Uses: Manager Beranda (Shift tab), Dashboard operasional
   *
   * @prop shifts - array of shift dengan start/end time + status
   * @prop rangeStart - range waktu mulai (default 06:00)
   * @prop rangeEnd - range waktu selesai (default 22:00)
   */
  import { shiftStatus } from '$lib/utils/status-helpers';
  import { statusDotClass } from '$lib/utils/status-classes';

  type Shift = {
    id: string | number;
    cashier_name: string;
    shift_no: string;
    started_at: string; // ISO
    ended_at: string | null; // null = masih aktif
    total_transactions: number;
    total_sales: number;
    status: 'AKTIF' | 'SELESAI' | 'UPCOMING';
  };

  type Props = {
    shifts?: Shift[];
    rangeStart?: string; // "06:00"
    rangeEnd?: string; // "22:00"
    currencyPrefix?: string;
  };

  let {
    shifts = [],
    rangeStart = '06:00',
    rangeEnd = '22:00',
    currencyPrefix = 'Rp',
  }: Props = $props();

  // Hitung position (%) dari jam
  function parseHM(hm: string): number {
    const [h, m] = hm.split(':').map(Number);
    return h + m / 60;
  }
  const rangeStartH = $derived(parseHM(rangeStart));
  const rangeEndH = $derived(parseHM(rangeEnd));
  const totalRangeH = $derived(rangeEndH - rangeStartH);

  function timeToPercent(iso: string): number {
    const d = new Date(iso);
    const h = d.getHours() + d.getMinutes() / 60;
    if (h < rangeStartH) return 0;
    if (h > rangeEndH) return 100;
    return ((h - rangeStartH) / totalRangeH) * 100;
  }

  function shiftStart(s: Shift): number {
    return timeToPercent(s.started_at);
  }
  function shiftWidth(s: Shift): number {
    if (!s.ended_at) {
      // Shift masih aktif — bar sampai sekarang (atau rangeEnd)
      const now = new Date();
      const nowH = now.getHours() + now.getMinutes() / 60;
      const endPct = Math.min(nowH, rangeEndH);
      return Math.max(0, endPct - shiftStart(s));
    }
    return Math.max(0, timeToPercent(s.ended_at) - shiftStart(s));
  }

  // Hour labels
  const hours = $derived(
    Array.from(
      { length: Math.floor(totalRangeH) + 1 },
      (_, i) => rangeStartH + i
    ).filter((h) => h <= rangeEndH)
  );

  function fmtHour(h: number): string {
    return String(Math.floor(h)).padStart(2, '0') + ':00';
  }

  // Status → color (pakai shiftStatus helper untuk konsistensi lintas komponen)
  function barColor(s: Shift): string {
    return statusDotClass(shiftStatus(s.status));
  }

  function fmtCurrency(n: number): string {
    return currencyPrefix + ' ' + n.toLocaleString('id-ID');
  }
</script>

<section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-base font-semibold text-gray-900">🕐 Timeline Shift</h2>
    <span class="text-xs text-gray-500">
      {rangeStart}–{rangeEnd}
    </span>
  </header>

  {#if shifts.length === 0}
    <p class="py-6 text-center text-sm text-gray-500">
      Belum ada shift hari ini
    </p>
  {:else}
    <!-- Timeline axis -->
    <div class="mb-2 ml-28 flex justify-between text-[10px] text-gray-500">
      {#each hours as h (h)}
        <span>{fmtHour(h)}</span>
      {/each}
    </div>

    <!-- Shift rows -->
    <ul class="space-y-2">
      {#each shifts as s (s.id)}
        <li class="flex items-center gap-2">
          <!-- Label cashier -->
          <div class="w-28 shrink-0 text-right">
            <p class="truncate text-xs font-medium text-gray-900">{s.cashier_name}</p>
            <p class="truncate text-[10px] text-gray-500">{s.shift_no}</p>
          </div>

          <!-- Bar -->
          <div class="relative h-7 flex-1 rounded-md bg-gray-100">
            <div
              class="absolute top-0 h-full rounded-md {barColor(s)} opacity-80 transition-all"
              style="left: {shiftStart(s)}%; width: {shiftWidth(s)}%"
              title="{s.cashier_name} · {s.total_transactions} trx · {fmtCurrency(s.total_sales)}"
              role="img"
              aria-label="{s.cashier_name} shift {s.shift_no}, {s.total_transactions} transaksi, {fmtCurrency(s.total_sales)}"
            >
              {#if shiftWidth(s) > 12}
                <span class="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white">
                  {s.total_transactions}trx
                </span>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>

    <!-- Legend -->
    <div class="mt-3 flex gap-3 text-[10px] text-gray-500">
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full {statusDotClass(shiftStatus('AKTIF'))}"></span> {shiftStatus('AKTIF').label}
      </span>
      <span class="flex items-center gap-1">
        <span class="h-2 w-2 rounded-full {statusDotClass(shiftStatus('SELESAI'))}"></span> {shiftStatus('SELESAI').label}
      </span>
    </div>
  {/if}
</section>