/**
 * Business reports API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET /api/reports/business?period=...    — overall business analytics
 *   GET /api/reports/finance?period=...     — P&L
 *   GET /api/reports/inventory              — stock report
 *   GET /api/reports/employees?period=...   — performance per employee
 *   GET /api/reports/export?type=csv&...    — export file
 */
import { httpFetch as http, API_MODE } from './client';

export type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
	from: string; // ISO date
	to: string;
}

export interface BusinessAnalytics {
	period: ReportPeriod;
	dateRange: DateRange;
	totalRevenue: number;
	totalTx: number;
	avgTicket: number;
	uniqueCustomers: number;
	topProducts: Array<{ productId: string; name: string; qty: number; revenue: number }>;
	byCategory: Array<{ category: string; revenue: number; share: number }>;
	byPayment: Record<string, number>;
	byDay: Array<{ date: string; revenue: number; tx: number }>;
	growth: { revenue: number; tx: number }; // % vs previous period
}

export interface FinanceReport {
	period: ReportPeriod;
	dateRange: DateRange;
	revenue: number;
	cogs: number;
	grossProfit: number;
	expenses: number;
	netProfit: number;
	margins: { gross: number; net: number };
	byCategory: Array<{ category: string; revenue: number; profit: number }>;
}

export interface EmployeePerformance {
	employeeId: string;
	username: string;
	fullName: string;
	txHandled: number;
	totalSales: number;
	avgTicket: number;
	rank: number;
}

function rangeForPeriod(period: ReportPeriod): DateRange {
	const now = new Date();
	const to = now.toISOString().slice(0, 10);
	const fromDate = new Date(now);
	switch (period) {
		case 'today':
			break;
		case 'week':
			fromDate.setDate(now.getDate() - 7);
			break;
		case 'month':
			fromDate.setMonth(now.getMonth() - 1);
			break;
		case 'quarter':
			fromDate.setMonth(now.getMonth() - 3);
			break;
		case 'year':
			fromDate.setFullYear(now.getFullYear() - 1);
			break;
		default:
			fromDate.setMonth(now.getMonth() - 1);
	}
	return { from: fromDate.toISOString().slice(0, 10), to };
}

export async function getBusinessAnalytics(period: ReportPeriod = 'month'): Promise<BusinessAnalytics> {
	if (API_MODE === 'http') return http<BusinessAnalytics>(`/api/reports/business?period=${period}`);
	// Mock: aggregate dari existing transactions
	const { listTransactions } = await import('./transactions');
	const txs = await listTransactions();
	const range = rangeForPeriod(period);
	const inRange = txs.filter((t) => {
		const d = new Date(t.created_at).toISOString().slice(0, 10);
		return d >= range.from && d <= range.to;
	});
	const totalRevenue = inRange.reduce((s, t) => s + (t.total ?? 0), 0);
	return {
		period,
		dateRange: range,
		totalRevenue,
		totalTx: inRange.length,
		avgTicket: inRange.length > 0 ? totalRevenue / inRange.length : 0,
		uniqueCustomers: new Set(inRange.map((t) => (t as any).memberId).filter(Boolean)).size,
		topProducts: [],
		byCategory: [],
		byPayment: {},
		byDay: [],
		growth: { revenue: 0, tx: 0 }
	};
}

export async function getFinanceReport(period: ReportPeriod = 'month'): Promise<FinanceReport> {
	if (API_MODE === 'http') return http<FinanceReport>(`/api/reports/finance?period=${period}`);
	const analytics = await getBusinessAnalytics(period);
	const cogs = analytics.totalRevenue * 0.6; // estimate 60% COGS
	const grossProfit = analytics.totalRevenue - cogs;
	const expenses = grossProfit * 0.3; // estimate 30% of profit
	return {
		period,
		dateRange: analytics.dateRange,
		revenue: analytics.totalRevenue,
		cogs,
		grossProfit,
		expenses,
		netProfit: grossProfit - expenses,
		margins: {
			gross: analytics.totalRevenue > 0 ? (grossProfit / analytics.totalRevenue) * 100 : 0,
			net: analytics.totalRevenue > 0 ? ((grossProfit - expenses) / analytics.totalRevenue) * 100 : 0
		},
		byCategory: []
	};
}

export async function getInventoryReport(): Promise<{
	totalProducts: number;
	totalStockValue: number;
	lowStock: number;
	byCategory: Array<{ category: string; count: number; value: number }>;
	movements: Array<{ date: string; type: string; qty: number }>;
}> {
	if (API_MODE === 'http') return http('/api/reports/inventory');
	const { getInventoryReport } = await import('./inventory');
	return getInventoryReport() as any;
}

export async function getEmployeePerformance(period: ReportPeriod = 'month'): Promise<EmployeePerformance[]> {
	if (API_MODE === 'http') return http<EmployeePerformance[]>(`/api/reports/employees?period=${period}`);
	return [];
}

export async function exportReport(type: 'csv' | 'xlsx' | 'pdf', params: Record<string, string>): Promise<Blob> {
	const qs = new URLSearchParams({ type, ...params }).toString();
	if (API_MODE === 'http') return http<Blob>(`/api/reports/export?${qs}`, { responseType: 'blob' });
	// Mock: return empty CSV
	return new Blob([''], { type: 'text/csv' });
}
