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
	// Mock: compute from actual product/stock data
	const { storage } = await import('$lib/utils/storage');
	const products = storage.get<any[]>('products', []);
	const active = products.filter((p) => p.is_active !== false);
	const totalStock = active.reduce((s: number, p: any) => s + (p.stock ?? 0), 0);
	const lowStockCount = active.filter((p: any) => p.stock <= (p.min_stock ?? 5)).length;
	const movements = storage.get<any[]>('inventory_movements', []);
	const recentMovements = movements.slice(-5).map((m: any) => ({
		id: String(m.id ?? ''),
		type: m.type ?? 'adjustment',
		qty: m.qty ?? m.quantity ?? 0,
		createdAt: m.created_at ?? Date.now()
	}));
	return {
		date: new Date().toISOString().slice(0, 10),
		totalProducts: active.length,
		totalStock,
		lowStockCount,
		todayPO: storage.get<any[]>('incoming_goods', []).length,
		todayOutgoing: storage.get<any[]>('outgoing_goods', []).length,
		todaySJ: storage.get<any[]>('surat_jalan', []).length,
		recentMovements,
		pendingTasks: lowStockCount
	};
}

export async function getKasirDashboard(): Promise<KasirDashboard> {
	if (API_MODE === 'http') return http<KasirDashboard>('/api/dashboard/kasir');
	// Mock: compute from actual transaction/shift data
	const { storage } = await import('$lib/utils/storage');
	const shifts = storage.get<any[]>('shifts', []);
	const activeShift = shifts.find((s: any) => s.status === 'active') ?? null;
	const txs = storage.get<any[]>('transactions', []);
	const today = new Date().toISOString().slice(0, 10);
	const todayTxs = txs.filter((t: any) => String(t.created_at ?? '').startsWith(today) && t.status === 'completed');
	const topMap = new Map<string, { name: string; qty: number; revenue: number }>();
	for (const tx of todayTxs) {
		for (const item of (tx.items ?? [])) {
			const key = String(item.product_id ?? item.id);
			const existing = topMap.get(key) ?? { name: item.product_name ?? item.name ?? '', qty: 0, revenue: 0 };
			existing.qty += (item.qty ?? 1);
			existing.revenue += (item.qty ?? 1) * (item.price ?? 0);
			topMap.set(key, existing);
		}
	}
	const topProducts = Array.from(topMap.entries())
		.map(([productId, rest]) => ({ productId, ...rest }))
		.sort((a, b) => b.revenue - a.revenue)
		.slice(0, 10);
	const heldCount = storage.get<any[]>('held', []).length;
	return {
		date: today,
		myShift: activeShift ? {
			id: activeShift.id,
			openedAt: activeShift.started_at ?? activeShift.opened_at ?? Date.now(),
			totalSales: activeShift.total_revenue ?? activeShift.totalSales ?? 0,
			totalTx: activeShift.total_transactions ?? activeShift.totalTx ?? 0
		} : null,
		todayTx: todayTxs.length,
		todayRevenue: todayTxs.reduce((s: number, t: any) => s + (t.total ?? 0), 0),
		topProducts,
		heldTransactions: heldCount
	};
}

/**
 * Re-export domain's DashboardSummary untuk backward compat.
 */
export type { DashboardSummary };
