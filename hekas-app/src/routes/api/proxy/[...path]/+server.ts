/**
 * /api/proxy/[...path] — generic proxy ke backend (semua HTTP methods).
 *
 * Production-grade implementation ada di Wafiq ElysiaJS BE — ini fallback.
 *
 * Usage:
 *   GET    /api/proxy/shifts        → BE GET    /shifts
 *   POST   /api/proxy/transactions  → BE POST   /transactions
 *   PATCH  /api/proxy/products/123  → BE PATCH  /products/123
 *   DELETE /api/proxy/products/123  → BE DELETE /products/123
 */
import { json, error } from '@sveltejs/kit';
import { httpFetch as httpFetchRaw, API_MODE } from '$lib/api/client';
import type { RequestHandler } from './$types';

const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined;

/** Shared proxy logic — forward request ke upstream BE. */
async function proxyRequest(
	method: string,
	paramsPath: string,
	urlSearch: string,
	request: Request
): Promise<Response> {
	if (API_MODE === 'mock' || !RAW_BASE) {
		throw error(503, 'Backend not configured. Set VITE_API_BASE untuk enable proxy.');
	}
	const path = '/' + (paramsPath ?? '') + urlSearch;
	try {
		const opts: RequestInit & { headers: HeadersInit } = {
			method,
			headers: request.headers
		};
		// Attach body untuk methods yang support body
		if (method !== 'GET' && method !== 'HEAD') {
			opts.body = await request.text();
		}
		const data = await httpFetchRaw(path, opts);
		return json(data as any);
	} catch (e) {
		throw error(502, `Upstream error: ${(e as Error).message}`);
	}
}

export const GET: RequestHandler = ({ params, url, request }) =>
	proxyRequest('GET', params.path ?? '', url.search, request);

export const POST: RequestHandler = ({ params, url, request }) =>
	proxyRequest('POST', params.path ?? '', url.search, request);

export const PUT: RequestHandler = ({ params, url, request }) =>
	proxyRequest('PUT', params.path ?? '', url.search, request);

export const PATCH: RequestHandler = ({ params, url, request }) =>
	proxyRequest('PATCH', params.path ?? '', url.search, request);

export const DELETE: RequestHandler = ({ params, url, request }) =>
	proxyRequest('DELETE', params.path ?? '', url.search, request);
