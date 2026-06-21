<script lang="ts">
  interface Props {
    value: string;
    placeholder?: string;
    oninput?: (value: string) => void;
    suggestions?: string[];
    showShortcutHint?: boolean;
  }

  let {
    value = $bindable(),
    placeholder = 'Cari...',
    oninput,
    suggestions = [],
    showShortcutHint = true
  }: Props = $props();

  let showSuggestions = $state(false);

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    oninput?.(value);
    showSuggestions = suggestions.length > 0 && value.length > 0;
  }

  function selectSuggestion(s: string) {
    value = s;
    oninput?.(s);
    showSuggestions = false;
  }

  function clear() {
    value = '';
    oninput?.('');
    showSuggestions = false;
  }
</script>

<div class="relative w-full">
  <!-- Search icon (left) -->
  <div class="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </div>

  <input
    type="search"
    {value}
    oninput={handleInput}
    onfocus={() => (showSuggestions = suggestions.length > 0 && value.length > 0)}
    onblur={() => setTimeout(() => (showSuggestions = false), 200)}
    {placeholder}
    class="w-full h-12 pl-12 pr-12 rounded-xl border border-default bg-surface text-body-md text-default placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
    aria-label={placeholder}
  />

  <!-- Right side: clear button OR shortcut hint -->
  <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
    {#if value.length > 0}
      <button
        type="button"
        onclick={clear}
        class="text-muted hover:text-default transition-colors"
        aria-label="Bersihkan pencarian"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    {:else if showShortcutHint}
      <kbd class="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-label-sm bg-surface-2 text-muted border border-default">
        Ctrl K
      </kbd>
    {/if}
  </div>

  <!-- Suggestions dropdown -->
  {#if showSuggestions && suggestions.length > 0}
    <ul
      class="absolute top-full left-0 right-0 mt-1 bg-surface border border-default rounded-xl shadow-lg max-h-64 overflow-auto z-10"
      role="listbox"
    >
      {#each suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8) as s}
        <li
          class="px-4 py-2 hover:bg-surface-2 cursor-pointer text-body-sm text-default"
          onclick={() => selectSuggestion(s)}
          onkeydown={(e) => e.key === 'Enter' && selectSuggestion(s)}
          role="option"
          tabindex="0"
        >
          {s}
        </li>
      {/each}
    </ul>
  {/if}
</div>
