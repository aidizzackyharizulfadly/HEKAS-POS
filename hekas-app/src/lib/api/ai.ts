/**
 * AI Assistant API.
 *
 * Endpoints (FE_HANDOFF v2.0.0):
 *   POST /api/ai/chat           — kirim prompt, dapat response
 *   GET  /api/ai/activity       — recent AI actions log
 *   GET  /api/ai/insights       — proactive insights
 *   GET  /api/ai/control        — toggle settings
 *   PATCH /api/ai/control       — update setting
 */
import { httpFetch as http, API_MODE } from './http';

export interface AIChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	actions?: Array<{ type: string; payload: unknown }>;
}

export interface AIActivity {
	id: string;
	type: 'chat' | 'insight' | 'action' | 'alert';
	title: string;
	description: string;
	timestamp: number;
	severity?: 'info' | 'warning' | 'critical';
}

export interface AIInsight {
	id: string;
	category: 'sales' | 'inventory' | 'staff' | 'customer' | 'finance';
	title: string;
	description: string;
	recommendation?: string;
	impact?: 'low' | 'medium' | 'high';
	generatedAt: number;
}

export interface AIControl {
	enabled: boolean;
	autoInsights: boolean;
	proactiveAlerts: boolean;
	dailySummary: boolean;
	language: 'id' | 'en';
	tone: 'formal' | 'casual' | 'friendly';
}

export async function chat(messages: AIChatMessage[]): Promise<AIChatMessage> {
	if (API_MODE === 'http')
		return http<AIChatMessage>('/api/ai/chat', { method: 'POST', body: JSON.stringify({ messages }) });
	// Mock echo response
	const last = messages[messages.length - 1];
	return {
		id: crypto.randomUUID(),
		role: 'assistant',
		content: `[Mock AI] Anda bertanya: "${last?.content ?? ''}". Integrasi BE akan memberikan jawaban real.`,
		timestamp: Date.now()
	};
}

export async function getActivity(limit: number = 20): Promise<AIActivity[]> {
	if (API_MODE === 'http') return http<AIActivity[]>(`/api/ai/activity?limit=${limit}`);
	return [];
}

export async function getInsights(category?: AIInsight['category']): Promise<AIInsight[]> {
	if (API_MODE === 'http') {
		const q = category ? `?category=${category}` : '';
		return http<AIInsight[]>(`/api/ai/insights${q}`);
	}
	return [];
}

export async function getControl(): Promise<AIControl> {
	if (API_MODE === 'http') return http<AIControl>('/api/ai/control');
	return {
		enabled: true,
		autoInsights: true,
		proactiveAlerts: true,
		dailySummary: false,
		language: 'id',
		tone: 'friendly'
	};
}

export async function updateControl(patch: Partial<AIControl>): Promise<AIControl> {
	if (API_MODE === 'http')
		return http<AIControl>('/api/ai/control', { method: 'PATCH', body: JSON.stringify(patch) });
	const current = await getControl();
	return { ...current, ...patch };
}
