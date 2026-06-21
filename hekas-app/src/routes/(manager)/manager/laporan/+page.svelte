<!-- Sub-route placeholder (R2 — FRONTEND_ARCHITECTURE.md §4) -->
<!-- TODO R1: Extract content dari monolithic page ke sini -->
<script lang="ts">
  import { page } from '$app/state';
  const role = 'manager';
  const path = page.url.pathname;
</script>

<svelte:head>
  <title>Laporan · HEKAS POS</title>
</svelte:head>

<div class="flex items-center justify-center min-h-[60vh] p-8">
  <div class="text-center max-w-md">
    <div class="text-6xl mb-4">🚧</div>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">Laporan</h1>
    <p style="font-size: 14px; color: #64748B; margin-bottom: 16px">
      Halaman ini belum diimplementasi. Lihat route <code>{path}</code> di role <strong>{role}</strong>.
    </p>
    <p style="font-size: 12px; color: #94A3B8">
      Placeholder created by R2 refactor. Konten akan diekstrak dari monolithic page di fase berikutnya.
    </p>
  </div>
</div>
