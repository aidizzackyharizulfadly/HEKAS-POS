/**
 * HEKAS POS — PIN verification helpers.
 *
 * PIN digunakan untuk authorize transaksi sensitif (void, refund, dll)
 * dan konfirmasi ganti shift. PIN 6 digit, di-hash dengan PBKDF2 (Web Crypto).
 *
 * Browser only — tidak ada fallback Node (server-side PIN verification
 * di-handle backend di FE_HANDOFF v2.0.0).
 */
import { browser } from '$app/environment';

const PIN_LENGTH = 6;
const PIN_REGEX = /^\d{6}$/;
const ATTEMPT_STORAGE_KEY = 'hekas:pin:attempts';
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit setelah lockout
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH = 'SHA-256';

export interface PinHashResult {
	hash: string;
	salt: string;
	iterations: number;
}

export interface PinAttemptRecord {
	count: number;
	lastAttemptAt: number;
	lockedUntil?: number;
}

function bytesToHex(buf: ArrayBuffer): string {
	return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSaltHex(byteLen: number = 16): string {
	if (!browser) return ''; // SSR no-op
	const arr = new Uint8Array(byteLen);
	crypto.getRandomValues(arr);
	return bytesToHex(arr.buffer);
}

async function pbkdf2Hex(password: string, saltHex: string, iterations: number): Promise<string> {
	if (!browser) return '';
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);
	const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
	const derived = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt, iterations, hash: PBKDF2_HASH },
		keyMaterial,
		256
	);
	return bytesToHex(derived);
}

/**
 * Cek format PIN valid (6 digit numerik).
 */
export function isValidPinFormat(pin: string): boolean {
	return PIN_REGEX.test(pin);
}

/**
 * Hash PIN dengan PBKDF2 + random salt. Return object untuk disimpan.
 * Aman untuk disimpan plain (salt+hash tanpa plaintext PIN).
 */
export async function hashPin(pin: string): Promise<PinHashResult> {
	if (!isValidPinFormat(pin)) {
		throw new Error(`Invalid PIN format: must be ${PIN_LENGTH} digits`);
	}
	const salt = randomSaltHex();
	const hash = await pbkdf2Hex(pin, salt, PBKDF2_ITERATIONS);
	return { hash, salt, iterations: PBKDF2_ITERATIONS };
}

/**
 * Verifikasi PIN cocok dengan hash tersimpan. Constant-time comparison
 * untuk mitigasi timing attack.
 */
export async function verifyPin(pin: string, stored: PinHashResult): Promise<boolean> {
	if (!isValidPinFormat(pin)) return false;
	const candidate = await pbkdf2Hex(pin, stored.salt, stored.iterations);
	if (candidate.length !== stored.hash.length) return false;
	let mismatch = 0;
	for (let i = 0; i < candidate.length; i++) {
		mismatch |= candidate.charCodeAt(i) ^ stored.hash.charCodeAt(i);
	}
	return mismatch === 0;
}

// ─── Attempt tracking (rate limit) ───────────────────────────────────────────

function readAttempts(): Record<string, PinAttemptRecord> {
	if (!browser) return {};
	try {
		const raw = localStorage.getItem(ATTEMPT_STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Record<string, PinAttemptRecord>) : {};
	} catch {
		return {};
	}
}

function writeAttempts(map: Record<string, PinAttemptRecord>): void {
	if (!browser) return;
	localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(map));
}

/**
 * Cek apakah user sedang di-lockout. Return sisa durasi (ms) atau 0.
 */
export function getLockoutRemaining(username: string): number {
	if (!browser) return 0;
	const map = readAttempts();
	const rec = map[username];
	if (!rec?.lockedUntil) return 0;
	const left = rec.lockedUntil - Date.now();
	if (left <= 0) {
		// Lockout expired → reset
		delete map[username];
		writeAttempts(map);
		return 0;
	}
	return left;
}

/**
 * Cek apakah user boleh coba PIN (tidak di-lockout).
 */
export function canAttemptPin(username: string): boolean {
	return getLockoutRemaining(username) === 0;
}

/**
 * Catat attempt gagal. Lockout jika sudah ≥ threshold.
 * Return info sisa attempt (sebelum lockout).
 */
export function recordFailedAttempt(username: string): { attemptsLeft: number; lockedMs: number } {
	if (!browser) return { attemptsLeft: LOCKOUT_THRESHOLD, lockedMs: 0 };
	const map = readAttempts();
	const prev = map[username] ?? { count: 0, lastAttemptAt: 0 };
	const next: PinAttemptRecord = {
		count: prev.count + 1,
		lastAttemptAt: Date.now()
	};
	if (next.count >= LOCKOUT_THRESHOLD) {
		next.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
	}
	map[username] = next;
	writeAttempts(map);

	const attemptsLeft = Math.max(0, LOCKOUT_THRESHOLD - next.count);
	const lockedMs = next.lockedUntil ? Math.max(0, next.lockedUntil - Date.now()) : 0;
	return { attemptsLeft, lockedMs };
}

/**
 * Reset attempt counter (setelah PIN berhasil atau unlock manual).
 */
export function clearAttempts(username: string): void {
	if (!browser) return;
	const map = readAttempts();
	delete map[username];
	writeAttempts(map);
}
