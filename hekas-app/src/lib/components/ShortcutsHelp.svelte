<!--
  ShortcutsHelp.svelte — Modal daftar pintasan keyboard
  Trigger: tekan "?" di mana saja
  Args:
    open    : boolean
    onClose : () => void
-->
<script lang="ts">
  import { SHORTCUTS, formatShortcut, type Shortcut } from '$lib/shortcuts';

  let { open, onClose }: {
    open: boolean;
    onClose: () => void;
  } = $props();

  const grouped = $derived(
    SHORTCUTS.reduce<Record<string, Shortcut[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {}),
  );

  const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
    global:     { label: 'Global',     icon: '🌐', color: '#2563EB' },
    kasir:      { label: 'Kasir',      icon: '🛒', color: '#059669' },
    navigation: { label: 'Navigasi',   icon: '🧭', color: '#7C3AED' },
    actions:    { label: 'Aksi Cepat', icon: '⚡', color: '#F59E0B' },
  };
</script>

{#if open}
  <!-- Backdrop -->
  <div
    role="button"
    tabindex="-1"
    aria-label="Tutup modal"
    onclick={onClose}
    onkeydown={(e) => e.key === 'Escape' && onClose()}
    style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); z-index: 200; backdrop-filter: blur(2px);"
  ></div>

  <!-- Modal -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="shortcuts-title"
    style="position: fixed; inset: 0; z-index: 201; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none;"
  >
    <div
      style="background: white; border-radius: 16px; max-width: 640px; width: 100%; max-height: 92vh; overflow: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); pointer-events: auto; animation: slide-in 0.18s ease-out;"
    >
      <!-- Header -->
      <div
        style="background: linear-gradient(135deg, #7C3AED, #5B21B6); color: white; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; border-radius: 16px 16px 0 0;"
      >
        <div>
          <h2 id="shortcuts-title" style="margin: 0; font-size: 18px; font-weight: 700;">
            ⌨️ Pintasan Keyboard
          </h2>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 2px;">
            Akses cepat dengan keyboard
          </div>
        </div>
        <button
          type="button"
          onclick={onClose}
          aria-label="Tutup"
          style="background: rgba(255,255,255,0.2); border: none; color: white; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 18px;"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div style="padding: 18px 22px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px;">
        {#each Object.entries(grouped) as [cat, items] (cat)}
          {@const meta = categoryLabels[cat] ?? categoryLabels.global}
          <section>
            <div
              style="display: flex; align-items: center; gap: 6px; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid #E2E8F0;"
            >
              <span style="font-size: 16px;">{meta.icon}</span>
              <h3 style="margin: 0; font-size: 13px; font-weight: 700; color: {meta.color};">
                {meta.label}
              </h3>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              {#each items as s (s.key + (s.shift ? 's' : ''))}
                <div
                  style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; background: #F8FAFC; border-radius: 6px;"
                >
                  <span style="font-size: 12px; color: #475569;">{s.description}</span>
                  <kbd
                    style="font-family: 'SF Mono', monospace; font-size: 11px; padding: 2px 8px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 1px 0 rgba(0,0,0,0.05); color: #0F172A; white-space: nowrap;"
                  >
                    {formatShortcut(s)}
                  </kbd>
                </div>
              {/each}
            </div>
          </section>
        {/each}
      </div>

      <!-- Footer -->
      <div
        style="padding: 12px 22px; border-top: 1px solid #e2e8f0; background: #F8FAFC; border-radius: 0 0 16px 16px; font-size: 11px; color: #94A3B8; text-align: center;"
      >
        Tekan <kbd style="background: white; padding: 1px 6px; border-radius: 3px; border: 1px solid #cbd5e1; font-family: monospace;">Esc</kbd> untuk menutup panel ini
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateY(8px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
</style>