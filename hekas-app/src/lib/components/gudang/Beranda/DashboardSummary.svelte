<!--
  DashboardSummary (HEKAS POS — gudang/Beranda)
  6 KPI cards sesuai referensi Role_Gudang screenshot 1.
  - BARANG MASUK MENUNGGU VERIFIKASI
  - BARANG KELUAR MENUNGGU PENGIRIMAN
  - SURAT JALAN PENDING
  - STOK MENIPIS (highlight merah jika ada)
  - RESTOCK PERLU DISETUJUI
  - TOTAL SKU AKTIF
-->
<script lang="ts">
	interface Props {
		barangMasukMenunggu: number;
		barangKeluarMenunggu: number;
		suratJalanPending: number;
		stokMenipis: number;
		restockPerluDisetujui: number;
		totalSkuAktif: number;
	}

	let {
		barangMasukMenunggu,
		barangKeluarMenunggu,
		suratJalanPending,
		stokMenipis,
		restockPerluDisetujui,
		totalSkuAktif
	}: Props = $props();

	function formatNumber(n: number): string {
		return n.toLocaleString('id-ID');
	}
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
	<!-- Baris 1 -->
	<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Barang Masuk Menunggu Verifikasi</div>
			<div class="text-3xl font-bold text-blue-700 mt-2">{formatNumber(barangMasukMenunggu)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
				<path d="M15 18H9"/>
				<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
				<circle cx="17" cy="18" r="2"/>
				<circle cx="7" cy="18" r="2"/>
			</svg>
		</div>
	</div>

	<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Barang Keluar Menunggu Pengiriman</div>
			<div class="text-3xl font-bold text-blue-700 mt-2">{formatNumber(barangKeluarMenunggu)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
				<path d="M15 18H9"/>
				<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
				<circle cx="17" cy="18" r="2"/>
				<circle cx="7" cy="18" r="2"/>
			</svg>
		</div>
	</div>

	<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Surat Jalan Pending</div>
			<div class="text-3xl font-bold text-blue-700 mt-2">{formatNumber(suratJalanPending)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
				<polyline points="14 2 14 8 20 8"/>
				<line x1="16" y1="13" x2="8" y2="13"/>
				<line x1="16" y1="17" x2="8" y2="17"/>
			</svg>
		</div>
	</div>

	<!-- Baris 2 -->
	<div class="bg-white border-2 {stokMenipis > 0 ? 'border-rose-200' : 'border-slate-200'} rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold {stokMenipis > 0 ? 'text-rose-600' : 'text-slate-500'} tracking-wider uppercase">Stok Menipis</div>
			<div class="text-3xl font-bold {stokMenipis > 0 ? 'text-rose-700' : 'text-slate-900'} mt-2">{formatNumber(stokMenipis)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg {stokMenipis > 0 ? 'bg-rose-50' : 'bg-slate-50'} flex items-center justify-center {stokMenipis > 0 ? 'text-rose-600' : 'text-slate-400'}">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
				<line x1="12" y1="9" x2="12" y2="13"/>
				<line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
		</div>
	</div>

	<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Restock Perlu Disetujui</div>
			<div class="text-3xl font-bold text-blue-700 mt-2">{formatNumber(restockPerluDisetujui)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="8" cy="21" r="1"/>
				<circle cx="19" cy="21" r="1"/>
				<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
			</svg>
		</div>
	</div>

	<div class="bg-white border border-slate-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
		<div>
			<div class="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Total SKU Aktif</div>
			<div class="text-3xl font-bold text-blue-700 mt-2">{formatNumber(totalSkuAktif)}</div>
		</div>
		<div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="3" width="7" height="7"/>
				<rect x="14" y="3" width="7" height="7"/>
				<rect x="14" y="14" width="7" height="7"/>
				<rect x="3" y="14" width="7" height="7"/>
			</svg>
		</div>
	</div>
</div>
