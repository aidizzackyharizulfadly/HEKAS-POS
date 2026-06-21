<!--
  RoleShell — role-aware layout shell dengan Sidebar + TopBar.

  Dipakai oleh sub-route pages (seperti /kasir/order, /manager/penjualan, dll).
  Pages lama yang masih pakai inline UI (mis. /kasir/pos, /manager/beranda)
  tetap pakai layout pass-through — TIDAK pakai RoleShell.

  Usage (di +page.svelte):
    <RoleShell role="kasir" title="Order" user={currentUser}>
      ...content...
    </RoleShell>

  Props:
    role   — 'kasir' | 'manager' | 'gudang'
    title  — page title (TopBar)
    user   — current user { name, role }
    onlogout — callback for logout button
    children — page content (default slot)
-->
<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import TopBar from './TopBar.svelte';
	import { kasirMenu, gudangMenu, managerMenu, type MenuItem } from '$lib/auth/roles';
	import { page } from '$app/state';

	interface User {
		full_name: string;
		role?: string;
	}

	interface Props {
		role: 'kasir' | 'manager' | 'gudang';
		title?: string;
		subtitle?: string;
		user?: User | null;
		onlogout?: () => void;
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
	}

	let { role, title, subtitle, user = null, onlogout, children, actions }: Props = $props();

	const menuByRole: Record<string, MenuItem[]> = {
		kasir: kasirMenu,
		manager: managerMenu,
		gudang: gudangMenu
	};

	const menu = $derived(menuByRole[role] ?? []);
	const activePath = $derived(page.url.pathname);
</script>

<div class="flex h-screen overflow-hidden" style="background: #F0F4F8">
	<Sidebar {menu} {activePath} />
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<TopBar {title} {subtitle} {user} {role} {onlogout} {actions} />
		<main class="flex-1 overflow-y-auto">
			{#if children}{@render children()}{/if}
		</main>
	</div>
</div>
