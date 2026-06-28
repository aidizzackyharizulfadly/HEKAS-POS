<script lang="ts">
  type Props = {
    title: string;
    subtitle?: string;
    typeSelector?: { label: string; value: string; options: string[] };
    actions?: Array<{
      label: string;
      variant?: 'primary' | 'outline';
      icon?: boolean;
      dropdown?: boolean;
    }>;
  };

  let { title, subtitle, typeSelector, actions = [] }: Props = $props();
</script>

<div class="flex items-center justify-between mb-6">
  <div class="flex items-center gap-3">
    <h1 class="text-xl font-bold text-gray-800">{title}</h1>
    {#if typeSelector}
      <select class="text-sm border border-gray-300 rounded px-2 py-1 font-medium text-gray-700 cursor-pointer hover:border-[#1E3A5F] focus:outline-none focus:border-[#1E3A5F]">
        {#each typeSelector.options as opt (opt)}
          <option value={opt} selected={opt === typeSelector.value}>{opt}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div class="flex items-center gap-2">
    {#if subtitle}
      <p class="text-xs text-gray-500 mr-2">{subtitle}</p>
    {/if}
    {#each actions as action, i (i)}
      <button
        class="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors {action.variant === 'outline' ? 'border border-[#1E3A5F] text-[#1E3A5F] hover:bg-blue-50' : 'bg-[#1E3A5F] text-white hover:bg-[#254B7A]'}"
      >
        {#if action.icon}
          <span class="text-base leading-none">+</span>
        {/if}
        {action.label}
        {#if action.dropdown}
          <svg class="w-3 h-3 opacity-80" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        {/if}
      </button>
    {/each}
  </div>
</div>