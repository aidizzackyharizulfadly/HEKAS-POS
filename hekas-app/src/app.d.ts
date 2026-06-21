/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Backend API base URL. Kosongkan untuk localStorage mock mode. */
	readonly VITE_API_BASE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string;
				username: string;
				role: 'kasir' | 'gudang' | 'manager' | 'admin_gudang';
				fullName?: string;
				outletId?: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
