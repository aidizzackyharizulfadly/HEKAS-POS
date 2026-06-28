<script lang="ts">
  type Props = {
    searchPlaceholder?: string;
    showOutlet?: boolean;
    showDate?: boolean;
    outletDefault?: string;
    dateDefault?: string;
    extraFilters?: Array<{ label: string; options: string[] }>;
  };

  let {
    searchPlaceholder = 'Cari...',
    showOutlet = true,
    showDate = true,
    outletDefault = 'HEKAS Pandeansari',
    dateDefault = '22/06/2026 – 28/06/2026',
    extraFilters = []
  }: Props = $props();
</script>

<div class="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center gap-2 flex-wrap">
  <!-- Search -->
  <div class="relative">
    <input
      type="text"
      placeholder={searchPlaceholder}
      class="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded w-52 focus:outline-none focus:border-[#1E3A5F]"
    />
    <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
      <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </div>

  {#if showDate}
    <input
      type="text"
      value={dateDefault}
      class="text-sm border border-gray-200 rounded px-3 py-1.5 w-48 focus:outline-none focus:border-[#1E3A5F]"
    />
  {/if}

  {#if showOutlet}
    <select class="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-[#1E3A5F]">
      <option>{outletDefault}</option>
      <option>HEKAS Panjen</option>
    </select>
  {/if}

  {#each extraFilters as filter, i (i)}
    <select class="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-[#1E3A5F]">
      {#each filter.options as opt (opt)}
        <option>{opt}</option>
      {/each}
    </select>
  {/each}

  <button class="flex items-center gap-1 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
    More Filter
    <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>

  <div class="flex-1"></div>

  <button class="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Refresh">
    <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <path d="M14 8a6 6 0 11-1.76-4.24M14 3v3h-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
  <button class="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="Export">
    <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <path d="M8 12V3M4 7l4-4 4 4M2 14h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
  <button class="p-1.5 rounded hover:bg-gray-100 text-gray-500" title="More">
    <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
      <circle cx="3" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="13" cy="8" r="1.2" fill="currentColor" />
    </svg>
  </button>
</div>