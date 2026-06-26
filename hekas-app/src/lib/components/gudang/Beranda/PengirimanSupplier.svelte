<!--
  PengirimanSupplier (HEKAS POS — gudang/Beranda)
  Card "Pengiriman & Supplier" sesuai referensi Role_Gudang screenshot 1.
  Pattern: header (icon + title) + sub-header "PENGIRIMAN AKTIF HARI INI"
  + list ekspedisi (J&T, SiCepat, dll) dengan status badge (SIAP/PENDING/DIKIRIM).
-->
<script lang="ts">
	export type ShipmentStatus = 'SIAP' | 'PENDING' | 'DIKIRIM' | 'SELESAI';

	interface Shipment {
		id: string;
		courier: string;
		packageCount: number;
		schedule: string;
		status: ShipmentStatus;
	}

	interface Props {
		shipments: Shipment[];
		onViewLog?: () => void;
	}

	let { shipments, onViewLog }: Props = $props();

	const STATUS_CFG: Record<ShipmentStatus, { bg: string; fg: string }> = {
		SIAP: { bg: 'bg-emerald-50', fg: 'text-emerald-700' },
		PENDING: { bg: 'bg-amber-50', fg: 'text-amber-700' },
		DIKIRIM: { bg: 'bg-blue-50', fg: 'text-blue-700' },
		SELESAI: { bg: 'bg-slate-100', fg: 'text-slate-600' }
	};
</script>

<div class="bg-white border border-slate-200 rounded-lg shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
		<div class="flex items-center gap-3">
			<div class="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
					<path d="M15 18H9"/>
					<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
					<circle cx="17" cy="18" r="2"/>
					<circle cx="7" cy="18" r="2"/>
				</svg>
			</div>
			<h3 class="text-base font-semibold text-slate-900">Pengiriman & Supplier</h3>
		</div>
		<button
			type="button"
			class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
			onclick={() => onViewLog?.()}
		>
			Lihat Log
		</button>
	</div>

	<!-- Sub-header -->
	<div class="px-6 py-3 border-b border-slate-100">
		<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Pengiriman Aktif Hari Ini</div>
	</div>

	<!-- Shipment list -->
	<ul class="divide-y divide-slate-100" role="list">
		{#each shipments as s (s.id)}
			{@const cfg = STATUS_CFG[s.status]}
			<li class="px-6 py-4 flex items-center justify-between gap-3">
				<div class="flex items-center gap-3 min-w-0">
					<div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M16 16h6"/>
							<path d="M2 16h12"/>
							<path d="M4 4h12v6"/>
							<path d="M16 4l4 4-4 4"/>
						</svg>
					</div>
					<div class="min-w-0">
						<div class="text-sm font-semibold text-slate-900 truncate">{s.courier}</div>
						<div class="text-xs text-slate-500 mt-0.5">
							{s.packageCount} Paket <span class="text-slate-300 mx-1">•</span> {s.schedule}
						</div>
					</div>
				</div>
				<span class="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase {cfg.bg} {cfg.fg} flex-shrink-0">
					{s.status}
				</span>
			</li>
		{/each}
		{#if shipments.length === 0}
			<li class="text-center py-8 text-sm text-slate-400">
				Tidak ada pengiriman aktif hari ini
			</li>
		{/if}
	</ul>
</div>
