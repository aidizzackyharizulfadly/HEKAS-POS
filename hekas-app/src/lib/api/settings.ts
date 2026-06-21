/**
 * App settings API.
 *
 * Note: Backend settings (store info, receipt, printer) sudah ada di
 * `lib/api/storage.ts` dengan key 'hekas:settings'. File ini menambah
 * typed wrapper layer di atasnya + BE endpoint untuk future sync.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET   /api/settings
 *   PATCH /api/settings
 *   POST  /api/settings/reset
 */
import { httpFetch as http, API_MODE } from './http';
import { browser } from '$app/environment';

const STORAGE_KEY = 'hekas:settings';

export interface ReceiptConfig {
	paperSize: '58mm' | '80mm';
	headerText: string;
	footerText: string;
	showLogo: boolean;
	autoPrint: boolean;
}

export interface PrinterConfig {
	mode: 'browser' | 'thermal';
	deviceName?: string;
	baudRate?: number;
	encoding?: 'UTF-8' | 'CP437';
}

export interface OperationalHours {
	open: string; // "08:00"
	close: string; // "22:00"
	openDays: number[]; // 0=Sun, 6=Sat
}

export interface AppSettings {
	store: {
		name: string;
		address: string;
		phone: string;
		email?: string;
		taxId?: string;
	};
	receipt: ReceiptConfig;
	printer: PrinterConfig;
	operationalHours: OperationalHours;
	accessRights: {
		managerApproval: { voidTx: boolean; refund: boolean; discountLimit: number };
		shiftHandover: boolean;
	};
	theme: 'light' | 'dark' | 'auto';
	language: 'id' | 'en';
}

const DEFAULTS: AppSettings = {
	store: {
		name: 'HEKAS POS',
		address: '',
		phone: '',
		email: '',
		taxId: ''
	},
	receipt: {
		paperSize: '80mm',
		headerText: 'HEKAS POS',
		footerText: 'Terima kasih atas kunjungan Anda',
		showLogo: true,
		autoPrint: false
	},
	printer: { mode: 'browser' },
	operationalHours: {
		open: '08:00',
		close: '22:00',
		openDays: [1, 2, 3, 4, 5, 6]
	},
	accessRights: {
		managerApproval: { voidTx: true, refund: true, discountLimit: 20 },
		shiftHandover: true
	},
	theme: 'auto',
	language: 'id'
};

function load(): AppSettings {
	if (!browser) return DEFAULTS;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULTS;
		const parsed = JSON.parse(raw);
		// Deep merge dengan defaults supaya key baru tetap punya default
		return {
			...DEFAULTS,
			...parsed,
			store: { ...DEFAULTS.store, ...(parsed.store ?? {}) },
			receipt: { ...DEFAULTS.receipt, ...(parsed.receipt ?? {}) },
			printer: { ...DEFAULTS.printer, ...(parsed.printer ?? {}) },
			operationalHours: { ...DEFAULTS.operationalHours, ...(parsed.operationalHours ?? {}) },
			accessRights: {
				...DEFAULTS.accessRights,
				...(parsed.accessRights ?? {}),
				managerApproval: {
					...DEFAULTS.accessRights.managerApproval,
					...(parsed.accessRights?.managerApproval ?? {})
				}
			}
		};
	} catch {
		return DEFAULTS;
	}
}

function save(settings: AppSettings): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function getSettings(): Promise<AppSettings> {
	if (API_MODE === 'http') return http<AppSettings>('/api/settings');
	return load();
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
	if (API_MODE === 'http')
		return http<AppSettings>('/api/settings', { method: 'PATCH', body: JSON.stringify(patch) });
	const current = load();
	const next: AppSettings = {
		...current,
		...patch,
		store: { ...current.store, ...(patch.store ?? {}) },
		receipt: { ...current.receipt, ...(patch.receipt ?? {}) },
		printer: { ...current.printer, ...(patch.printer ?? {}) },
		operationalHours: { ...current.operationalHours, ...(patch.operationalHours ?? {}) },
		accessRights: {
			...current.accessRights,
			...(patch.accessRights ?? {}),
			managerApproval: {
				...current.accessRights.managerApproval,
				...(patch.accessRights?.managerApproval ?? {})
			}
		}
	};
	save(next);
	return next;
}

export async function resetSettings(): Promise<AppSettings> {
	if (API_MODE === 'http') return http<AppSettings>('/api/settings/reset', { method: 'POST' });
	save(DEFAULTS);
	return DEFAULTS;
}
