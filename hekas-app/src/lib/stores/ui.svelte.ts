/**
 * UI store — global UI state (sidebar collapse, modal, theme, dll).
 */
import type { ModalState } from '$lib/types/domain';

class UIStore {
	sidebarOpen = $state(true);
	activeModal = $state<ModalState>('none');
	theme = $state<'light' | 'dark' | 'auto'>('light');
	soundEnabled = $state(true);

	toggleSidebar(): void {
		this.sidebarOpen = !this.sidebarOpen;
	}

	setSidebar(open: boolean): void {
		this.sidebarOpen = open;
	}

	openModal(modal: ModalState): void {
		this.activeModal = modal;
	}

	closeModal(): void {
		this.activeModal = 'none';
	}

	setTheme(theme: 'light' | 'dark' | 'auto'): void {
		this.theme = theme;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('hekas:theme', theme);
		}
		this.applyTheme();
	}

	toggleTheme(): void {
		const next = this.theme === 'light' ? 'dark' : 'light';
		this.setTheme(next);
	}

	toggleSound(): void {
		this.soundEnabled = !this.soundEnabled;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('hekas:sound', String(this.soundEnabled));
		}
	}

	applyTheme(): void {
		if (typeof document === 'undefined') return;
		const root = document.documentElement;
		const isDark =
			this.theme === 'dark' ||
			(this.theme === 'auto' &&
				window.matchMedia?.('(prefers-color-scheme: dark)').matches);
		root.classList.toggle('dark', isDark);
	}

	loadFromStorage(): void {
		if (typeof localStorage === 'undefined') return;
		const t = localStorage.getItem('hekas:theme');
		if (t === 'light' || t === 'dark' || t === 'auto') this.theme = t;
		const s = localStorage.getItem('hekas:sound');
		if (s !== null) this.soundEnabled = s === 'true';
	}
}

export const ui = new UIStore();
