/**
 * GET /api/health — health check endpoint.
 * Return app status, version, uptime, mode.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const STARTED_AT = Date.now();

export const GET: RequestHandler = async () => {
	return json({
		ok: true,
		app: 'hekas-pos',
		version: '0.0.1',
		uptime_ms: Date.now() - STARTED_AT,
		timestamp: new Date().toISOString()
	});
};
