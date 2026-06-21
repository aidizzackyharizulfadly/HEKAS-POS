/**
 * GET/POST /api/proxy/[...path] — generic proxy ke backend.
 *
 * Untuk endpoint yang belum punya dedicated route. Production-grade
 * implementation harus ada di Wafiq ElysiaJS BE — ini cuma fallback.
 *
 * Usage:
 *   GET  /api/proxy/shifts        → BE GET /shifts
 *   POST /api/proxy/transactions  → BE POST /transactions
 */
import { json, error } from '@sveltejs/kit';
import { httpFetch as httpFetchRaw, API_MODE } from '$lib/api/http';
import type { RequestHandler } from './$types';

const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined;

export const GET: RequestHandler = async ({ params, url, request }) => {
	if (API_MODE === 'mock' || !RAW_BASE) {
		throw error(503, 'Backend not configured. Set VITE_API_BASE untuk enable proxy.');
	}
	const path = '/' + (params.path ?? '') + url.search;
	try {
		const data = await httpFetchRaw(path, {
			method: 'GET',
			headers: request.headers
		});
		return json(data as any);
	} catch (e) {
		throw error(502, `Upstream error: ${(e as Error).message}`);
	}
};

export const POST: RequestHandler = async ({ params, url, request }) => {
	if (API_MODE === 'mock' || !RAW_BASE) {
		throw error(503, 'Backend not configured.');
	}
	const path = '/' + (params.path ?? '') + url.search;
	const body = await request.text();
	try {
		const data = await httpFetchRaw(path, {
			method: request.method,
			headers: request.headers,
			body
		});
		return json(data as any);
	} catch (e) {
		throw error(502, `Upstream error: ${(e as Error).message}`);
	}
};
