// HEKAS POS — Backup utility
// Export/import/reset semua `hekas:*` localStorage data ke format JSON
// yang ter-version (untuk future migration).
//
// Format:
// {
//   app: 'hekas-pos',
//   version: 1,
//   exported_at: ISO string,
//   data: {
//     products: [...],
//     members: [...],
//     users: [...],
//     transactions: [...],
//     held: [...],
//     settings: {...}
//   }
// }

import { storage, seedIfEmpty } from './storage.js';

const BACKUP_KEYS = [
  'products',
  'members',
  'users',
  'transactions',
  'held',
  'settings',
] as const;

type BackupKey = typeof BACKUP_KEYS[number];

export const BACKUP_VERSION = 1;
export const BACKUP_APP = 'hekas-pos';

// Track metadata in localStorage (not included in backup data itself)
const META_LAST_BACKUP_KEY = 'hekas_meta:last_backup';
const META_LAST_RESTORE_KEY = 'hekas_meta:last_restore';

export interface BackupFile {
  app: string;
  version: number;
  exported_at: string;
  device?: string;
  data: Record<string, unknown>;
}

export interface BackupPreview {
  app: string;
  version: number;
  exported_at: string;
  counts: Record<string, number>;
  total_items: number;
}

export type BackupPreviewResult = BackupPreview | { error: string };

// ─── Export ─────────────────────────────────────────────────────────────────
export function exportBackup(): BackupFile {
  const data: Record<string, unknown> = {};
  for (const key of BACKUP_KEYS) {
    data[key] = storage.get<unknown>(key, null);
  }
  const file: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exported_at: new Date().toISOString(),
    device: getDeviceName(),
    data,
  };

  const json = JSON.stringify(file, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `hekas-backup-${nowStamp()}.json`);

  // Track last backup time
  try {
    storage.set(META_LAST_BACKUP_KEY, new Date().toISOString());
  } catch {
    /* storage full? ignore */
  }

  return file;
}

// ─── Preview (sebelum import) ───────────────────────────────────────────────
export function previewBackup(json: string): BackupPreviewResult {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') {
      return { error: 'File bukan JSON valid' };
    }
    if (parsed.app !== BACKUP_APP) {
      return {
        error: `File ini bukan backup HEKAS POS (app: "${parsed.app ?? 'unknown'}")`,
      };
    }
    if (typeof parsed.version !== 'number') {
      return { error: 'Versi backup tidak valid' };
    }
    if (!parsed.data || typeof parsed.data !== 'object') {
      return { error: 'Struktur data backup corrupt' };
    }

    const counts: Record<string, number> = {};
    let total = 0;
    for (const key of BACKUP_KEYS) {
      const arr = parsed.data[key];
      if (Array.isArray(arr)) {
        counts[key] = arr.length;
        total += arr.length;
      } else if (arr && typeof arr === 'object') {
        counts[key] = Object.keys(arr).length;
        total += Object.keys(arr).length;
      } else {
        counts[key] = 0;
      }
    }

    return {
      app: parsed.app,
      version: parsed.version,
      exported_at: parsed.exported_at ?? '',
      counts,
      total_items: total,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { error: `JSON parse error: ${msg}` };
  }
}

// ─── Import (apply backup to current data) ──────────────────────────────────
export interface ImportOptions {
  mode: 'replace' | 'merge';   // replace = overwrite all, merge = keep existing + add new
  skipKeys?: string[];         // keys to skip during import
}

export interface ImportResult {
  imported: Record<string, number>;
  skipped: Record<string, number>;
  total: number;
}

export function importBackup(
  json: string,
  options: ImportOptions = { mode: 'replace' },
): ImportResult {
  const parsed = JSON.parse(json);
  if (parsed.app !== BACKUP_APP) {
    throw new Error(`File bukan backup HEKAS POS`);
  }

  const result: ImportResult = {
    imported: {},
    skipped: {},
    total: 0,
  };

  for (const key of BACKUP_KEYS) {
    if (options.skipKeys?.includes(key)) {
      continue;
    }
    const incoming = parsed.data?.[key];
    if (incoming == null) continue;

    if (options.mode === 'replace') {
      storage.set<unknown>(key, incoming);
      const count = Array.isArray(incoming) ? incoming.length : 1;
      result.imported[key] = count;
      result.total += count;
    } else {
      // merge: gabung existing + incoming (de-dup by id untuk array)
      const existing = storage.get<unknown>(key, null);
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        const existingIds = new Set(
          existing.map((e: unknown) => {
            if (e && typeof e === 'object' && 'id' in e) {
              return String((e as { id: unknown }).id);
            }
            return JSON.stringify(e);
          }),
        );
        const merged = [
          ...existing,
          ...incoming.filter((i: unknown) => {
            const id = i && typeof i === 'object' && 'id' in i
              ? String((i as { id: unknown }).id)
              : JSON.stringify(i);
            return !existingIds.has(id);
          }),
        ];
        storage.set<unknown>(key, merged);
        const added = merged.length - existing.length;
        result.imported[key] = added;
        result.total += added;
      } else {
        storage.set<unknown>(key, incoming);
        const count = Array.isArray(incoming) ? incoming.length : 1;
        result.imported[key] = count;
        result.total += count;
      }
    }
  }

  try {
    storage.set(META_LAST_RESTORE_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }

  return result;
}

// ─── Reset (hapus semua data + reseed) ──────────────────────────────────────
export function resetData(): void {
  // Hapus semua keys
  for (const key of BACKUP_KEYS) {
    storage.remove(key);
  }
  // Hapus metadata juga
  storage.remove(META_LAST_BACKUP_KEY);
  storage.remove(META_LAST_RESTORE_KEY);
  storage.remove('hekas:seeded');

  // Reseed dengan data default
  seedIfEmpty();
}

// ─── Stats & metadata ──────────────────────────────────────────────────────
export interface DataStats {
  total_keys: number;
  total_size_kb: number;
  counts: Record<string, number>;
  last_backup: string | null;
  last_restore: string | null;
  days_since_backup: number | null;
}

export function getDataStats(): DataStats {
  const counts: Record<string, number> = {};
  let totalSize = 0;

  for (const key of BACKUP_KEYS) {
    const v = storage.get<unknown>(key, null);
    if (v == null) {
      counts[key] = 0;
    } else if (Array.isArray(v)) {
      counts[key] = v.length;
      totalSize += JSON.stringify(v).length;
    } else if (typeof v === 'object') {
      counts[key] = Object.keys(v as object).length;
      totalSize += JSON.stringify(v).length;
    } else {
      counts[key] = 1;
    }
  }

  const lastBackup = storage.get<string | null>(META_LAST_BACKUP_KEY, null);
  const lastRestore = storage.get<string | null>(META_LAST_RESTORE_KEY, null);

  let daysSince: number | null = null;
  if (lastBackup) {
    const days = Math.floor(
      (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24),
    );
    daysSince = days;
  }

  return {
    total_keys: BACKUP_KEYS.length,
    total_size_kb: Math.round(totalSize / 1024 * 10) / 10,
    counts,
    last_backup: lastBackup,
    last_restore: lastRestore,
    days_since_backup: daysSince,
  };
}

// ─── File picker (browser file input → JSON string) ────────────────────────
export function pickBackupFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('File picker hanya tersedia di browser'));
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        reject(new Error('Tidak ada file dipilih'));
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('File read error'));
      reader.readAsText(file);
    };
    input.click();
  });
}

// ─── Stale detection ────────────────────────────────────────────────────────
export function isBackupStale(thresholdDays = 7): boolean {
  const stats = getDataStats();
  if (!stats.last_backup) return true;
  if (stats.days_since_backup == null) return true;
  return stats.days_since_backup >= thresholdDays;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function getDeviceName(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type { BackupKey };