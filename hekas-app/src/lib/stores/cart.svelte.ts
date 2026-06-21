/**
 * Cart store — kasir cart state (rune-based).
 *
 * TODO R4: Migrate dari kasir/+page.svelte (2,257 LOC) ke sini.
 * Untuk sekarang, ini adalah skeleton yang siap dipakai.
 */
import type { CartItem, Product, Member, PaymentMethod } from '$lib/types/domain';

class CartStore {
	items = $state<CartItem[]>([]);
	member = $state<Member | null>(null);
	globalDiscount = $state(0);
	payments = $state<PaymentMethod[]>([]);

	subtotal = $derived(
		this.items.reduce((sum, item) => sum + item.price * item.qty, 0)
	);

	itemDiscountTotal = $derived(
		this.items.reduce((sum, item) => sum + item.disc, 0)
	);

	total = $derived(
		Math.max(0, this.subtotal - this.itemDiscountTotal - this.globalDiscount)
	);

	itemCount = $derived(this.items.reduce((sum, item) => sum + item.qty, 0));

	paidTotal = $derived(this.payments.reduce((sum, p) => sum + p.amount, 0));
	remaining = $derived(Math.max(0, this.total - this.paidTotal));

	addProduct(product: Product): void {
		const existing = this.items.find((i) => i.id === product.id);
		if (existing) {
			existing.qty += 1;
		} else {
			this.items.push({
				...product,
				qty: 1,
				disc: 0
			});
		}
	}

	setQty(productId: number, qty: number): void {
		if (qty <= 0) {
			this.remove(productId);
			return;
		}
		const item = this.items.find((i) => i.id === productId);
		if (item) item.qty = qty;
	}

	remove(productId: number): void {
		this.items = this.items.filter((i) => i.id !== productId);
	}

	setItemDiscount(productId: number, disc: number): void {
		const item = this.items.find((i) => i.id === productId);
		if (item) item.disc = Math.max(0, disc);
	}

	setGlobalDiscount(value: number): void {
		this.globalDiscount = Math.max(0, value);
	}

	attachMember(member: Member | null): void {
		this.member = member;
	}

	addPayment(payment: PaymentMethod): void {
		this.payments.push(payment);
	}

	removePayment(paymentId: string): void {
		this.payments = this.payments.filter((p) => p.id !== paymentId);
	}

	clear(): void {
		this.items = [];
		this.member = null;
		this.globalDiscount = 0;
		this.payments = [];
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}
}

export const cart = new CartStore();
