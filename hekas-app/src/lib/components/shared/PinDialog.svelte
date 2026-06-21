<script lang="ts">
	/**
	 * PIN verification dialog (6-digit).
	 *
	 * Usage:
	 *   <PinDialog
	 *     open={needPin}
	 *     title="Konfirmasi Void"
	 *     onconfirm={(pin) => doVoid(pin)}
	 *     oncancel={() => needPin = false}
	 *   />
	 */
	import { verifyPin, hashPin, canAttemptPin, recordFailedAttempt, getLockoutRemaining, isValidPinFormat } from '$lib/auth/pin';
	import { playError, playSuccess } from '$lib/utils/sound';

	interface Props {
		open: boolean;
		title?: string;
		description?: string;
		username?: string;
		/** Optional pre-hashed PIN untuk demo/dev (skip when BE active). */
		expectedHash?: { hash: string; salt: string; iterations: number };
		onconfirm: (pin: string) => void | Promise<void>;
		oncancel: () => void;
	}

	let {
		open,
		title = 'Masukkan PIN',
		description,
		username = '',
		expectedHash,
		onconfirm,
		oncancel
	}: Props = $props();

	let pin = $state('');
	let error = $state('');
	let loading = $state(false);
	let lockoutMs = $state(0);
	let lockoutTimer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (open) {
			pin = '';
			error = '';
			lockoutMs = username ? getLockoutRemaining(username) : 0;
			if (lockoutMs > 0) startLockoutCountdown();
		} else {
			stopLockoutCountdown();
		}
	});

	function startLockoutCountdown() {
		stopLockoutCountdown();
		lockoutTimer = setInterval(() => {
			lockoutMs = username ? getLockoutRemaining(username) : 0;
			if (lockoutMs <= 0) stopLockoutCountdown();
		}, 1000);
	}

	function stopLockoutCountdown() {
		if (lockoutTimer) {
			clearInterval(lockoutTimer);
			lockoutTimer = null;
		}
	}

	function pressKey(d: string) {
		if (loading || lockoutMs > 0) return;
		if (d === 'del') {
			pin = pin.slice(0, -1);
			error = '';
		} else if (d === 'clear') {
			pin = '';
			error = '';
		} else if (pin.length < 6) {
			pin += d;
			error = '';
			if (pin.length === 6) {
				queueMicrotask(() => submit());
			}
		}
	}

	async function submit() {
		if (!isValidPinFormat(pin)) {
			error = 'PIN harus 6 digit';
			return;
		}
		if (username && !canAttemptPin(username)) {
			error = 'Terlalu banyak percobaan. Coba lagi nanti.';
			return;
		}
		loading = true;
		try {
			// Verify kalau expectedHash tersedia
			if (expectedHash) {
				const ok = await verifyPin(pin, expectedHash);
				if (!ok) {
					playError();
					if (username) {
						const r = recordFailedAttempt(username);
						lockoutMs = r.lockedMs;
						if (r.lockedMs > 0) startLockoutCountdown();
						error = `PIN salah. Sisa ${r.attemptsLeft} percobaan.`;
					} else {
						error = 'PIN salah';
					}
					pin = '';
					return;
				}
			}
			playSuccess();
			await onconfirm(pin);
		} catch (e) {
			playError();
			error = (e as Error).message ?? 'Verifikasi gagal';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key >= '0' && e.key <= '9') pressKey(e.key);
		else if (e.key === 'Backspace') pressKey('del');
		else if (e.key === 'Escape') oncancel();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px)"
		role="dialog"
		aria-modal="true" tabindex="-1"
		aria-labelledby="pin-dialog-title"
	>
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
			role="document"
		>
			<div class="flex items-start justify-between mb-1">
				<h2 id="pin-dialog-title" class="text-lg font-bold text-slate-800">
					{title}
				</h2>
				<button
					type="button"
					onclick={oncancel}
					class="text-slate-400 hover:text-slate-600 -mt-1 -mr-1 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
					aria-label="Tutup dialog PIN"
				>
					✕
				</button>
			</div>
			{#if description}
				<p class="text-sm text-slate-600 mb-4">{description}</p>
			{/if}

			<!-- PIN dots -->
			<div class="flex justify-center gap-2 my-6" aria-label="PIN {pin.length} dari 6 digit">
				{#each Array(6) as _, i (i)}
					<div
						class="w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold transition-colors"
						class:border-blue-500={pin.length === i}
						class:bg-blue-50={pin.length === i}
						class:border-slate-300={pin.length !== i}
					>
						{pin[i] ? '•' : ''}
					</div>
				{/each}
			</div>

			{#if error}
				<p class="text-sm text-red-600 text-center mb-2" role="alert">{error}</p>
			{/if}

			{#if lockoutMs > 0}
				<p class="text-sm text-amber-700 text-center mb-2 bg-amber-50 p-2 rounded">
					🔒 Terkunci. Coba lagi dalam {Math.ceil(lockoutMs / 60000)} menit.
				</p>
			{/if}

			<!-- Numpad -->
			<div class="grid grid-cols-3 gap-2" role="group" aria-label="Keypad PIN">
				{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as d (d)}
					<button
						type="button"
						onclick={() => pressKey(d)}
						disabled={loading || lockoutMs > 0}
						class="aspect-square rounded-lg bg-slate-100 hover:bg-slate-200 text-2xl font-bold text-slate-800 transition-colors disabled:opacity-50"
					>
						{d}
					</button>
				{/each}
				<button
					type="button"
					onclick={() => pressKey('clear')}
					disabled={loading || lockoutMs > 0}
					class="aspect-square rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-600 transition-colors disabled:opacity-50"
				>
					CLEAR
				</button>
				<button
					type="button"
					onclick={() => pressKey('0')}
					disabled={loading || lockoutMs > 0}
					class="aspect-square rounded-lg bg-slate-100 hover:bg-slate-200 text-2xl font-bold text-slate-800 transition-colors disabled:opacity-50"
				>
					0
				</button>
				<button
					type="button"
					onclick={() => pressKey('del')}
					disabled={loading || lockoutMs > 0}
					class="aspect-square rounded-lg bg-slate-200 hover:bg-slate-300 text-sm font-bold text-slate-600 transition-colors disabled:opacity-50"
					aria-label="Hapus digit terakhir"
				>
					⌫
				</button>
			</div>
		</div>
	</div>
{/if}
