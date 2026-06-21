<script lang="ts">
	import { goto } from '$app/navigation';
	import { authenticate, DEMO_ACCOUNTS, ROLES, type RoleConfig, type RoleId } from '$lib/auth/roles';

	interface Props {
		role: RoleConfig;
		showBackLink?: boolean;
		showDateVersion?: boolean;
		showRoleBadge?: boolean;
		redirectOnSuccess?: string;
	}

	let {
		role,
		showBackLink = true,
		showDateVersion = true,
		showRoleBadge = true,
		redirectOnSuccess
	}: Props = $props();

	let username = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let error = $state('');

	const roleAccounts = $derived(
		DEMO_ACCOUNTS.filter((a) => a.role === role.id).map((a) => a.username)
	);

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';

		if (!username.trim()) {
			error = 'Username harus diisi';
			return;
		}
		if (!password) {
			error = 'Password harus diisi';
			return;
		}

		isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 700));
		const authedRole = authenticate(username, password);

		if (!authedRole) {
			isLoading = false;
			error = 'Username atau password salah';
			return;
		}

		const authedConfig = ROLES[authedRole as RoleId];
		goto(redirectOnSuccess || authedConfig.gotoPath);
	}

	const today = new Date().toLocaleDateString('id-ID', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
</script>

<svelte:head>
	<title>Masuk {role.label} · HEKAS POS</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center p-4"
	style="background: linear-gradient(135deg, var(--color-hekas-navy) 0%, var(--color-hekas-navy-deep) 100%)"
>
	<div class="w-full max-w-sm">
		<!-- Logo & brand -->
		<div class="flex flex-col items-center mb-8">
			<div
				class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
				style="background: {role.color}; box-shadow: 0 8px 24px {role.color}40"
				aria-hidden="true"
			>
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<line x1="8" y1="21" x2="16" y2="21" />
					<line x1="12" y1="17" x2="12" y2="21" />
				</svg>
			</div>
			<h1 class="brand-title" style="color: #fff; font-size: 26; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1">
				HEKAS <span style="color: var(--color-hekas-blue-light)">POS</span>
			</h1>
			<p style="color: rgba(226,235,248,0.65); font-size: 13; margin-top: 6; letter-spacing: 0.01em">
				Sistem Kasir Retail Modern
			</p>
		</div>

		<!-- Role badge -->
		{#if showRoleBadge}
			<div
				class="flex items-center justify-center gap-2 px-4 py-2 rounded-full mb-6 mx-auto"
				style="background: rgba(255,255,255,0.08); color: var(--color-hekas-blue-light); font-size: 13; font-weight: 500; border: 1px solid rgba(147,197,253,0.18)"
				role="status"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
					<circle cx="12" cy="7" r="4" />
				</svg>
				Masuk sebagai <strong style="color: #fff; font-weight: 700">{role.label}</strong>
			</div>
		{/if}

		<!-- Login form -->
		<form onsubmit={handleLogin} class="space-y-4" novalidate>
			<div>
				<label
					for="username"
					style="color: rgba(226,235,248,0.85); font-size: 13; font-weight: 500; margin-bottom: 8; display: block"
				>
					Username
				</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					placeholder={roleAccounts[0] ? `contoh: ${roleAccounts[0]}` : 'Masukkan username'}
					autocomplete="username"
					autocapitalize="off"
					spellcheck="false"
					aria-invalid={error && !username.trim() ? 'true' : 'false'}
					class="login-input"
					style="
						width: 100%;
						padding: 13px 16px;
						border-radius: 10px;
						border: 1px solid {error && !username.trim() ? '#FCA5A5' : 'rgba(255,255,255,0.16)'};
						background: rgba(255,255,255,0.06);
						color: #fff;
						font-size: 14;
						font-family: inherit;
						outline: none;
						transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
					"
				/>
			</div>

			<div>
				<label
					for="password"
					style="color: rgba(226,235,248,0.85); font-size: 13; font-weight: 500; margin-bottom: 8; display: block"
				>
					Password
				</label>
				<div style="position: relative">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Masukkan password"
						autocomplete="current-password"
						aria-invalid={error && !password ? 'true' : 'false'}
						class="login-input"
						style="
							width: 100%;
							padding: 13px 48px 13px 16px;
							border-radius: 10px;
							border: 1px solid {error && !password ? '#FCA5A5' : 'rgba(255,255,255,0.16)'};
							background: rgba(255,255,255,0.06);
							color: #fff;
							font-size: 14;
							font-family: inherit;
							outline: none;
							transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
						"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
						aria-pressed={showPassword}
						class="login-eye-btn"
					>
						{#if showPassword}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
								<line x1="1" y1="1" x2="23" y2="23" />
							</svg>
						{:else}
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- Error message -->
			{#if error}
				<div
					role="alert"
					aria-live="polite"
					style="
						padding: 11px 14px;
						border-radius: 10px;
						background: rgba(239,68,68,0.14);
						color: #FCA5A5;
						font-size: 13;
						border: 1px solid rgba(239,68,68,0.3);
						display: flex;
						align-items: flex-start;
						gap: 8px;
					"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 1px" aria-hidden="true">
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<!-- Submit button -->
			<button
				type="submit"
				disabled={isLoading}
				aria-busy={isLoading}
				class="login-submit"
				style="
					width: 100%;
					padding: 14px;
					border-radius: 10px;
					background: {isLoading ? role.colorDeep : role.color};
					color: #fff;
					font-size: 15;
					font-weight: 700;
					font-family: inherit;
					border: none;
					cursor: {isLoading ? 'wait' : 'pointer'};
					opacity: {isLoading ? 0.85 : 1};
					transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
					box-shadow: 0 4px 14px {role.color}40;
					margin-top: 8px;
				"
			>
				{#if isLoading}
					<span style="display: flex; align-items: center; justify-content: center; gap: 8px">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="spin" aria-hidden="true">
							<path d="M21 12a9 9 0 11-6.219-8.56" />
						</svg>
						Memproses...
					</span>
				{:else}
					Masuk sebagai {role.label}
				{/if}
			</button>
		</form>

		<!-- Back link -->
		{#if showBackLink}
			<div style="text-align: center; margin-top: 24px">
				<a
					href="/login"
					class="login-back-link"
					style="
						color: rgba(226,235,248,0.6);
						font-size: 13;
						text-decoration: none;
						display: inline-flex;
						align-items: center;
						gap: 4px;
						padding: 6px 10px;
						border-radius: 6px;
						transition: color 0.2s, background 0.2s;
					"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					<span>Pilih role lain</span>
				</a>
			</div>
		{/if}

		<!-- Date + version -->
		{#if showDateVersion}
			<p style="color: rgba(226,235,248,0.35); font-size: 12; text-align: center; margin-top: 32; letter-spacing: 0.02em">
				{today} · v2.4.1
			</p>
		{/if}
	</div>
</div>

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.spin {
		animation: spin 0.8s linear infinite;
	}

	.login-input:hover {
		background: rgba(255, 255, 255, 0.08) !important;
	}

	.login-input:focus {
		border-color: var(--color-hekas-blue) !important;
		background: rgba(255, 255, 255, 0.1) !important;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important;
	}

	.login-submit:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.login-submit:active:not(:disabled) {
		transform: translateY(0);
	}

	.login-eye-btn {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: rgba(226, 235, 248, 0.6);
		cursor: pointer;
		padding: 8px;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color 0.15s, background 0.15s;
	}

	.login-eye-btn:hover {
		color: rgba(226, 235, 248, 0.95);
		background: rgba(255, 255, 255, 0.08);
	}

	.login-back-link:hover {
		color: rgba(226, 235, 248, 0.9) !important;
		background: rgba(255, 255, 255, 0.05);
	}
</style>
