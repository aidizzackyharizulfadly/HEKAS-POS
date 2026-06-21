// HEKAS POS — Keyboard shortcuts system
// Global handler + declarative shortcut registration.
// Usage:
//   import { registerShortcut, formatShortcut, SHORTCUTS } from '$lib/utils/shortcuts';
//   registerShortcut('?', () => openHelp());
//   formatShortcut({ key: 'Enter', ctrl: true }) // → "Ctrl + Enter"

import { browser } from '$app/environment';

export interface Shortcut {
  key: string;             // '?', '/', 'Escape', etc
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;          // Cmd on Mac
  description: string;
  category: 'kasir' | 'navigation' | 'actions' | 'global';
  preventDefault?: boolean;
}

export const SHORTCUTS: Shortcut[] = [
  // Global
  { key: '?', shift: true, description: 'Buka panel pintasan keyboard', category: 'global' },
  { key: 'Escape', description: 'Tutup modal / batal', category: 'global' },

  // Kasir
  { key: '/', description: 'Fokus ke pencarian produk', category: 'kasir' },
  { key: 'Enter', description: 'Tambah produk pertama hasil cari', category: 'kasir' },
  { key: '+', description: 'Tambah qty item di keranjang', category: 'kasir' },
  { key: '-', description: 'Kurangi qty item di keranjang', category: 'kasir' },
  { key: 'h', description: 'Hold (tahan transaksi)', category: 'kasir' },
  { key: 'p', description: 'Buka panel pembayaran', category: 'kasir' },
  { key: 'Delete', description: 'Hapus item dari keranjang', category: 'kasir' },

  // Navigation
  { key: 'g', description: 'Pergi ke halaman (tekan g lalu 1/2/3)', category: 'navigation' },
  { key: '1', description: 'Menu utama: POS', category: 'navigation' },
  { key: '2', description: 'Menu utama: Produk', category: 'navigation' },
  { key: '3', description: 'Menu utama: Shift', category: 'navigation' },

  // Actions
  { key: 'b', description: 'Backup & Restore', category: 'actions' },
  { key: 'e', description: 'Export CSV', category: 'actions' },
  { key: 'c', description: 'Cetak laporan', category: 'actions' },
  { key: 'd', description: 'Toggle dark mode', category: 'actions' },
];

type Handler = (e: KeyboardEvent) => void;
const handlers = new Map<string, Handler>();
let globalListener: ((e: KeyboardEvent) => void) | null = null;

export function registerShortcut(key: string, handler: Handler) {
  handlers.set(key, handler);
}

export function unregisterShortcut(key: string) {
  handlers.delete(key);
}

function normalize(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('ctrl');
  if (e.metaKey) parts.push('meta');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey && e.key.length > 1) parts.push('shift');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

// Cek apakah user sedang mengetik di input/textarea (jangan trigger)
function isTypingTarget(target: EventTarget | null): boolean {
  if (!target) return false;
  const el = target as HTMLElement;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function startListening() {
  if (!browser || globalListener) return;
  globalListener = (e: KeyboardEvent) => {
    // Jangan trigger saat user di input kecuali modifier key
    const hasModifier = e.ctrlKey || e.metaKey || e.altKey;
    if (isTypingTarget(e.target) && !hasModifier) return;

    const k = normalize(e);
    const handler = handlers.get(k);
    if (handler) {
      e.preventDefault();
      handler(e);
    }
  };
  window.addEventListener('keydown', globalListener);
}

export function stopListening() {
  if (!browser || !globalListener) return;
  window.removeEventListener('keydown', globalListener);
  globalListener = null;
}

export function formatShortcut(s: Shortcut): string {
  const parts: string[] = [];
  const isMac = browser && /Mac/.test(navigator.platform);
  if (s.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
  if (s.meta) parts.push(isMac ? '⌘' : 'Meta');
  if (s.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (s.shift) parts.push(isMac ? '⇧' : 'Shift');
  // Format key
  let k = s.key;
  if (k === ' ') k = 'Space';
  if (k.length === 1) k = k.toUpperCase();
  parts.push(k);
  return isMac ? parts.join('') : parts.join(' + ');
}