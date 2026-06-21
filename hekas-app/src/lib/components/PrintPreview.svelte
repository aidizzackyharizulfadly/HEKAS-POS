<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Transaction } from '$lib/types/domain';
	import {
		printReceipt, connectThermal, disconnectThermal, isThermalConnected,
		isThermalSupported, loadSettings, saveSettings, DEFAULT_STORE_SETTINGS,
	} from '$lib/utils/print';
	import type { StoreSettings } from '$lib/utils/print';
	import Receipt from './Receipt.svelte';

	interface Props {
		transaction: Transaction;
		open: boolean;
		onclose: () => void;
		onPrinted?: () => void;
		isReprint?: boolean;
	}

	let { transaction: tx, open = $bindable(), onclose, onPrinted, isReprint = false }: Props = $props();

	let settings = $state<StoreSettings>(DEFAULT_STORE_SETTINGS);
	let printing = $state(false);
	let thermalBusy = $state(false);
	let thermalConnected = $state(false);
	let lastResult = $state<{ ok: boolean; method: string; message?: string } | null>(null);

	// Settings accordion
	let showSettings = $state(false);

	$effect(() => {
		if (open) {
			settings = loadSettings();
			thermalConnected = isThermalConnected();
			lastResult = null;
		}
	});

	function close() {
		onclose();
	}

	async function handlePrint() {
		printing = true;
		try {
			const result = await printReceipt(tx);
			lastResult = result;
			if (result.ok && onPrinted) onPrinted();
		} finally {
			printing = false;
		}
	}

	async function handleConnectThermal() {
		thermalBusy = true;
		try {
			const connected = await connectThermal();
			thermalConnected = connected;
			if (connected) {
				settings.printer_type = 'thermal';
				saveSettings(settings);
				lastResult = { ok: true, method: 'connected' };
			} else {
				lastResult = { ok: false, method: 'cancelled', message: 'Pemilihan printer dibatalkan' };
			}
		} catch (e: any) {
			lastResult = { ok: false, method: 'error', message: e.message };
		} finally {
			thermalBusy = false;
		}
	}

	async function handleDisconnectThermal() {
		await disconnectThermal();
		thermalConnected = false;
		settings.printer_type = 'browser';
		saveSettings(settings);
	}

	function handleSaveSettings() {
		saveSettings(settings);
		lastResult = { ok: true, method: 'settings-saved' };
	}
</script>

{#if open}
	<div
		class="fixed inset-0 flex items-center justify-center z-50 p-4"
		style="background: rgba(15,23,41,0.6); backdrop-filter: blur(4px)"
		onclick={(e) => { if (e.target === e.currentTarget) close(); }} onkeydown={(e) => { if (e.key === 'Escape') { /* TODO close */ } }}
		transition:fade={{ duration: 150 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="print-preview-title"
	>
		<div
			class="rounded-3xl shadow-2xl overflow-hidden flex flex-col"
			style="background: #fff; max-width: 720px; width: 100%; max-height: 92vh"
			transition:scale={{ duration: 200, start: 0.92, easing: cubicOut }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-5 py-4 shrink-0" style="background: #1E3A5F">
				<div class="flex items-center gap-2">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
						<polyline points="6 9 6 2 18 2 18 9" />
						<path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
						<rect x="6" y="14" width="12" height="8" />
					</svg>
					<span id="print-preview-title" style="color: #fff; font-size: 15; font-weight: 700">Cetak Struk</span>
				</div>
				<button onclick={close} aria-label="Tutup">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Body: 2-column layout (preview + actions) -->
			<div class="flex-1 overflow-hidden grid" style="grid-template-columns: 1fr 280px; min-height: 0">
				<!-- Receipt preview -->
				<div class="overflow-y-auto p-6" style="background: #F0F4F8">
					<div id="hekas-receipt-print-container" class="mx-auto" style="
						background: #fff;
						box-shadow: 0 4px 20px rgba(15,23,42,0.08);
						border-radius: 4px;
					">
						<Receipt transaction={tx} settings={settings} compact showWatermark={isReprint} />
					</div>
				</div>

				<!-- Actions sidebar -->
				<div class="overflow-y-auto p-4 space-y-3" style="background: #fff; border-left: 1px solid #E2E8F0">
					<!-- Status feedback -->
					{#if lastResult}
						<div
							class="p-3 rounded-lg flex items-start gap-2"
							style="
								background: {lastResult.ok ? '#F0FDF4' : '#FEF2F2'};
								border: 1px solid {lastResult.ok ? '#BBF7D0' : '#FECACA'};
								color: {lastResult.ok ? '#166534' : '#991B1B'};
								font-size: 12px;
							"
						>
							{#if lastResult.ok}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-top: 2px; flex-shrink: 0"><polyline points="20 6 9 17 4 12"/></svg>
							{:else}
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-top: 2px; flex-shrink: 0"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
							{/if}
							<div>
								{#if lastResult.method === 'thermal'}
									<div style="font-weight: 700">Terkirim ke printer thermal ✓</div>
								{:else if lastResult.method === 'browser'}
									<div style="font-weight: 700">Dialog cetak dibuka</div>
									<div style="margin-top: 2px; opacity: 0.8">Pilih printer & klik Print</div>
								{:else if lastResult.method === 'connected'}
									<div style="font-weight: 700">Printer terhubung ✓</div>
									<div style="margin-top: 2px; opacity: 0.8">Sekarang bisa cetak langsung</div>
								{:else if lastResult.method === 'settings-saved'}
									<div style="font-weight: 700">Pengaturan disimpan</div>
								{:else if lastResult.method === 'cancelled'}
									<div style="font-weight: 700">Dibatalkan</div>
								{:else}
									<div style="font-weight: 700">Gagal: {lastResult.message ?? 'Unknown'}</div>
								{/if}
							</div>
						</div>
					{/if}

					<!-- Print button (primary) -->
					<button
						onclick={handlePrint}
						disabled={printing}
						class="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
						style="
							background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
							color: #fff;
							font-size: 14px;
							font-weight: 800;
							box-shadow: 0 6px 20px rgba(37,99,235,0.35);
							opacity: {printing ? 0.6 : 1};
						"
					>
						{#if printing}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite">
								<path d="M21 12a9 9 0 11-6.219-8.56" />
							</svg>
							Mencetak…
						{:else}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="6 9 6 2 18 2 18 9" />
								<path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
								<rect x="6" y="14" width="12" height="8" />
							</svg>
							{thermalConnected ? 'Cetak ke Thermal' : 'Cetak via Browser'}
						{/if}
					</button>

					<!-- Thermal printer section -->
					<div class="rounded-xl overflow-hidden" style="border: 1px solid #E2E8F0">
						<button
							onclick={() => showSettings = !showSettings}
							class="w-full px-3 py-2.5 flex items-center justify-between"
							style="background: #F8FAFC; font-size: 12px; font-weight: 700; color: #475569"
						>
							<span class="flex items-center gap-2">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<polyline points="6 9 6 2 18 2 18 9" />
									<rect x="6" y="14" width="12" height="8" />
								</svg>
								Printer Thermal
							</span>
							<div class="flex items-center gap-2">
								{#if thermalConnected}
									<span style="font-size: 10px; padding: 1px 6px; border-radius: 999px; background: #D1FAE5; color: #065F46; font-weight: 700">TERHUBUNG</span>
								{:else}
									<span style="font-size: 10px; padding: 1px 6px; border-radius: 999px; background: #F1F5F9; color: #64748B; font-weight: 700">OFFLINE</span>
								{/if}
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate({showSettings ? 180 : 0}deg); transition: transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
							</div>
						</button>

						{#if showSettings}
							<div class="p-3 space-y-2.5" style="background: #fff">
								{#if !isThermalSupported()}
									<div style="font-size: 11px; color: #92400E; background: #FEF3C7; padding: 6px 8px; border-radius: 6px">
										⚠️ Web Serial API tidak tersedia. Gunakan Chrome/Edge di localhost atau HTTPS.
									</div>
								{/if}

								{#if thermalConnected}
									<button
										onclick={handleDisconnectThermal}
										disabled={thermalBusy}
										class="w-full py-2 rounded-lg"
										style="background: #FEE2E2; color: #DC2626; font-size: 12px; font-weight: 600; opacity: {thermalBusy ? 0.6 : 1}"
									>Putuskan Koneksi</button>
								{:else}
									<button
										onclick={handleConnectThermal}
										disabled={thermalBusy || !isThermalSupported()}
										class="w-full py-2 rounded-lg"
										style="background: #2563EB; color: #fff; font-size: 12px; font-weight: 600; opacity: {thermalBusy || !isThermalSupported() ? 0.5 : 1}"
									>
										{thermalBusy ? 'Menghubungkan…' : 'Hubungkan Printer USB'}
									</button>
									<div style="font-size: 10px; color: #64748B; text-align: center">
										Pastikan printer ESC/POS sudah dicolok USB
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Store settings -->
					<div class="rounded-xl overflow-hidden" style="border: 1px solid #E2E8F0">
						<div class="px-3 py-2.5" style="background: #F8FAFC; font-size: 12px; font-weight: 700; color: #475569">
							⚙️ Pengaturan Toko
						</div>
						<div class="p-3 space-y-2" style="background: #fff">
							<label class="block">
								<span style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase">Nama Toko</span>
								<input bind:value={settings.store_name} class="w-full mt-1 px-2 py-1.5 rounded-md" style="font-size: 12px; border: 1px solid #E2E8F0" />
							</label>
							<label class="block">
								<span style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase">Alamat</span>
								<input bind:value={settings.address} class="w-full mt-1 px-2 py-1.5 rounded-md" style="font-size: 12px; border: 1px solid #E2E8F0" />
							</label>
							<label class="block">
								<span style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase">Telp</span>
								<input bind:value={settings.phone} class="w-full mt-1 px-2 py-1.5 rounded-md" style="font-size: 12px; border: 1px solid #E2E8F0" />
							</label>
							<label class="block">
								<span style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase">Footer</span>
								<input bind:value={settings.footer_message} class="w-full mt-1 px-2 py-1.5 rounded-md" style="font-size: 12px; border: 1px solid #E2E8F0" />
							</label>
							<label class="block">
								<span style="font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase">Lebar Kertas</span>
								<select bind:value={settings.paper_width} class="w-full mt-1 px-2 py-1.5 rounded-md" style="font-size: 12px; border: 1px solid #E2E8F0">
									<option value="58mm">58mm (32 char)</option>
									<option value="80mm">80mm (42 char)</option>
								</select>
							</label>
							<button
								onclick={handleSaveSettings}
								class="w-full py-2 rounded-md"
								style="background: #059669; color: #fff; font-size: 12px; font-weight: 600"
							>Simpan Pengaturan</button>
						</div>
					</div>

					<button
						onclick={close}
						class="w-full py-2 rounded-lg"
						style="background: #F1F5F9; color: #475569; font-size: 12px; font-weight: 600"
					>Selesai</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}
</style>
