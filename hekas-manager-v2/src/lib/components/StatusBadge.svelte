<script lang="ts">
  type Props = { status: string };
  let { status }: Props = $props();

  const styles: Record<string, string> = {
    selesai: 'bg-sky-100 text-sky-600',
    aktif: 'bg-emerald-100 text-emerald-600',
    belum: 'bg-gray-100 text-gray-500',
    closed: 'bg-gray-100 text-gray-500',
    expired: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-100 text-amber-600',
    draft: 'bg-gray-100 text-gray-500',
    approved: 'bg-emerald-100 text-emerald-600',
    rejected: 'bg-rose-100 text-rose-600',
    menunggu: 'bg-amber-100 text-amber-600',
    publik: 'bg-blue-100 text-blue-600',
    privat: 'bg-gray-100 text-gray-500'
  };

  const key = $derived(status.toLowerCase().split(/\s+/)[0] ?? '');
  const cls = $derived(styles[key] ?? 'bg-gray-100 text-gray-500');
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {cls}">
  {status}
</span>