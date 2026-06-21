/**
 * Inventory / stock movement API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   GET    /api/inventory              — list stock per product
 *   GET    /api/inventory/movements    — stock movement log
 *   POST   /api/inventory/restock      — single restock
 *   POST   /api/inventory/restock/bulk — bulk restock
 *   GET    /api/inventory/low-stock    — items below threshold
 *
 * Mock fallback: localStorage key 'hekas:stock_movements'.
 */
import { browser } from '$app/environment';
import { httpFetch as http, API_MODE, ApiError } from './http';

const STORAGE_KEY = 'hekas:stock_movements';

export type MovementType = 'in' | 'out' | 'adjust' | 'sale' | 'void' | 'transfer';

export interface StockMovement {
	id: string;
	productId: string;
	productName: string;
	type: MovementType;
	qty: number;
	before: number;
	after: number;
	reason?: string;
	referenceId?: string; // PO number, tx id, etc
	createdAt: number;
	createdBy: string;
}

export interface InventoryItem {
	productId: string;
	productName: string;
	sku: string;
	stock: number;
	minStock: number;
	maxStock: number;
	unit: string;
	lastMovementAt?: number;
}

export interface RestockInput {
	productId: string;
	qty: number;
	reason?: string;
	referenceId?: string;
	createdBy: string;
}

function loadAll(): StockMovement[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as StockMovement[]) : [];
	} catch {
		return [];
	}
}

function saveAll(movements: StockMovement[]): void {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(movements));
}

export async function listMovements(productId?: string): Promise<StockMovement[]> {
	if (API_MODE === 'http') {
		const q = productId ? `?productId=${productId}` : '';
		return http<StockMovement[]>(`/api/inventory/movements${q}`);
	}
	const all = loadAll();
	return productId ? all.filter((m) => m.productId === productId) : all;
}

export async function restock(input: RestockInput): Promise<StockMovement> {
	const mv: StockMovement = {
		id: crypto.randomUUID(),
		productId: input.productId,
		productName: '', // akan di-resolve caller side kalau perlu
		type: 'in',
		qty: input.qty,
		before: 0,
		after: 0,
		reason: input.reason,
		referenceId: input.referenceId,
		createdAt: Date.now(),
		createdBy: input.createdBy
	};
	if (API_MODE === 'http')
		return http<StockMovement>('/api/inventory/restock', { method: 'POST', body: JSON.stringify(input) });
	const all = loadAll();
	all.push(mv);
	saveAll(all);
	return mv;
}

export async function bulkRestock(items: RestockInput[]): Promise<StockMovement[]> {
	if (API_MODE === 'http')
		return http<StockMovement[]>('/api/inventory/restock/bulk', {
			method: 'POST',
			body: JSON.stringify({ items })
		});
	const all = loadAll();
	const created = items.map(
		(it): StockMovement => ({
			id: crypto.randomUUID(),
			productId: it.productId,
			productName: '',
			type: 'in',
			qty: it.qty,
			before: 0,
			after: 0,
			reason: it.reason,
			referenceId: it.referenceId,
			createdAt: Date.now(),
			createdBy: it.createdBy
		})
	);
	all.push(...created);
	saveAll(all);
	return created;
}

export async function getLowStock(threshold: number = 5): Promise<InventoryItem[]> {
	if (API_MODE === 'http') return http<InventoryItem[]>(`/api/inventory/low-stock?threshold=${threshold}`);
	// Mock: aggregate dari products
	const { listProducts } = await import('./products');
	const products = await listProducts();
	return products
		.filter((p) => (p as any).stock !== undefined && (p as any).stock <= threshold)
		.map((p) => ({
			productId: (p as any).id ?? '',
			productName: p.name,
			sku: (p as any).sku ?? '',
			stock: (p as any).stock ?? 0,
			minStock: (p as any).minStock ?? 0,
			maxStock: (p as any).maxStock ?? 0,
			unit: (p as any).unit ?? 'pcs'
		}));
}

export async function getInventoryReport(): Promise<{
	totalProducts: number;
	totalValue: number;
	lowStockCount: number;
	byCategory: Array<{ category: string; count: number; value: number }>;
}> {
	if (API_MODE === 'http') return http('/api/inventory/report');
	const movements = loadAll();
	const ins = movements.filter((m) => m.type === 'in').reduce((s, m) => s + m.qty, 0);
	const outs = movements.filter((m) => m.type === 'out' || m.type === 'sale').reduce((s, m) => s + m.qty, 0);
	return {
		totalProducts: new Set(movements.map((m) => m.productId)).size,
		totalValue: 0, // requires price data
		lowStockCount: 0,
		byCategory: []
	};
}
