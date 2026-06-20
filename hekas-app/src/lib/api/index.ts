// HEKAS POS — API facade
// Import dari '$lib/api' instead of file langsung, supaya gampang di-swap
// ke real backend nanti (tinggal ganti implementasinya).
//
// Contoh:
//   import { api } from '$lib/api';
//   const products = await api.products.list();

import * as products from './products.js';
import * as members from './members.js';
import * as transactions from './transactions.js';
import * as analytics from './analytics.js';
import * as auth from './auth.js';

export { products, members, transactions, analytics, auth };
export * from './types.js';
export type { ClosingReport, ClosingReportFilter } from './transactions.js';
export type { MemberStats, AdjustPointsInput, UpdateMemberInput } from './members.js';
export { seedIfEmpty, storage } from './storage.js';

// Grouped namespace untuk import yang lebih ergonomis:
//   const list = await api.products.list();
//   const tx = await api.transactions.checkout({ ... });
export const api = {
  products,
  members,
  transactions,
  analytics,
  auth,
};
