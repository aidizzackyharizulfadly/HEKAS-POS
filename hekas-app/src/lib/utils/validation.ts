/**
 * Common validation helpers.
 *
 * NOTE: Untuk validasi form yang lebih lengkap (zod-style),
 * install zod dan extend schema di sini. Saat ini pakai
 * simple predicate functions yang return { valid, error }.
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/** Validate Indonesian phone: 08xx atau +62xx. */
export function validatePhone(phone: string): ValidationResult {
	const cleaned = phone.replace(/[\s-]/g, '');
	if (cleaned.length < 9) return { valid: false, error: 'Nomor HP terlalu pendek' };
	if (cleaned.length > 15) return { valid: false, error: 'Nomor HP terlalu panjang' };
	if (!/^(\+62|62|0)8[0-9]{8,11}$/.test(cleaned)) {
		return { valid: false, error: 'Format nomor HP tidak valid' };
	}
	return { valid: true };
}

/** Validate email (basic). Empty string treated as valid (optional). */
export function validateEmail(email: string): ValidationResult {
	if (!email || email.trim() === '') return { valid: true };
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return { valid: false, error: 'Format email tidak valid' };
	}
	return { valid: true };
}

/** Validate kasir PIN: 4-6 digit angka. */
export function validatePin(pin: string): ValidationResult {
	if (!/^\d{4,6}$/.test(pin)) return { valid: false, error: 'PIN harus 4-6 digit angka' };
	return { valid: true };
}

/** Validate username: 3-32 char alphanumeric + underscore. */
export function validateUsername(username: string): ValidationResult {
	if (username.length < 3) return { valid: false, error: 'Username minimal 3 karakter' };
	if (username.length > 32) return { valid: false, error: 'Username maksimal 32 karakter' };
	if (!/^[a-zA-Z0-9_]+$/.test(username)) {
		return { valid: false, error: 'Username hanya boleh huruf, angka, underscore' };
	}
	return { valid: true };
}

/** Validate password: minimal 6 karakter. */
export function validatePassword(password: string): ValidationResult {
	if (password.length < 6) return { valid: false, error: 'Password minimal 6 karakter' };
	if (password.length > 128) return { valid: false, error: 'Password maksimal 128 karakter' };
	return { valid: true };
}

/** Validate SKU: alphanumeric + dash, 1-64 char. */
export function validateSku(sku: string): ValidationResult {
	if (sku.length < 1) return { valid: false, error: 'SKU wajib diisi' };
	if (sku.length > 64) return { valid: false, error: 'SKU maksimal 64 karakter' };
	if (!/^[A-Z0-9-]+$/i.test(sku)) {
		return { valid: false, error: 'SKU hanya boleh huruf, angka, dash' };
	}
	return { valid: true };
}

/** Validate barcode: 8-14 digit. */
export function validateBarcode(barcode: string): ValidationResult {
	if (barcode.length < 8) return { valid: false, error: 'Barcode minimal 8 digit' };
	if (barcode.length > 14) return { valid: false, error: 'Barcode maksimal 14 digit' };
	if (!/^\d+$/.test(barcode)) return { valid: false, error: 'Barcode hanya boleh angka' };
	return { valid: true };
}

/** Validate positive number (untuk harga, nominal). */
export function validatePositiveNumber(value: number, label = 'Nilai'): ValidationResult {
	if (!Number.isFinite(value)) return { valid: false, error: `${label} harus angka` };
	if (value <= 0) return { valid: false, error: `${label} harus lebih dari 0` };
	return { valid: true };
}

/** Validate non-negative number. */
export function validateNonNegativeNumber(value: number, label = 'Nilai'): ValidationResult {
	if (!Number.isFinite(value)) return { valid: false, error: `${label} harus angka` };
	if (value < 0) return { valid: false, error: `${label} tidak boleh negatif` };
	return { valid: true };
}

/** Validate positive integer. */
export function validatePositiveInt(value: number, label = 'Nilai'): ValidationResult {
	if (!Number.isInteger(value)) return { valid: false, error: `${label} harus bilangan bulat` };
	return validatePositiveNumber(value, label);
}

/** Validate required string (not empty). */
export function validateRequired(value: string | null | undefined, label = 'Field'): ValidationResult {
	if (value === null || value === undefined || value.trim() === '') {
		return { valid: false, error: `${label} wajib diisi` };
	}
	return { valid: true };
}

/** Compose multiple validators, return first error. */
export function validateAll(
	...validators: ValidationResult[]
): ValidationResult {
	for (const v of validators) {
		if (!v.valid) return v;
	}
	return { valid: true };
}
