/**
 * Kasir route group — no-op load placeholder.
 *
 * Akan berisi RBAC guard:
 * - Cek locals.user
 * - Redirect ke /login jika belum auth
 * - Redirect ke role home jika role tidak sesuai
 *
 * Untuk sekarang kosong sampai backend integration siap.
 */
export const prerender = false;
