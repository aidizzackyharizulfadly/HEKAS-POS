import { useState } from "react";
import {
  Package, Search, ArrowRightLeft, Truck, AlertTriangle,
  CheckCircle2, Clock, ChevronRight, Filter, Download,
  Plus, TrendingUp, TrendingDown, BarChart2, RefreshCw,
  Boxes, MapPin, ArrowUp, ArrowDown
} from "lucide-react";

const STOCK_ITEMS = [
  { id: 1, sku: "MKN001", name: "Indomie Goreng", category: "Makanan", stock: 120, min: 50, unit: "pcs", outlet: "Gudang Utama", status: "ok" },
  { id: 2, sku: "MNM001", name: "Aqua 600ml", category: "Minuman", stock: 200, min: 100, unit: "btl", outlet: "Gudang Utama", status: "ok" },
  { id: 3, sku: "ELK001", name: "Earphone JBL", category: "Elektronik", stock: 8, min: 10, unit: "pcs", outlet: "Gudang Utama", status: "low" },
  { id: 4, sku: "PKN001", name: "Kaos Polos Cotton", category: "Pakaian", stock: 3, min: 20, unit: "pcs", outlet: "Gudang Utama", status: "critical" },
  { id: 5, sku: "MNM002", name: "Teh Botol Sosro", category: "Minuman", stock: 85, min: 60, unit: "btl", outlet: "Gudang Cabang 1", status: "ok" },
  { id: 6, sku: "KCT001", name: "Lipstik Implora", category: "Kecantikan", stock: 70, min: 30, unit: "pcs", outlet: "Gudang Utama", status: "ok" },
  { id: 7, sku: "OLR001", name: "Botol Minum 1L", category: "Olahraga", stock: 12, min: 20, unit: "pcs", outlet: "Gudang Cabang 2", status: "low" },
  { id: 8, sku: "BAY001", name: "Krim Bayi Johnson", category: "Bayi", stock: 45, min: 25, unit: "pcs", outlet: "Gudang Utama", status: "ok" },
];

const TRANSFERS = [
  { id: "TR-2406001", from: "Gudang Utama", to: "Outlet Cabang 1", items: 5, status: "transit", date: "10 Jun 2026", qty: 120 },
  { id: "TR-2406002", from: "Gudang Cabang 2", to: "Gudang Utama", items: 3, status: "pending", date: "10 Jun 2026", qty: 45 },
  { id: "TR-2406003", from: "Gudang Utama", to: "Outlet Cabang 3", items: 8, status: "completed", date: "09 Jun 2026", qty: 200 },
  { id: "TR-2405098", from: "Gudang Utama", to: "Outlet Utama", items: 12, status: "completed", date: "08 Jun 2026", qty: 350 },
];

const DELIVERIES = [
  { id: "DO-2406015", supplier: "PT Indofood Sukses Makmur", items: 15, status: "scheduled", date: "11 Jun 2026", value: 4500000 },
  { id: "DO-2406014", supplier: "PT Unilever Indonesia", items: 8, status: "arrived", date: "10 Jun 2026", value: 2200000 },
  { id: "DO-2406013", supplier: "PT Aqua Golden Mississippi", items: 6, status: "checking", date: "10 Jun 2026", value: 1800000 },
  { id: "DO-2406012", supplier: "PT JBL Indonesia", items: 4, status: "completed", date: "09 Jun 2026", value: 7200000 },
];

const TABS = ["Inventaris", "Transfer Barang", "Delivery Order"];

const statusConfig = {
  ok: { label: "Normal", bg: "#D1FAE5", color: "#065F46" },
  low: { label: "Hampir Habis", bg: "#FEF3C7", color: "#92400E" },
  critical: { label: "Kritis", bg: "#FEE2E2", color: "#991B1B" },
  transit: { label: "Dalam Pengiriman", bg: "#DBEAFE", color: "#1E40AF" },
  pending: { label: "Menunggu", bg: "#FEF3C7", color: "#92400E" },
  completed: { label: "Selesai", bg: "#D1FAE5", color: "#065F46" },
  scheduled: { label: "Terjadwal", bg: "#EDE9FE", color: "#5B21B6" },
  arrived: { label: "Tiba", bg: "#DBEAFE", color: "#1E40AF" },
  checking: { label: "Sedang Dicek", bg: "#FEF3C7", color: "#92400E" },
};

const formatRupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function WarehouseDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState("");
  const [newTransferModal, setNewTransferModal] = useState(false);

  const filteredStock = STOCK_ITEMS.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = STOCK_ITEMS.filter((i) => i.status === "critical").length;
  const lowCount = STOCK_ITEMS.filter((i) => i.status === "low").length;
  const totalItems = STOCK_ITEMS.reduce((s, i) => s + i.stock, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "#fff", borderColor: "var(--border)" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Manajemen Gudang</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Gudang Utama • Sinkronisasi terakhir: 2 menit lalu</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", fontSize: 13, fontWeight: 500 }}>
            <RefreshCw size={14} /> Sinkronisasi
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 13, fontWeight: 600 }}>
            <Plus size={14} /> Tambah Stok
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 px-6 py-3">
        {[
          { label: "Total Produk", value: STOCK_ITEMS.length, sub: "SKU aktif", icon: Boxes, color: "var(--hekas-blue)", bg: "#DBEAFE" },
          { label: "Total Stok", value: totalItems.toLocaleString("id-ID"), sub: "unit", icon: Package, color: "#059669", bg: "#D1FAE5" },
          { label: "Stok Hampir Habis", value: lowCount, sub: "SKU perlu restock", icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" },
          { label: "Stok Kritis", value: criticalCount, sub: "butuh tindakan segera", icon: AlertTriangle, color: "#DC2626", bg: "#FEE2E2" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)" }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{kpi.sub}</div>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pb-3">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className="px-4 py-2 rounded-xl transition-all"
            style={{
              background: activeTab === i ? "var(--hekas-blue)" : "#fff",
              color: activeTab === i ? "#fff" : "var(--muted-foreground)",
              fontSize: 13,
              fontWeight: 600,
              border: activeTab === i ? "none" : "1px solid var(--border)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 0 && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari produk atau SKU..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: "var(--input-background)", borderColor: "var(--border)" }}
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border" style={{ borderColor: "var(--border)", fontSize: 12, fontWeight: 500 }}>
                <Filter size={13} /> Filter
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border" style={{ borderColor: "var(--border)", fontSize: 12, fontWeight: 500 }}>
                <Download size={13} /> Export
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                  {["SKU", "Nama Produk", "Kategori", "Stok", "Stok Min", "Lokasi", "Status"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStock.map((item, idx) => {
                  const s = statusConfig[item.status as keyof typeof statusConfig];
                  return (
                    <tr key={item.id} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: "var(--border)" }}>
                      <td className="px-4 py-3" style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}>{item.sku}</td>
                      <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</td>
                      <td className="px-4 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{item.category}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: 14, fontWeight: 700 }}>{item.stock}</span>
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{item.unit}</span>
                          {item.stock < item.min ? (
                            <ArrowDown size={12} style={{ color: "#DC2626" }} />
                          ) : (
                            <ArrowUp size={12} style={{ color: "#059669" }} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{item.min} {item.unit}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                          <MapPin size={11} /> {item.outlet}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Riwayat Transfer Barang</h3>
              <button
                onClick={() => setNewTransferModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 13, fontWeight: 600 }}
              >
                <Plus size={14} /> Buat Transfer
              </button>
            </div>
            {TRANSFERS.map((t) => {
              const s = statusConfig[t.status as keyof typeof statusConfig];
              return (
                <div key={t.id} className="rounded-2xl p-4 border flex items-center gap-4" style={{ background: "#fff", borderColor: "var(--border)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                    <ArrowRightLeft size={18} style={{ color: "var(--hekas-blue)" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{t.id}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      <MapPin size={11} /> {t.from}
                      <ChevronRight size={12} />
                      <MapPin size={11} /> {t.to}
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t.items} SKU • {t.qty} unit</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.date}</div>
                  </div>
                  <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Delivery Order</h3>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                <Plus size={14} /> Buat DO
              </button>
            </div>
            {DELIVERIES.map((d) => {
              const s = statusConfig[d.status as keyof typeof statusConfig];
              return (
                <div key={d.id} className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE" }}>
                        <Truck size={18} style={{ color: "#7C3AED" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{d.id}</span>
                          <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{d.supplier}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--hekas-blue)" }}>{formatRupiah(d.value)}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{d.items} item • {d.date}</div>
                    </div>
                  </div>
                  {d.status === "arrived" || d.status === "checking" ? (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 rounded-xl border text-center" style={{ borderColor: "var(--border)", fontSize: 12, fontWeight: 600 }}>Tolak</button>
                      <button className="flex-1 py-2 rounded-xl text-center" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 12, fontWeight: 600 }}>Terima & Cek</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
