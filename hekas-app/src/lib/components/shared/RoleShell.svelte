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
    subtitle  — page subtitle (TopBar)
    user   — current user { name, role }
    onlogout — callback for logout button
    customHeader — snippet rendered below TopBar (untuk POS KasirCommandBar, dll)
    children — page content (default slot)
    actions — TopBar actions snippet
-->
<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import TopBar from './TopBar.svelte';
	import { kasirMenu, gudangMenu, managerMenu, ownerMenu, type MenuItem } from '$lib/auth/roles';
	import { page } from '$app/state';

	interface User {
		full_name: string;
		role?: string;
	}

	interface Props {
		role: 'kasir' | 'manager' | 'gudang' | 'owner';
		title?: string;
		subtitle?: string;
		user?: User | null;
		onlogout?: () => void;
		children?: import('svelte').Snippet;
		actions?: import('svelte').Snippet;
		customHeader?: import('svelte').Snippet;
	}

	let { role, title, subtitle, user = null, onlogout, children, actions, customHeader }: Props = $props();

	const menuByRole: Record<string, MenuItem[]> = {
		kasir: kasirMenu,
		manager: managerMenu,
		gudang: gudangMenu,
		owner: ownerMenu
	};

	const menu = $derived(menuByRole[role] ?? []);
	const activePath = $derived(page.url.pathname);
</script>

<div class="flex h-screen overflow-hidden" style="background: #F0F4F8">
	<Sidebar {menu} {activePath} />
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">
		<TopBar {title} {subtitle} {user} role={role} {onlogout} {actions} />
		{#if customHeader}
			{@render customHeader()}
		{/if}
		<main class="flex-1 overflow-y-auto">
			{#if children}{@render children()}{/if}
		</main>
	</div>
</div>
