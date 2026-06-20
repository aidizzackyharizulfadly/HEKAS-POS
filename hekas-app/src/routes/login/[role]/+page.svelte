<script lang="ts">
	import { page } from '$app/state';
	import LoginForm from '$lib/components/LoginForm.svelte';
	import { ROLES, isValidRole } from '$lib/auth/roles';

	const role = $derived(isValidRole(page.params.role) ? ROLES[page.params.role] : null);
</script>

{#if role}
	<LoginForm {role} />
{:else}
	<div
		class="min-h-screen flex items-center justify-center p-4"
		style="background: var(--color-hekas-navy); color: #fff"
	>
		<div class="text-center">
			<p style="font-size: 48; font-weight: 800; margin-bottom: 8">404</p>
			<p style="font-size: 14; opacity: 0.7; margin-bottom: 24">Role tidak dikenali</p>
			<a href="/login" style="color: var(--color-hekas-blue-light); font-size: 14">← Kembali ke login</a>
		</div>
	</div>
{/if}
