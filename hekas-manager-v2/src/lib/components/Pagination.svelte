<script lang="ts">
  type Props = {
    currentPage?: number;
    totalPages?: number;
    totalRecords?: number;
  };

  let { currentPage = 1, totalPages = 5, totalRecords = 0 }: Props = $props();
</script>

<div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs">
  <div class="text-gray-600">Total <span class="font-semibold">{totalRecords.toLocaleString('id-ID')}</span> records</div>
  <div class="flex items-center gap-3">
    <select class="border border-gray-200 rounded px-2 py-1 text-xs">
      <option>30/page</option>
      <option>50/page</option>
      <option>100/page</option>
    </select>
    <div class="flex items-center gap-1">
      <button class="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50" disabled={currentPage === 1} aria-label="Previous page">
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      {#each Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1) as page (page)}
        <button
          class="min-w-[28px] px-2 py-0.5 text-xs font-semibold rounded transition-colors {page === currentPage ? 'bg-[#1E3A5F] text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}"
          aria-label="Go to page {page}"
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      {/each}
      <button class="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50" disabled={currentPage === totalPages} aria-label="Next page">
        <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</div>