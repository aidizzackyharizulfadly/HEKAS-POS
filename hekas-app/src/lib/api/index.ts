/**
 * Barrel file — convenience re-exports.
 *
 * Mempermudah import dari `$lib/api` (single namespace) sambil
 * tetap mempertahankan granular file structure di belakang.
 * Bisa di-hapus saat consumers sudah migrasi ke direct imports.
 *
 * Usage:
 *   import { products, members, orders, analytics, auth, http, TIER_CONFIG } from '$lib/api';
 */

import * as products from './products.js';
import * as members from './members.js';
import * as orders from './orders.js';
import * as analytics from './analytics.js';
import * as auth from './auth.js';
import * as http from './client.js';
import * as shifts from './shifts.js';
import * as inventory from './inventory.js';
import * as suratJalan from './surat-jalan.js';
import * as employees from './employees.js';
import * as reports from './reports.js';
import * as dashboard from './dashboard.js';
import * as ai from './ai.js';
import * as telegram from './telegram.js';
import * as settings from './settings.js';

export {
	products,
	members,
	orders,
	analytics,
	auth,
	http,
	shifts,
	inventory,
	suratJalan,
	employees,
	reports,
	dashboard,
	ai,
	telegram,
	settings
};
export const api = {
	products,
	members,
	orders,
	analytics,
	auth,
	http,
	shifts,
	inventory,
	suratJalan,
	employees,
	reports,
	dashboard,
	ai,
	telegram,
	settings
};

// Re-export types & constants
export * from '../types/api.js';
export { TIER_CONFIG } from '../types/domain.js';
export type { PaymentMethod, PaymentMethodKind } from '../utils/payment.js';
