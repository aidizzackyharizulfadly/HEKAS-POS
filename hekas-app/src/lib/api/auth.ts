// HEKAS POS — API layer: Auth (sederhana, frontend-only)
// Untuk demo. Production: panggil backend, simpan JWT/session.

import type { User } from './types.js';
import { storage, seedIfEmpty } from '$lib/utils/storage.js';

const delay = (ms = 30) => new Promise<void>((r) => setTimeout(r, ms));
const SESSION_KEY = 'session';

export interface LoginResult { user: User; }

export async function login(username: string, password: string): Promise<User> {
  seedIfEmpty();
  await delay();
  const u = username.toLowerCase().trim();
  const users = storage.get<User[]>('users', []);
  const found = users.find((x) => x.username === u);
  if (!found) throw new Error('Username tidak ditemukan');
  // Demo: password = 123 untuk semua role (mirror DEMO_ACCOUNTS di auth/roles.ts)
  if (password !== '123') throw new Error('Password salah');
  storage.set(SESSION_KEY, found);
  return found;
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  await delay(5);
  return storage.get<User | null>(SESSION_KEY, null);
}

export async function logout(): Promise<void> {
  storage.remove(SESSION_KEY);
}

export async function listUsers(): Promise<User[]> {
  seedIfEmpty();
  await delay();
  return storage.get<User[]>('users', []);
}
