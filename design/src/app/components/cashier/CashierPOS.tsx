import { useState, useEffect, useRef } from "react";
import {
  Search, ShoppingCart, Package, BarChart2, Settings,
  LogOut, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  X, CheckCircle2, Printer, User, UserPlus, ScanLine, Clock,
  MoreHorizontal, PauseCircle, Store,
  ShoppingBag, FileText, Users, LayoutGrid, RotateCcw, Check,
  Percent
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  sku: string;
  barcode: string;
  stock: number;
  unit: string;
  image: string;
}

interface CartItem extends Product {
  qty: number;
  disc: number; // per-item discount in Rp
}

interface Member {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: "Silver" | "Gold" | "Platinum";
}

type PaymentMethod = "tunai" | "qris" | "debit";
type ModalState = "none" | "payment" | "hold" | "receipt" | "member" | "discount" | "numpad";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "minuman", label: "Minuman" },
  { id: "snack", label: "Snack" },
  { id: "sembako", label: "Sembako" },
  { id: "frozen", label: "Frozen" },
  { id: "rokok", label: "Rokok" },
  { id: "lainnya", label: "Lainnya" },
];

const PRODUCTS: Product[] = [
  { id: 1,  name: "Aqua 600ml",          price: 4000,   category: "minuman", sku: "MNM001", barcode: "8996001300050", stock: 144, unit: "btl", image: "💧" },
  { id: 2,  name: "Teh Botol Sosro 350ml",price: 5000,  category: "minuman", sku: "MNM002", barcode: "8992388100060", stock: 72,  unit: "btl", image: "🍵" },
  { id: 3,  name: "Pocari Sweat 330ml",   price: 8500,  category: "minuman", sku: "MNM003", barcode: "4901085088700", stock: 36,  unit: "btl", image: "🥤" },
  { id: 4,  name: "Milo 3in1 Sachet",     price: 3000,  category: "minuman", sku: "MNM004", barcode: "4800361001204", stock: 240, unit: "pcs", image: "🥛" },
  { id: 5,  name: "Chitato Sapi Panggang",price: 14000, category: "snack",   sku: "SNK001", barcode: "8992752210011", stock: 48,  unit: "pcs", image: "🥨" },
  { id: 6,  name: "Qtela Singkong BBQ",   price: 9500,  category: "snack",   sku: "SNK002", barcode: "8993022000120", stock: 60,  unit: "pcs", image: "🍿" },
  { id: 7,  name: "Richeese Nabati",      price: 5500,  category: "snack",   sku: "SNK003", barcode: "8992979200050", stock: 84,  unit: "pcs", image: "🧀" },
  { id: 8,  name: "Oreo Vanilla 119g",    price: 12500, category: "snack",   sku: "SNK004", barcode: "7622200672070", stock: 30,  unit: "pcs", image: "🍪" },
  { id: 9,  name: "Indomie Goreng",       price: 3500,  category: "sembako", sku: "SBK001", barcode: "8992388101038", stock: 200, unit: "pcs", image: "🍜" },
  { id: 10, name: "Beras Cap Ayam 5kg",   price: 68000, category: "sembako", sku: "SBK002", barcode: "8996001000025", stock: 20,  unit: "kg",  image: "🌾" },
  { id: 11, name: "Minyak Goreng Tropical 1L", price: 18500, category: "sembako", sku: "SBK003", barcode: "8999999011111", stock: 35, unit: "ltr", image: "🫙" },
  { id: 12, name: "Gula Pasir 1kg",       price: 15000, category: "sembako", sku: "SBK004", barcode: "8999999022222", stock: 45,  unit: "kg",  image: "🍬" },
  { id: 13, name: "Sosis So Nice 375g",   price: 24000, category: "frozen",  sku: "FRZ001", barcode: "8993351000130", stock: 24,  unit: "pcs", image: "🌭" },
  { id: 14, name: "Nugget So Good 500g",  price: 38000, category: "frozen",  sku: "FRZ002", barcode: "8993351000147", stock: 18,  unit: "pcs", image: "🍗" },
  { id: 15, name: "Sampoerna Mild 16",    price: 32000, category: "rokok",   sku: "ROK001", barcode: "8990009000010", stock: 60,  unit: "bks", image: "🚬" },
  { id: 16, name: "Dji Sam Soe Filter",   price: 28000, category: "rokok",   sku: "ROK002", barcode: "8990009000027", stock: 40,  unit: "bks", image: "🚬" },
  { id: 17, name: "Sabun Lifebuoy 90g",   price: 5500,  category: "lainnya", sku: "LNY001", barcode: "8851932091111", stock: 90,  unit: "pcs", image: "🧼" },
  { id: 18, name: "Shampoo Sunsilk 170ml",price: 22000, category: "lainnya", sku: "LNY002", barcode: "8851932092222", stock: 55,  unit: "btl", image: "🧴" },
  { id: 19, name: "Pasta Gigi Pepsodent", price: 12000, category: "lainnya", sku: "LNY003", barcode: "8851932093333", stock: 70,  unit: "pcs", image: "🪥" },
  { id: 20, name: "Kecap Bango 135ml",    price: 9000,  category: "lainnya", sku: "LNY004", barcode: "8887290011223", stock: 65,  unit: "btl", image: "🫙" },
];

const MEMBERS: Member[] = [
  { id: "M001", name: "Siti Rahayu",   phone: "081234567890", points: 1250, tier: "Gold" },
  { id: "M002", name: "Budi Setiawan", phone: "082345678901", points: 320,  tier: "Silver" },
  { id: "M003", name: "Dewi Lestari",  phone: "083456789012", points: 5800, tier: "Platinum" },
  { id: "M004", name: "Andi Rahman",   phone: "085678901234", points: 90,   tier: "Silver" },
];

const HELD: { id: string; items: number; total: number; time: string }[] = [
  { id: "H-001", items: 3, total: 47500,  time: "10:22" },
  { id: "H-002", items: 7, total: 124000, time: "10:38" },
];

const fmt = (n: number) =>
  "Rp " + n.toLocaleString("id-ID");

const tierColor: Record<Member["tier"], { bg: string; fg: string }> = {
  Silver:   { bg: "#F1F5F9", fg: "#64748B" },
  Gold:     { bg: "#FEF3C7", fg: "#92400E" },
  Platinum: { bg: "#EDE9FE", fg: "#5B21B6" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Clock12() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span>{now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CashierPOS({ onLogout }: { onLogout?: () => void }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [modal, setModal] = useState<ModalState>("none");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("tunai");
  const [cashInput, setCashInput] = useState("");
  const [globalDisc, setGlobalDisc] = useState(0);
  const [discInput, setDiscInput] = useState("");
  const [numpadTarget, setNumpadTarget] = useState<number | null>(null);
  const [numpadValue, setNumpadValue] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = PRODUCTS.filter(
    (p) =>
      (activeCategory === "all" || p.category === activeCategory) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Cart mutations ─────────────────────────────────────────────────────────
  const addProduct = (product: Product) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      if (ex) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1, disc: 0 }];
    });
  };

  const setQty = (id: number, qty: number) => {
    if (qty <= 0) return setCart((p) => p.filter((i) => i.id !== id));
    setCart((p) => p.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const removeItem = (id: number) =>
    setCart((p) => p.filter((i) => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setMember(null);
    setGlobalDisc(0);
    setCashInput("");
  };

  // ── Barcode scan ───────────────────────────────────────────────────────────
  const handleBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const found = PRODUCTS.find((p) => p.barcode === barcodeInput.trim());
      if (found) addProduct(found);
      setBarcodeInput("");
    }
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty - i.disc, 0);
  const discAmt   = Math.round((subtotal * globalDisc) / 100);
  const afterDisc = subtotal - discAmt;
  const tax       = Math.round(afterDisc * 0.11);
  const total     = afterDisc + tax;
  const change    = Number(cashInput.replace(/\D/g, "")) - total;
  const totalQty  = cart.reduce((s, i) => s + i.qty, 0);

  // ── Member search ─────────────────────────────────────────────────────────
  const memberResults = MEMBERS.filter(
    (m) =>
      memberSearch.length > 1 &&
      (m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone.includes(memberSearch))
  );

  // ── Numpad ────────────────────────────────────────────────────────────────
  const numpadPress = (k: string) => {
    if (k === "⌫") return setNumpadValue((v) => v.slice(0, -1));
    if (k === "C") return setNumpadValue("");
    setNumpadValue((v) => (v + k).slice(0, 9));
  };
  const numpadConfirm = () => {
    if (numpadTarget !== null) setQty(numpadTarget, Number(numpadValue) || 1);
    setNumpadTarget(null);
    setNumpadValue("");
    setModal("none");
  };

  const openNumpad = (itemId: number, currentQty: number) => {
    setNumpadTarget(itemId);
    setNumpadValue(String(currentQty));
    setModal("numpad");
  };

  return (
    <div
      className="flex h-screen overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif", background: "#F0F4F8" }}
    >
      {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="w-[60px] flex flex-col items-center py-3 shrink-0 z-10"
        style={{ background: "#1E3A5F" }}
      >
        {/* Logo mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
          style={{ background: "#2563EB" }}
        >
          <ShoppingBag size={18} style={{ color: "#fff" }} />
        </div>

        {/* Nav */}
        {[
          { icon: LayoutGrid,   label: "POS",       active: true  },
          { icon: FileText,     label: "Order",     active: false },
          { icon: Package,      label: "Produk",    active: false },
          { icon: Users,        label: "Pelanggan", active: false },
          { icon: Clock,        label: "Shift",     active: false },
          { icon: BarChart2,    label: "Laporan",   active: false },
          { icon: MoreHorizontal,label: "Lainnya",  active: false },
          { icon: Settings,     label: "Setting",   active: false },
        ].map((item) => (
          <button
            key={item.label}
            title={item.label}
            className="relative w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 mb-0.5 transition-all"
            style={{
              background: item.active ? "#2563EB" : "transparent",
              color: item.active ? "#fff" : "rgba(226,235,248,0.45)",
            }}
          >
            <item.icon size={17} strokeWidth={item.active ? 2.2 : 1.8} />
            <span style={{ fontSize: 8, lineHeight: 1 }}>{item.label}</span>
            {item.active && (
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l"
                style={{ background: "#93C5FD" }}
              />
            )}
          </button>
        ))}

        <div className="flex-1" />

        {/* Held transactions badge */}
        {HELD.length > 0 && (
          <button
            onClick={() => setModal("hold")}
            title="Transaksi Ditahan"
            className="relative w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 mb-1"
            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
          >
            <PauseCircle size={17} />
            <span style={{ fontSize: 8 }}>Hold</span>
            <div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: "#F59E0B", color: "#fff", fontSize: 9, fontWeight: 700 }}
            >
              {HELD.length}
            </div>
          </button>
        )}

        {/* User + Logout */}
        <div className="flex flex-col items-center gap-1 pt-2 border-t w-full" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <button
            title="Ganti User"
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5"
            style={{ color: "rgba(226,235,248,0.5)" }}
          >
            <User size={15} />
            <span style={{ fontSize: 8 }}>Ganti</span>
          </button>
          <button
            title="Logout"
            onClick={onLogout}
            className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5"
            style={{ color: "rgba(226,235,248,0.4)" }}
          >
            <LogOut size={14} />
            <span style={{ fontSize: 8 }}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ── Main workspace ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 shrink-0"
          style={{ background: "#1E3A5F", height: 44 }}
        >
          <div className="flex items-center gap-2 flex-1">
            <Store
              size={13}
              style={{ color: "#93C5FD", flexShrink: 0 }}
            />
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              Duamart Panjen
            </span>
            <span style={{ color: "rgba(147,197,253,0.5)", fontSize: 13 }}>•</span>
            <span style={{ color: "#93C5FD", fontSize: 13 }}>Kasir Siti</span>
            <span style={{ color: "rgba(147,197,253,0.5)", fontSize: 13 }}>•</span>
            <span style={{ color: "rgba(226,235,248,0.55)", fontSize: 13 }}>
              Shift #12345
            </span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock size={12} style={{ color: "#93C5FD" }} />
            <span
              className="tabular-nums"
              style={{ color: "#93C5FD", fontSize: 13, fontWeight: 600 }}
            >
              <Clock12 />
            </span>
          </div>
        </div>

        {/* ── Content row ───────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* ── LEFT: product area ──────────────────────────────────────── */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Search + Barcode row */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 shrink-0"
              style={{ background: "#fff", borderBottom: "1px solid var(--border)" }}
            >
              {/* Product search */}
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)", pointerEvents: "none" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama produk atau SKU..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none"
                  style={{
                    background: "var(--input-background)",
                    borderColor: "var(--border)",
                    fontSize: 13,
                  }}
                />
              </div>

              {/* Barcode input */}
              <div className="relative">
                <ScanLine
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--hekas-blue)", pointerEvents: "none" }}
                />
                <input
                  ref={barcodeRef}
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcode}
                  placeholder="Scan barcode..."
                  className="pl-9 pr-3 py-2 rounded-xl border outline-none w-44"
                  style={{
                    background: "#EFF6FF",
                    borderColor: "#BFDBFE",
                    fontSize: 13,
                    caretColor: "var(--hekas-blue)",
                  }}
                />
              </div>
            </div>

            {/* Category tabs */}
            <div
              className="flex items-center gap-1 px-3 py-2 overflow-x-auto shrink-0"
              style={{ background: "#fff", borderBottom: "1px solid var(--border)" }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all shrink-0"
                  style={{
                    background:
                      activeCategory === cat.id ? "#2563EB" : "var(--input-background)",
                    color:
                      activeCategory === cat.id ? "#fff" : "var(--muted-foreground)",
                    fontSize: 12,
                    fontWeight: activeCategory === cat.id ? 600 : 400,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Product grid — 4 columns */}
            <div className="flex-1 overflow-y-auto p-3">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
              >
                {filtered.map((product) => {
                  const inCart = cart.find((c) => c.id === product.id);
                  const lowStock = product.stock <= 10;
                  const outStock = product.stock === 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => !outStock && addProduct(product)}
                      disabled={outStock}
                      className="rounded-2xl text-left transition-all active:scale-95 overflow-hidden relative"
                      style={{
                        background: "#fff",
                        border: inCart
                          ? "2px solid #2563EB"
                          : "1.5px solid var(--border)",
                        opacity: outStock ? 0.45 : 1,
                        boxShadow: inCart ? "0 0 0 3px rgba(37,99,235,0.1)" : undefined,
                      }}
                    >
                      {/* Qty badge */}
                      {inCart && (
                        <div
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                          style={{ background: "#2563EB", color: "#fff", fontSize: 10, fontWeight: 700 }}
                        >
                          {inCart.qty}
                        </div>
                      )}

                      {/* Image area */}
                      <div
                        className="flex items-center justify-center"
                        style={{
                          height: 64,
                          background: inCart ? "#EFF6FF" : "#F8FAFC",
                          fontSize: 30,
                        }}
                      >
                        {product.image}
                      </div>

                      <div className="p-2.5">
                        <div
                          className="line-clamp-2 leading-tight mb-1"
                          style={{ fontSize: 12, fontWeight: 500, color: "#0F1729", minHeight: 30 }}
                        >
                          {product.name}
                        </div>
                        <div
                          style={{ fontSize: 13, fontWeight: 700, color: "#2563EB" }}
                          className="mb-1.5"
                        >
                          {fmt(product.price)}
                        </div>

                        {/* Stock indicator */}
                        <div className="flex items-center justify-between">
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              background: outStock
                                ? "#FEE2E2"
                                : lowStock
                                ? "#FEF3C7"
                                : "#F1F5F9",
                              color: outStock
                                ? "#DC2626"
                                : lowStock
                                ? "#92400E"
                                : "#64748B",
                            }}
                          >
                            {outStock ? "Habis" : `Stok ${product.stock}`}
                          </span>

                          {!outStock && (
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center"
                              style={{ background: "#2563EB" }}
                            >
                              <Plus size={13} style={{ color: "#fff" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div
                  className="flex flex-col items-center justify-center py-16 gap-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Package size={36} style={{ opacity: 0.25 }} />
                  <span style={{ fontSize: 13 }}>Produk tidak ditemukan</span>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Cart ───────────────────────────────────────────────── */}
          <div
            className="flex flex-col shrink-0 overflow-hidden"
            style={{ width: 300, background: "#fff", borderLeft: "1px solid var(--border)" }}
          >
            {/* Cart header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-1.5">
                <ShoppingCart size={15} style={{ color: "#2563EB" }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Keranjang</span>
                {totalQty > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{ background: "#DBEAFE", color: "#2563EB", fontSize: 11, fontWeight: 700 }}
                  >
                    {totalQty}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ background: "#FEF2F2", color: "#DC2626", fontSize: 11, fontWeight: 600 }}
                >
                  <RotateCcw size={10} /> Hapus
                </button>
              )}
            </div>

            {/* Member section */}
            <div
              className="px-3 py-2.5 shrink-0"
              style={{ borderBottom: "1px solid var(--border)", background: "#FAFAFA" }}
            >
              {member ? (
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "#DBEAFE", color: "#2563EB" }}
                  >
                    {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 700 }} className="truncate">{member.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                      {member.phone} • {member.points.toLocaleString("id-ID")} poin
                    </div>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded shrink-0"
                    style={{ ...tierColor[member.tier], fontSize: 9, fontWeight: 700 }}
                  >
                    {member.tier}
                  </span>
                  <button
                    onClick={() => setMember(null)}
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <User
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)", pointerEvents: "none" }}
                  />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Cari member / no. HP..."
                    className="w-full pl-8 pr-8 py-2 rounded-xl border outline-none"
                    style={{
                      background: "var(--input-background)",
                      borderColor: "var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <button
                    onClick={() => setModal("member")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    title="Tambah member baru"
                  >
                    <UserPlus size={14} style={{ color: "#2563EB" }} />
                  </button>
                  {/* Dropdown results */}
                  {memberResults.length > 0 && (
                    <div
                      className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-lg z-20"
                      style={{ background: "#fff", border: "1px solid var(--border)" }}
                    >
                      {memberResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setMember(m); setMemberSearch(""); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left"
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "#DBEAFE", color: "#2563EB" }}
                          >
                            {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 12, fontWeight: 600 }} className="truncate">{m.name}</div>
                            <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{m.phone}</div>
                          </div>
                          <span
                            className="px-1.5 py-0.5 rounded shrink-0"
                            style={{ ...tierColor[m.tier], fontSize: 9, fontWeight: 700 }}
                          >
                            {m.tier}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {cart.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <ShoppingCart size={32} style={{ opacity: 0.15 }} />
                  <span style={{ fontSize: 12 }}>Belum ada item</span>
                  <span style={{ fontSize: 11, opacity: 0.6, textAlign: "center" }}>
                    Tap produk atau scan barcode
                  </span>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 py-2 border-b"
                    style={{ borderColor: idx < cart.length - 1 ? "var(--border)" : "transparent" }}
                  >
                    {/* Emoji icon */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 mt-0.5"
                      style={{ background: "#F0F4F8" }}
                    >
                      {item.image}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="truncate"
                        style={{ fontSize: 12, fontWeight: 500 }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>
                        {fmt(item.price)}
                      </div>

                      {/* Qty row */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <button
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center border"
                          style={{ borderColor: "var(--border)" }}
                        >
                          <Minus size={10} />
                        </button>

                        {/* Qty — tap to open numpad */}
                        <button
                          onClick={() => openNumpad(item.id, item.qty)}
                          className="w-8 h-6 rounded-md flex items-center justify-center border"
                          style={{ background: "#F8FAFC", borderColor: "var(--border)", fontSize: 12, fontWeight: 700 }}
                        >
                          {item.qty}
                        </button>

                        <button
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ background: "#2563EB", color: "#fff" }}
                        >
                          <Plus size={10} />
                        </button>

                        <span
                          className="ml-auto"
                          style={{ fontSize: 12, fontWeight: 700, color: "#0F1729" }}
                        >
                          {fmt(item.price * item.qty - item.disc)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ color: "#94A3B8" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Payment method selector */}
            {cart.length > 0 && (
              <div
                className="px-3 py-2.5 shrink-0"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div
                  className="flex items-center justify-between mb-2"
                  style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}
                >
                  Metode Bayar
                </div>
                <div className="flex gap-1.5">
                  {([
                    { id: "tunai" as PaymentMethod, label: "Tunai", icon: Banknote },
                    { id: "qris"  as PaymentMethod, label: "QRIS",  icon: Smartphone },
                    { id: "debit" as PaymentMethod, label: "Debit", icon: CreditCard },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: payMethod === m.id ? "#2563EB" : "var(--border)",
                        background: payMethod === m.id ? "#EFF6FF" : "#FAFAFA",
                        color: payMethod === m.id ? "#2563EB" : "var(--muted-foreground)",
                      }}
                    >
                      <m.icon size={16} />
                      <span style={{ fontSize: 10, fontWeight: 600 }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {cart.length > 0 && (
              <div
                className="px-4 py-3 space-y-1.5 shrink-0"
                style={{ borderTop: "1px solid var(--border)", background: "#FAFAFA" }}
              >
                <div className="flex justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Subtotal</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{fmt(subtotal)}</span>
                </div>

                {/* Discount row — clickable */}
                <button
                  onClick={() => setModal("discount")}
                  className="w-full flex justify-between items-center group"
                >
                  <span style={{ fontSize: 12, color: globalDisc > 0 ? "#059669" : "var(--muted-foreground)" }}>
                    Diskon {globalDisc > 0 ? `(${globalDisc}%)` : ""}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: globalDisc > 0 ? "#059669" : "var(--muted-foreground)" }}>
                    {globalDisc > 0 ? `- ${fmt(discAmt)}` : (
                      <span className="flex items-center gap-1">
                        <Percent size={11} /> Tambah
                      </span>
                    )}
                  </span>
                </button>

                <div className="flex justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>PPN 11%</span>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{fmt(tax)}</span>
                </div>

                <div
                  className="flex justify-between pt-2 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800 }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#2563EB" }}>{fmt(total)}</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div
              className="px-3 pb-3 pt-2 flex gap-2 shrink-0"
              style={{ borderTop: cart.length > 0 ? "none" : "1px solid var(--border)" }}
            >
              <button
                onClick={() => setModal("hold")}
                disabled={cart.length === 0}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all"
                style={{
                  borderColor: "var(--border)",
                  color: cart.length > 0 ? "#0F1729" : "var(--muted-foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                  flex: "0 0 auto",
                  opacity: cart.length === 0 ? 0.4 : 1,
                }}
              >
                <PauseCircle size={14} />
                Tahan
              </button>

              <button
                onClick={() => cart.length > 0 && setModal("payment")}
                disabled={cart.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95"
                style={{
                  background: cart.length > 0
                    ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                    : "var(--muted)",
                  color: cart.length > 0 ? "#fff" : "var(--muted-foreground)",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                  boxShadow: cart.length > 0
                    ? "0 4px 16px rgba(37,99,235,0.35)"
                    : "none",
                }}
              >
                <CreditCard size={17} />
                {cart.length > 0 ? `Bayar ${fmt(total)}` : "Bayar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────── MODALS ─────────────────────────────────── */}

      {/* Payment Modal */}
      {modal === "payment" && (
        <Overlay onClose={() => setModal("none")}>
          <ModalCard title="Pembayaran" onClose={() => setModal("none")} wide>
            {/* Total */}
            <div className="text-center py-4 mb-2" style={{ background: "#F0F7FF", borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
                Total Tagihan
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#2563EB", letterSpacing: "-0.02em" }}>
                {fmt(total)}
              </div>
              {member && (
                <div style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>
                  Member: {member.name} • {member.points.toLocaleString("id-ID")} poin
                </div>
              )}
            </div>

            {/* Method */}
            <div className="flex gap-2 mb-4">
              {([
                { id: "tunai" as PaymentMethod, label: "Tunai", icon: Banknote },
                { id: "qris"  as PaymentMethod, label: "QRIS",  icon: Smartphone },
                { id: "debit" as PaymentMethod, label: "Debit/Kredit", icon: CreditCard },
              ] as const).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className="flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all"
                  style={{
                    borderColor: payMethod === m.id ? "#2563EB" : "var(--border)",
                    background: payMethod === m.id ? "#EFF6FF" : "#FAFAFA",
                    color: payMethod === m.id ? "#2563EB" : "var(--muted-foreground)",
                  }}
                >
                  <m.icon size={20} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Tunai: quick amounts + input */}
            {payMethod === "tunai" && (
              <div className="mb-4">
                <div
                  className="mb-2"
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)" }}
                >
                  Uang Diterima
                </div>
                <input
                  value={cashInput ? fmt(Number(cashInput.replace(/\D/g, ""))) : ""}
                  onChange={(e) =>
                    setCashInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder={fmt(total)}
                  className="w-full px-4 py-3 rounded-xl border text-center outline-none mb-2"
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    borderColor: "var(--border)",
                    background: "var(--input-background)",
                  }}
                />
                {/* Quick amounts */}
                <div className="flex gap-1.5">
                  {[total, total + (5000 - (total % 5000) || 5000),
                    Math.ceil(total / 50000) * 50000,
                    Math.ceil(total / 100000) * 100000]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 4)
                    .map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setCashInput(String(amt))}
                        className="flex-1 py-2 rounded-xl border text-center transition-all"
                        style={{
                          background:
                            Number(cashInput) === amt ? "#DBEAFE" : "#F8FAFC",
                          borderColor:
                            Number(cashInput) === amt ? "#2563EB" : "var(--border)",
                          color:
                            Number(cashInput) === amt ? "#2563EB" : "var(--foreground)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {fmt(amt)}
                      </button>
                    ))}
                </div>
                {Number(cashInput) >= total && (
                  <div
                    className="mt-3 flex justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: "#D1FAE5" }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#065F46" }}>
                      Kembalian
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>
                      {fmt(change)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* QRIS QR placeholder */}
            {payMethod === "qris" && (
              <div className="flex flex-col items-center py-4 mb-4 gap-3">
                <div
                  className="w-36 h-36 rounded-2xl flex items-center justify-center"
                  style={{ background: "#F1F5F9", border: "2px dashed var(--border)" }}
                >
                  <div className="text-center">
                    <Smartphone size={36} style={{ color: "var(--muted-foreground)", opacity: 0.4, margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>QR Code</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center" }}>
                  Minta pelanggan scan QR dengan aplikasi dompet digital
                </p>
              </div>
            )}

            {/* Debit */}
            {payMethod === "debit" && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-4"
                style={{ background: "#F8FAFC", border: "1.5px solid var(--border)" }}
              >
                <CreditCard size={24} style={{ color: "var(--muted-foreground)" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Tempelkan / Gesek Kartu</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    EDC BRI · BCA · Mandiri · BNI
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => { setModal("receipt"); clearCart(); }}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
              }}
            >
              <CheckCircle2 size={20} />
              Proses Pembayaran
            </button>
          </ModalCard>
        </Overlay>
      )}

      {/* Receipt Success */}
      {modal === "receipt" && (
        <Overlay onClose={() => setModal("none")}>
          <div
            className="rounded-3xl p-8 text-center shadow-2xl max-w-xs w-full"
            style={{ background: "#fff" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#D1FAE5" }}
            >
              <CheckCircle2 size={32} style={{ color: "#059669" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              Pembayaran Berhasil
            </div>
            {payMethod === "tunai" && change > 0 && (
              <div
                className="px-4 py-2 rounded-xl mb-4 mt-2"
                style={{ background: "#D1FAE5" }}
              >
                <div style={{ fontSize: 11, color: "#065F46" }}>Kembalian</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#059669" }}>
                  {fmt(change)}
                </div>
              </div>
            )}
            <div
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl mt-2"
              style={{ background: "#EFF6FF", color: "#2563EB", fontSize: 13 }}
            >
              <Printer size={15} />
              Mencetak struk...
            </div>
            <button
              onClick={() => setModal("none")}
              className="mt-4 w-full py-3 rounded-2xl"
              style={{ background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 700 }}
            >
              Transaksi Baru
            </button>
          </div>
        </Overlay>
      )}

      {/* Hold / Held Transactions */}
      {modal === "hold" && (
        <Overlay onClose={() => setModal("none")}>
          <ModalCard title="Transaksi Ditahan" onClose={() => setModal("none")}>
            {cart.length > 0 && (
              <button
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl mb-3 border"
                style={{ background: "#FEF3C7", borderColor: "#FCD34D", color: "#92400E", fontSize: 13, fontWeight: 600 }}
              >
                <PauseCircle size={16} />
                Tahan Transaksi Saat Ini ({totalQty} item • {fmt(total)})
              </button>
            )}
            <div
              className="mb-2"
              style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase" }}
            >
              Ditahan Sebelumnya
            </div>
            {HELD.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border mb-2"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#FEF3C7" }}
                >
                  <PauseCircle size={16} style={{ color: "#F59E0B" }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{h.id}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {h.items} item • {h.time}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(h.total)}</div>
                <button
                  className="px-3 py-1.5 rounded-lg"
                  style={{ background: "#2563EB", color: "#fff", fontSize: 12, fontWeight: 600 }}
                  onClick={() => setModal("none")}
                >
                  Lanjut
                </button>
              </div>
            ))}
            {HELD.length === 0 && cart.length === 0 && (
              <div
                className="py-8 text-center"
                style={{ color: "var(--muted-foreground)", fontSize: 13 }}
              >
                Tidak ada transaksi yang ditahan
              </div>
            )}
          </ModalCard>
        </Overlay>
      )}

      {/* Discount Modal */}
      {modal === "discount" && (
        <Overlay onClose={() => setModal("none")}>
          <ModalCard title="Tambah Diskon" onClose={() => setModal("none")}>
            <div
              className="mb-2"
              style={{ fontSize: 12, color: "var(--muted-foreground)" }}
            >
              Diskon berlaku untuk seluruh transaksi
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[5, 10, 15, 20, 25, 30].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscInput(String(pct))}
                  className="py-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: discInput === String(pct) ? "#2563EB" : "var(--border)",
                    background: discInput === String(pct) ? "#EFF6FF" : "#FAFAFA",
                    color: discInput === String(pct) ? "#2563EB" : "var(--foreground)",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <input
                value={discInput}
                onChange={(e) => setDiscInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Masukkan % diskon"
                className="w-full px-4 py-3 rounded-xl border text-center outline-none"
                style={{ fontSize: 18, fontWeight: 700, borderColor: "var(--border)", background: "var(--input-background)" }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2" style={{ fontSize: 16, fontWeight: 700 }}>%</span>
            </div>
            {discInput && Number(discInput) > 0 && (
              <div
                className="flex justify-between px-4 py-2 rounded-xl mb-4"
                style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}
              >
                <span style={{ fontSize: 13 }}>Hemat</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>
                  - {fmt(Math.round(subtotal * Number(discInput) / 100))}
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { setGlobalDisc(0); setDiscInput(""); setModal("none"); }}
                className="flex-1 py-2.5 rounded-xl border"
                style={{ borderColor: "var(--border)", fontSize: 13, fontWeight: 600 }}
              >
                Hapus Diskon
              </button>
              <button
                onClick={() => { setGlobalDisc(Number(discInput) || 0); setModal("none"); }}
                className="flex-1 py-2.5 rounded-xl"
                style={{ background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700 }}
              >
                Terapkan
              </button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* Numpad Modal */}
      {modal === "numpad" && (
        <Overlay onClose={() => setModal("none")}>
          <ModalCard title="Ubah Jumlah" onClose={() => setModal("none")}>
            <div
              className="flex items-center justify-center py-3 mb-4 rounded-xl"
              style={{ background: "var(--input-background)", fontSize: 28, fontWeight: 900 }}
            >
              {numpadValue || "0"}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {["1","2","3","4","5","6","7","8","9","C","0","⌫"].map((k) => (
                <button
                  key={k}
                  onClick={() => numpadPress(k)}
                  className="py-4 rounded-xl transition-all active:scale-95"
                  style={{
                    background: k === "⌫" || k === "C" ? "#FEF2F2" : "#F8FAFC",
                    color: k === "⌫" || k === "C" ? "#DC2626" : "var(--foreground)",
                    fontSize: 18,
                    fontWeight: 700,
                    border: "1.5px solid var(--border)",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
            <button
              onClick={numpadConfirm}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
              style={{ background: "#2563EB", color: "#fff", fontSize: 15, fontWeight: 700 }}
            >
              <Check size={18} /> Konfirmasi
            </button>
          </ModalCard>
        </Overlay>
      )}

      {/* New Member Modal */}
      {modal === "member" && (
        <Overlay onClose={() => setModal("none")}>
          <ModalCard title="Tambah Member Baru" onClose={() => setModal("none")}>
            {[
              { label: "Nama Lengkap", placeholder: "Nama pelanggan" },
              { label: "No. HP", placeholder: "08xxxxxxxxxx" },
              { label: "Email (opsional)", placeholder: "email@domain.com" },
            ].map((f) => (
              <div key={f.label} className="mb-3">
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4 }}>{f.label}</label>
                <input
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none"
                  style={{ background: "var(--input-background)", borderColor: "var(--border)", fontSize: 13 }}
                />
              </div>
            ))}
            <button
              onClick={() => setModal("none")}
              className="w-full mt-2 py-3 rounded-xl"
              style={{ background: "#2563EB", color: "#fff", fontSize: 14, fontWeight: 700 }}
            >
              Daftarkan Member
            </button>
          </ModalCard>
        </Overlay>
      )}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(15,23,41,0.55)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

function ModalCard({
  title,
  children,
  onClose,
  wide,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden"
      style={{ background: "#fff", width: wide ? 420 : 360, maxWidth: "100%" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ background: "#1E3A5F" }}
      >
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{title}</span>
        <button onClick={onClose}>
          <X size={18} style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

