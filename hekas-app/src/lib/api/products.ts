// HEKAS POS — API layer: Products
//
// Dual-mode: HTTP (Wafiq BE) | localStorage mock.
//
// BE shape (per FE_HANDOFF §9.3):
//   {ok:true, data:{items,total,limit,offset}} — paginated list
//   {ok:true, data:{...}}                     — detail
// Money fields: purchasePrice/sellingPrice = STRING (PostgreSQL numeric).
// IDs: UUID strings.

import type { Product, ProductImageMeta } from '../types/api.js';
import { API_MODE, httpFetch, unwrapPaginated, unwrapOne, type Paginated } from './http.js';
import { storage, seedIfEmpty, nextProductId } from '$lib/utils/storage.js';

const delay = (ms = 15) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Mappers (BE Product ↔ FE Product) ──────────────────────────────────
interface BEProduct {
	id: string;
	sku: string;
	barcode: string;
	name: string;
	description: string | null;
	categoryId: string;
	supplierId: string;
	outletId: string;
	purchasePrice: string;
	sellingPrice: string;
	stockMin: number;
	stockMax: number;
	unit: string;
	status: 'aktif' | 'nonaktif';
	imageUrl: string | null;
	metadata: any;
	createdAt: string;
	updatedAt: string;
	images?: BEProductImage[];
	stock?: number; // if BE includes current stock
}

interface BEProductImage {
	id: string;
	imageUrl: string;
	isPrimary: boolean;
	sortOrder: number;
}

function beToFe(p: BEProduct, currentStock?: number, fallbackId?: number): Product {
	return {
		id: fallbackId ?? hashUuidToId(p.id),
		uuid: p.id,
		sku: p.sku,
		barcode: p.barcode,
		name: p.name,
		category: p.categoryId,
		price: parseFloat(p.sellingPrice) || 0,
		price_buy: parseFloat(p.purchasePrice) || 0,
		stock: currentStock ?? p.stock ?? 0,
		min_stock: p.stockMin,
		unit: p.unit,
		is_active: p.status === 'aktif',
		image_url: p.imageUrl ?? undefined,
		image: '📦', // emoji fallback
		images: p.images?.map((img) => ({
			id: img.id,
			image_url: img.imageUrl,
			is_primary: img.isPrimary,
			sort_order: img.sortOrder
		}))
	} as Product;
}

/** Simple hash UUID string → small int (FE display ID) */
function hashUuidToId(uuid: string): number {
	let h = 0;
	for (let i = 0; i < uuid.length; i++) {
		h = (h * 31 + uuid.charCodeAt(i)) | 0;
	}
	return Math.abs(h) || 1;
}

// ─── list ────────────────────────────────────────────────────────────────
export interface ListProductsFilter {
	category?: string;
	q?: string;
	activeOnly?: boolean;
	limit?: number;
	offset?: number;
}

export async function listProducts(filter: ListProductsFilter = {}): Promise<Product[]> {
	if (API_MODE === 'http') {
		const params = new URLSearchParams();
		if (filter.q) params.set('search', filter.q);
		if (filter.category && filter.category !== 'all') params.set('categoryId', filter.category);
		if (filter.activeOnly !== false) params.set('status', 'aktif');
		if (filter.limit !== undefined) params.set('limit', String(filter.limit));
		if (filter.offset !== undefined) params.set('offset', String(filter.offset));
		const qs = params.toString();
		const raw = await httpFetch<Paginated<BEProduct>>(`/api/products/${qs ? '?' + qs : ''}`);
		const page = unwrapPaginated<BEProduct>(raw);
		return page.items.map((p) => beToFe(p));
	}

	// Mock
	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	return all
		.filter((p) => {
			if (filter.activeOnly !== false && !p.is_active) return false;
			if (filter.category && filter.category !== 'all' && p.category !== filter.category) return false;
			if (filter.q) {
				const term = filter.q.toLowerCase();
				if (
					!p.name.toLowerCase().includes(term) &&
					!p.sku.toLowerCase().includes(term) &&
					!String(p.barcode).includes(term)
				)
					return false;
			}
			return true;
		})
		.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

// ─── get by id ──────────────────────────────────────────────────────────
export async function getProduct(id: string | number): Promise<Product | null> {
	if (API_MODE === 'http') {
		try {
			const raw = await httpFetch<BEProduct>(`/api/products/${id}`);
			return beToFe(unwrapOne<BEProduct>(raw));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	return all.find((p) => p.id === id) ?? null;
}

// ─── get by barcode (untuk scanner) ─────────────────────────────────────
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
	if (API_MODE === 'http') {
		try {
			const raw = await httpFetch<BEProduct>(`/api/products/barcode/${encodeURIComponent(barcode)}`);
			return beToFe(unwrapOne<BEProduct>(raw));
		} catch (e: any) {
			if (e?.status === 404) return null;
			throw e;
		}
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	return all.find((p) => String(p.barcode) === barcode && p.is_active) ?? null;
}

// ─── create / update / delete (gudang only) ─────────────────────────────
export interface CreateProductInput {
	name: string;
	price: number;
	price_buy?: number;
	category: string;
	category_id?: string;
	sku: string;
	barcode: string;
	stock: number;
	min_stock?: number;
	unit: string;
	image?: string;
	is_active?: boolean;
	supplier_id?: string;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
	if (API_MODE === 'http') {
		const body = {
			sku: input.sku,
			barcode: String(input.barcode),
			name: input.name,
			categoryId: input.category,
			supplierId: (input as any).supplier_id ?? '',
			purchasePrice: String(input.price_buy ?? 0),
			sellingPrice: String(input.price),
			stockMin: input.min_stock ?? 0,
			unit: input.unit,
			status: input.is_active ? 'aktif' : 'nonaktif'
		};
		const raw = await httpFetch<BEProduct>('/api/products/', {
			method: 'POST',
			body: JSON.stringify(body)
		});
		return beToFe(unwrapOne<BEProduct>(raw));
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const id = nextProductId();
	const next = { ...input, id } as Product;
	all.push(next);
	storage.set('products', all);
	return next;
}

export async function updateProduct(id: string | number, patch: Partial<Product>): Promise<Product> {
	if (API_MODE === 'http') {
		const body: any = {};
		if (patch.name) body.name = patch.name;
		if (patch.sku) body.sku = patch.sku;
		if (patch.barcode) body.barcode = String(patch.barcode);
		if (patch.price !== undefined) body.sellingPrice = String(patch.price);
		if (patch.price_buy !== undefined) body.purchasePrice = String(patch.price_buy);
		if (patch.min_stock !== undefined) body.stockMin = patch.min_stock;
		if (patch.is_active !== undefined) body.status = patch.is_active ? 'aktif' : 'nonaktif';
		if (patch.unit) body.unit = patch.unit;
		const raw = await httpFetch<BEProduct>(`/api/products/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(body)
		});
		return beToFe(unwrapOne<BEProduct>(raw));
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const idx = all.findIndex((p) => p.id === id);
	if (idx < 0) throw new Error('Product not found');
	all[idx] = { ...all[idx], ...patch };
	storage.set('products', all);
	return all[idx];
}

export async function deleteProduct(id: string | number): Promise<void> {
	if (API_MODE === 'http') {
		await httpFetch(`/api/products/${id}`, { method: 'DELETE' });
		return;
	}
	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const idx = all.findIndex((p) => p.id === id);
	if (idx < 0) return;
	all[idx].is_active = false; // soft delete
	storage.set('products', all);
}

// ─── restock (gudang) ───────────────────────────────────────────────────
export async function restock(productId: string | number, quantity: number, supplierId?: string): Promise<void> {
	if (API_MODE === 'http') {
		await httpFetch(`/api/products/${productId}/restock`, {
			method: 'POST',
			body: JSON.stringify({ quantity, supplierId })
		});
		return;
	}
	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const p = all.find((x) => x.id === productId);
	if (!p) throw new Error('Product not found');
	p.stock += quantity;
	storage.set('products', all);
}

// ─── updateStock (increment/decrement delta) ────────────────────────────
export async function updateStock(productId: string | number, delta: number): Promise<void> {
	if (API_MODE === 'http') {
		// BE: positive delta = restock, negative = adjustment
		if (delta > 0) {
			await httpFetch(`/api/products/${productId}/restock`, {
				method: 'POST',
				body: JSON.stringify({ quantity: delta })
			});
		} else {
			await httpFetch(`/api/inventory/adjust`, {
				method: 'POST',
				body: JSON.stringify({ productId, quantityDelta: delta })
			});
		}
		return;
	}
	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const p = all.find((x) => x.id === productId);
	if (!p) throw new Error('Product not found');
	p.stock = Math.max(0, p.stock + delta);
	storage.set('products', all);
}

// ─── deactivateProduct (soft delete) ────────────────────────────────────
export async function deactivateProduct(productId: string | number): Promise<void> {
	return deleteProduct(productId);
}

// ─── listCategories (BE belum ada — fallback localStorage) ──────────────
export interface Category {
	id: string;
	code: string;
	name: string;
	icon?: string;
	is_active: boolean;
}
export async function listCategories(): Promise<Category[]> {
	if (API_MODE === 'http') {
		// BE belum expose /api/categories (FE_HANDOFF §16)
		// Fallback: derive unique categories from product list
		const products = await listProducts({ limit: 1000 });
		const map = new Map<string, Category>();
		for (const p of products) {
			const cat = String(p.category);
			if (!map.has(cat)) {
				map.set(cat, {
					id: cat,
					code: cat.toLowerCase().replace(/\s+/g, '_'),
					name: cat,
					icon: undefined,
					is_active: true
				});
			}
		}
		return Array.from(map.values());
	}

	seedIfEmpty();
	await delay();
	return storage.get<Category[]>('categories', [
		{ id: 'minuman', code: 'minuman', name: 'Minuman', icon: '🥤', is_active: true },
		{ id: 'snack', code: 'snack', name: 'Snack', icon: '🍿', is_active: true },
		{ id: 'sembako', code: 'sembako', name: 'Sembako', icon: '🍚', is_active: true },
		{ id: 'frozen', code: 'frozen', name: 'Frozen', icon: '🧊', is_active: true },
		{ id: 'rokok', code: 'rokok', name: 'Rokok', icon: '🚬', is_active: true },
		{ id: 'lainnya', code: 'lainnya', name: 'Lainnya', icon: '📦', is_active: true }
	]);
}

// ─── Image upload (Fase F) ──────────────────────────────────────────────
// ProductImageMeta defined in types/domain.ts (single source of truth)
// Shape: { image_data, image_mime, image_size, image_width, image_height }

export async function setProductImage(productId: string | number, meta: ProductImageMeta): Promise<Product> {
	if (API_MODE === 'http') {
		// Convert base64 to Blob
		const res = await fetch(`data:${meta.image_mime};base64,${meta.image_data}`);
		const blob = await res.blob();
		const form = new FormData();
		form.append('file', blob, 'image.' + meta.image_mime.split('/')[1]);
		form.append('isPrimary', 'true');
		form.append('sortOrder', '0');
		const raw = await httpFetch<BEProduct>(`/api/products/${productId}/image`, {
			method: 'POST',
			body: form
		});
		return beToFe(unwrapOne<BEProduct>(raw));
	}

	// Mock: store base64 in image_data
	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const p = all.find((x) => x.id === productId);
	if (!p) throw new Error('Product not found');
	p.image_data = meta.image_data;
	p.image_mime = meta.image_mime;
	p.image_size = meta.image_size;
	p.image_width = meta.image_width;
	p.image_height = meta.image_height;
	p.image_updated_at = new Date().toISOString();
	storage.set('products', all);
	return p;
}

export async function removeProductImage(productId: string | number): Promise<Product> {
	if (API_MODE === 'http') {
		// BE: delete primary image. For simplicity, set to null via PATCH
		const raw = await httpFetch<BEProduct>(`/api/products/${productId}`, {
			method: 'PATCH',
			body: JSON.stringify({ imageUrl: null })
		});
		return beToFe(unwrapOne<BEProduct>(raw));
	}

	seedIfEmpty();
	await delay();
	const all = storage.get<Product[]>('products', []);
	const p = all.find((x) => x.id === productId);
	if (!p) throw new Error('Product not found');
	p.image_url = undefined;
	storage.set('products', all);
	return p;
}
