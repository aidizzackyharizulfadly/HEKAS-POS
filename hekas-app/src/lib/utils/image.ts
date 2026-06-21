// HEKAS POS — Image utility (Fase F)
// Convert File → base64, resize via Canvas, compress, quota helper

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ResizeOptions {
  maxWidth?: number;   // default 800
  maxHeight?: number;  // default 800
  quality?: number;    // 0-1, default 0.8
  mimeType?: string;   // default image/jpeg
}

export interface ProcessedImage {
  base64: string;        // data:image/jpeg;base64,...
  dataUrl: string;       // sama dengan base64 (alias)
  width: number;
  height: number;
  sizeBytes: number;     // estimasi size dalam bytes
  mimeType: string;
}

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number;
  availableBytes: number;
  percentUsed: number;
  productsBytes: number; // size dari hekas:products
  productsImageCount: number; // jumlah produk dengan image_data
  warning: 'ok' | 'warning' | 'critical' | 'full';
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULTS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  mimeType: 'image/jpeg',
};

const STORAGE_LIMITS = {
  WARNING: 0.7,    // 70% used → warning
  CRITICAL: 0.9,   // 90% used → critical
  FULL: 0.95,      // 95% used → block
};

// Estimasi: localStorage ~5-10MB per origin
// Most browsers allow ~5MB tanpa error, ~10MB dengan quota prompt
const STORAGE_TOTAL_BYTES = 5 * 1024 * 1024; // 5MB conservative

// ─── File to Base64 ──────────────────────────────────────────────────────────
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

// ─── Load Image from URL/dataURL ────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gagal load image'));
    img.src = src;
  });
}

// ─── Resize & Compress via Canvas ───────────────────────────────────────────
export async function processImage(
  file: File,
  options: ResizeOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULTS, ...options };

  // 1. Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar');
  }

  // 2. Validasi ukuran file (max 10MB sebelum proses)
  const MAX_INPUT = 10 * 1024 * 1024;
  if (file.size > MAX_INPUT) {
    throw new Error(`File terlalu besar (max ${formatBytes(MAX_INPUT)})`);
  }

  // 3. Convert ke base64
  const dataUrl = await fileToBase64(file);

  // 4. Load ke image element
  const img = await loadImage(dataUrl);

  // 5. Hitung dimensi baru (preserve aspect ratio)
  let { width, height } = img;
  if (width > opts.maxWidth! || height > opts.maxHeight!) {
    const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 6. Draw ke canvas dengan dimensi baru
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak support Canvas');
  ctx.drawImage(img, 0, 0, width, height);

  // 7. Export ke base64 dengan kompresi
  const mimeType = opts.mimeType!;
  const compressed = canvas.toDataURL(mimeType, opts.quality);

  // 8. Hitung size (base64 length × 0.75 untuk dapat original bytes)
  // base64 encoding: 4 chars per 3 bytes, so bytes = chars * 3/4
  const base64Only = compressed.split(',')[1] ?? '';
  const sizeBytes = Math.round((base64Only.length * 3) / 4);

  return {
    base64: compressed,
    dataUrl: compressed,
    width,
    height,
    sizeBytes,
    mimeType,
  };
}

// ─── Format bytes ke human readable ─────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Cek localStorage quota ─────────────────────────────────────────────────
export function getStorageQuota(): StorageQuota {
  if (typeof localStorage === 'undefined') {
    return {
      usedBytes: 0,
      totalBytes: STORAGE_TOTAL_BYTES,
      availableBytes: STORAGE_TOTAL_BYTES,
      percentUsed: 0,
      productsBytes: 0,
      productsImageCount: 0,
      warning: 'ok',
    };
  }

  // Hitung total used
  let usedBytes = 0;
  let productsBytes = 0;
  let productsImageCount = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) ?? '';
    // each char = 2 bytes in JS strings (UTF-16)
    const size = value.length * 2;
    usedBytes += size;
    if (key === 'hekas:products') {
      productsBytes = size;
      try {
        const products = JSON.parse(value);
        if (Array.isArray(products)) {
          productsImageCount = products.filter(
            (p: { image_data?: string }) => !!p.image_data
          ).length;
        }
      } catch {
        // ignore
      }
    }
  }

  const totalBytes = STORAGE_TOTAL_BYTES;
  const availableBytes = Math.max(0, totalBytes - usedBytes);
  const percentUsed = usedBytes / totalBytes;

  let warning: StorageQuota['warning'] = 'ok';
  if (percentUsed >= STORAGE_LIMITS.FULL) warning = 'full';
  else if (percentUsed >= STORAGE_LIMITS.CRITICAL) warning = 'critical';
  else if (percentUsed >= STORAGE_LIMITS.WARNING) warning = 'warning';

  return {
    usedBytes,
    totalBytes,
    availableBytes,
    percentUsed,
    productsBytes,
    productsImageCount,
    warning,
  };
}

// ─── Validasi apakah image baru bisa di-add ─────────────────────────────────
export function canAddImage(approxSizeBytes: number): {
  ok: boolean;
  reason?: string;
} {
  const quota = getStorageQuota();
  if (quota.warning === 'full') {
    return {
      ok: false,
      reason: `Storage penuh (${(quota.percentUsed * 100).toFixed(0)}%). Hapus backup lama atau export data.`,
    };
  }
  if (quota.usedBytes + approxSizeBytes > quota.totalBytes * STORAGE_LIMITS.CRITICAL) {
    return {
      ok: false,
      reason: `Tidak cukup ruang. Sisa ${formatBytes(quota.availableBytes)}, butuh ~${formatBytes(approxSizeBytes)}.`,
    };
  }
  return { ok: true };
}

// ─── Helper: dimensi display ────────────────────────────────────────────────
export function aspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const r = gcd(width, height);
  return `${width / r}:${height / r}`;
}
