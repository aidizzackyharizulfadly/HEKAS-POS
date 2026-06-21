// HEKAS POS — API layer: Auth
//
// Dual-mode (per FE_HANDOFF v2.0.0):
//   - HTTP mode: panggil Wafiq BE di VITE_API_BASE/api/auth/*
//   - Mock mode: localStorage (untuk FE-only demo)
//
// Auto-detected via API_MODE dari ./http.

import type { User, RoleId } from '../types/api.js';
import { API_MODE, httpFetch, setTokens, getToken, clearTokens, unwrapOne } from './client.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';

const delay = (ms = 30) => new Promise<void>((r) => setTimeout(r, ms));
const SESSION_KEY = 'session';

export interface LoginResult {
	user: User;
	accessToken: string;
	refreshToken?: string;
}

// ─── login ────────────────────────────────────────────────────────────────
export async function login(username: string, password: string): Promise<User> {
	if (API_MODE === 'http') {
		const res = await httpFetch<LoginResult>('/api/auth/login', {
			method: 'POST',
			noAuth: true,
			body: JSON.stringify({ username, password })
		});
		setTokens(res.accessToken, res.refreshToken);
		// Cache user
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('hekas:user', JSON.stringify(res.user));
		}
		return res.user;
	}

	// Mock mode (fallback)
	seedIfEmpty();
	await delay();
	const u = username.toLowerCase().trim();
	const users = storage.get<User[]>('users', []);
	const found = users.find((x) => x.username === u);
	if (!found) throw new Error('Username tidak ditemukan');
	if (password !== '123') throw new Error('Password salah');
	storage.set(SESSION_KEY, found);
	return found;
}

// ─── getCurrentUser ──────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
	if (typeof window === 'undefined') return null;

	if (API_MODE === 'http' && getToken()) {
		try {
			const user = await httpFetch<User>('/api/auth/me');
			localStorage.setItem('hekas:user', JSON.stringify(user));
			return user;
		} catch {
			clearTokens();
			return null;
		}
	}

	await delay(5);
	return storage.get<User | null>(SESSION_KEY, null);
}

// ─── logout ──────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
	if (API_MODE === 'http' && getToken()) {
		try {
			await httpFetch('/api/auth/logout', { method: 'POST' });
		} catch {
			// ignore — clear local anyway
		}
		clearTokens();
		return;
	}
	storage.remove(SESSION_KEY);
}

// ─── listUsers (mock-only — untuk seed kasir demo) ──────────────────────
export async function listUsers(): Promise<User[]> {
	if (API_MODE === 'http') {
		// BE tidak expose list users ke kasir — return current user only
		const me = await getCurrentUser();
		return me ? [me] : [];
	}
	seedIfEmpty();
	await delay();
	return storage.get<User[]>('users', []);
}

// ─── verify PIN ──────────────────────────────────────────────────────────
export async function verifyPin(pin: string): Promise<boolean> {
	if (API_MODE === 'http') {
		try {
			await httpFetch('/api/auth/pin', {
				method: 'POST',
				body: JSON.stringify({ pin })
			});
			return true;
		} catch (e: any) {
			if (e?.code === 'INVALID_PIN' || e?.status === 401) return false;
			throw e;
		}
	}
	// Mock: any 4-digit pin OK
	return /^\d{4}$/.test(pin);
}
