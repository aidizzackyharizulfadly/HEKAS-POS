<script lang="ts">
  import MetricSummaryCard from '$lib/components/MetricSummaryCard.svelte';
  import LineChart from '$lib/components/LineChart.svelte';
  import InsightCard from '$lib/components/InsightCard.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import {
    greetingHour, operationalStatus, ringkasanPenjualan, peakInfo, penjualanTrend,
    topOutlet, topPelanggan, topProdukByJumlah, topProdukByQty,
    topKategoriByJumlah, topKategoriByQty, stokRendah
  } from '$lib/mock/dashboard';

  const greeting = greetingHour();
  const statusLine = operationalStatus('HEKAS Pandeansari');

  // Quick stats for sidebar footer
  const totalOutlets = 4;
  const activeKasir = 12;
</script>

<svelte:head><title>Dashboard — HEKAS POS Manager</title></svelte:head>

<!-- Greeting -->
<div class="flex items-center gap-3 mb-6">
  <div class="w-11 h-11 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white flex items-center justify-center text-sm font-bold shrink-0">SW</div>
  <div>
    <p class="text-sm text-gray-500">{greeting}, Bu Siti —</p>
    <h1 class="text-xl font-bold text-gray-800 leading-tight">{statusLine}</h1>
    <p class="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
      <span class="flex items-center gap-0.5">
        <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h12l-1 8H3L2 6zM5 6V4a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        HEKAS Pandeansari
      </span>
      ·
      <span>login 08:02 WIB</span>
    </p>
  </div>
</div>

<!-- Ringkasan Penjualan -->
<div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
  <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Ringkasan Penjualan · 22 – 28 Juni 2026</div>
  <MetricSummaryCard metrics={ringkasanPenjualan} />
</div>

<!-- Penjualan Line Chart -->
<div class="bg-white rounded-lg border border-gray-200 p-5 mb-4">
  <div class="flex items-center justify-between mb-4">
    <div>
      <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Penjualan · 7 hari terakhir</div>
      <div class="grid grid-cols-4 gap-6 text-xs">
        <div>
          <div class="text-gray-500">Peak Date</div>
          <div class="font-bold text-gray-800">{peakInfo.peakDate}</div>
          <div class="text-gray-600 tabular-nums">{peakInfo.peakValue}</div>
        </div>
        <div>
          <div class="text-gray-500">Top Income</div>
          <div class="font-bold text-gray-800">{peakInfo.topIncome}</div>
          <div class="text-gray-600 tabular-nums">{peakInfo.topValue}</div>
        </div>
        <div>
          <div class="text-gray-500">Low Date</div>
          <div class="font-bold text-gray-800">{peakInfo.lowDate}</div>
          <div class="text-gray-600 tabular-nums">{peakInfo.lowValue}</div>
        </div>
        <div>
          <div class="text-gray-500">Lower Income</div>
          <div class="font-bold text-gray-800">{peakInfo.lowerDate}</div>
          <div class="text-gray-600 tabular-nums">{peakInfo.lowerValue}</div>
        </div>
      </div>
    </div>
    <select class="text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-[#1E3A5F]">
      <option>Tanggal</option>
      <option>Bulan</option>
      <option>Tahun</option>
    </select>
  </div>
  <LineChart values={penjualanTrend.values} labels={penjualanTrend.labels} />
</div>

<!-- 2-col Insight Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <InsightCard title="Top Outlet" total="Rp 142jt" segments={topOutlet} />
  <InsightCard title="Top Pelanggan" total="Rp 142jt" segments={topPelanggan} />
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <InsightCard title="Top Produk Berdasarkan Jumlah" total="Rp 102jt" segments={topProdukByJumlah} />
  <InsightCard title="Top Produk Berdasarkan Qty" total="5.376 unit" segments={topProdukByQty} />
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <InsightCard title="Top Kategori by Jumlah" total="Rp 142jt" segments={topKategoriByJumlah} />
  <InsightCard title="Top Kategori by Qty" total="7.401 unit" segments={topKategoriByQty} />
</div>

<!-- Stok Rendah -->
<div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Produk dengan Stok Rendah · 5 dari 15.240 item</div>
    <button class="text-xs text-[#1E3A5F] hover:underline">Lainnya →</button>
  </div>
  <table class="w-full text-sm">
    <thead class="bg-white border-b border-gray-200">
      <tr>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Produk</th>
        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">Gudang</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Qty Tersedia</th>
        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500">Minimum Qty</th>
      </tr>
    </thead>
    <tbody>
      {#each stokRendah as row, i (i)}
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3 text-gray-800">{row.produk}</td>
          <td class="px-4 py-3 text-gray-700">{row.gudang}</td>
          <td class="px-4 py-3 text-right tabular-nums text-rose-600 font-semibold">{row.qty}</td>
          <td class="px-4 py-3 text-right tabular-nums text-gray-700">{row.minimum}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <Pagination currentPage={1} totalPages={3} totalRecords={stokRendah.length} />
</div>

<!-- Footer ringkasan -->
<div class="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
  <div class="flex items-center gap-4">
    <span>© 2026 HEKAS POS · Powered by HEKAS</span>
    <span class="text-gray-300">·</span>
    <span>{totalOutlets} outlet aktif</span>
    <span class="text-gray-300">·</span>
    <span>{activeKasir} kasir on-duty</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
    <span>Data updated real-time · {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
  </div>
</div>