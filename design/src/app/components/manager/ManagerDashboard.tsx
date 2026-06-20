import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Store, ShoppingBag,
  AlertCircle, CheckCircle2, Clock, Bell, Send, ChevronRight,
  BarChart2, ArrowUpRight, ArrowDownRight, Calendar, Filter,
  Download, Settings, Eye, RefreshCw, Star, Zap, MessageCircle,
  UserCheck, UserX, Package, DollarSign, Activity, MapPin
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const REVENUE_DATA = [
  { date: "4 Jun", revenue: 12400000, transactions: 142 },
  { date: "5 Jun", revenue: 15200000, transactions: 178 },
  { date: "6 Jun", revenue: 11800000, transactions: 131 },
  { date: "7 Jun", revenue: 18600000, transactions: 214 },
  { date: "8 Jun", revenue: 16400000, transactions: 192 },
  { date: "9 Jun", revenue: 21200000, transactions: 243 },
  { date: "10 Jun", revenue: 19800000, transactions: 228 },
];

const OUTLET_DATA = [
  { outlet: "Outlet Utama", revenue: 8200000, transactions: 95, target: 10000000, staff: 4, status: "open" },
  { outlet: "Cabang Sudirman", revenue: 6400000, transactions: 74, target: 7000000, staff: 3, status: "open" },
  { outlet: "Cabang Kelapa Gading", revenue: 3100000, transactions: 38, target: 5000000, staff: 2, status: "open" },
  { outlet: "Cabang Tangerang", revenue: 2100000, transactions: 21, target: 4000000, staff: 2, status: "closed" },
];

const SHIFTS = [
  { name: "Andi Nugraha", role: "Kasir", outlet: "Outlet Utama", checkin: "08:02", status: "active", transactions: 42, revenue: 3200000 },
  { name: "Budi Santoso", role: "Kasir", outlet: "Cabang Sudirman", checkin: "08:15", status: "active", transactions: 38, revenue: 2800000 },
  { name: "Citra Dewi", role: "Kasir", outlet: "Cabang Kelapa Gading", checkin: "08:30", status: "active", transactions: 22, revenue: 1600000 },
  { name: "Dimas Pratama", role: "Supervisor", outlet: "Outlet Utama", checkin: "07:45", status: "active", transactions: 0, revenue: 0 },
  { name: "Eka Wulandari", role: "Kasir", outlet: "Cabang Tangerang", checkin: "-", status: "absent", transactions: 0, revenue: 0 },
];

const APPROVALS = [
  { id: "APR-001", type: "Diskon Khusus", requestBy: "Budi Santoso", outlet: "Cabang Sudirman", value: "15%", amount: 450000, time: "5 mnt lalu", urgent: true },
  { id: "APR-002", type: "Retur Barang", requestBy: "Citra Dewi", outlet: "Cabang Kelapa Gading", value: "2 item", amount: 89000, time: "12 mnt lalu", urgent: false },
  { id: "APR-003", type: "Void Transaksi", requestBy: "Andi Nugraha", outlet: "Outlet Utama", value: "TXN-2406871", amount: 320000, time: "28 mnt lalu", urgent: true },
  { id: "APR-004", type: "Stok Opname", requestBy: "Dimas Pratama", outlet: "Outlet Utama", value: "24 SKU", amount: 0, time: "1 jam lalu", urgent: false },
];

const NOTIFICATIONS = [
  { id: 1, type: "alert", msg: "Stok Kaos Polos Cotton kritis (3 pcs) di Outlet Utama", time: "5 mnt", read: false },
  { id: 2, type: "success", msg: "Target harian Outlet Utama tercapai 82%", time: "32 mnt", read: false },
  { id: 3, type: "info", msg: "Shift Eka Wulandari belum check-in (Cabang Tangerang)", time: "1 jam", read: false },
  { id: 4, type: "success", msg: "Delivery Order DO-2406014 dari Unilever telah tiba", time: "2 jam", read: true },
  { id: 5, type: "alert", msg: "Transaksi void menunggu persetujuan dari Andi Nugraha", time: "3 jam", read: true },
];

const CATEGORY_SALES = [
  { name: "Makanan", value: 35 },
  { name: "Minuman", value: 28 },
  { name: "Pakaian", value: 17 },
  { name: "Elektronik", value: 12 },
  { name: "Lainnya", value: 8 },
];

const PIE_COLORS = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6"];

const formatRupiah = (n: number) => {
  if (n >= 1000000) return "Rp " + (n / 1000000).toFixed(1) + " Jt";
  return "Rp " + n.toLocaleString("id-ID");
};

const TABS = ["Ringkasan", "Outlet", "Shift Karyawan", "Persetujuan", "Notifikasi Telegram"];

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(APPROVALS);

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
  };
  const handleReject = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const totalRevToday = OUTLET_DATA.reduce((s, o) => s + o.revenue, 0);
  const totalTxToday = OUTLET_DATA.reduce((s, o) => s + o.transactions, 0);
  const activeStaff = SHIFTS.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "var(--background)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "#fff", borderColor: "var(--border)" }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>Dashboard Manager</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Selasa, 10 Juni 2026 • 4 Outlet Aktif</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", fontSize: 13 }}>
            <Calendar size={14} style={{ color: "var(--muted-foreground)" }} /> 1–10 Jun 2026
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 13, fontWeight: 600 }}>
            <Download size={14} /> Export Laporan
          </button>
          <div className="relative">
            <button className="w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: "var(--border)" }}>
              <Bell size={16} />
            </button>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "var(--destructive)", color: "#fff", fontSize: 9, fontWeight: 700 }}>3</div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3 px-6 py-3">
        {[
          { label: "Pendapatan Hari Ini", value: formatRupiah(totalRevToday), sub: "+12.4% dari kemarin", icon: DollarSign, color: "var(--hekas-blue)", bg: "#DBEAFE", trend: "up" },
          { label: "Total Transaksi", value: totalTxToday.toString(), sub: "228 transaksi", icon: ShoppingBag, color: "#059669", bg: "#D1FAE5", trend: "up" },
          { label: "Staff Aktif", value: `${activeStaff}/5`, sub: "1 tidak hadir", icon: UserCheck, color: "#7C3AED", bg: "#EDE9FE", trend: "neutral" },
          { label: "Perlu Persetujuan", value: pendingApprovals.length.toString(), sub: `${pendingApprovals.filter(a => a.urgent).length} urgent`, icon: AlertCircle, color: "#D97706", bg: "#FEF3C7", trend: "neutral" },
          { label: "Avg per Transaksi", value: formatRupiah(Math.round(totalRevToday / totalTxToday)), sub: "vs Rp 86.400 kemarin", icon: Activity, color: "#0EA5E9", bg: "#E0F2FE", trend: "up" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between mb-2">
              <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
                <kpi.icon size={15} style={{ color: kpi.color }} />
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{kpi.value}</div>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === "up" && <ArrowUpRight size={12} style={{ color: "#059669" }} />}
              <span style={{ fontSize: 11, color: kpi.trend === "up" ? "#059669" : "var(--muted-foreground)" }}>{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 pb-3 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className="px-4 py-2 rounded-xl whitespace-nowrap transition-all"
            style={{
              background: activeTab === i ? "var(--hekas-blue)" : "#fff",
              color: activeTab === i ? "#fff" : "var(--muted-foreground)",
              fontSize: 13,
              fontWeight: 600,
              border: activeTab === i ? "none" : "1px solid var(--border)",
            }}
          >
            {tab}
            {tab === "Persetujuan" && pendingApprovals.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full" style={{ fontSize: 10, background: activeTab === i ? "rgba(255,255,255,0.3)" : "#FEE2E2", color: activeTab === i ? "#fff" : "#DC2626" }}>{pendingApprovals.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 0 && (
          <div className="grid grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="col-span-2 rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Tren Pendapatan</h3>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>7 hari terakhir</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "#D1FAE5" }}>
                  <TrendingUp size={13} style={{ color: "#059669" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>+18.2%</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={REVENUE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Jt`} style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v: number) => [formatRupiah(v), "Pendapatan"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#2563EB" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Kategori Terlaris</h3>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>Distribusi penjualan hari ini</p>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={CATEGORY_SALES} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                    {CATEGORY_SALES.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {CATEGORY_SALES.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{c.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Bar */}
            <div className="col-span-2 rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Transaksi per Hari</h3>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>7 hari terakhir</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis style={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Approvals */}
            <div className="rounded-2xl p-4 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>Persetujuan Tertunda</h3>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{pendingApprovals.length} item</span>
              </div>
              {pendingApprovals.slice(0, 3).map((a) => (
                <div key={a.id} className="py-2.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    {a.urgent && <Zap size={12} style={{ color: "#F59E0B" }} />}
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{a.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 6 }}>oleh {a.requestBy} • {a.time}</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleReject(a.id)} className="flex-1 py-1 rounded-lg border text-center" style={{ borderColor: "var(--border)", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)" }}>Tolak</button>
                    <button onClick={() => handleApprove(a.id)} className="flex-1 py-1 rounded-lg text-center" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 11, fontWeight: 600 }}>Setujui</button>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <div className="py-6 text-center" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>
                  <CheckCircle2 size={24} className="mx-auto mb-2 opacity-30" />
                  Semua telah disetujui
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-3">
            {OUTLET_DATA.map((outlet) => {
              const pct = Math.round((outlet.revenue / outlet.target) * 100);
              return (
                <div key={outlet.outlet} className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                        <Store size={18} style={{ color: "var(--hekas-blue)" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{outlet.outlet}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: outlet.status === "open" ? "#10B981" : "#94A3B8" }} />
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{outlet.status === "open" ? "Buka" : "Tutup"} • {outlet.staff} staff</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--hekas-blue)" }}>{formatRupiah(outlet.revenue)}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{outlet.transactions} transaksi</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Target: {formatRupiah(outlet.target)}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 80 ? "#059669" : pct >= 50 ? "#D97706" : "#DC2626" }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 2 && (
          <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "var(--border)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700 }}>Monitoring Shift Hari Ini</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                  {["Karyawan", "Jabatan", "Outlet", "Check In", "Status", "Transaksi", "Omzet"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map((s) => (
                  <tr key={s.name} className="border-b hover:bg-slate-50 transition-colors" style={{ borderColor: "var(--border)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--secondary)", fontSize: 11, fontWeight: 700, color: "var(--hekas-blue)" }}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.role}</td>
                    <td className="px-4 py-3" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.outlet}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 500 }}>{s.checkin}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{
                        fontSize: 11,
                        fontWeight: 600,
                        background: s.status === "active" ? "#D1FAE5" : "#FEE2E2",
                        color: s.status === "active" ? "#065F46" : "#991B1B",
                      }}>
                        {s.status === "active" ? "Aktif" : "Tidak Hadir"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 500 }}>{s.transactions > 0 ? s.transactions : "-"}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: "var(--hekas-blue)" }}>{s.revenue > 0 ? formatRupiah(s.revenue) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="rounded-2xl p-12 border text-center" style={{ background: "#fff", borderColor: "var(--border)" }}>
                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
                <div style={{ fontSize: 15, fontWeight: 600 }}>Tidak ada persetujuan tertunda</div>
                <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Semua permintaan telah diproses</div>
              </div>
            ) : pendingApprovals.map((a) => (
              <div key={a.id} className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: a.urgent ? "#FEF3C7" : "var(--secondary)" }}>
                      {a.urgent ? <Zap size={18} style={{ color: "#D97706" }} /> : <CheckCircle2 size={18} style={{ color: "var(--hekas-blue)" }} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{a.type}</span>
                        {a.urgent && <span className="px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 700 }}>URGENT</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Oleh {a.requestBy} • {a.outlet}</div>
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{a.id} • {a.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.amount > 0 && <div style={{ fontSize: 16, fontWeight: 800, color: "var(--hekas-blue)" }}>{formatRupiah(a.amount)}</div>}
                    <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{a.value}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleReject(a.id)} className="flex-1 py-2.5 rounded-xl border text-center" style={{ borderColor: "var(--border)", fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)" }}>Tolak</button>
                  <button onClick={() => handleApprove(a.id)} className="flex-1 py-2.5 rounded-xl text-center" style={{ background: "var(--hekas-blue)", color: "#fff", fontSize: 13, fontWeight: 700 }}>Setujui</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 4 && (
          <div className="grid grid-cols-2 gap-4">
            {/* Notification Feed */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: "#fff", borderColor: "var(--border)" }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} style={{ color: "#2CA5E0" }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Notifikasi Telegram</h3>
                </div>
                <div className="px-2 py-0.5 rounded-full" style={{ background: "#E0F2FE", color: "#0369A1", fontSize: 11, fontWeight: 600 }}>Terhubung</div>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {NOTIFICATIONS.map((n) => (
                  <div key={n.id} className="px-4 py-3 flex items-start gap-3" style={{ background: n.read ? "#fff" : "#F0F7FF" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                      background: n.type === "alert" ? "#FEE2E2" : n.type === "success" ? "#D1FAE5" : "#DBEAFE",
                    }}>
                      {n.type === "alert" && <AlertCircle size={13} style={{ color: "#DC2626" }} />}
                      {n.type === "success" && <CheckCircle2 size={13} style={{ color: "#059669" }} />}
                      {n.type === "info" && <Bell size={13} style={{ color: "var(--hekas-blue)" }} />}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 12, lineHeight: 1.5 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{n.time} lalu</div>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--hekas-blue)" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Telegram Config */}
            <div className="space-y-3">
              <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#E0F2FE" }}>
                    <Send size={15} style={{ color: "#2CA5E0" }} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Konfigurasi Bot</h3>
                </div>
                {[
                  { label: "Bot Token", value: "7654321098:AAF******* (tersembunyi)" },
                  { label: "Chat ID", value: "-100123456789" },
                  { label: "Channel", value: "@hekas_notif_utama" },
                ].map((f) => (
                  <div key={f.label} className="mb-3">
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                    <div className="px-3 py-2 rounded-xl" style={{ background: "var(--input-background)", fontSize: 12, fontFamily: "monospace" }}>{f.value}</div>
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl mt-2" style={{ background: "#E0F2FE", color: "#0369A1", fontSize: 13, fontWeight: 600 }}>
                  Test Koneksi Telegram
                </button>
              </div>

              <div className="rounded-2xl p-5 border" style={{ background: "#fff", borderColor: "var(--border)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Trigger Notifikasi Aktif</h3>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>Notifikasi dikirim otomatis ke Telegram</p>
                {[
                  { label: "Stok kritis (< minimum)", enabled: true },
                  { label: "Transaksi besar (> Rp 500rb)", enabled: true },
                  { label: "Permintaan persetujuan", enabled: true },
                  { label: "Staff absen shift", enabled: false },
                  { label: "Laporan harian otomatis", enabled: true },
                  { label: "Delivery order tiba", enabled: false },
                ].map((trigger) => (
                  <div key={trigger.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <span style={{ fontSize: 12 }}>{trigger.label}</span>
                    <div className="w-9 h-5 rounded-full flex items-center px-0.5 transition-colors" style={{ background: trigger.enabled ? "var(--hekas-blue)" : "var(--switch-background)" }}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all" style={{ transform: trigger.enabled ? "translateX(16px)" : "translateX(0)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
