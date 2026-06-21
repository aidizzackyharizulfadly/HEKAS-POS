/**
 * Pure helpers untuk gudang flow components
 * (PickingProcess, POVerification, POInputForm).
 */

export interface PickItem {
	productId: number;
	productName: string;
	sku: string;
	qty: number;
	picked: number;
	location?: string;
}

/** Total unit yang harus di-pick vs sudah di-pick. */
export function pickingProgress(items: PickItem[]): {
	picked: number;
	total: number;
	pct: number;
	isComplete: boolean;
} {
	if (!Array.isArray(items) || items.length === 0) {
		return { picked: 0, total: 0, pct: 0, isComplete: false };
	}
	const total = items.reduce((s, it) => s + it.qty, 0);
	const picked = items.reduce((s, it) => s + it.picked, 0);
	const pct = total > 0 ? Math.round((picked / total) * 100) : 0;
	const isComplete = items.every((it) => it.picked >= it.qty);
	return { picked, total, pct, isComplete };
}

/** Deteksi barcode cocok dengan SKU produk. */
export function isBarcodeMatch(scannedCode: string, expectedSku: string): boolean {
	return scannedCode.trim() === expectedSku.trim();
}

/** Current item remaining qty to pick. */
export function pickRemaining(item: PickItem): number {
	return Math.max(0, item.qty - item.picked);
}

/** Short-pick: picked > qty (lebih dari target). */
export function pickOvershoot(item: PickItem): number {
	return Math.max(0, item.picked - item.qty);
}

// =============== PO Verification ===============

export interface POVerifyItem {
	productId: number;
	productName: string;
	qty: number;
	receivedQty: number;
}

export interface POVerifySummary {
	ordered: number;
	received: number;
	variance: number;
	discrepancies: number;
	isFullyReceived: boolean;
}

/** Hitung ringkasan verifikasi PO. */
export function poVerifySummary(items: POVerifyItem[]): POVerifySummary {
	if (!Array.isArray(items) || items.length === 0) {
		return { ordered: 0, received: 0, variance: 0, discrepancies: 0, isFullyReceived: false };
	}
	const ordered = items.reduce((s, it) => s + it.qty, 0);
	const received = items.reduce((s, it) => s + it.receivedQty, 0);
	const variance = received - ordered;
	const discrepancies = items.filter((it) => it.receivedQty !== it.qty).length;
	const isFullyReceived = items.every((it) => it.receivedQty >= it.qty);
	return { ordered, received, variance, discrepancies, isFullyReceived };
}

/** Accept all = set receivedQty = qty untuk semua item. */
export function poAcceptAllOrdered(items: POVerifyItem[]): POVerifyItem[] {
	return items.map((it) => ({ ...it, receivedQty: it.qty }));
}

/** Reset semua receivedQty ke 0. */
export function poClearReceived(items: POVerifyItem[]): POVerifyItem[] {
	return items.map((it) => ({ ...it, receivedQty: 0 }));
}

/** Variance per-item. */
export function poVariance(item: POVerifyItem): number {
	return item.receivedQty - item.qty;
}

// =============== PO Input Form ===============

export interface POInputItem {
	productId: number;
	qty: number;
}

export interface POInputValidation {
	validItems: POInputItem[];
	distinctProducts: number;
	hasDuplicates: boolean;
	totalUnits: number;
}

/** Validasi dan normalisasi items PO. */
export function validatePOItems(items: POInputItem[]): POInputValidation {
	const validItems = items.filter((it) => it.productId > 0 && it.qty > 0);
	const distinctProducts = new Set(validItems.map((it) => it.productId)).size;
	const hasDuplicates = distinctProducts < validItems.length;
	const totalUnits = validItems.reduce((s, it) => s + it.qty, 0);
	return { validItems, distinctProducts, hasDuplicates, totalUnits };
}

/** Agregat qty untuk produk duplikat (jika ada). */
export function aggregatePOItems(items: POInputItem[]): POInputItem[] {
	const map = new Map<number, number>();
	for (const it of items) {
		if (it.productId > 0 && it.qty > 0) {
			map.set(it.productId, (map.get(it.productId) ?? 0) + it.qty);
		}
	}
	return Array.from(map.entries()).map(([productId, qty]) => ({ productId, qty }));
}

/** Default expected date = +N days dari hari ini. */
export function defaultExpectedDate(daysAhead = 7): string {
	const d = new Date();
	d.setDate(d.getDate() + daysAhead);
	return d.toISOString().slice(0, 10);
}
