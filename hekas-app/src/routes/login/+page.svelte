<script lang="ts">
	import { goto } from '$app/navigation';
	import { detectRole, authenticate, ROLE_LIST, ROLES, type RoleId } from '$lib/auth/roles';
	import { storage, seedIfEmpty } from '$lib/utils/storage';
	import { writeSession } from '$lib/auth/session';

	let username = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let error = $state('');

	const detectedRole = $derived<RoleId | null>(detectRole(username));
	const detectedConfig = $derived(detectedRole ? ROLES[detectedRole] : null);

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
		if (!detectedRole || !detectedConfig) {
			error = 'Role tidak dikenali. Gunakan kasi01, manager01, atau gudang01.';
			return;
		}

		// Authenticate against demo accounts
		isLoading = true;
		await new Promise((resolve) => setTimeout(resolve, 700));
		const authedRole = authenticate(username, password);

		if (!authedRole) {
			isLoading = false;
			error = 'Username atau password salah';
			return;
		}

		// Simpan session ke localStorage SEBELUM navigasi,
		// karena route guard di +layout.ts membaca 'hekas:auth'
		seedIfEmpty();
		const users = storage.get<any[]>('users', []);
		const user = users.find(
			(u: any) => u.username === username.toLowerCase().trim()
		);
		writeSession({
			id: String(user?.id ?? '1'),
			username: user?.username ?? username,
			role: authedRole,
			fullName: user?.full_name ?? username,
			outletId: String(user?.outlet_id ?? '1')
		});

		const roleConfig = ROLES[authedRole as RoleId];
		goto(roleConfig.gotoPath);
	}
</script>

<svelte:head>
	<title>Login · HEKAS POS</title>
</svelte:head>

<div
	class="min-h-screen flex items-center justify-center p-4"
	style="background: linear-gradient(135deg, var(--color-hekas-navy) 0%, var(--color-hekas-navy-deep) 100%)"
>
	<div class="w-full max-w-sm">
		<!-- Logo & brand -->
		<div class="flex flex-col items-center mb-8">
			<div
				class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
				style="background: var(--color-hekas-blue); box-shadow: 0 8px 28px rgba(37, 99, 235, 0.4)"
				aria-hidden="true"
			>
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<line x1="8" y1="21" x2="16" y2="21" />
					<line x1="12" y1="17" x2="12" y2="21" />
				</svg>
			</div>
			<h1 style="color: #fff; font-size: 30; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1">
				HEKAS <span style="color: var(--color-hekas-blue-light)">POS</span>
			</h1>
			<p style="color: rgba(226,235,248,0.7); font-size: 13; margin-top: 6; letter-spacing: 0.01em">
				Sistem Kasir Retail Modern
			</p>
		</div>

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
					placeholder="contoh: kasi01, manager01, gudang01"
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

				<!-- Role preview -->
				{#if username.trim().length >= 2}
					<div
						class="role-preview"
						style="
							margin-top: 10px;
							padding: 10px 12px;
							border-radius: 8px;
							background: {detectedConfig ? detectedConfig.color + '20' : 'rgba(239, 68, 68, 0.12)'};
							border: 1px solid {detectedConfig ? detectedConfig.color + '50' : 'rgba(239, 68, 68, 0.3)'};
							color: {detectedConfig ? '#fff' : '#FCA5A5'};
							font-size: 12.5;
							display: flex;
							align-items: center;
							gap: 8px;
						"
						role="status"
						aria-live="polite"
					>
						{#if detectedConfig}
							<span
								class="role-preview-dot"
								style="
									width: 8px;
									height: 8px;
									border-radius: 50%;
									background: {detectedConfig.color};
									flex-shrink: 0;
								"
								aria-hidden="true"
							></span>
							<span>
								Terdeteksi: <strong style="font-weight: 700">{detectedConfig.label}</strong> — {detectedConfig.roleDescription}
							</span>
						{:else}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
							<span>Role tidak dikenali. Coba awalan: kasir, manager, gudang</span>
						{/if}
					</div>
				{/if}
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
					background: {isLoading ? 'var(--color-hekas-blue-deep)' : 'var(--color-hekas-blue)'};
					color: #fff;
					font-size: 15;
					font-weight: 700;
					font-family: inherit;
					border: none;
					cursor: {isLoading ? 'wait' : 'pointer'};
					opacity: {isLoading ? 0.85 : 1};
					transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
					box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
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
					Masuk
				{/if}
			</button>
		</form>
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
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
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
</style>
