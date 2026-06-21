<script lang="ts">
  /**
   * NotificationFeed — Telegram-style notification log (read-only)
   *
   * Uses: Manager Beranda (notifikasi widget), Manager Surat Jalan
   *
   * @prop messages - array of { id, icon, title, preview, time, status, chat_id }
   * @prop maxItems - berapa item yang ditampilkan (default 6, sisanya auto-collapse)
   * @prop onitemclick - callback saat user klik salah satu notifikasi
   */
  import { statusDotClass } from '$lib/utils/status-classes';
  import type { StatusMeta } from '$lib/utils/status-helpers';
  type Notification = {
    id: string | number;
    icon?: string;
    title: string;
    preview?: string;
    time: string; // ISO string atau format bebas
    status?: 'sent' | 'pending' | 'failed';
    chat_id?: string;
  };

  let {
    messages = [],
    maxItems = 6,
    onitemclick,
  }: {
    messages?: Notification[];
    maxItems?: number;
    onitemclick?: (n: any) => void;
  } = $props();

  let showAll = $state(false);

  const visible = $derived(
    showAll ? messages : messages.slice(0, maxItems)
  );
  const hidden = $derived(Math.max(0, messages.length - maxItems));

  // Status dot color — pakai status-helpers via status-classes (konsisten dengan badge lain)
  function statusMeta(s?: Notification['status']): StatusMeta {
    if (s === 'failed') return { label: 'Gagal', color: 'red', icon: '✗', severity: 'error' };
    if (s === 'pending') return { label: 'Pending', color: 'yellow', icon: '⏳', severity: 'warning' };
    return { label: 'Terkirim', color: 'green', icon: '✓', severity: 'success' };
  }
  function statusDot(s?: Notification['status']): string {
    return statusDotClass(statusMeta(s)) + (s === 'pending' ? ' animate-pulse' : '');
  }
  function statusLabel(s?: Notification['status']): string {
    return statusMeta(s).label;
  }

  function handleClick(n: Notification) {
    onitemclick?.(n);
  }

  function handleKey(e: KeyboardEvent, n: Notification) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(n);
    }
  }
</script>

<section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
  <header class="mb-3 flex items-center justify-between">
    <h2 class="text-base font-semibold text-gray-900">🔔 Notifikasi Telegram</h2>
    {#if messages.length > 0}
      <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        {messages.length}
      </span>
    {/if}
  </header>

  {#if messages.length === 0}
    <p class="py-6 text-center text-sm text-gray-500">
      Belum ada notifikasi
    </p>
  {:else}
    <ul class="space-y-1.5">
      {#each visible as n (n.id)}
        <li>
          <button
            type="button"
            class="group flex w-full items-start gap-2 rounded-md p-2 text-left transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onclick={() => handleClick(n)}
            onkeydown={(e) => handleKey(e, n)}
          >
            <!-- Status dot -->
            <span
              class="mt-1.5 h-2 w-2 shrink-0 rounded-full {statusDot(n.status)}"
              aria-label={statusLabel(n.status)}
              title={statusLabel(n.status)}
            ></span>

            <!-- Icon + content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                {#if n.icon}
                  <span aria-hidden="true">{n.icon}</span>
                {/if}
                <p class="truncate text-sm font-medium text-gray-900 group-hover:text-blue-700">
                  {n.title}
                </p>
              </div>
              {#if n.preview}
                <p class="truncate text-xs text-gray-500">{n.preview}</p>
              {/if}
              <p class="mt-0.5 text-[10px] uppercase tracking-wide text-gray-400">
                {n.time}
              </p>
            </div>
          </button>
        </li>
      {/each}
    </ul>

    {#if hidden > 0 && !showAll}
      <button
        type="button"
        class="mt-2 w-full rounded-md py-1.5 text-center text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onclick={() => (showAll = true)}
      >
        Lihat semua ({hidden} lagi)
      </button>
    {/if}
  {/if}
</section>