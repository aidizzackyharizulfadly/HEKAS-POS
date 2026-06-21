/**
 * Dashboard aggregation API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET /api/dashboard/manager — manager beranda summary
 *   GET /api/dashboard/gudang  — gudang beranda summary
 *   GET /api/dashboard/kasir   — kasir beranda summary
 *
 * Each aggregates data dari shifts, transactions, inventory, employees, SJ.
 */
import { httpFetch as http, API_MODE } from './client';
import type { DashboardSummary } from '../types/domain';

export interface ManagerDashboard {
	date: string;
	revenue: { today: number; yesterday: number; change: number };
	transactions: { count: number; voidCount: number; avgTicket: number };
	topProducts: Array<{ productId: string; name: string; qty: number; revenue: number }>;
	lowStock: Array<{ productId: string; name: string; stock: number }>;
	pendingApprovals: number;
	pendingSJ: number;
	employeeOnDuty: number;
	hourlyRevenue: Array<{ hour: number; revenue: number }>;
}

export interface GudangDashboard {
	date: string;
	totalProducts: number;
	totalStock: number;
	lowStockCount: number;
	todayPO: number;
	todayOutgoing: number;
	todaySJ: number;
	recentMovements: Array<{ id: string; type: string; qty: number; createdAt: number }>;
	pendingTasks: number;
}

export interface KasirDashboard {
	date: string;
	myShift: { id: string; openedAt: number; totalSales: number; totalTx: number } | null;
	todayTx: number;
	todayRevenue: number;
	topProducts: Array<{ productId: string; name: string; qty: number; revenue: number }>;
	heldTransactions: number;
}

export async function getManagerDashboard(): Promise<ManagerDashboard> {
	if (API_MODE === 'http') return http<ManagerDashboard>('/api/dashboard/manager');
	const { getBusinessAnalytics } = await import('./reports');
	const { getLowStock } = await import('./inventory');
	const { getPendingApprovals } = await import('./surat-jalan');
	const analytics = await getBusinessAnalytics('today');
	const lowStock = await getLowStock();
	const pendingSJ = await getPendingApprovals();
	return {
		date: new Date().toISOString().slice(0, 10),
		revenue: { today: analytics.totalRevenue, yesterday: 0, change: 0 },
		transactions: { count: analytics.totalTx, voidCount: 0, avgTicket: analytics.avgTicket },
		topProducts: analytics.topProducts,
		lowStock: lowStock.map((i) => ({ productId: i.productId, name: i.productName, stock: i.stock })),
		pendingApprovals: 0,
		pendingSJ: pendingSJ.length,
		employeeOnDuty: 0,
		hourlyRevenue: []
	};
}

export async function getGudangDashboard(): Promise<GudangDashboard> {
	if (API_MODE === 'http') return http<GudangDashboard>('/api/dashboard/gudang');
	return {
		date: new Date().toISOString().slice(0, 10),
		totalProducts: 0,
		totalStock: 0,
		lowStockCount: 0,
		todayPO: 0,
		todayOutgoing: 0,
		todaySJ: 0,
		recentMovements: [],
		pendingTasks: 0
	};
}

export async function getKasirDashboard(): Promise<KasirDashboard> {
	if (API_MODE === 'http') return http<KasirDashboard>('/api/dashboard/kasir');
	return {
		date: new Date().toISOString().slice(0, 10),
		myShift: null,
		todayTx: 0,
		todayRevenue: 0,
		topProducts: [],
		heldTransactions: 0
	};
}

/**
 * Re-export domain's DashboardSummary untuk backward compat.
 */
export type { DashboardSummary };
