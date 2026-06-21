/**
 * Telegram link API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET  /api/telegram/settings        — get link status
 *   POST /api/telegram/link            — link bot via token
 *   DELETE /api/telegram/link          — unlink
 *   POST /api/telegram/test-message    — kirim test message
 *
 * Mock fallback: localStorage key 'hekas:telegram'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError } from './client';

const STORAGE_KEY = 'hekas:telegram';

export interface TelegramSettings {
	linked: boolean;
	chatId?: string;
	username?: string;
	linkedAt?: number;
	notifyOn: {
		newOrder: boolean;
		lowStock: boolean;
		shiftEnd: boolean;
		voidTx: boolean;
		dailyReport: boolean;
	};
}

const DEFAULT_SETTINGS: TelegramSettings = {
	linked: false,
	notifyOn: {
		newOrder: true,
		lowStock: true,
		shiftEnd: true,
		voidTx: true,
		dailyReport: false
	}
};

function loadSettings(): TelegramSettings {
	if (!browser) return DEFAULT_SETTINGS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

function saveSettings(settings: TelegramSettings): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
	if (API_MODE === 'http') return http<TelegramSettings>('/api/telegram/settings');
	return loadSettings();
}

export async function linkTelegram(token: string): Promise<TelegramSettings> {
	if (API_MODE === 'http')
		return http<TelegramSettings>('/api/telegram/link', { method: 'POST', body: JSON.stringify({ token }) });
	if (!token || token.length < 10) throw new ApiError(400, 'INVALID_TOKEN', 'Token tidak valid');
	const current = loadSettings();
	const next: TelegramSettings = {
		...current,
		linked: true,
		chatId: `mock-${Date.now()}`,
		username: '@hekas_bot',
		linkedAt: Date.now()
	};
	saveSettings(next);
	return next;
}

export async function unlinkTelegram(): Promise<TelegramSettings> {
	if (API_MODE === 'http') return http<TelegramSettings>('/api/telegram/link', { method: 'DELETE' });
	const next: TelegramSettings = { ...loadSettings(), linked: false };
	delete next.chatId;
	delete next.username;
	delete next.linkedAt;
	saveSettings(next);
	return next;
}

export async function updateNotifications(patch: Partial<TelegramSettings['notifyOn']>): Promise<TelegramSettings> {
	if (API_MODE === 'http')
		return http<TelegramSettings>('/api/telegram/notifications', {
			method: 'PATCH',
			body: JSON.stringify(patch)
		});
	const current = loadSettings();
	const next: TelegramSettings = { ...current, notifyOn: { ...current.notifyOn, ...patch } };
	saveSettings(next);
	return next;
}

export async function sendTestMessage(): Promise<{ ok: boolean; message: string }> {
	if (API_MODE === 'http') return http('/api/telegram/test-message', { method: 'POST' });
	const settings = loadSettings();
	if (!settings.linked) throw new ApiError(400, 'NOT_LINKED', 'Telegram belum di-link');
	return { ok: true, message: 'Test message terkirim (mock)' };
}
