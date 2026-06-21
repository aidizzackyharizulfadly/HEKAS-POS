/**
 * String manipulation helpers — formatting, sanitizing, masking.
 *
 * Pure functions, no DOM access. Semua return string baru (immutable).
 * Dipakai di banyak component untuk display + form input.
 */

/**
 * Potong string dengan suffix jika melebihi maxLength.
 * - "Halo dunia" + maxLength=10 + suffix="…" → "Halo du…"
 * - whitespace di akhir dibuang sebelum suffix ditambahkan.
 * - maxLength adalah panjang HASIL AKHIR (termasuk suffix).
 * - jika maxLength <= suffix.length, return suffix saja.
 */
export function truncate(s: string, maxLength: number, suffix = '…'): string {
	if (typeof s !== 'string') return '';
	const sufLen = suffix.length;
	if (maxLength <= 0) return '';
	if (maxLength <= sufLen) return suffix;
	if (s.length <= maxLength) return s;
	const contentLen = maxLength - sufLen;
	const trimmed = s.slice(0, contentLen).trimEnd();
	return trimmed + suffix;
}

/**
 * Buat URL-friendly slug dari string.
 * - "Beras Cap Ayam 5kg!" → "beras-cap-ayam-5kg"
 * - lowercase, replace non-alphanumeric dengan "-"
 * - collapse multiple "-", trim di awal/akhir.
 */
export function slugify(s: string): string {
	if (typeof s !== 'string') return '';
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '') // strip combining marks (diacritics)
		.replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
		.replace(/\s+/g, '-') // spaces → "-"
		.replace(/-+/g, '-') // collapse multiple "-"
		.replace(/^-+|-+$/g, ''); // trim leading/trailing "-"
}

/**
 * Capitalize huruf pertama, sisanya lowercase.
 * - "halo" → "Halo"
 * - "halo dunia" → "Halo dunia" (word pertama saja)
 * - "" → ""
 */
export function capitalize(s: string): string {
	if (typeof s !== 'string' || s.length === 0) return '';
	return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Title-case: capitalize setiap kata yang dipisah whitespace.
 * - "halo dunia" → "Halo Dunia"
 */
export function titleCase(s: string): string {
	if (typeof s !== 'string') return '';
	return s
		.toLowerCase()
		.split(/\s+/)
		.filter((w) => w.length > 0)
		.map(capitalize)
		.join(' ');
}

/**
 * Mask data sensitif — tampilkan sebagian awal/akhir, sembunyikan tengah.
 * - maskPhone("081234567890") → "0812-****-7890"
 * - maskEmail("user@example.com") → "us****@example.com"
 * - maskGeneric("1234567890", 2, 2) → "12****90"
 */
export function maskPhone(phone: string): string {
	const cleaned = (phone ?? '').replace(/\D/g, '');
	if (cleaned.length < 8) return cleaned; // too short, no mask
	if (cleaned.length <= 10) {
		// 0812-3456-7890 → 0812-****-7890
		return `${cleaned.slice(0, 4)}-****-${cleaned.slice(-4)}`;
	}
	// 13+ digit → mask middle 4
	return `${cleaned.slice(0, 4)}-****-${cleaned.slice(-4)}`;
}

export function maskEmail(email: string): string {
	if (!email || typeof email !== 'string') return '';
	const at = email.indexOf('@');
	if (at < 1) return email;
	const local = email.slice(0, at);
	const domain = email.slice(at);
	if (local.length <= 2) return `${'*'.repeat(local.length)}${domain}`;
	return `${local.slice(0, 2)}${'*'.repeat(Math.max(2, local.length - 2))}${domain}`;
}

/**
 * Generic mask: keep `keepStart` chars di awal dan `keepEnd` chars di akhir,
 * sisanya diganti dengan `maskChar`. Default: "****".
 */
export function maskGeneric(s: string, keepStart = 0, keepEnd = 0, maskChar = '*'): string {
	if (typeof s !== 'string' || s.length === 0) return '';
	if (keepStart + keepEnd >= s.length) return s;
	const mid = s.slice(keepStart, s.length - keepEnd);
	const masked = maskChar.repeat(Math.max(0, mid.length));
	return s.slice(0, keepStart) + masked + s.slice(s.length - keepEnd);
}

/**
 * Strip HTML tags dari string. Untuk sanitize input/paste dari rich text.
 * - "<b>Halo</b>" → "Halo"
 * - "<script>alert(1)</script>" → "alert(1)" (text content only)
 */
export function stripHtml(html: string): string {
	if (typeof html !== 'string') return '';
	return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Inisial dari nama. "Budi Setiawan" → "BS", "Siti" → "S".
 * Maximum 3 inisial.
 */
export function initials(name: string, max = 2): string {
	if (typeof name !== 'string') return '';
	const words = name
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0);
	if (words.length === 0) return '';
	return words
		.slice(0, max)
		.map((w) => w.charAt(0).toUpperCase())
		.join('');
}

/**
 * Format string dari template + replacements.
 * - template("Halo {name}, total {total}", { name: "Budi", total: 50000 })
 *   → "Halo Budi, total 50000"
 * - Key hilang → tetap di template (debug-friendly).
 */
export function template(str: string, replacements: Record<string, string | number>): string {
	if (typeof str !== 'string') return '';
	return str.replace(/\{(\w+)\}/g, (match, key: string) => {
		const v = replacements[key];
		return v === undefined || v === null ? match : String(v);
	});
}

/**
 * Normalize whitespace: collapse multiple spaces/newlines jadi single space.
 * - "halo   dunia\n\n!" → "halo dunia !"
 */
export function normalizeWhitespace(s: string): string {
	if (typeof s !== 'string') return '';
	return s.replace(/\s+/g, ' ').trim();
}

/**
 * Escape HTML entities untuk safe rendering.
 * - "<script>" → "&lt;script&gt;"
 */
export function escapeHtml(s: string): string {
	if (typeof s !== 'string') return '';
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Pad string ke kiri dengan char sampai panjang tertentu.
 * - padStart("5", 3, "0") → "005"
 */
export function padStart(s: string | number, length: number, char = ' '): string {
	const str = String(s ?? '');
	return str.length >= length ? str : char.repeat(length - str.length) + str;
}

/**
 * Pad string ke kanan dengan char sampai panjang tertentu.
 */
export function padEnd(s: string | number, length: number, char = ' '): string {
	const str = String(s ?? '');
	return str.length >= length ? str : str + char.repeat(length - str.length);
}
