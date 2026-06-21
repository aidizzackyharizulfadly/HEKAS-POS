<!--
  SettingsPanel.svelte — Modal settings (theme + sound)
  Args:
    open      : boolean
    onClose   : () => void
    showToast : optional toast
-->
<script lang="ts">
  import {
    getStoredTheme,
    setTheme,
    type ThemeMode,
  } from '$lib/utils/theme';
  import {
    isSoundEnabled,
    setSoundEnabled,
    playSuccess,
    playClick,
    playScan,
  } from '$lib/utils/sound';

  let { open, onClose, showToast }: {
    open: boolean;
    onClose: () => void;
    showToast?: (kind: 'success' | 'error' | 'info', text: string) => void;
  } = $props();

  let themeMode = $state<ThemeMode>('light');
  let soundOn = $state(true);

  $effect(() => {
    if (open) {
      themeMode = getStoredTheme();
      soundOn = isSoundEnabled();
    }
  });

  function handleThemeChange(mode: ThemeMode) {
    themeMode = mode;
    setTheme(mode);
    showToast?.('info', `Theme: ${mode === 'auto' ? 'Otomatis (ikut OS)' : mode === 'dark' ? 'Gelap' : 'Terang'}`);
  }

  function handleSoundToggle(v: boolean) {
    soundOn = v;
    setSoundEnabled(v);
    if (v) playSuccess(); // Test sound
    showToast?.('info', v ? 'Suara diaktifkan' : 'Suara dimatikan');
  }

  const themeOptions: { id: ThemeMode; label: string; icon: string; description: string }[] = [
    { id: 'light', label: 'Terang', icon: '☀️', description: 'Mode standar, cocok untuk siang hari' },
    { id: 'dark',  label: 'Gelap',  icon: '🌙', description: 'Lebih nyaman di malam hari, hemat baterai' },
    { id: 'auto',  label: 'Otomatis', icon: '⚙️', description: 'Mengikuti pengaturan OS (prefers-color-scheme)' },
  ];
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
    aria-modal="true" tabindex="-1" tabindex="-1"
    aria-labelledby="settings-title"
    style="position: fixed; inset: 0; z-index: 201; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none;"
  >
    <div
      style="background: white; border-radius: 16px; max-width: 520px; width: 100%; max-height: 92vh; overflow: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); pointer-events: auto; animation: slide-in 0.18s ease-out;"
    >
      <!-- Header -->
      <div
        style="background: linear-gradient(135deg, #64748B, #334155); color: white; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; border-radius: 16px 16px 0 0;"
      >
        <div>
          <h2 id="settings-title" style="margin: 0; font-size: 18px; font-weight: 700;">
            ⚙️ Pengaturan
          </h2>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 2px;">
            Tema, suara, dan preferensi aplikasi
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
      <div style="padding: 18px 22px;">
        <!-- Theme -->
        <section style="margin-bottom: 22px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #0F172A;">
              🎨 Tema Tampilan
            </h3>
            <span style="font-size: 11px; color: #64748B;">Aktif: <strong>{themeMode === 'auto' ? 'Otomatis' : themeMode === 'dark' ? 'Gelap' : 'Terang'}</strong></span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            {#each themeOptions as opt (opt.id)}
              <button
                type="button"
                onclick={() => handleThemeChange(opt.id)}
                style="padding: 12px 8px; border: 2px solid {themeMode === opt.id ? '#2563EB' : '#E2E8F0'}; border-radius: 10px; background: {themeMode === opt.id ? '#EFF6FF' : 'white'}; cursor: pointer; transition: all 150ms;"
              >
                <div style="font-size: 24px; margin-bottom: 4px;">{opt.icon}</div>
                <div style="font-size: 12px; font-weight: 600; color: {themeMode === opt.id ? '#1E40AF' : '#0F172A'};">{opt.label}</div>
              </button>
            {/each}
          </div>
          <p style="margin: 8px 0 0; font-size: 11px; color: #94A3B8; line-height: 1.4;">
            Tema tersimpan otomatis dan berlaku untuk semua halaman.
          </p>
        </section>

        <!-- Sound -->
        <section style="margin-bottom: 22px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #0F172A;">
              🔊 Suara Feedback
            </h3>
            <div style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 4px 10px; background: {soundOn ? '#F0FDF4' : '#F1F5F9'}; border-radius: 20px;">
              <div
                role="switch"
                aria-checked={soundOn}
                aria-label="Toggle suara feedback"
                tabindex="0"
                onclick={() => handleSoundToggle(!soundOn)}
                onkeydown={(e) => (e.key === ' ' || e.key === 'Enter') && handleSoundToggle(!soundOn)}
                style="position: relative; width: 32px; height: 18px; background: {soundOn ? '#10B981' : '#CBD5E1'}; border-radius: 9px; transition: all 200ms; cursor: pointer;"
              >
                <div
                  style="position: absolute; top: 2px; left: {soundOn ? '16px' : '2px'}; width: 14px; height: 14px; background: white; border-radius: 50%; transition: all 200ms; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"
                ></div>
              </div>
              <span style="font-size: 11px; font-weight: 600; color: {soundOn ? '#059669' : '#64748B'};">
                {soundOn ? 'Aktif' : 'Mati'}
              </span>
            </div>
          </div>
          <p style="margin: 0 0 10px; font-size: 12px; color: #64748B; line-height: 1.5;">
            Bunyi bip saat checkout berhasil, scan barcode, error, dll.
          </p>
          {#if soundOn}
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button
                type="button"
                onclick={() => playSuccess()}
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid #10B981; background: #F0FDF4; color: #047857; font-size: 11px; font-weight: 600; cursor: pointer;"
              >
                ✓ Test Success
              </button>
              <button
                type="button"
                onclick={() => playClick()}
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid #94A3B8; background: #F8FAFC; color: #475569; font-size: 11px; font-weight: 600; cursor: pointer;"
              >
                • Test Click
              </button>
              <button
                type="button"
                onclick={() => playScan()}
                style="padding: 6px 12px; border-radius: 6px; border: 1px solid #2563EB; background: #EFF6FF; color: #1E40AF; font-size: 11px; font-weight: 600; cursor: pointer;"
              >
                📷 Test Scan
              </button>
            </div>
          {/if}
        </section>

        <!-- Keyboard shortcuts info -->
        <section>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #F8FAFC; border-radius: 10px;">
            <div>
              <h3 style="margin: 0; font-size: 13px; font-weight: 700; color: #0F172A;">
                ⌨️ Pintasan Keyboard
              </h3>
              <p style="margin: 2px 0 0; font-size: 11px; color: #64748B;">
                Tekan <kbd style="background: white; padding: 1px 6px; border-radius: 3px; border: 1px solid #cbd5e1; font-family: monospace;">?</kbd> kapan saja untuk melihat daftar lengkap
              </p>
            </div>
            <div style="font-size: 22px;">💡</div>
          </div>
        </section>
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