// HEKAS POS — API: Orders (alias untuk transactions.ts)
//
// Wafiq BE pakai path `/api/orders/*`, FE codebase pakai nama `transactions`.
// File ini adalah rename alias — semua logic ada di transactions.ts.
// Re-export public API biar import bisa `from '$lib/api/orders'`.
//
// Expose BOTH old names (transactions.*) + new names (orders.*) untuk
// backward-compat dengan consumer code.

import * as tx from './transactions.js';

export const checkout = tx.checkout;
export const holdTransaction = tx.holdTransaction;
export const holdOrder = tx.holdTransaction;
export const recallHeld = tx.recallHeld;
export const recallHeldOrder = tx.recallHeld;
export const listTransactions = tx.listTransactions;
export const listOrders = tx.listTransactions;
export const getTransaction = tx.getTransaction;
export const getOrder = tx.getTransaction;
export const voidTransaction = tx.voidTransaction;
export const voidOrder = tx.voidTransaction;
export const listHeld = tx.listHeld;
export const listHeldOrders = tx.listHeld;
export const getClosingReport = tx.getClosingReport;

export type ListTxFilter = tx.ListTxFilter;
export type ListOrderFilter = tx.ListTxFilter;
export type HoldInput = tx.HoldInput;
export type HoldOrderInput = tx.HoldInput;
