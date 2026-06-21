<!-- /manager/widgets-demo — Reference integration untuk 6 R3f components -->
<script lang="ts">
  import RoleShell from '$lib/components/shared/RoleShell.svelte';
  import SalesTable from '$lib/components/manager/Penjualan/SalesTable.svelte';
  import BusinessAnalytics from '$lib/components/manager/Laporan/BusinessAnalytics.svelte';
  import SJManagement from '$lib/components/manager/SuratJalan/SJManagement.svelte';
  import AIChat from '$lib/components/manager/AI/AIChat.svelte';
  import OperationalHours from '$lib/components/manager/Pengaturan/OperationalHours.svelte';
  import POList from '$lib/components/gudang/BarangMasuk/POList.svelte';

  // Mock data
  const salesRows = [
    { period: 'Hari ini', date: '2026-06-19', transactions: 142, items_sold: 487, revenue: 12_450_000, growth: 0.087 },
    { period: 'Kemarin', date: '2026-06-18', transactions: 128, items_sold: 432, revenue: 11_456_000, growth: -0.024 },
    { period: '2 hari lalu', date: '2026-06-17', transactions: 156, items_sold: 521, revenue: 13_780_000, growth: 0.125 },
    { period: 'Minggu ini', transactions: 987, items_sold: 3210, revenue: 84_500_000, growth: 0.169 },
    { period: 'Bulan ini', transactions: 4123, items_sold: 14210, revenue: 367_800_000, growth: 0.213 }
  ];

  const insights = [
    { title: 'Penjualan meningkat signifikan', detail: 'Pendapatan minggu ini naik 16.9% dibanding minggu lalu, didorong oleh kategori Minuman (+24%).', metric: '+16.9%', sentiment: 'positive' as const },
    { title: 'Stok kritis perlu restock', detail: '3 produk dengan stok di bawah minimum (Indomie, Aqua 600ml, Rokok Surya 12).', sentiment: 'warning' as const },
    { title: 'Best seller stabil', detail: 'Aqua 600ml tetap di top 3 selama 4 minggu berturut-turut dengan penjualan 48-52 pcs/hari.', sentiment: 'neutral' as const },
    { title: 'Kasir Andi performa terbaik', detail: 'Transaksi 87/hari dengan rata-rata nilai Rp 87k. Pertahankan pola shift pagi.', metric: '87 trx', sentiment: 'positive' as const },
    { title: 'Margin laba sehat', detail: 'Net profit margin 26.4% (target: 25%). Pertahankan strategi pricing saat ini.', metric: '26.4%', sentiment: 'positive' as const },
    { title: 'Beban operasional naik', detail: 'Biaya listrik dan sewa naik 8% dari bulan lalu. Evaluasi efisiensi energi.', metric: '+8%', sentiment: 'negative' as const }
  ];

  const kpis = [
    { label: 'Pendapatan',  value: 'Rp 84.5jt', delta: 0.169,  tone: 'success' as const },
    { label: 'Transaksi',   value: '987',       delta: 0.124,  tone: 'info' as const },
    { label: 'Rata-rata',   value: 'Rp 85.6k',  delta: 0.041,  tone: 'primary' as const },
    { label: 'Laba bersih', value: 'Rp 22.3jt', delta: 0.187,  tone: 'success' as const }
  ];

  const sampleSJ = {
    id: 1,
    sj_no: 'SJ-2406015',
    destination: 'Cabang Bandung',
    status: 'MENUNGGU_APPROVAL' as const,
    items: [
      { product_id: 1, product_name: 'Aqua 600ml', qty: 48, unit: 'btl' },
      { product_id: 2, product_name: 'Indomie Goreng', qty: 120, unit: 'pcs' },
      { product_id: 3, product_name: 'Rokok Surya 12', qty: 24, unit: 'bks' }
    ],
    total_items: 3,
    notes: 'Pengiriman reguler mingguan',
    order_reference: 'ORD-2406010',
    created_at: '2026-06-19T07:32:00Z',
    created_by_name: 'Admin Gudang',
    approvals: [
      { stage: 'GUDANG_REVIEW', decision: 'APPROVE', decided_by: 'Budi Santoso', decided_at: '2026-06-19T07:45:00Z', reason: 'Stok cukup' }
    ]
  };

  const aiConversation = {
    id: 1,
    title: 'Penjualan minggu ini',
    messages: [
      { id: 1, role: 'user' as const, content: 'Bagaimana performa penjualan minggu ini?', created_at: '2026-06-19T10:00:00Z' },
      { id: 2, role: 'assistant' as const, content: 'AI belum tersedia (MVP placeholder). Backend integration dengan LLM akan dilakukan di Tahap 2.', created_at: '2026-06-19T10:00:02Z' }
    ]
  };

  const aiInsights = [
    'Apa best seller minggu ini?',
    'Berapa laba bersih bulan lalu?',
    'Produk apa yang perlu restock?',
    'Karyawan dengan performa terbaik?'
  ];

  const samplePOs = [
    { id: 1, po_no: 'PO-2406012', supplier_name: 'PT Indofood Sukses Makmur', status: 'MENUNGGU_VERIFIKASI' as const, received_at: '2026-06-19T08:00:00Z', total_items: 15, total_value: 4_500_000 },
    { id: 2, po_no: 'PO-2406011', supplier_name: 'PT Aqua Golden Mississippi',  status: 'TERVERIFIKASI' as const,       received_at: '2026-06-18T13:15:00Z', verified_at: '2026-06-18T14:00:00Z', total_items: 8,  total_value: 2_800_000 },
    { id: 3, po_no: 'PO-2406010', supplier_name: 'PT HM Sampoerna',             status: 'DITOLAK' as const,             received_at: '2026-06-17T10:30:00Z', total_items: 5,  total_value: 1_200_000, notes: 'Qty tidak sesuai' }
  ];

  // Just dummy handlers for demo (no actual logic)
  const handleApprove = (_sj: any) => alert('Approve (mock)');
  const handleReject = (_r: string) => alert('Reject: ' + _r);
  const handleSubmit = (_p: string) => alert('Submit prompt: ' + _p);
  const handleNewConvo = () => alert('New conversation');
  const handleSaveHours = (_v: any) => alert('Save hours');
  const handleVerifyPO = (_po: any) => alert('Verify: ' + _po.po_no);
  const handleRejectPO = (_po: any) => alert('Reject: ' + _po.po_no);
  const handleViewPO = (_po: any) => alert('View: ' + _po.po_no);
  const handleRowClick = (_row: any) => alert('Row: ' + _row.period);
</script>

<RoleShell role="manager" title="Widgets Demo" subtitle="6 R3f components reference integration">
  <div class="p-6 space-y-6 bg-gray-50 min-h-screen">

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">📊 Sales Table</h2>
      <SalesTable rows={salesRows} onRowClick={handleRowClick} />
    </section>

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">💡 Business Insights</h2>
      <BusinessAnalytics {insights} {kpis} />
    </section>

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">📋 Surat Jalan Approval</h2>
      <SJManagement sj={sampleSJ} canApprove={true} onApprove={handleApprove} onReject={handleReject} />
    </section>

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">🤖 AI Chat</h2>
      <div class="h-96">
        <AIChat conversation={aiConversation} insights={aiInsights} onSubmit={handleSubmit} onNewConversation={handleNewConvo} />
      </div>
    </section>

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">⏰ Operational Hours</h2>
      <OperationalHours onSave={handleSaveHours} />
    </section>

    <section>
      <h2 class="text-lg font-bold text-gray-800 mb-3">📦 PO List (Gudang)</h2>
      <POList pos={samplePOs} onVerify={handleVerifyPO} onReject={handleRejectPO} onView={handleViewPO} />
    </section>

  </div>
</RoleShell>