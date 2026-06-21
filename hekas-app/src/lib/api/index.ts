/**
 * Barrel file — convenience re-exports.
 *
 * Mempermudah import dari `$lib/api` (single namespace) sambil
 * tetap mempertahankan granular file structure di belakang.
 * Bisa di-hapus saat consumers sudah migrasi ke direct imports.
 *
 * Usage:
 *   import { products, members, transactions, TIER_CONFIG } from '$lib/api';
 */

import * as products from './products.js';
import * as members from './members.js';
import * as transactions from './transactions.js';
import * as analytics from './analytics.js';
import * as auth from './auth.js';

export { products, members, transactions, analytics, auth };
export const api = { products, members, transactions, analytics, auth };

// Re-export types & constants
export * from '../types/api.js';
export { TIER_CONFIG } from '../types/domain.js';
export type { PaymentMethod, PaymentMethodKind } from '../utils/payment.js';
