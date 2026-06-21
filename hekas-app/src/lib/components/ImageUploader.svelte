<!--
  ImageUploader.svelte — Upload image for product (Fase F)
  Supports: file picker, drag & drop, paste from clipboard
  Props:
    - productId: number
    - currentImage: string | null  (base64 dataURL, or null)
    - onsave: (meta: ProductImageMeta) => void
    - onremove: () => void
    - onclose: () => void
    - showToast: (kind, msg) => void
-->
<script lang="ts">
  import { processImage, getStorageQuota, formatBytes, canAddImage, type ProcessedImage, type StorageQuota } from '$lib/utils/image';
  import type { ProductImageMeta } from '$lib/api';

  let {
    productId,
    currentImage = null,
    onsave,
    onremove,
    onclose,
    showToast = (kind: string, msg: string) => console.log(`[${kind}]`, msg),
  }: {
    productId: number;
    currentImage?: string | null;
    onsave?: (meta: ProductImageMeta) => void;
    onremove?: () => void;
    onclose: () => void;
    showToast?: (kind: 'success' | 'error' | 'info', msg: string) => void;
  } = $props();

  let processing = $state(false);
  let preview = $state<ProcessedImage | null>(null);
  let dragOver = $state(false);
  let quota = $state<StorageQuota>(getStorageQuota());

  // File input ref
  let fileInput: HTMLInputElement | null = $state(null);

  // Setup preview dari currentImage (jika ada)
  $effect(() => {
    if (currentImage && !preview) {
      preview = {
        base64: currentImage,
        dataUrl: currentImage,
        width: 0,
        height: 0,
        sizeBytes: 0,
        mimeType: currentImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
      };
    }
  });

  // Listen paste event globally (saat modal open)
  $effect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  async function handleFile(file: File) {
    processing = true;
    try {
      const result = await processImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8,
        mimeType: 'image/jpeg',
      });
      preview = result;
      showToast('info', `Image diproses: ${result.width}×${result.height}px, ${formatBytes(result.sizeBytes)}`);
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Gagal memproses image');
    } finally {
      processing = false;
    }
  }

  function onFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
  }

  function triggerFilePicker() {
    fileInput?.click();
  }

  async function handleSave() {
    if (!preview) {
      showToast('error', 'Belum ada image untuk disimpan');
      return;
    }
    // Validasi quota
    const canAdd = canAddImage(preview.sizeBytes);
    if (!canAdd.ok) {
      showToast('error', canAdd.reason ?? 'Tidak bisa upload');
      return;
    }
    try {
      onsave?.({
        image_data: preview.base64,
        image_mime: preview.mimeType,
        image_size: preview.sizeBytes,
        image_width: preview.width,
        image_height: preview.height,
      });
    } catch (e) {
      showToast('error', e instanceof Error ? e.message : 'Gagal menyimpan');
    }
  }

  function handleRemove() {
    if (!confirm('Hapus image produk? Emoji fallback akan dipakai.')) return;
    onremove?.();
  }

  function handleClear() {
    preview = null;
    if (fileInput) fileInput.value = '';
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget && !processing) onclose();
  }

  function handleBackdropKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && !processing) onclose();
  }

  const quotaPercent = $derived(Math.round(quota.percentUsed * 100));
  const quotaColor = $derived(
    quota.warning === 'full' || quota.warning === 'critical'
      ? '#DC2626'
      : quota.warning === 'warning'
        ? '#F59E0B'
        : '#10B981'
  );
</script>

<div
  class="backdrop"
  onclick={handleBackdrop}
  onkeydown={handleBackdropKey}
  role="button"
  tabindex="-1"
  aria-label="Tutup uploader"
>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="uploader-title">
    <div class="header">
      <h2 id="uploader-title">🖼️ Upload Gambar Produk #{productId}</h2>
      <button class="close-btn" onclick={onclose} disabled={processing} aria-label="Tutup">✕</button>
    </div>

    <div class="body">
      <!-- Storage quota indicator -->
      <div class="quota-bar" style="border-color: {quotaColor};">
        <div class="quota-header">
          <span style="font-size: 12px; font-weight: 600; color: #475569;">
            💾 Storage: {formatBytes(quota.usedBytes)} / {formatBytes(quota.totalBytes)}
          </span>
          <span style="font-size: 12px; font-weight: 700; color: {quotaColor};">
            {quotaPercent}%
          </span>
        </div>
        <div class="quota-track">
          <div class="quota-fill" style="width: {Math.min(100, quotaPercent)}%; background: {quotaColor};"></div>
        </div>
        {#if quota.warning !== 'ok'}
          <div class="quota-warning" style="color: {quotaColor}; font-size: 11px; margin-top: 4px;">
            ⚠️ Storage {quota.warning === 'warning' ? 'mulai penuh' : quota.warning === 'critical' ? 'hampir penuh' : 'penuh'}.
            {#if quota.warning === 'full'}Tidak bisa upload lagi.{/if}
          </div>
        {/if}
      </div>

      <!-- Drop zone / Preview area -->
      {#if !preview}
        <div
          class="dropzone"
          class:drag-over={dragOver}
          ondrop={onDrop}
          ondragover={onDragOver}
          ondragleave={onDragLeave}
          role="button"
          tabindex="0"
          onclick={triggerFilePicker}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFilePicker(); }}
        >
          <div class="dropzone-icon">📁</div>
          <div class="dropzone-text">
            <strong>Drop image di sini</strong>
            <span>atau klik untuk pilih file</span>
          </div>
          <div class="dropzone-hint">
            📋 Atau paste dari clipboard (Ctrl+V)<br>
            🖼️ Max 800×800px • 💾 Compress ke JPEG quality 0.8
          </div>
        </div>
      {:else}
        <div class="preview-area">
          <img src={preview.base64} alt="Preview" class="preview-img" />
          <div class="preview-info">
            <div><strong>{preview.width} × {preview.height}px</strong></div>
            <div style="color: #64748B; font-size: 12px;">
              {formatBytes(preview.sizeBytes)} • {preview.mimeType}
            </div>
          </div>
        </div>
      {/if}

      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        onchange={onFileSelect}
        style="display: none"
      />

      {#if processing}
        <div class="processing">
          ⏳ Memproses image...
        </div>
      {/if}
    </div>

    <div class="footer">
      {#if currentImage && !preview}
        <button class="btn-remove" onclick={handleRemove} disabled={processing}>
          🗑️ Hapus Image
        </button>
      {/if}
      {#if preview}
        <button class="btn-secondary" onclick={handleClear} disabled={processing}>
          🔄 Ganti Image
        </button>
      {/if}
      <div style="flex: 1"></div>
      <button class="btn-cancel" onclick={onclose} disabled={processing}>
        ❌ Batal
      </button>
      {#if preview}
        <button class="btn-save" onclick={handleSave} disabled={processing || quota.warning === 'full'}>
          💾 Simpan
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }
  .modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 520px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .header {
    padding: 14px 18px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0F172A;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #64748B;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .close-btn:hover:not(:disabled) {
    background: #F1F5F9;
  }
  .body {
    padding: 18px;
  }
  .quota-bar {
    background: #F8FAFC;
    border: 1px solid;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 14px;
  }
  .quota-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .quota-track {
    width: 100%;
    height: 6px;
    background: #E2E8F0;
    border-radius: 3px;
    overflow: hidden;
  }
  .quota-fill {
    height: 100%;
    transition: width 0.3s, background 0.3s;
  }
  .dropzone {
    border: 2px dashed #CBD5E1;
    border-radius: 8px;
    padding: 32px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s;
    background: #F8FAFC;
  }
  .dropzone:hover {
    border-color: #2563EB;
    background: #EFF6FF;
  }
  .dropzone.drag-over {
    border-color: #10B981;
    background: #D1FAE5;
    transform: scale(1.01);
  }
  .dropzone-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
  .dropzone-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }
  .dropzone-text strong {
    font-size: 15px;
    color: #0F172A;
  }
  .dropzone-text span {
    font-size: 13px;
    color: #64748B;
  }
  .dropzone-hint {
    font-size: 11px;
    color: #94A3B8;
    line-height: 1.6;
  }
  .preview-area {
    text-align: center;
  }
  .preview-img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .preview-info {
    margin-top: 10px;
    font-size: 13px;
    color: #475569;
  }
  .processing {
    text-align: center;
    padding: 12px;
    background: #DBEAFE;
    color: #1E40AF;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 10px;
  }
  .footer {
    padding: 12px 18px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    gap: 8px;
    align-items: center;
    background: #F8FAFC;
  }
  .btn-cancel,
  .btn-save,
  .btn-remove,
  .btn-secondary {
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-cancel {
    background: #E2E8F0;
    color: #334155;
  }
  .btn-cancel:hover:not(:disabled) {
    background: #CBD5E1;
  }
  .btn-save {
    background: #2563EB;
    color: white;
  }
  .btn-save:hover:not(:disabled) {
    background: #1D4ED8;
  }
  .btn-remove {
    background: #FEE2E2;
    color: #991B1B;
  }
  .btn-remove:hover:not(:disabled) {
    background: #FECACA;
  }
  .btn-secondary {
    background: #FEF3C7;
    color: #92400E;
  }
  .btn-secondary:hover:not(:disabled) {
    background: #FDE68A;
  }
  .btn-cancel:disabled,
  .btn-save:disabled,
  .btn-remove:disabled,
  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
