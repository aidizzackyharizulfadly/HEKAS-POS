/**
 * Notifications store — toast/notification state (rune-based).
 *
 * TIDAK untuk push notification. Hanya in-app toast UI feedback.
 *
 * Usage:
 *   import { notifications } from '$lib/stores/notifications.svelte';
 *   notifications.success('Transaksi berhasil');
 *   notifications.error('Stok tidak cukup');
 */
import type { Toast, ToastType } from '$lib/types/ui';

class NotificationStore {
	toasts = $state<Toast[]>([]);
	private counter = 0;

	show(message: string, type: ToastType = 'info', duration = 3000): number {
		const id = ++this.counter;
		this.toasts.push({ id, type, message, duration });
		if (duration > 0) {
			setTimeout(() => this.dismiss(id), duration);
		}
		return id;
	}

	success(message: string, duration?: number): number {
		return this.show(message, 'success', duration);
	}

	error(message: string, duration?: number): number {
		return this.show(message, 'error', duration ?? 5000);
	}

	info(message: string, duration?: number): number {
		return this.show(message, 'info', duration);
	}

	warning(message: string, duration?: number): number {
		return this.show(message, 'warning', duration ?? 4000);
	}

	dismiss(id: number): void {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	clear(): void {
		this.toasts = [];
	}
}

export const notifications = new NotificationStore();
