/**
 * Generic validation helpers — input validation untuk forms.
 *
 * Dipakai oleh: LoginForm, MemberForm, POInputForm, PinDialog, dll.
 */

/** Hasil validasi: { valid: boolean, error?: string }. */
export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/** Gabungkan multiple validators (semua harus valid). */
export function composeValidators<T>(
	value: T,
	...validators: Array<(v: T) => ValidationResult>
): ValidationResult {
	for (const v of validators) {
		const r = v(value);
		if (!r.valid) return r;
	}
	return { valid: true };
}

/** Validator: required (tidak boleh kosong/nullable). */
export function required<T>(errorMsg = 'Field ini wajib diisi'): (v: T) => ValidationResult {
	return (v) => {
		if (v === null || v === undefined) return { valid: false, error: errorMsg };
		if (typeof v === 'string' && v.trim().length === 0) return { valid: false, error: errorMsg };
		if (Array.isArray(v) && v.length === 0) return { valid: false, error: errorMsg };
		return { valid: true };
	};
}

/** Validator: minimum length untuk string. */
export function minLength(min: number, errorMsg?: string): (v: string) => ValidationResult {
	return (v) => {
		const msg = errorMsg ?? `Minimal ${min} karakter`;
		if (typeof v !== 'string') return { valid: false, error: msg };
		return v.length >= min ? { valid: true } : { valid: false, error: msg };
	};
}

/** Validator: maximum length untuk string. */
export function maxLength(max: number, errorMsg?: string): (v: string) => ValidationResult {
	return (v) => {
		const msg = errorMsg ?? `Maksimal ${max} karakter`;
		if (typeof v !== 'string') return { valid: false, error: msg };
		return v.length <= max ? { valid: true } : { valid: false, error: msg };
	};
}

/** Validator: numeric range. */
export function numberRange(
	min: number,
	max: number,
	errorMsg?: string
): (v: number) => ValidationResult {
	return (v) => {
		const msg = errorMsg ?? `Nilai harus antara ${min} dan ${max}`;
		if (typeof v !== 'number' || isNaN(v)) return { valid: false, error: msg };
		return v >= min && v <= max ? { valid: true } : { valid: false, error: msg };
	};
}

/** Validator: positive number (> 0). */
export function positiveNumber(errorMsg = 'Harus lebih dari 0'): (v: number) => ValidationResult {
	return (v) => {
		if (typeof v !== 'number' || isNaN(v)) return { valid: false, error: errorMsg };
		return v > 0 ? { valid: true } : { valid: false, error: errorMsg };
	};
}

/** Validator: non-negative number (>= 0). */
export function nonNegativeNumber(errorMsg = 'Tidak boleh negatif'): (v: number) => ValidationResult {
	return (v) => {
		if (typeof v !== 'number' || isNaN(v)) return { valid: false, error: errorMsg };
		return v >= 0 ? { valid: true } : { valid: false, error: errorMsg };
	};
}

/** Validator: regex pattern (e.g. email, phone). */
export function pattern(
	regex: RegExp,
	errorMsg = 'Format tidak valid'
): (v: string) => ValidationResult {
	return (v) => {
		if (typeof v !== 'string') return { valid: false, error: errorMsg };
		return regex.test(v) ? { valid: true } : { valid: false, error: errorMsg };
	};
}

/** Common regex patterns. */
export const PATTERNS = {
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	phoneId: /^(\+62|62|0)8[0-9]{8,11}$/,
	numeric: /^[0-9]+$/,
	alphabetic: /^[a-zA-Z\s]+$/,
	alphanumeric: /^[a-zA-Z0-9]+$/,
	username: /^[a-zA-Z0-9_]{3,20}$/,
	pin6Digit: /^[0-9]{6}$/,
	skuFormat: /^[A-Z0-9-]{3,20}$/i
} as const;

/** Validator: matches one of allowed values. */
export function oneOf<T>(
	allowed: readonly T[],
	errorMsg?: string
): (v: T) => ValidationResult {
	return (v) => {
		const msg = errorMsg ?? `Harus salah satu dari: ${allowed.join(', ')}`;
		return allowed.includes(v) ? { valid: true } : { valid: false, error: msg };
	};
}

/** Validator: future date (untuk scheduled events). */
export function isFutureDate(d: Date | string): boolean {
	try {
		const date = d instanceof Date ? d : new Date(d);
		return date.getTime() > Date.now();
	} catch {
		return false;
	}
}

/** Validator: past date. */
export function isPastDate(d: Date | string): boolean {
	try {
		const date = d instanceof Date ? d : new Date(d);
		return date.getTime() < Date.now();
	} catch {
		return false;
	}
}

/** Sanitize string input (trim + collapse whitespace). */
export function sanitizeString(input: string): string {
	if (typeof input !== 'string') return '';
	return input.trim().replace(/\s+/g, ' ');
}

/** Clamp number ke [min, max]. */
export function clampNumber(value: number, min: number, max: number): number {
	if (typeof value !== 'number' || isNaN(value)) return min;
	return Math.min(Math.max(value, min), max);
}

/** Round ke nearest integer (banker's rounding untuk .5). */
export function roundHalf(num: number): number {
	if (typeof num !== 'number' || isNaN(num)) return 0;
	return Math.round(num);
}
