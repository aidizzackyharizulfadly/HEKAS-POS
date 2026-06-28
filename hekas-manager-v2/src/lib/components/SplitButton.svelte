<script lang="ts">
  type Props = {
    label: string;
    href?: string;
    onPrimary?: () => void;
  };
  let { label, onPrimary }: Props = $props();
</script>

<div class="inline-flex rounded-full overflow-hidden shadow-sm">
  <button
    onclick={onPrimary}
    class="px-4 py-1.5 text-sm bg-[#1E3A5F] text-white font-medium hover:bg-[#254B7A] transition-colors"
  >
    {label}
  </button>
  <button
    class="px-2 py-1.5 bg-[#1E3A5F] text-white hover:bg-[#254B7A] border-l border-white/20 transition-colors"
    aria-label="More options"
  >
    <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</div>