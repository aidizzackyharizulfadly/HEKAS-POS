/* MARKER-MAKE-KIT-INVOKED */
import { useState } from "react";
import {
  ShoppingCart, Package, BarChart2, ChevronRight,
  LogOut, Store, Bell, Settings, Menu, X,
  Users, Warehouse, LayoutDashboard
} from "lucide-react";
import { CashierPOS } from "./components/cashier/CashierPOS";
import { WarehouseDashboard } from "./components/warehouse/WarehouseDashboard";
import { ManagerDashboard } from "./components/manager/ManagerDashboard";

type Role = "cashier" | "warehouse" | "manager";
type RoleDef = { id: Role; label: string; desc: string; icon: React.ElementType; color: string; bg: string };

const ROLES: RoleDef[] = [
  {
    id: "cashier",
    label: "Kasir",
    desc: "Transaksi penjualan & pembayaran",
    icon: ShoppingCart,
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  {
    id: "warehouse",
    label: "Admin Gudang",
    desc: "Manajemen stok & pengiriman",
    icon: Warehouse,
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  {
    id: "manager",
    label: "Manager",
    desc: "Dashboard KPI & analitik outlet",
    icon: LayoutDashboard,
    color: "#059669",
    bg: "#D1FAE5",
  },
];

const MANAGER_NAV = [
  { id: "summary", label: "Ringkasan", icon: LayoutDashboard },
  { id: "outlet", label: "Outlet", icon: Store },
  { id: "shift", label: "Shift", icon: Users },
  { id: "approval", label: "Persetujuan", icon: Bell },
  { id: "telegram", label: "Telegram", icon: Settings },
];

const WAREHOUSE_NAV = [
  { id: "inventory", label: "Inventaris", icon: Package },
  { id: "transfer", label: "Transfer", icon: ChevronRight },
  { id: "delivery", label: "Delivery", icon: Store },
];

function RoleSelector({ onSelect }: { onSelect: (role: Role) => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: "var(--hekas-navy)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          style={{ background: "var(--hekas-blue)" }}
        >
          <Store size={32} className="text-white" />
        </div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>
          HEKAS <span style={{ color: "#93C5FD" }}>POS</span>
        </h1>
        <p style={{ color: "rgba(226,235,248,0.6)", fontSize: 14, marginTop: 4 }}>
          Point of Sale System
        </p>
      </div>

      {/* Outlet Badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full mb-8"
        style={{ background: "rgba(255,255,255,0.08)", color: "#93C5FD", fontSize: 13, fontWeight: 500 }}
      >
        <Store size={14} />
        PT Nusantara Retail Jaya — Outlet Utama
      </div>

      {/* Role Cards */}
      <div className="flex gap-4 w-full max-w-2xl">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelect(role.id)}
            className="flex-1 rounded-2xl p-6 text-left transition-all group hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: role.bg }}
            >
              <role.icon size={22} style={{ color: role.color }} />
            </div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{role.label}</h3>
            <p style={{ color: "rgba(226,235,248,0.55)", fontSize: 12, lineHeight: 1.5 }}>{role.desc}</p>
            <div
              className="flex items-center gap-1 mt-4"
              style={{ color: "#93C5FD", fontSize: 12, fontWeight: 600 }}
            >
              Masuk <ChevronRight size={14} />
            </div>
          </button>
        ))}
      </div>

      <p style={{ color: "rgba(226,235,248,0.3)", fontSize: 12, marginTop: 10 }}>
        Selasa, 10 Juni 2026 • v2.4.1
      </p>
    </div>
  );
}

function AppShell({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const def = ROLES.find((r) => r.id === role)!;

  if (role === "cashier") {
    return (
      <div className="h-screen overflow-hidden">
        <CashierPOS onLogout={onLogout} />
      </div>
    );
  }

  const navItems = role === "manager" ? MANAGER_NAV : WAREHOUSE_NAV;

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col py-4 shrink-0"
        style={{ background: "var(--hekas-navy)" }}
      >
        {/* Logo */}
        <div className="px-4 flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--hekas-blue)" }}>
            <Store size={16} className="text-white" />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>HEKAS POS</div>
            <div style={{ color: "rgba(226,235,248,0.45)", fontSize: 10 }}>v2.4.1</div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mx-3 mb-4 px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: def.bg }}>
            <def.icon size={14} style={{ color: def.color }} />
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{def.label}</div>
            <div style={{ color: "rgba(226,235,248,0.45)", fontSize: 10 }}>Outlet Utama</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors"
              style={{
                background: idx === 0 ? "var(--hekas-blue)" : "transparent",
                color: idx === 0 ? "#fff" : "rgba(226,235,248,0.6)",
                cursor: "default",
              }}
            >
              <item.icon size={15} />
              <span style={{ fontSize: 13, fontWeight: idx === 0 ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--hekas-blue)", color: "#fff" }}>
              {role === "manager" ? "RH" : role === "warehouse" ? "FP" : "AN"}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>
                {role === "manager" ? "Rizky Handoko" : role === "warehouse" ? "Fajar Pratama" : "Andi Nugraha"}
              </div>
              <div style={{ color: "rgba(226,235,248,0.4)", fontSize: 10, textTransform: "capitalize" }}>{def.label}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-xl"
            style={{ color: "rgba(226,235,248,0.45)", fontSize: 12 }}
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {role === "warehouse" && <WarehouseDashboard />}
        {role === "manager" && <ManagerDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState<Role | null>(null);

  if (!role) {
    return <RoleSelector onSelect={setRole} />;
  }

  return <AppShell role={role} onLogout={() => setRole(null)} />;
}
