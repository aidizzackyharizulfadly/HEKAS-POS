<script lang="ts">
  import type { Member } from '$lib/types/domain';
  import TierBadge from '$lib/components/kasir/Pelanggan/TierBadge.svelte';

  interface Props {
    members: Member[];
    onSelect: (member: Member) => void;
    onClose: () => void;
    title?: string;
  }

  let { members, onSelect, onClose, title = 'Pilih Member' }: Props = $props();

  let query = $state('');

  const filtered = $derived(
    members.filter(m => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.email?.toLowerCase().includes(q) ?? false)
      );
    })
  );

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:document onkeydown={onkeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4"
  style="background: rgba(15,23,41,0.55); backdrop-filter: blur(2px)"
  onclick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  role="dialog"
  aria-modal="true" tabindex="-1" tabindex="-1"
  aria-label={title}
  tabindex="-1"
>
  <div
    class="rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
    style="background: #fff; max-height: 80vh"
  >
    <!-- Header -->
    <div class="px-5 py-4 flex items-center justify-between" style="border-bottom: 1px solid #F1F5F9">
      <h2 class="text-base font-bold" style="color: #0F172A">{title}</h2>
      <button
        onclick={onClose}
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        style="background: #F1F5F9; color: #64748B"
        aria-label="Tutup"
      >✕</button>
    </div>

    <!-- Search -->
    <div class="px-5 py-3" style="border-bottom: 1px solid #F1F5F9">
      <input
        type="search"
        bind:value={query}
        placeholder="Cari nama / ID / HP / email…"
        autofocus
        class="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
        style="border-color: #E2EBF4; background: #F8FAFC"
      />
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-3">
      {#if filtered.length === 0}
        <div class="text-center py-12" style="color: #94A3B8">
          <div class="text-4xl mb-2">🔍</div>
          <div class="text-sm">{members.length === 0 ? 'Belum ada member' : 'Tidak ada hasil'}</div>
        </div>
      {:else}
        {#each filtered as m (m.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <button
            type="button"
            onclick={() => onSelect(m)}
            class="w-full text-left px-3 py-3 rounded-lg flex items-center gap-3 transition-all mb-1"
            style="background: #fff; border: 1px solid transparent"
            onmouseenter={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2EBF4'; }}
            onmouseleave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
          >
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff"
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold truncate" style="color: #0F172A">{m.name}</div>
              <div class="text-xs" style="color: #64748B">
                {m.id} · {m.phone}
              </div>
            </div>
            <div class="flex flex-col items-end gap-1">
              <TierBadge tier={m.tier} />
              <span class="text-xs font-bold" style="color: #2563EB">
                {m.points.toLocaleString('id-ID')} poin
              </span>
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </div>
</div>
