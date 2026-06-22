// HEKAS POS — Role configuration
// Single source of truth untuk 3 role (Kasir, Manager, Admin Gudang)
// Dipakai oleh /login dan sidebar role guard

export type RoleId = 'kasir' | 'manager' | 'gudang';

export interface RoleConfig {
	id: RoleId;
	label: string;             // "Kasir"
	roleDescription: string;  // "Transaksi penjualan & pembayaran"
	color: string;             // Hex warna utama
	colorDeep: string;         // Hex hover
	bgSoft: string;            // Background badge
	gotoPath: string;          // Path tujuan setelah login (home URL)
}

export const ROLES: Record<RoleId, RoleConfig> = {
	kasir: {
		id: 'kasir',
		label: 'Kasir',
		roleDescription: 'Transaksi penjualan & pembayaran',
		color: '#2563EB',
		colorDeep: '#1D4ED8',
		bgSoft: '#DBEAFE',
		gotoPath: '/kasir/pos'        // R0.5: updated dari '/kasir' ke '/kasir/pos'
	},
	manager: {
		id: 'manager',
		label: 'Manager',
		roleDescription: 'Dashboard KPI & analitik outlet',
		color: '#059669',
		colorDeep: '#047857',
		bgSoft: '#D1FAE5',
		gotoPath: '/manager/beranda'  // R0.5: updated dari '/manager' ke '/manager/beranda'
	},
	gudang: {
		id: 'gudang',
		label: 'Admin Gudang',
		roleDescription: 'Manajemen stok & pengiriman',
		color: '#7C3AED',
		colorDeep: '#6D28D9',
		bgSoft: '#EDE9FE',
		gotoPath: '/gudang/beranda'   // R0.5: updated dari '/gudang' ke '/gudang/beranda'
	}
};

export const ROLE_LIST: RoleConfig[] = [ROLES.kasir, ROLES.manager, ROLES.gudang];

// ─── Menu definitions (untuk Sidebar shared component) ──────────────────────
// R0.2: Tambah menu arrays per role, sesuai FRONTEND_ARCHITECTURE.md §6.1
// Dipakai oleh Sidebar.svelte yang akan di-wire di fase R1 (page refactor).
// Untuk sekarang, role pages masih pakai inline sidebar — menu arrays ini
// adalah single source of truth untuk navigation yang akan datang.

// Icon name string — mapped to @lucide/svelte component in Sidebar.svelte
// (Single source of truth for navigation; Sidebar handles icon rendering).
// Lihat `src/lib/components/shared/icon-map.ts` untuk icon registry.
export interface MenuItem {
	label: string;
	path: string;
	icon: string; // lucide icon name (PascalCase)
}

export const kasirMenu: MenuItem[] = [
	{ label: 'POS',       path: '/kasir/pos',       icon: 'ShoppingCart' },
	{ label: 'Order',     path: '/kasir/order',     icon: 'Receipt' },
	{ label: 'Produk',    path: '/kasir/produk',    icon: 'Package' },
	{ label: 'Pelanggan', path: '/kasir/pelanggan', icon: 'Users' },
	{ label: 'Shift',     path: '/kasir/shift',     icon: 'Clock' },
	{ label: 'Laporan',   path: '/kasir/laporan',   icon: 'BarChart3' },
	{ label: 'Setting',   path: '/kasir/setting',   icon: 'Settings' }
];

export const gudangMenu: MenuItem[] = [
	{ label: 'Beranda',       path: '/gudang/beranda',        icon: 'Home' },
	{ label: 'Inventaris',    path: '/gudang/inventaris',     icon: 'Package' },
	{ label: 'Barang Masuk',  path: '/gudang/barang-masuk',   icon: 'Truck' },
	{ label: 'Barang Keluar', path: '/gudang/barang-keluar',  icon: 'PackageOpen' },
	{ label: 'Surat Jalan',   path: '/gudang/surat-jalan',    icon: 'FileText' }
];

export const managerMenu: MenuItem[] = [
	{ label: 'Beranda',      path: '/manager/beranda',    icon: 'Home' },
	{ label: 'Penjualan',    path: '/manager/penjualan',  icon: 'TrendingUp' },
	{ label: 'Inventaris',   path: '/manager/inventaris', icon: 'Package' },
	{ label: 'Keuangan',     path: '/manager/keuangan',   icon: 'Wallet' },
	{ label: 'Surat Jalan',  path: '/manager/surat-jalan', icon: 'FileText' },
	{ label: 'Karyawan',     path: '/manager/karyawan',   icon: 'Users' },
	{ label: 'AI Assistant', path: '/manager/ai',         icon: 'Sparkles' },
	{ label: 'Laporan',      path: '/manager/laporan',    icon: 'BarChart3' },
	{ label: 'Pengaturan',   path: '/manager/pengaturan', icon: 'Settings' }
];

// ─── Demo accounts (mock auth) ──────────────────────────────────────────────
// Per FE_HANDOFF v2.0.0 §3 — default credentials for DEV (matches Wafiq BE).
// Password disimpan plain text HANYA untuk demo — JANGAN pakai pattern ini di production
export interface DemoAccount {
	username: string;
	password: string;
	role: RoleId;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
	{ username: 'kasir1',   password: 'password123', role: 'kasir'   },
	{ username: 'manager1', password: 'password123', role: 'manager' },
	{ username: 'gudang1',  password: 'password123', role: 'gudang'  }
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
