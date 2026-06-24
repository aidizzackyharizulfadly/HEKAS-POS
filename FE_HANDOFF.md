# HEKAS POS — Frontend Handoff v2.0.0

Dokumen ini adalah kontrak API antara **Frontend (SvelteKit 5 SPA)** dan **Backend (ElysiaJS / Wafiq)**.

---

## 1. Prasyarat Backend

### Base URL
FE membaca `VITE_API_BASE` dari environment variable. Kalau tidak di-set, FE berjalan dalam **mock mode** (localStorage).

```env
# Development (laptop Wafiq)
VITE_API_BASE=http://localhost:3001/api

# Staging
# VITE_API_BASE=https://staging-api.hekas.id/api

# Production
# VITE_API_BASE=https://api.hekas.id/api
```

### CORS
Karena FE adalah **SPA** (`ssr: false`) yang memanggil API langsung dari browser, BE **WAJIB** mengembalikan CORS header:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Auth Header
Semua request (kecuali `/api/auth/login`) menyertakan:

```
Authorization: Bearer <access_token>
```

Response **HTTP 401** akan di-handle FE dengan auto-clear token + redirect ke `/login`.

---

## 2. Konvensi Response

### Response Shape Standar

```typescript
// Sukses — paginated list
{
  ok: true,
  data: {
    items: T[],
    total: number,
    limit: number,
    offset: number
  }
}

// Sukses — single item
{
  ok: true,
  data: { ... }
}

// Sukses — array (dashboard, reports)
{
  ok: true,
  data: [ ... ]
}

// Error
{
  ok: false,
  error: {
    code: string,        // machine-readable: "INSUFFICIENT_STOCK", "NOT_FOUND", etc.
    message: string,     // human-readable (Indonesian)
    details?: any,       // optional extra context
    request_id?: string  // untuk tracing
  }
}
```

### Konvensi Data

| Aspek | Aturan | Contoh |
|---|---|---|
| **Uang** | SELALU `string` (PostgreSQL `numeric`) | `"15000"`, `"499900"` |
| **ID** | SELALU `string` (UUID v4) | `"a1b2c3d4-..."` |
| **Tanggal** | SELALU ISO 8601 string | `"2025-06-23T14:30:00.000Z"` |
| **Status** | `string` enum (lowercase) | `"aktif"`, `"paid"`, `"pending"` |
| **Boolean** | `boolean` | `true` / `false` |

> ⚠️ **PENTING**: FE melakukan `parseFloat()` pada semua money fields. Kalau BE mengirim number instead of string, tidak akan error tapi bisa menyebabkan floating-point issues.

---

## 3. Daftar Endpoint

### 3.1 Auth

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | `{ username, password }` | `{ data: { accessToken, refreshToken?, user } }` | Return 401 jika gagal |
| `GET` | `/api/auth/me` | — | `{ data: { id, username, role, fullName, outletId } }` | Validasi token |
| `POST` | `/api/auth/logout` | — | `{ data: { ok: true } }` | Optional: blacklist token |
| `POST` | `/api/auth/pin` | `{ pin }` | `{ data: { valid: boolean } }` | Verifikasi PIN untuk operasi sensitif |

**User object:**
```typescript
{
  id: string;           // UUID
  username: string;
  role: 'kasir' | 'gudang' | 'manager';
  fullName: string;
  outletId: string;     // UUID
}
```

### 3.2 Products

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/products?search=&categoryId=&status=&limit=&offset=` | — | `{ data: { items: BEProduct[], total, limit, offset } }` |
| `GET` | `/api/products/:id` | — | `{ data: BEProduct }` |
| `GET` | `/api/products/barcode/:barcode` | — | `{ data: BEProduct }` |
| `POST` | `/api/products/` | `BECreateProduct` | `{ data: BEProduct }` |
| `PATCH` | `/api/products/:id` | `Partial<BEUpdateProduct>` | `{ data: BEProduct }` |
| `DELETE` | `/api/products/:id` | — | `{ data: { ok: true } }` |
| `POST` | `/api/products/:id/restock` | `{ quantity: number, supplierId?: string }` | `{ data: { ok: true } }` |
| `POST` | `/api/products/:id/image` | `FormData { file, isPrimary, sortOrder }` | `{ data: BEProduct }` |

**BEProduct shape:**
```typescript
{
  id: string;              // UUID
  sku: string;
  barcode: string;
  name: string;
  description: string | null;
  categoryId: string;      // UUID
  supplierId: string;      // UUID
  outletId: string;        // UUID
  purchasePrice: string;   // "5000"
  sellingPrice: string;    // "7500"
  stockMin: number;
  stockMax: number;
  unit: string;            // "pcs", "btl", "kg", "ltr", "bks"
  status: 'aktif' | 'nonaktif';
  imageUrl: string | null;
  metadata: any;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  images?: { id: string; imageUrl: string; isPrimary: boolean; sortOrder: number }[];
  stock?: number;          // current stock (opsional, dari join)
}
```

### 3.3 Orders / Transactions

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/orders/draft` | `BECheckoutInput` | `{ data: BECheckoutResult }` |
| `POST` | `/api/orders/complete` | `BECheckoutInput` | `{ data: BECheckoutResult }` |
| `GET` | `/api/orders/?limit=&offset=&status=&q=` | — | `{ data: { items: BEOrder[], total, limit, offset } }` |
| `GET` | `/api/orders/:id` | — | `{ data: BEOrder }` |
| `POST` | `/api/orders/:id/void` | `{ reason?: string }` | `{ data: BEOrder }` |

**BEOrder shape:**
```typescript
{
  id: string;              // UUID
  orderNumber: string;     // invoice number, e.g. "INV-20250623-001"
  userId: string;          // UUID
  outletId: string;        // UUID
  memberId: string | null; // UUID
  subtotal: string;        // "150000"
  discountPct: number;
  discountAmt: string;     // "15000"
  total: string;           // "135000"
  paid: string;            // "150000"
  changeAmt: string;       // "15000"
  paymentMethod: string;   // "tunai" | "qris" | "debit" | "kredit" | "transfer" | "ewallet"
  payments?: BEPayment[];  // split payment (optional)
  isSplit?: boolean;
  status: 'paid' | 'voided';
  note: string | null;
  createdAt: string;
  items?: BEOrderItem[];
  userName?: string;
  memberName?: string | null;
}
```

**BEPayment:**
```typescript
{
  kind: 'tunai' | 'qris' | 'debit' | 'kredit' | 'transfer' | 'ewallet';
  amount: string;       // "100000"
  tendered?: string;    // "100000" (untuk tunai)
  reference?: string;   // nomor referensi
}
```

**BEOrderItem:**
```typescript
{
  id: string;
  productId: string;
  productName: string;
  qty: number;
  price: string;       // "7500"
  discPct: number;
  subtotal: string;    // "15000"
}
```

**BECheckoutInput:**
```typescript
{
  userId: string;
  outletId?: string;
  memberId?: string | null;
  items: { productId: string; qty: number; discPct?: number }[];
  discountPct?: number;
  paid: string;
  payments?: BEPayment[];  // split payment
  note?: string;
}
```

**BECheckoutResult:**
```typescript
{
  id: string;
  invoiceNo: string;
  subtotal: string;
  discountPct: number;
  discountAmt: string;
  total: string;
  paid: string;
  changeAmt: string;
  paymentMethod: string;
  payments?: BEPayment[];
  isSplit?: boolean;
  memberId: string | null;
  pointsEarned: number;
}
```

### 3.4 Held Drafts

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/held-drafts/?userId=` | — | `{ data: BEHeldDraft[] }` |
| `POST` | `/api/held-drafts/` | `BEHeldDraftInput` | `{ data: BEHeldDraft }` |
| `DELETE` | `/api/held-drafts/:id` | — | `{ data: { ok: true } }` |

**BEHeldDraft:**
```typescript
{
  id: string;
  userId: string;
  memberId?: string | null;
  cart: { productId: string; name: string; price: string; qty: number; disc: number }[];
  subtotal: string;
  discountPct: number;
  total: string;
  heldAt: string;  // ISO 8601
}
```

### 3.5 Shifts

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/shifts/?limit=&offset=&status=` | — | `{ data: { items: BEShift[], total, limit, offset } }` |
| `GET` | `/api/shifts/current` | — | `{ data: BEShift \| null }` |
| `GET` | `/api/shifts/:id` | — | `{ data: BEShift }` |
| `POST` | `/api/shifts/start` | `{ userId: string, startingCash: string, note?: string }` | `{ data: BEShift }` |
| `POST` | `/api/shifts/:id/end` | `{ endingCash: string, note?: string }` | `{ data: BEShift }` |

**BEShift:**
```typescript
{
  id: string;
  userId: string;
  outletId: string;
  shiftNo: string;         // "#SHF-001"
  startingCash: string;    // "500000"
  endingCash: string | null;
  expectedCash: string | null;   // calculated by BE
  difference: string | null;
  totalTransactions: number;
  totalRevenue: string;    // "2500000"
  status: 'active' | 'closed';
  startedAt: string;       // ISO 8601
  endedAt: string | null;
  note: string | null;
}
```

### 3.6 Members (Loyalty)

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/members/?q=&tier=&sortBy=` | — | `{ data: { items: BEMember[], total, limit, offset } }` |
| `GET` | `/api/members/:id` | — | `{ data: BEMember }` |
| `POST` | `/api/members/` | `BECreateMember` | `{ data: BEMember }` |
| `PATCH` | `/api/members/:id` | `Partial<BEUpdateMember>` | `{ data: BEMember }` |
| `DELETE` | `/api/members/:id` | — | `{ data: { ok: true } }` |
| `POST` | `/api/members/:id/points` | `{ delta: number, type: string, refId?: string, note?: string }` | `{ data: BEMember }` |
| `GET` | `/api/members/:id/stats` | — | `{ data: BEMemberStats }` |
| `GET` | `/api/members/count-by-tier` | — | `{ data: { silver: number, gold: number, platinum: number } }` |

**BEMember:**
```typescript
{
  id: string;              // UUID
  code: string;            // "M001" (display code)
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  birthday?: string | null;
  points: number;
  tier: 'silver' | 'gold' | 'platinum';
  lifetimeSpend: string;   // "5000000"
  lastTransactionAt: string | null;
  createdAt: string;
  pointHistory?: BEPointEntry[];
  tierHistory?: BETierEntry[];
  note?: string | null;
}
```

### 3.7 Inventory

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/stocks/movements?productId=&limit=&offset=` | — | `{ data: { items: BEStockMovement[], total, limit, offset } }` |
| `POST` | `/api/inventory/restock` | `{ productId: string, quantity: number, supplierId?: string, note?: string }` | `{ data: { ok: true } }` |
| `POST` | `/api/inventory/restock-bulk` | `{ items: { productId, quantity }[] }` | `{ data: { ok: true } }` |
| `POST` | `/api/inventory/adjust` | `{ productId: string, quantityDelta: number, reason: string }` | `{ data: { ok: true } }` |
| `GET` | `/api/stocks/low-stock` | — | `{ data: BEProduct[] }` |
| `GET` | `/api/inventory/summary` | — | `{ data: BEInventorySummary }` |

### 3.8 Incoming Goods (Barang Masuk)

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/incoming-goods/?status=&limit=&offset=` | — | `{ data: { items: BEPO[], total, limit, offset } }` |
| `POST` | `/api/incoming-goods/` | `BECreatePO` | `{ data: BEPO }` |
| `GET` | `/api/incoming-goods/:id` | — | `{ data: BEPO }` |
| `POST` | `/api/incoming-goods/:id/verify` | `{ items: { productId, qtyReceived, note? }[] }` | `{ data: BEPO }` |
| `POST` | `/api/incoming-goods/:id/reject` | `{ reason: string }` | `{ data: BEPO }` |

### 3.9 Outgoing Goods (Barang Keluar)

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/outgoing-goods/?status=&limit=&offset=` | — | `{ data: { items: BEOutgoing[], total, limit, offset } }` |
| `POST` | `/api/outgoing-goods/` | `BECreateOutgoing` | `{ data: BEOutgoing }` |
| `GET` | `/api/outgoing-goods/:id` | — | `{ data: BEOutgoing }` |
| `POST` | `/api/outgoing-goods/:id/pick` | `{ items: { productId, qtyPicked }[] }` | `{ data: BEOutgoing }` |
| `POST` | `/api/outgoing-goods/:id/mark-sent` | — | `{ data: BEOutgoing }` |
| `POST` | `/api/outgoing-goods/:id/cancel` | `{ reason: string }` | `{ data: BEOutgoing }` |

### 3.10 Surat Jalan

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/surat-jalan/?status=&limit=&offset=` | — | `{ data: { items: BESuratJalan[], total, limit, offset } }` |
| `POST` | `/api/surat-jalan/` | `BECreateSJ` | `{ data: BESuratJalan }` |
| `GET` | `/api/surat-jalan/:id` | — | `{ data: BESuratJalan }` |
| `POST` | `/api/surat-jalan/:id/approve` | — | `{ data: BESuratJalan }` |
| `POST` | `/api/surat-jalan/:id/reject` | `{ reason: string }` | `{ data: BESuratJalan }` |
| `POST` | `/api/surat-jalan/:id/mark-sent` | — | `{ data: BESuratJalan }` |
| `GET` | `/api/surat-jalan/:id/pdf` | — | `Blob` (application/pdf) |

### 3.11 Employees

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/hr/employees?q=&role=&sortBy=` | — | `{ data: BEEmployee[] }` |
| `POST` | `/api/hr/employees` | `BECreateEmployee` | `{ data: BEEmployee }` |
| `GET` | `/api/hr/employees/:id` | — | `{ data: BEEmployee }` |
| `PATCH` | `/api/hr/employees/:id` | `Partial<BEUpdateEmployee>` | `{ data: BEEmployee }` |
| `GET` | `/api/hr/attendance?from=&to=&employeeId=` | — | `{ data: BEAttendance[] }` |
| `GET` | `/api/hr/attendance/today` | — | `{ data: BEAttendance[] }` |
| `POST` | `/api/hr/attendance/clock-in` | `{ employeeId: string }` | `{ data: BEAttendance }` |
| `POST` | `/api/hr/attendance/clock-out` | `{ employeeId: string }` | `{ data: BEAttendance }` |
| `GET` | `/api/hr/leave-requests?status=` | — | `{ data: BELeaveRequest[] }` |
| `POST` | `/api/hr/leave-requests` | `{ employeeId, type, startDate, endDate, reason }` | `{ data: BELeaveRequest }` |
| `PATCH` | `/api/hr/leave-requests/:id/approve` | `{ note?: string }` | `{ data: BELeaveRequest }` |
| `PATCH` | `/api/hr/leave-requests/:id/reject` | `{ reason: string }` | `{ data: BELeaveRequest }` |

### 3.12 Dashboard

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/dashboard/manager?from=&to=` | — | `{ data: BEManagerDashboard }` |
| `GET` | `/api/dashboard/gudang` | — | `{ data: BEGudangDashboard }` |
| `GET` | `/api/dashboard/kasir?userId=` | — | `{ data: BEKasirDashboard }` |

### 3.13 Reports

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/reports/business?from=&to=` | — | `{ data: BEBusinessReport }` |
| `GET` | `/api/reports/finance?from=&to=` | — | `{ data: BEFinanceReport }` |
| `GET` | `/api/reports/inventory?from=&to=` | — | `{ data: BEInventoryReport }` |
| `GET` | `/api/reports/employees?from=&to=` | — | `{ data: BEEmployeeReport }` |
| `GET` | `/api/reports/export?type=&from=&to=&format=` | — | `Blob` (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet) |

### 3.14 Settings

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/settings` | — | `{ data: BESettings }` |
| `PATCH` | `/api/settings` | `Partial<BESettings>` | `{ data: BESettings }` |
| `POST` | `/api/settings/reset` | — | `{ data: { ok: true } }` |

### 3.15 AI Assistant

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/api/ai/chat` | `{ message: string, context?: string }` | `{ data: { reply: string, sources?: any[] } }` |
| `GET` | `/api/ai/activity` | — | `{ data: BEAIActivity[] }` |
| `GET` | `/api/ai/insights` | — | `{ data: BEAIInsight[] }` |
| `GET` | `/api/ai/control` | — | `{ data: BEAIControl }` |
| `PATCH` | `/api/ai/control` | `Partial<BEAIControl>` | `{ data: BEAIControl }` |

### 3.16 Telegram

| Method | Path | Body | Response |
|---|---|---|---|
| `GET` | `/api/telegram/settings` | — | `{ data: BETelegramSettings }` |
| `POST` | `/api/telegram/link` | `{ chatId: string }` | `{ data: BETelegramSettings }` |
| `DELETE` | `/api/telegram/link` | — | `{ data: { ok: true } }` |
| `POST` | `/api/telegram/test-message` | `{ message?: string }` | `{ data: { ok: true } }` |

---

## 4. FE → BE Type Mappers

FE melakukan mapping otomatis antara BE shapes (PostgreSQL-native) dan FE shapes (UI-friendly). Berikut mapper yang ada:

### Products (`products.ts`)
- `beToFe(BEProduct) → Product` — UUID→hashed-number, `sellingPrice` string→number, `status` enum→boolean
- Money: `parseFloat(p.sellingPrice)`

### Transactions (`transactions.ts`)
- `beToFeOrder(BEOrder) → Transaction` — `orderNumber`→`invoice_no`, money strings→numbers, `'paid'`→`'completed'`
- Hashing UUID ke numeric ID untuk backward-compat

### Members (`members.ts`)
- `beToFeMember(BEMember) → Member` — `lifetimeSpend` string→number, `tier` lowercase→PascalCase
- Money: `parseFloat(m.lifetimeSpend)`

> ⚠️ Backend developer TIDAK perlu ikut konvensi FE. BE kirim data sesuai schema PostgreSQL (snake_case, UUID, money as string), FE yang adaptasi.

---

## 5. Mode Detection

```typescript
// client.ts
const RAW_BASE = import.meta.env.VITE_API_BASE as string | undefined;
export const API_MODE: 'http' | 'mock' = RAW_BASE ? 'http' : 'mock';
```

- `VITE_API_BASE` di-set → **HTTP mode** → semua call ke BE
- `VITE_API_BASE` kosong → **mock mode** → localStorage (FE standalone demo)

Setiap API module mengikuti pattern:
```typescript
export async function someFunction() {
  if (API_MODE === 'http') {
    // HTTP path: panggil BE
    const raw = await httpFetch<BEResponse>(`/api/some-endpoint`);
    return beToFeMapper(unwrapOne(raw));
  }
  // Mock path: localStorage
  // ...
}
```

---

## 6. Error Codes

Error code standar yang di-handle FE (dari `api-errors.ts`):

| Code | Pesan Indonesia | Aksi |
|---|---|---|
| `INSUFFICIENT_STOCK` | Stok tidak mencukupi | — |
| `PRODUCT_NOT_FOUND` | Produk tidak ditemukan | — |
| `MEMBER_NOT_FOUND` | Member tidak ditemukan | — |
| `SHIFT_ALREADY_ACTIVE` | Shift sudah aktif | — |
| `SHIFT_NOT_FOUND` | Tidak ada shift aktif | — |
| `INVALID_PIN` | PIN tidak valid | — |
| `PIN_LOCKED` | PIN terkunci (15 menit) | — |
| `DUPLICATE_PHONE` | No. HP sudah terdaftar | — |
| `DUPLICATE_EMAIL` | Email sudah terdaftar | — |
| `UNAUTHORIZED` | Silakan login ulang | Redirect `/login` |
| `FORBIDDEN` | Anda tidak punya akses | Redirect role home |
| `VALIDATION_ERROR` | Data tidak valid | — |
| `SERVER_ERROR` | Gangguan server, coba lagi | — |

---

## 7. Yang Sudah Ada & Yang Perlu Dibuat

### ✅ Sudah dual-mode (HTTP + mock)
- Auth, Products, Orders, Shifts, Held Drafts
- Inventory, Incoming Goods, Outgoing Goods
- Surat Jalan, Dashboard, Reports
- Employees, AI, Telegram, Settings

### ⚠️ Perlu endpoint BE (baru)

| Modul | Endpoint | Prioritas |
|---|---|---|
| **Members** | Semua endpoint CRUD — saat ini mock-only | **P0** |
| **Categories** | `GET /api/categories` — opsional, FE fallback derive dari products | P2 |
| **AI** | Semua endpoint — saat ini return mock kosong | P3 |
| **Telegram** | Semua endpoint — saat ini return mock kosong | P3 |

---

## 8. Testing Backend

Cara switch ke HTTP mode:

```bash
# 1. Copy env
cp .env.example .env

# 2. Pastikan VITE_API_BASE mengarah ke BE Wafiq
# VITE_API_BASE=http://localhost:3001/api

# 3. Jalankan dev server
npm run dev

# 4. Buka browser — FE akan otomatis panggil BE
```

Kalau BE belum siap, kosongkan `VITE_API_BASE` — FE akan berjalan penuh di localStorage.

---

## 9. Catatan Tambahan

- **SSR disabled** (`ssr: false`) — semua render di client, semua API call dari browser
- **Proxy route** (`/api/proxy/[...path]/+server.ts`) tersedia sebagai fallback — hanya handle GET/POST, tidak digunakan di production
- **Demo accounts**: `kasir1`, `manager1`, `gudang1` dengan password `password123` (hanya mock mode)
- **PIN**: FE melakukan PBKDF2-SHA256 (100k iterasi) untuk PIN verification di mock mode. Di production, BE handle PIN via `/api/auth/pin`
- **Route guards**: FE enforce RBAC di client-side via `+layout.ts` load functions. BE tetap harus enforce di server-side
