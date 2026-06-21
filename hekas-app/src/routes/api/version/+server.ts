/**
 * GET /api/version — return current app version + build info.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		app: 'hekas-pos',
		version: '0.0.1',
		api_version: 'v1',
		features: ['shifts', 'inventory', 'surat-jalan', 'employees', 'reports', 'ai', 'telegram', 'settings'],
		schema_version: 1
	});
};
