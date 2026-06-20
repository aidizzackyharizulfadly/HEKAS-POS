<script lang="ts">
  // HEKAS POS — Payment Form (Fase 5: Multi-Payment Split)
  // UI untuk split payment:
  //   - List entry metode pembayaran (bisa lebih dari 1)
  //   - Tambah entry dgn tombol "+ Metode"
  //   - Tiap entry: pilih jenis (tunai/qris/debit/kredit/transfer/ewallet),
  //     label optional, nominal, tendered (khusus tunai), reference (kartu/transfer)
  //   - Remaining = grand_total - sum(amount) dihitung real-time
  //   - Tombol "Bayar" disabled jika remaining !== 0 atau ada entry invalid
  //   - Tombol "Bayar Sisa dgn Tunai" (auto-fill cash untuk remaining)

  import type { PaymentMethod, PaymentMethodKind } from '$lib/payment.js';
  import {
    PAYMENT_METHOD_LABEL, PAYMENT_METHOD_ICON,
    PAYMENT_METHOD_NEEDS_TENDERED, PAYMENT_METHOD_NEEDS_REFERENCE,
    genPaymentMethodId, summarizePayments,
  } from '$lib/payment.js';

  // Props
  let {
    grandTotal,
    onChange,
    onConfirm,
    onCancel,
    disabled = false,
  }: {
    grandTotal: number;
    onChange?: (summary: { methods: PaymentMethod[]; remaining: number; total_paid: number; is_valid: boolean }) => void;
    onConfirm: (methods: PaymentMethod[]) => void;
    onCancel?: () => void;
    disabled?: boolean;
  } = $props();

  // State
  let payments: PaymentMethod[] = $state([
    {
      id: genPaymentMethodId(),
      kind: 'tunai' as PaymentMethodKind,
      label: undefined,
      amount: grandTotal,           // default: full amount
      tendered: grandTotal,         // default: customer bayar pas
      change: 0,
      reference: undefined,
      paid_at: new Date().toISOString(),
    },
  ]);

  // Derived: summary + remaining
  let summary = $derived(summarizePayments(payments));
  let remaining = $derived(grandTotal - summary.total_paid);
  let totalChange = $derived(summary.total_change);

  // Validasi per-entry
  function isEntryValid(p: PaymentMethod): boolean {
    if (p.amount <= 0) return false;
    if (PAYMENT_METHOD_NEEDS_REFERENCE.includes(p.kind) && !p.reference?.trim()) return false;
    if (p.kind === 'tunai' && p.tendered !== undefined && p.tendered < p.amount) return false;
    return true;
  }

  let allValid = $derived(
    payments.length > 0 && payments.every(isEntryValid) && remaining === 0,
  );

  // Notify parent whenever state changes
  $effect(() => {
    onChange?.({
      methods: payments,
      remaining,
      total_paid: summary.total_paid,
      is_valid: allValid,
    });
  });

  // ─── Actions ────────────────────────────────────────────────────────────

  function addPayment() {
    const newEntry: PaymentMethod = {
      id: genPaymentMethodId(),
      kind: 'qris' as PaymentMethodKind,
      label: undefined,
      amount: remaining > 0 ? remaining : 0,
      tendered: undefined,
      change: 0,
      reference: undefined,
      paid_at: new Date().toISOString(),
    };
    payments = [...payments, newEntry];
  }

  function removePayment(id: string) {
    if (payments.length === 1) return; // minimal 1 entry
    payments = payments.filter((p) => p.id !== id);
    // re-balance: set entry pertama ke grandTotal (single-payment behavior)
    if (payments.length === 1) {
      payments[0].amount = grandTotal;
      if (payments[0].kind === 'tunai') {
        payments[0].tendered = payments[0].tendered ?? grandTotal;
      }
    }
  }

  function changeKind(id: string, kind: PaymentMethodKind) {
    payments = payments.map((p) => {
      if (p.id !== id) return p;
      const needsTendered = PAYMENT_METHOD_NEEDS_TENDERED.includes(kind);
      const needsRef = PAYMENT_METHOD_NEEDS_REFERENCE.includes(kind);
      return {
        ...p,
        kind,
        tendered: needsTendered ? (p.tendered ?? p.amount) : undefined,
        reference: needsRef ? p.reference : undefined,
      };
    });
  }

  function changeAmount(id: string, value: number) {
    payments = payments.map((p) => {
      if (p.id !== id) return p;
      const tendered = p.kind === 'tunai' ? (p.tendered ?? p.amount) : undefined;
      const change = p.kind === 'tunai' && tendered !== undefined
        ? Math.max(0, tendered - value)
        : 0;
      return { ...p, amount: value, tendered, change };
    });
  }

  function changeTendered(id: string, value: number) {
    payments = payments.map((p) => {
      if (p.id !== id) return p;
      const change = Math.max(0, value - p.amount);
      return { ...p, tendered: value, change };
    });
  }

  function changeLabel(id: string, value: string) {
    payments = payments.map((p) => {
      if (p.id !== id) return p;
      return { ...p, label: value || undefined };
    });
  }

  function changeReference(id: string, value: string) {
    payments = payments.map((p) => {
      if (p.id !== id) return p;
      return { ...p, reference: value || undefined };
    });
  }

  function fillRemainingWithCash() {
    if (remaining <= 0) return;
    // Cari entry tunai, atau tambah baru
    const cashIdx = payments.findIndex((p) => p.kind === 'tunai');
    if (cashIdx >= 0) {
      const cur = payments[cashIdx];
      const newAmount = cur.amount + remaining;
      changeAmount(cur.id, newAmount);
      // Set tendered = newAmount (pas bayar)
      changeTendered(cur.id, newAmount);
    } else {
      payments = [
        ...payments,
        {
          id: genPaymentMethodId(),
          kind: 'tunai',
          amount: remaining,
          tendered: remaining,
          change: 0,
          paid_at: new Date().toISOString(),
        },
      ];
    }
  }

  function autoBalance() {
    // Set entry pertama = grandTotal - sum(other entries)
    if (payments.length < 2) return;
    const first = payments[0];
    const otherSum = payments.slice(1).reduce((s, p) => s + p.amount, 0);
    const newAmount = Math.max(0, grandTotal - otherSum);
    changeAmount(first.id, newAmount);
    if (first.kind === 'tunai' && first.tendered !== undefined) {
      changeTendered(first.id, Math.max(newAmount, first.tendered));
    }
  }

  function handleConfirm() {
    if (!allValid || disabled) return;
    // update paid_at timestamp terakhir
    payments = payments.map((p) => ({ ...p, paid_at: new Date().toISOString() }));
    onConfirm(payments);
  }

  function formatRupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function needsTendered(kind: PaymentMethodKind): boolean {
    return PAYMENT_METHOD_NEEDS_TENDERED.includes(kind);
  }
  function needsReference(kind: PaymentMethodKind): boolean {
    return PAYMENT_METHOD_NEEDS_REFERENCE.includes(kind);
  }

  // Lock body scroll saat modal terbuka
  $effect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  });
</script>

<!-- Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
  onclick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
  role="dialog"
  aria-modal="true"
  aria-label="Form Pembayaran"
>
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white flex items-center justify-between">
      <div>
        <h2 class="text-lg font-bold flex items-center gap-2">
          💳 Pembayaran
        </h2>
        <p class="text-xs opacity-90 mt-0.5">Bisa lebih dari 1 metode (split)</p>
      </div>
      <button
        type="button"
        onclick={onCancel}
        class="text-white/80 hover:text-white hover:bg-white/20 rounded-lg w-9 h-9 flex items-center justify-center text-xl transition"
        aria-label="Tutup"
      >×</button>
    </div>

    <!-- Grand total banner -->
    <div class="px-5 py-3 bg-emerald-50 border-b border-emerald-200">
      <div class="flex items-center justify-between">
        <span class="text-sm text-emerald-700 font-medium">Total Tagihan</span>
        <span class="text-2xl font-bold text-emerald-900">{formatRupiah(grandTotal)}</span>
      </div>
    </div>

    <!-- Payment entries -->
    <div class="flex-1 overflow-y-auto p-5 space-y-3">
      {#each payments as p, idx (p.id)}
        {@const isFirst = idx === 0}
        <div class="border-2 border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2">
          <!-- Header row: index + kind selector + remove -->
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {idx + 1}
            </span>
            <select
              value={p.kind}
              onchange={(e) => changeKind(p.id, (e.target as HTMLSelectElement).value as PaymentMethodKind)}
              disabled={disabled}
              class="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="tunai">💵 Tunai</option>
              <option value="qris">📱 QRIS</option>
              <option value="debit">💳 Kartu Debit</option>
              <option value="kredit">💳 Kartu Kredit</option>
              <option value="transfer">🏦 Transfer Bank</option>
              <option value="ewallet">📲 E-Wallet</option>
            </select>
            {#if payments.length > 1}
              <button
                type="button"
                onclick={() => removePayment(p.id)}
                disabled={disabled}
                class="w-8 h-8 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition"
                aria-label="Hapus metode"
              >✕</button>
            {/if}
          </div>

          <!-- Label (optional) -->
          <input
            type="text"
            value={p.label ?? ''}
            oninput={(e) => changeLabel(p.id, (e.target as HTMLInputElement).value)}
            placeholder="Label (opsional, mis. BCA, DANA, ShopeePay)"
            disabled={disabled}
            class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <!-- Amount -->
          <label class="block">
            <span class="block text-xs text-gray-600 mb-0.5">Nominal</span>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-500 font-medium">Rp</span>
              <input
                type="number"
                value={p.amount}
                oninput={(e) => changeAmount(p.id, Number((e.target as HTMLInputElement).value) || 0)}
                disabled={disabled}
                min="0"
                class="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </label>

          <!-- Tunai: tendered + change -->
          {#if needsTendered(p.kind)}
            <div class="grid grid-cols-2 gap-2">
              <label class="block">
                <span class="block text-xs text-gray-600 mb-0.5">Disetor</span>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={p.tendered ?? ''}
                    oninput={(e) => changeTendered(p.id, Number((e.target as HTMLInputElement).value) || 0)}
                    disabled={disabled}
                    min="0"
                    placeholder={p.amount.toString()}
                    class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </label>
              <div>
                <span class="block text-xs text-gray-600 mb-0.5">Kembalian</span>
                <div class="px-2 py-1.5 bg-emerald-100 border border-emerald-300 rounded-lg text-sm font-bold text-emerald-800 text-right">
                  {formatRupiah(p.change ?? 0)}
                </div>
              </div>
            </div>
            <!-- Quick tendered buttons -->
            <div class="flex gap-1 flex-wrap">
              {#each [p.amount, 50000, 100000, 200000].filter((v, i, a) => a.indexOf(v) === i) as preset}
                <button
                  type="button"
                  onclick={() => changeTendered(p.id, preset)}
                  disabled={disabled}
                  class="px-2 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-emerald-50 hover:border-emerald-400 transition font-medium"
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              {/each}
            </div>
          {/if}

          <!-- Reference (kartu/transfer) -->
          {#if needsReference(p.kind)}
            <label class="block">
              <span class="block text-xs text-gray-600 mb-0.5">
                No. Referensi / Approval <span class="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={p.reference ?? ''}
                oninput={(e) => changeReference(p.id, (e.target as HTMLInputElement).value)}
                placeholder="mis. TRX-12345 / APPROVE-67890"
                disabled={disabled}
                class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </label>
          {/if}

          {#if p.kind === 'qris' || p.kind === 'ewallet'}
            <div class="text-xs text-gray-500 italic px-2 py-1 bg-blue-50 rounded">
              📱 Tampilkan QR code / nomor pembayaran ke customer untuk scanning.
            </div>
          {/if}
        </div>
      {/each}

      <!-- Add payment button -->
      <button
        type="button"
        onclick={addPayment}
        disabled={disabled || remaining <= 0}
        class="w-full py-2 border-2 border-dashed border-emerald-400 text-emerald-700 rounded-xl hover:bg-emerald-50 hover:border-emerald-500 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
      >
        ➕ Tambah Metode Pembayaran
      </button>

      <!-- Quick helpers -->
      {#if payments.length >= 2 && remaining > 0}
        <button
          type="button"
          onclick={fillRemainingWithCash}
          disabled={disabled}
          class="w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl transition font-medium text-sm flex items-center justify-center gap-1"
        >
          💵 Bayar Sisa ({formatRupiah(remaining)}) dgn Tunai
        </button>
      {/if}
    </div>

    <!-- Summary + actions -->
    <div class="border-t border-gray-200 bg-gray-50 px-5 py-3 space-y-2">
      <!-- Status row -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="bg-white rounded-lg p-2 border border-gray-200">
          <div class="text-xs text-gray-500">Total Bayar</div>
          <div class="text-sm font-bold text-emerald-700">{formatRupiah(summary.total_paid)}</div>
        </div>
        <div class="bg-white rounded-lg p-2 border border-gray-200">
          <div class="text-xs text-gray-500">Sisa</div>
          <div class="text-sm font-bold {remaining === 0 ? 'text-gray-400' : 'text-amber-600'}">
            {formatRupiah(Math.max(0, remaining))}
          </div>
        </div>
        <div class="bg-white rounded-lg p-2 border border-gray-200">
          <div class="text-xs text-gray-500">Kembalian</div>
          <div class="text-sm font-bold text-blue-600">{formatRupiah(totalChange)}</div>
        </div>
      </div>

      {#if remaining < 0}
        <div class="text-xs text-red-600 text-center font-medium">
          ⚠️ Total bayar melebihi tagihan ({formatRupiah(-remaining)} lebih)
        </div>
      {:else if remaining > 0}
        <div class="text-xs text-amber-700 text-center">
          Sisa tagihan: <strong>{formatRupiah(remaining)}</strong> — tambah metode atau bayar dgn tunai
        </div>
      {:else if summary.is_split}
        <div class="text-xs text-emerald-700 text-center font-medium">
          ✅ Split payment: {payments.length} metode — kembalian {formatRupiah(totalChange)}
        </div>
      {:else}
        <div class="text-xs text-emerald-700 text-center font-medium">
          ✅ Pembayaran pas
        </div>
      {/if}

      <!-- Action buttons -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onclick={onCancel}
          disabled={disabled}
          class="py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onclick={handleConfirm}
          disabled={!allValid || disabled || remaining < 0}
          class="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          💰 Bayar Sekarang
        </button>
      </div>
    </div>
  </div>
</div>
