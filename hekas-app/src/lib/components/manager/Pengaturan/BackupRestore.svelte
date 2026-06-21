<!--
  BackupRestore.svelte — Modal untuk export/import/reset data
  Args:
    open      : boolean
    onClose   : () => void
    showToast : (kind, msg) => void
    onChanged : () => void  — optional, dipanggil setelah import/reset agar parent refresh
-->
<script lang="ts">
  import {
    exportBackup,
    previewBackup,
    importBackup,
    resetData,
    getDataStats,
    pickBackupFile,
    isBackupStale,
    BACKUP_VERSION,
  } from '$lib/utils/backup';
  import type { BackupPreview, BackupPreviewResult, ImportResult } from '$lib/utils/backup';

  let { open, onClose, showToast, onChanged }: {
    open: boolean;
    onClose: () => void;
    showToast?: (kind: 'success' | 'error' | 'info', text: string) => void;
    onChanged?: () => void;
  } = $props();

  let tab = $state<'export' | 'import' | 'reset'>('export');
  let stats = $state(getDataStats());
  let preview = $state<BackupPreview | null>(null);
  let previewError = $state<string | null>(null);
  let importJson = $state('');
  let importMode = $state<'replace' | 'merge'>('replace');
  let importing = $state(false);
  let exporting = $state(false);
  let resetting = $state(false);
  let resetConfirm = $state('');

  $effect(() => {
    if (open) {
      stats = getDataStats();
      preview = null;
      previewError = null;
      importJson = '';
      resetConfirm = '';
    }
  });

  function isPreviewError(r: BackupPreviewResult): r is { error: string } {
    return 'error' in r;
  }

  function handleExport() {
    exporting = true;
    try {
      const file = exportBackup();
      let total = 0;
      for (const v of Object.values(file.data)) {
        if (Array.isArray(v)) total += v.length;
        else total += 1;
      }
      showToast?.('success', `Backup berhasil! ${total} item tersimpan.`);
      stats = getDataStats();
    } catch (e: any) {
      showToast?.('error', `Export gagal: ${e.message}`);
    } finally {
      exporting = false;
    }
  }

  async function handlePickFile() {
    try {
      const json = await pickBackupFile();
      importJson = json;
      const result = previewBackup(json);
      if (isPreviewError(result)) {
        previewError = result.error;
        preview = null;
      } else {
        previewError = null;
        preview = result;
      }
    } catch (e: any) {
      if (e.message !== 'Tidak ada file dipilih') {
        showToast?.('error', `Gagal membaca file: ${e.message}`);
      }
    }
  }

  function handlePreviewFromText() {
    if (!importJson.trim()) {
      previewError = 'Tempel JSON di textarea atau pilih file';
      preview = null;
      return;
    }
    const result = previewBackup(importJson);
    if (isPreviewError(result)) {
      previewError = result.error;
      preview = null;
    } else {
      previewError = null;
      preview = result;
    }
  }

  function handleImport() {
    if (!preview) {
      showToast?.('error', 'Preview backup dulu');
      return;
    }
    importing = true;
    try {
      const result: ImportResult = importBackup(importJson, { mode: importMode });
      const total = Object.values(result.imported).reduce((a, b) => a + b, 0);
      showToast?.(
        'success',
        `Berhasil import ${total} item (mode: ${importMode === 'replace' ? 'Replace' : 'Merge'})`,
      );
      stats = getDataStats();
      onChanged?.();
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      showToast?.('error', `Import gagal: ${e.message}`);
    } finally {
      importing = false;
    }
  }

  function handleReset() {
    if (resetConfirm !== 'RESET') {
      showToast?.('error', 'Ketik "RESET" untuk konfirmasi');
      return;
    }
    resetting = true;
    try {
      resetData();
      showToast?.('success', 'Data direset ke kondisi awal. Halaman akan dimuat ulang.');
      onChanged?.();
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      showToast?.('error', `Reset gagal: ${e.message}`);
      resetting = false;
    }
  }

  function fmtBytes(kb: number) {
    if (kb < 1) return `${Math.round(kb * 1024)} B`;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  }

  function fmtDate(iso: string | null) {
    if (!iso) return 'Belum pernah';
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function daysSinceLabel(days: number | null) {
    if (days === null) return 'Belum pernah';
    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Kemarin';
    return `${days} hari lalu`;
  }

  const stale = $derived(isBackupStale(7));

  const totalItems = $derived(
    Object.values(stats.counts).reduce<number>((a, b) => a + (b as number), 0)
  );
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
    aria-modal="true" tabindex="-1"
    aria-labelledby="backup-title"
    style="position: fixed; inset: 0; z-index: 201; display: flex; align-items: center; justify-content: center; padding: 16px; pointer-events: none;"
  >
    <div
      style="background: white; border-radius: 16px; max-width: 720px; width: 100%; max-height: 92vh; overflow: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); pointer-events: auto; animation: slide-in 0.18s ease-out;"
    >
      <!-- Header -->
      <div
        style="background: linear-gradient(135deg, #6366F1, #4338CA); color: white; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; border-radius: 16px 16px 0 0;"
      >
        <div>
          <h2 id="backup-title" style="margin: 0; font-size: 18px; font-weight: 700;">
            💾 Backup & Restore
          </h2>
          <div style="font-size: 12px; opacity: 0.85; margin-top: 2px;">
            Export, import, atau reset semua data lokal
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

      <!-- Stats summary -->
      <div
        style="padding: 14px 22px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 12px;"
      >
        <div>
          <div style="color: #64748B; font-weight: 600;">Total Item</div>
          <div style="color: #0F172A; font-weight: 700; font-size: 14px;">
            {totalItems}
          </div>
        </div>
        <div>
          <div style="color: #64748B; font-weight: 600;">Ukuran Data</div>
          <div style="color: #0F172A; font-weight: 700; font-size: 14px;">
            {fmtBytes(stats.total_size_kb)}
          </div>
        </div>
        <div>
          <div style="color: #64748B; font-weight: 600;">Backup Terakhir</div>
          <div style="color: {stale ? '#DC2626' : '#059669'}; font-weight: 700; font-size: 13px;">
            {daysSinceLabel(stats.days_since_backup)}
          </div>
        </div>
        <div>
          <div style="color: #64748B; font-weight: 600;">Restore Terakhir</div>
          <div style="color: #0F172A; font-weight: 700; font-size: 13px;">
            {stats.last_restore ? fmtDate(stats.last_restore) : 'Belum pernah'}
          </div>
        </div>
      </div>

      <!-- Tab nav -->
      <div
        style="display: flex; gap: 4px; padding: 8px 22px 0; border-bottom: 1px solid #E2E8F0; background: white;"
      >
        {#each [
          { id: 'export', label: '📤 Export', color: '#2563EB' },
          { id: 'import', label: '📥 Import', color: '#059669' },
          { id: 'reset',  label: '⚠️ Reset',  color: '#DC2626' },
        ] as t (t.id)}
          <button
            type="button"
            onclick={() => (tab = t.id as any)}
            style="padding: 10px 16px; border: none; background: transparent; cursor: pointer; font-size: 13px; font-weight: 600; color: {tab === t.id ? t.color : '#64748B'}; border-bottom: 2px solid {tab === t.id ? t.color : 'transparent'}; margin-bottom: -1px;"
          >
            {t.label}
          </button>
        {/each}
      </div>

      <!-- Tab content -->
      <div style="padding: 18px 22px;">
        {#if tab === 'export'}
          <div>
            <p style="margin: 0 0 12px; color: #475569; font-size: 13px; line-height: 1.5;">
              Download semua data lokal (produk, member, transaksi, dll) ke file JSON
              ter-version ({BACKUP_VERSION}). File ini bisa di-import kembali nanti untuk
              migrasi data atau recovery.
            </p>

            <!-- Per-key counts -->
            <div
              style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; margin-bottom: 14px;"
            >
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">
                Isi Backup
              </div>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
                {#each Object.entries(stats.counts) as [key, count] (key)}
                  <div style="display: flex; justify-content: space-between; padding: 4px 8px; font-size: 12px;">
                    <span style="color: #64748B; text-transform: capitalize;">{key}</span>
                    <span style="color: #0F172A; font-weight: 600;">{count}</span>
                  </div>
                {/each}
              </div>
            </div>

            {#if stale}
              <div
                style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; color: #991B1B; font-size: 12px; display: flex; align-items: center; gap: 8px;"
              >
                <span>⚠️</span>
                <span>
                  {#if stats.last_backup}
                    Sudah {(stats.days_since_backup ?? 0)} hari sejak backup terakhir.
                  {:else}
                    Belum pernah backup.
                  {/if}
                  Sebaiknya backup rutin untuk jaga-jaga.
                </span>
              </div>
            {/if}

            <button
              type="button"
              onclick={handleExport}
              disabled={exporting}
              style="width: 100%; padding: 14px; border-radius: 10px; border: none; background: #2563EB; color: white; font-size: 14px; font-weight: 700; cursor: pointer; opacity: {exporting ? 0.6 : 1};"
            >
              {exporting ? '⏳ Menyiapkan…' : '📤 Download Backup (.json)'}
            </button>
          </div>

        {:else if tab === 'import'}
          <div>
            <p style="margin: 0 0 12px; color: #475569; font-size: 13px; line-height: 1.5;">
              Restore data dari backup JSON. Pilih file atau paste JSON di textarea.
              <strong style="color: #DC2626;">Replace</strong> akan menimpa semua data,
              <strong style="color: #059669;">Merge</strong> akan menambah data baru saja.
            </p>

            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <button
                type="button"
                onclick={handlePickFile}
                style="flex: 1; padding: 10px; border-radius: 8px; border: 1px dashed #94A3B8; background: white; color: #475569; font-size: 12px; font-weight: 600; cursor: pointer;"
              >
                📁 Pilih File .json
              </button>
            </div>

            <details style="margin-bottom: 12px;">
              <summary style="cursor: pointer; font-size: 12px; color: #64748B; user-select: none;">
                Atau paste JSON langsung
              </summary>
              <textarea
                bind:value={importJson}
                oninput={handlePreviewFromText}
                placeholder={'{"app":"hekas-pos", ...}'}
                style="width: 100%; height: 120px; margin-top: 8px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: monospace; font-size: 11px; resize: vertical;"
              ></textarea>
            </details>

            {#if previewError}
              <div
                style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; color: #991B1B; font-size: 12px;"
              >
                ❌ {previewError}
              </div>
            {/if}

            {#if preview}
              <div
                style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 12px; margin-bottom: 14px;"
              >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">
                    ✓ Backup valid
                  </div>
                  <span style="font-size: 11px; color: #166534;">
                    v{preview.version} • {fmtDate(preview.exported_at)}
                  </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; font-size: 12px;">
                  {#each Object.entries(preview.counts) as [key, count] (key)}
                    <div style="display: flex; justify-content: space-between; padding: 2px 8px;">
                      <span style="color: #475569; text-transform: capitalize;">{key}</span>
                      <span style="color: #166534; font-weight: 600;">{count}</span>
                    </div>
                  {/each}
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: #475569;">
                  Total: <strong>{preview.total_items}</strong> item
                </div>
              </div>

              <div style="display: flex; gap: 8px; margin-bottom: 14px; font-size: 12px;">
                <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid {importMode === 'replace' ? '#DC2626' : '#cbd5e1'}; border-radius: 8px; cursor: pointer; background: {importMode === 'replace' ? '#FEF2F2' : 'white'};">
                  <input type="radio" bind:group={importMode} value="replace" />
                  <div>
                    <div style="font-weight: 600; color: #0F172A;">Replace</div>
                    <div style="color: #64748B; font-size: 11px;">Timpa semua data</div>
                  </div>
                </label>
                <label style="flex: 1; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid {importMode === 'merge' ? '#059669' : '#cbd5e1'}; border-radius: 8px; cursor: pointer; background: {importMode === 'merge' ? '#F0FDF4' : 'white'};">
                  <input type="radio" bind:group={importMode} value="merge" />
                  <div>
                    <div style="font-weight: 600; color: #0F172A;">Merge</div>
                    <div style="color: #64748B; font-size: 11px;">Tambah data baru saja</div>
                  </div>
                </label>
              </div>

              <button
                type="button"
                onclick={handleImport}
                disabled={importing}
                style="width: 100%; padding: 14px; border-radius: 10px; border: none; background: #059669; color: white; font-size: 14px; font-weight: 700; cursor: pointer; opacity: {importing ? 0.6 : 1};"
              >
                {importing ? '⏳ Memproses…' : `📥 Import (${importMode === 'replace' ? 'Replace' : 'Merge'})`}
              </button>
            {/if}
          </div>

        {:else}
          <div>
            <div
              style="background: #FEF2F2; border: 2px solid #DC2626; border-radius: 10px; padding: 14px; margin-bottom: 14px;"
            >
              <div style="display: flex; gap: 10px; align-items: flex-start;">
                <span style="font-size: 24px;">⚠️</span>
                <div>
                  <div style="font-weight: 700; color: #991B1B; margin-bottom: 4px;">
                    Tindakan ini tidak bisa dibatalkan!
                  </div>
                  <div style="color: #7F1D1D; font-size: 12px; line-height: 1.5;">
                    Semua data (produk, member, transaksi, dll) akan dihapus dan diganti
                    dengan data awal (seed). Untuk amannya, export backup dulu sebelum reset.
                  </div>
                </div>
              </div>
            </div>

            <div
              style="background: #F8FAFC; border-radius: 8px; padding: 12px; margin-bottom: 14px; font-size: 12px;"
            >
              <div style="font-weight: 700; color: #475569; margin-bottom: 6px;">
                Yang akan dihapus:
              </div>
              <ul style="margin: 0; padding-left: 20px; color: #64748B; line-height: 1.6;">
                {#each Object.entries(stats.counts) as [key, count] (key)}
                  {#if count > 0}
                    <li>{count} {key}</li>
                  {/if}
                {/each}
              </ul>
            </div>

            <label style="display: block; margin-bottom: 14px;">
              <span style="font-size: 12px; color: #475569; font-weight: 600;">
                Ketik <code style="background: #FEE2E2; padding: 2px 6px; border-radius: 4px; color: #991B1B;">RESET</code> untuk konfirmasi:
              </span>
              <input
                type="text"
                bind:value={resetConfirm}
                placeholder="RESET"
                autocomplete="off"
                style="width: 100%; margin-top: 6px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; font-family: monospace; letter-spacing: 0.1em;"
              />
            </label>

            <button
              type="button"
              onclick={handleReset}
              disabled={resetting || resetConfirm !== 'RESET'}
              style="width: 100%; padding: 14px; border-radius: 10px; border: none; background: #DC2626; color: white; font-size: 14px; font-weight: 700; cursor: {resetConfirm === 'RESET' && !resetting ? 'pointer' : 'not-allowed'}; opacity: {resetConfirm === 'RESET' && !resetting ? 1 : 0.5};"
            >
              {resetting ? '⏳ Mereset…' : '🗑️ Reset Semua Data'}
            </button>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div
        style="padding: 12px 22px; border-top: 1px solid #e2e8f0; background: #F8FAFC; border-radius: 0 0 16px 16px; font-size: 11px; color: #94A3B8; display: flex; justify-content: space-between;"
      >
        <span>Backup format v{BACKUP_VERSION}</span>
        <span>Data disimpan lokal (localStorage)</span>
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