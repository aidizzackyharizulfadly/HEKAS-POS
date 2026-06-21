<!--
  OperationalHours — Form to configure operational hours per day.
  Used by: Manager Pengaturan screen.
-->
<script lang="ts">
  type Day = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | "Jum'at" | 'Sabtu' | 'Minggu';

  export interface HoursConfig {
    open: string;     // "08:00"
    close: string;    // "22:00"
    closed?: boolean;
  }

  let { value = $bindable({} as Record<Day, HoursConfig>), onSave = (_v: Record<Day, HoursConfig>) => {} }: {
    value?: Record<Day, HoursConfig>;
    onSave?: (v: Record<Day, HoursConfig>) => void;
  } = $props();

  const days: Day[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu'];

  // Initialize if empty
  $effect(() => {
    if (Object.keys(value).length === 0) {
      for (const day of days) {
        value[day] = { open: '08:00', close: '22:00', closed: false };
      }
    }
  });

  function toggleClosed(day: Day) {
    const d = value[day];
    if (d) d.closed = !d.closed;
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <h3 class="font-semibold text-gray-800">⏰ Jam Operasional</h3>
    <button
      type="button"
      class="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
      onclick={() => onSave(value)}
    >
      Simpan
    </button>
  </div>

  <div class="divide-y divide-gray-100">
    {#each days as day}
      {@const h = value[day] ?? { open: '08:00', close: '22:00', closed: false }}
      <div class="px-4 py-3 flex items-center gap-3">
        <div class="w-24 font-medium text-sm text-gray-700">{day}</div>

        <label class="inline-flex items-center gap-1.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={!h.closed}
            onchange={() => toggleClosed(day)}
            class="rounded text-blue-600"
          />
          Buka
        </label>

        {#if !h.closed}
          <div class="flex items-center gap-1">
            <input
              type="time"
              bind:value={h.open}
              class="px-2 py-1 border border-gray-300 rounded text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-gray-400">–</span>
            <input
              type="time"
              bind:value={h.close}
              class="px-2 py-1 border border-gray-300 rounded text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        {:else}
          <span class="text-xs text-gray-400 italic">Tutup</span>
        {/if}
      </div>
    {/each}
  </div>
</div>