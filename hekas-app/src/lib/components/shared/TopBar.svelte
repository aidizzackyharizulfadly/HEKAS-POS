<script lang="ts">
	/**
	 * Shared TopBar component.
	 *
	 * Generic horizontal header dengan:
	 * - Title (optional)
	 * - User info (right side)
	 * - Logout button
	 * - Slot untuk role-specific actions
	 *
	 * Usage (di role layout):
	 *   <TopBar title="..." user={{ name: '...' }} role="kasir">
	 *     {#snippet actions()}
	 *       <button>Action khusus role</button>
	 *     {/snippet}
	 *   </TopBar>
	 *
	 * Status (R0.3 2026-06-21): Komponen dibuat, siap dipakai.
	 * Wiring ke role layouts akan dilakukan di fase R1 (page refactor).
	 */
	interface User {
		id?: string | number;
		name: string;
		role?: string;
	}

	interface Props {
		title?: string;
		subtitle?: string;
		user?: User | null;
		role?: 'kasir' | 'manager' | 'gudang';
		onlogout?: () => void;
		children?: import('svelte').Snippet;
	}

	let { title, subtitle, user = null, role, onlogout, children }: Props = $props();
</script>

<header
	class="shrink-0 px-6 py-3 flex items-center justify-between border-b"
	style="background: #fff; border-color: #E2E8F0; min-height: 64px"
>
	<div class="flex flex-col min-w-0">
		{#if title}
			<h1 style="font-size: 16px; font-weight: 700; color: #0F172A; margin: 0">
				{title}
			</h1>
		{/if}
		{#if subtitle}
			<p style="font-size: 12px; color: #64748B; margin: 2px 0 0">
				{@html subtitle}
			</p>
		{/if}
	</div>

	<div class="flex items-center gap-3">
		{#if children}
			{@render children()}
		{/if}

		{#if user}
			<div class="flex items-center gap-2.5 pl-3" style="border-left: 1px solid #E2E8F0">
				<div
					class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
					style="background: #EFF6FF; color: #2563EB"
					aria-hidden="true"
				>
					{user.name.charAt(0).toUpperCase()}
				</div>
				<div class="flex flex-col">
					<span style="font-size: 13px; font-weight: 600; color: #0F172A">{user.name}</span>
					{#if role}
						<span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px">
							{role}
						</span>
					{/if}
				</div>
			</div>
		{/if}

		{#if onlogout}
			<button
				type="button"
				onclick={onlogout}
				class="px-3 py-1.5 rounded-lg"
				style="font-size: 12px; font-weight: 600; background: transparent; color: #64748B; border: 1px solid #E2E8F0"
				aria-label="Logout"
			>
				Logout
			</button>
		{/if}
	</div>
</header>
