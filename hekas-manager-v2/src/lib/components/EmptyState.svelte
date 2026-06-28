<script lang="ts">
  type Props = {
    title?: string;
    message?: string;
    icon?: 'mail' | 'inbox' | 'chart' | 'users' | 'package' | 'store';
  };
  let { title = 'Belum ada data', message = 'Data akan muncul di sini setelah ada transaksi.', icon = 'inbox' }: Props = $props();

  function path(name: string): string {
    const map: Record<string, string> = {
      mail: 'M3 7l9 6 9-6M3 7l9-4 9 4M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7',
      inbox: 'M3 8h18M3 8v9a2 2 0 002 2h14a2 2 0 002-2V8M3 8l3-5h12l3 5M9 12h6',
      chart: 'M3 3v18h18M7 14l4-4 4 4 5-5',
      users: 'M16 11a4 4 0 10-8 0 4 4 0 008 0zM2 21a8 8 0 0116 0M22 21a8 8 0 00-6-7.5',
      package: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      store: 'M3 6h12l-1 8H4L3 6zM5 6V4a3 3 0 116 0v2'
    };
    return map[name] ?? map.inbox;
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 p-12 text-center">
  <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-[#1E3A5F] mb-3">
    <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d={path(icon)} />
    </svg>
  </div>
  <p class="text-sm font-semibold text-gray-800">{title}</p>
  <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">{message}</p>
  <div class="mt-4 inline-flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-wider">
    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
    <span>0 records</span>
    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
  </div>
</div>