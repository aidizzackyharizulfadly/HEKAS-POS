// HEKAS POS — Sound feedback
// Generate simple beep sounds via Web Audio API — no asset files.
// Hook untuk: success, error, scan, click, notification.

import { browser } from '$app/environment';

const STORAGE_KEY = 'hekas:sound';

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function setSoundEnabled(v: boolean) {
  soundEnabled = v;
  if (browser) {
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }
}

export function initSound() {
  if (!browser) return;
  try {
    soundEnabled = localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    soundEnabled = true;
  }
}

function ctx(): AudioContext | null {
  if (!browser) return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Beberapa browser butuh resume setelah user interaction
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function beep(freq: number, durationMs: number, volume = 0.1, type: OscillatorType = 'sine') {
  if (!soundEnabled) return;
  const ac = ctx();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + durationMs / 1000);
  } catch {
    /* ignore */
  }
}

// ─── Public sound effects ──────────────────────────────────────────────────

/** Success — ascending double beep (mid → high) */
export function playSuccess() {
  beep(660, 100, 0.08);
  setTimeout(() => beep(880, 120, 0.1), 110);
}

/** Error — descending low beep */
export function playError() {
  beep(330, 200, 0.12, 'square');
}

/** Scan — quick short high beep */
export function playScan() {
  beep(1320, 60, 0.06);
}

/** Click — very short subtle click */
export function playClick() {
  beep(800, 30, 0.04);
}

/** Notification — 3 quick beeps */
export function playNotification() {
  beep(880, 60, 0.07);
  setTimeout(() => beep(880, 60, 0.07), 80);
  setTimeout(() => beep(1100, 80, 0.08), 160);
}

/** Cash register — quick cash sound (cha-ching style) */
export function playChaChing() {
  beep(1200, 80, 0.08);
  setTimeout(() => beep(1600, 60, 0.06), 90);
  setTimeout(() => beep(1800, 100, 0.07), 160);
}