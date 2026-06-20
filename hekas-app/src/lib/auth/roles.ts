// HEKAS POS — Role configuration
// Single source of truth untuk 3 role (Kasir, Manager, Admin Gudang)
// Dipakai oleh /login, /login/[role], dan sidebar role guard

export type RoleId = 'kasir' | 'manager' | 'gudang';

export interface RoleConfig {
	id: RoleId;
	label: string;             // "Kasir"
	roleDescription: string;  // "Transaksi penjualan & pembayaran"
	color: string;             // Hex warna utama
	colorDeep: string;         // Hex hover
	bgSoft: string;            // Background badge
	gotoPath: string;          // Path tujuan setelah login
}

export const ROLES: Record<RoleId, RoleConfig> = {
	kasir: {
		id: 'kasir',
		label: 'Kasir',
		roleDescription: 'Transaksi penjualan & pembayaran',
		color: '#2563EB',
		colorDeep: '#1D4ED8',
		bgSoft: '#DBEAFE',
		gotoPath: '/kasir'
	},
	manager: {
		id: 'manager',
		label: 'Manager',
		roleDescription: 'Dashboard KPI & analitik outlet',
		color: '#059669',
		colorDeep: '#047857',
		bgSoft: '#D1FAE5',
		gotoPath: '/manager'
	},
	gudang: {
		id: 'gudang',
		label: 'Admin Gudang',
		roleDescription: 'Manajemen stok & pengiriman',
		color: '#7C3AED',
		colorDeep: '#6D28D9',
		bgSoft: '#EDE9FE',
		gotoPath: '/gudang'
	}
};

export const ROLE_LIST: RoleConfig[] = [ROLES.kasir, ROLES.manager, ROLES.gudang];

// ─── Demo accounts (mock auth) ──────────────────────────────────────────────
// Ganti dengan API call ke backend saat production
// Password disimpan plain text HANYA untuk demo — JANGAN pakai pattern ini di production
export interface DemoAccount {
	username: string;
	password: string;
	role: RoleId;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
	{ username: 'kasi01',    password: '123', role: 'kasir'   },
	{ username: 'manager01', password: '123', role: 'manager' },
	{ username: 'gudang01',  password: '123', role: 'gudang'  }
];

export function authenticate(username: string, password: string): RoleId | null {
	const u = username.toLowerCase().trim();
	const account = DEMO_ACCOUNTS.find(
		(a) => a.username.toLowerCase() === u && a.password === password
	);
	return account?.role ?? null;
}

export function detectRole(username: string): RoleId | null {
	const u = username.toLowerCase().trim();
	if (u.startsWith('kasi')) return 'kasir';
	if (u.startsWith('manager') || u.startsWith('mgr')) return 'manager';
	if (u.startsWith('gudang') || u.startsWith('admin')) return 'gudang';
	return null;
}

export function isValidRole(id: string | undefined): id is RoleId {
	return id === 'kasir' || id === 'manager' || id === 'gudang';
}
