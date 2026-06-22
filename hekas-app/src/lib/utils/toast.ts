/**
 * Toast helpers — thin wrappers around svelte-sonner untuk API ergonomics.
 *
 * Usage:
 *   import { showError, showSuccess, showWarning, showInfo } from '$lib/utils/toast';
 *   showError('Gagal menyimpan', error.message);
 *   showSuccess('Produk berhasil ditambahkan');
 *
 * svelte-sonner exports: toast, toast.success, toast.error, toast.warning, toast.info, toast.loading
 */

import { toast } from 'svelte-sonner';

export function showSuccess(message: string, description?: string) {
	if (description) {
		toast.success(message, { description });
	} else {
		toast.success(message);
	}
}

export function showError(message: string, description?: string) {
	if (description) {
		toast.error(message, { description });
	} else {
		toast.error(message);
	}
}

export function showWarning(message: string, description?: string) {
	if (description) {
		toast.warning(message, { description });
	} else {
		toast.warning(message);
	}
}

export function showInfo(message: string, description?: string) {
	if (description) {
		toast.info(message, { description });
	} else {
		toast.info(message);
	}
}

export function showLoading(message: string) {
	return toast.loading(message);
}

export function dismissToast(id: string | number) {
	toast.dismiss(id);
}