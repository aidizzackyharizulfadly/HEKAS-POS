// HEKAS POS — Theme system
// Dark mode toggle dengan CSS class di <html>. Persisted ke localStorage.
// Usage:
//   import { initTheme, toggleTheme, getTheme, onThemeChange } from '$lib/utils/theme';
//   initTheme();          // call on app boot (in +layout.svelte)
//   toggleTheme();       // switch theme
//   theme: 'light' | 'dark' | 'auto'

import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'auto';

const STORAGE_KEY = 'hekas:theme';
const DARK_CLASS = 'hekas-dark';

export function getStoredTheme(): ThemeMode {
  if (!browser) return 'light';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'auto') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}

export function getEffectiveTheme(): 'light' | 'dark' {
  if (!browser) return 'light';
  const mode = getStoredTheme();
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function applyTheme(theme: 'light' | 'dark') {
  if (!browser) return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
}

export function setTheme(mode: ThemeMode) {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
  applyTheme(getEffectiveTheme());
  // Notify listeners
  for (const fn of listeners) {
    try { fn(getEffectiveTheme()); } catch { /* ignore */ }
  }
}

export function toggleTheme() {
  const cur = getEffectiveTheme();
  setTheme(cur === 'dark' ? 'light' : 'dark');
}

type Listener = (theme: 'light' | 'dark') => void;
const listeners = new Set<Listener>();

export function onThemeChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Auto-apply on import (SSR-safe — no-op di server)
export function initTheme() {
  if (!browser) return;
  applyTheme(getEffectiveTheme());
  // Re-apply kalau user OS theme berubah (mode = auto)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'auto') applyTheme(getEffectiveTheme());
  });
}