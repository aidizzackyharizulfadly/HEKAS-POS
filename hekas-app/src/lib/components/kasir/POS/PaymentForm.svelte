<!--
  HEKAS POS — Payment Form (Fase 9: shadcn-svelte polish)

  Multi-payment split form. shadcn-svelte style:
    - Dialog-style modal with backdrop + body scroll lock + Esc key
    - Card-based payment entries (numbered Badge)
    - Select dropdown for method kind
    - Input for label/amount/tendered/reference
    - Button variants: default (primary Bayar), outline (Tambah Metode),
      secondary (Tahan/Batal), ghost (close X), destructive (remove)
    - lucide icons: CreditCard, Banknote, QrCode, Wallet, Building2, Plus,
      Trash2, AlertTriangle, CheckCircle2, X, Coins

  Props:
    grandTotal  number                   — total tagihan
    onChange    (summary) => void        — dipanggil setiap state change
    onConfirm   (methods) => void        — klik "Bayar Sekarang"
    onCancel    () => void               — klik "Batal" / Esc / backdrop
    disabled    boolean? = false         — disable semua input + button
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { PaymentMethod, PaymentMethodKind } from '$lib/utils/payment';
  import {
    PAYMENT_METHOD_LABEL,
    PAYMENT_METHOD_NEEDS_TENDERED,
    PAYMENT_METHOD_NEEDS_REFERENCE,
    genPaymentMethodId,
    summarizePayments,
  } from '$lib/utils/payment';
  import { cn } from '$lib/utils/cn';

  // shadcn-svelte primitives
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import Label from '$lib/components/ui/label.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import Select from '$lib/components/ui/select.svelte';
  import type { SelectOption } from '$lib/components/ui/select.svelte';

  // lucide-svelte icons
  import CreditCardIcon from '@lucide/svelte/icons/credit-card';
  import XIcon from '@lucide/svelte/icons/x';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
  import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
  import CoinsIcon from '@lucide/svelte/icons/coins';
  import WalletIcon from '@lucide/svelte/icons/wallet';

  // ─── Props ──────────────────────────────────────────────────────────────
  let {
    grandTotal,
    onChange,
    onConfirm,
    onCancel,
    disabled = false,
  }: {
    grandTotal: number;
    onChange?: (summary: {
      methods: PaymentMethod[];
      remaining: number;
      total_paid: number;
      is_valid: boolean;
    }) => void;
    onConfirm: (methods: PaymentMethod[]) => void;
    onCancel?: () => void;
    disabled?: boolean;
  } = $props();

  // ─── State ──────────────────────────────────────────────────────────────
  let payments: PaymentMethod[] = $state(
    untrack(() => [
      {
        id: genPaymentMethodId(),
        kind: 'tunai' as PaymentMethodKind,
        label: undefined,
        amount: grandTotal,
        tendered: grandTotal,
        change: 0,
        reference: undefined,
        paid_at: new Date().toISOString(),
      },
    ])
  );

  // ─── Derived ────────────────────────────────────────────────────────────
  let summary = $derived(summarizePayments(payments));
  let remaining = $derived(grandTotal - summary.total_paid);
  let totalChange = $derived(summary.total_change);

  // ─── Helpers ────────────────────────────────────────────────────────────
  function isEntryValid(p: PaymentMethod): boolean {
    if (p.amount <= 0) return false;
    if (PAYMENT_METHOD_NEEDS_REFERENCE.includes(p.kind) && !p.reference?.trim()) return false;
    if (p.kind === 'tunai' && p.tendered !== undefined && p.tendered < p.amount) return false;
    return true;
  }

  let allValid = $derived(
    payments.length > 0 && payments.every(isEntryValid) && remaining === 0
  );

  function needsTendered(kind: PaymentMethodKind): boolean {
    return PAYMENT_METHOD_NEEDS_TENDERED.includes(kind);
  }
  function needsReference(kind: PaymentMethodKind): boolean {
    return PAYMENT_METHOD_NEEDS_REFERENCE.includes(kind);
  }

  function formatRupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  // Opsi dropdown Select (kind → label)
  const kindOptions: SelectOption[] = [
    { value: 'tunai', label: '💵 Tunai' },
    { value: 'qris', label: '📱 QRIS' },
    { value: 'debit', label: '💳 Kartu Debit' },
    { value: 'kredit', label: '💳 Kartu Kredit' },
    { value: 'transfer', label: '🏦 Transfer Bank' },
    { value: 'ewallet', label: '📲 E-Wallet' },
  ];

  // ─── Effects ────────────────────────────────────────────────────────────

  // Notify parent setiap state change
  $effect(() => {
    onChange?.({
      methods: payments,
      remaining,
      total_paid: summary.total_paid,
      is_valid: allValid,
    });
  });

  // Lock body scroll saat modal terbuka
  $effect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  });

  // Escape key handler
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  }

  // Backdrop click handler
  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onCancel?.();
  }

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
    if (payments.length === 1) return;
    payments = payments.filter((p) => p.id !== id);
    // re-balance: jika tinggal 1 entry, set ke grandTotal
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
      const change =
        p.kind === 'tunai' && tendered !== undefined ? Math.max(0, tendered - value) : 0;
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
    payments = payments.map((p) => (p.id === id ? { ...p, label: value || undefined } : p));
  }

  function changeReference(id: string, value: string) {
    payments = payments.map((p) => (p.id === id ? { ...p, reference: value || undefined } : p));
  }

  function fillRemainingWithCash() {
    if (remaining <= 0) return;
    const cashIdx = payments.findIndex((p) => p.kind === 'tunai');
    if (cashIdx >= 0) {
      const cur = payments[cashIdx];
      const newAmount = cur.amount + remaining;
      changeAmount(cur.id, newAmount);
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

  function handleConfirm() {
    if (!allValid || disabled) return;
    payments = payments.map((p) => ({ ...p, paid_at: new Date().toISOString() }));
    onConfirm(payments);
  }
</script>

<!--
  Backdrop + Modal container
  Mirrors shadcn Dialog (no Dialog primitive — parent controls via {#if}).
  bg-popover + ring-foreground/10 = shadcn design tokens.
-->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  onclick={onBackdropClick}
  onkeydown={onKeydown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="payment-form-title"
  tabindex="-1"
>
  <div
    class="bg-popover text-popover-foreground ring-foreground/10 grid w-full max-w-lg gap-0 overflow-hidden rounded-xl text-sm shadow-2xl ring-1 outline-none max-h-[90vh] flex flex-col"
  >
    <!-- Header (gradient emerald matching design system) -->
    <header
      class="flex items-center justify-between gap-2 px-5 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white"
    >
      <div>
        <h2 id="payment-form-title" class="text-base font-bold flex items-center gap-2">
          <CreditCardIcon class="size-5" aria-hidden="true" />
          Pembayaran
        </h2>
        <p class="text-xs opacity-90 mt-0.5">Bisa lebih dari 1 metode (split)</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onclick={onCancel}
        aria-label="Tutup form pembayaran"
        class="text-white/80 hover:text-white hover:bg-white/20"
      >
        <XIcon />
      </Button>
    </header>

    <!-- Grand total banner (emerald soft) -->
    <div class="px-5 py-3 bg-emerald-50 border-b border-emerald-200">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-emerald-700">Total Tagihan</span>
        <span class="text-2xl font-bold text-emerald-900 tabular-nums">
          {formatRupiah(grandTotal)}
        </span>
      </div>
    </div>

    <!-- Payment entries (scrollable) -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      {#each payments as p, idx (p.id)}
        <article
          class="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2.5"
        >
          <!-- Header row: index badge + kind select + remove -->
          <div class="flex items-center gap-2">
            <Badge variant="success" class="size-7 p-0 justify-center font-bold">
              {idx + 1}
            </Badge>
            <div class="flex-1">
              <Select
                value={p.kind}
                options={kindOptions}
                onchange={(v) => changeKind(p.id, v as PaymentMethodKind)}
                disabled={disabled}
                placeholder="Pilih metode…"
              />
            </div>
            {#if payments.length > 1}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onclick={() => removePayment(p.id)}
                {disabled}
                aria-label="Hapus metode {PAYMENT_METHOD_LABEL[p.kind]}"
                class="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2Icon />
              </Button>
            {/if}
          </div>

          <!-- Label (optional) -->
          <Input
            type="text"
            value={p.label ?? ''}
            oninput={(e: Event) => changeLabel(p.id, (e.target as HTMLInputElement).value)}
            placeholder="Label (opsional, mis. BCA, DANA, ShopeePay)"
            {disabled}
            class="h-8 text-xs"
          />

          <!-- Amount (Nominal) -->
          <div class="space-y-1">
            <Label for="amount-{p.id}" class="text-xs font-medium text-slate-600">
              Nominal
            </Label>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-500">Rp</span>
              <Input
                id="amount-{p.id}"
                type="number"
                value={p.amount}
                oninput={(e: Event) => changeAmount(p.id, Number((e.target as HTMLInputElement).value) || 0)}
                {disabled}
                min="0"
                class="font-bold tabular-nums"
              />
            </div>
          </div>

          <!-- Tunai: tendered + change -->
          {#if needsTendered(p.kind)}
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1">
                <Label for="tendered-{p.id}" class="text-xs font-medium text-slate-600">
                  Disetor
                </Label>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-slate-500">Rp</span>
                  <Input
                    id="tendered-{p.id}"
                    type="number"
                    value={p.tendered ?? ''}
                    oninput={(e: Event) =>
                      changeTendered(p.id, Number((e.target as HTMLInputElement).value) || 0)}
                    {disabled}
                    min="0"
                    placeholder={p.amount.toString()}
                    class="tabular-nums"
                  />
                </div>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-medium text-slate-600 block">Kembalian</span>
                <div
                  class="flex h-8 items-center justify-end rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-sm font-bold text-emerald-800 tabular-nums"
                >
                  {formatRupiah(p.change ?? 0)}
                </div>
              </div>
            </div>

            <!-- Quick tendered presets -->
            <div class="flex flex-wrap gap-1">
              {#each [p.amount, 50000, 100000, 200000].filter((v, i, a) => a.indexOf(v) === i) as preset}
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onclick={() => changeTendered(p.id, preset)}
                  {disabled}
                  class="text-xs"
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </Button>
              {/each}
            </div>
          {/if}

          <!-- Reference (kartu/transfer) -->
          {#if needsReference(p.kind)}
            <div class="space-y-1">
              <Label for="ref-{p.id}" class="text-xs font-medium text-slate-600">
                No. Referensi / Approval <span class="text-red-500">*</span>
              </Label>
              <Input
                id="ref-{p.id}"
                type="text"
                value={p.reference ?? ''}
                oninput={(e: Event) => changeReference(p.id, (e.target as HTMLInputElement).value)}
                placeholder="mis. TRX-12345 / APPROVE-67890"
                {disabled}
                class="font-mono"
              />
            </div>
          {/if}

          <!-- QRIS / E-Wallet helper note -->
          {#if p.kind === 'qris' || p.kind === 'ewallet'}
            <div
              class="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs italic text-blue-700"
            >
              Tampilkan QR code / nomor pembayaran ke customer untuk scanning.
            </div>
          {/if}
        </article>
      {/each}

      <!-- Add payment button (dashed outline) -->
      <Button
        type="button"
        variant="outline"
        onclick={addPayment}
        disabled={disabled || remaining <= 0}
        class="w-full justify-center gap-1 border-dashed border-emerald-400 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500"
      >
        <PlusIcon class="size-4" />
        Tambah Metode Pembayaran
      </Button>

      <!-- Quick helper: bayar sisa dgn tunai -->
      {#if payments.length >= 2 && remaining > 0}
        <Button
          type="button"
          variant="secondary"
          onclick={fillRemainingWithCash}
          {disabled}
          class="w-full justify-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200"
        >
          <CoinsIcon class="size-4" />
          Bayar Sisa ({formatRupiah(remaining)}) dgn Tunai
        </Button>
      {/if}
    </div>

    <!-- Footer: summary + actions -->
    <footer class="border-t border-slate-200 bg-slate-50 px-5 py-3 space-y-2.5">
      <!-- Status row: 3 mini stat cards -->
      <div class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-lg border border-slate-200 bg-white p-2">
          <div class="text-xs text-slate-500">Total Bayar</div>
          <div class="text-sm font-bold text-emerald-700 tabular-nums">
            {formatRupiah(summary.total_paid)}
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-2">
          <div class="text-xs text-slate-500">Sisa</div>
          <div
            class={cn(
              'text-sm font-bold tabular-nums',
              remaining === 0 ? 'text-slate-400' : 'text-amber-600'
            )}
          >
            {formatRupiah(Math.max(0, remaining))}
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-white p-2">
          <div class="text-xs text-slate-500">Kembalian</div>
          <div class="text-sm font-bold text-blue-600 tabular-nums">
            {formatRupiah(totalChange)}
          </div>
        </div>
      </div>

      <!-- Status message -->
      {#if remaining < 0}
        <div class="flex items-center justify-center gap-1 text-xs font-medium text-red-600">
          <AlertTriangleIcon class="size-3.5" />
          Total bayar melebihi tagihan ({formatRupiah(-remaining)} lebih)
        </div>
      {:else if remaining > 0}
        <div class="text-center text-xs text-amber-700">
          Sisa tagihan: <strong class="tabular-nums">{formatRupiah(remaining)}</strong> — tambah
          metode atau bayar dgn tunai
        </div>
      {:else if summary.is_split}
        <div class="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700">
          <CheckCircle2Icon class="size-3.5" />
          Split payment: {payments.length} metode — kembalian
          <span class="tabular-nums">{formatRupiah(totalChange)}</span>
        </div>
      {:else}
        <div class="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700">
          <CheckCircle2Icon class="size-3.5" />
          Pembayaran pas
        </div>
      {/if}

      <!-- Action buttons: Batal + Bayar -->
      <div class="grid grid-cols-2 gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          onclick={onCancel}
          {disabled}
          class="bg-slate-200 hover:bg-slate-300 text-slate-800"
        >
          Batal
        </Button>
        <Button
          type="button"
          onclick={handleConfirm}
          disabled={!allValid || disabled || remaining < 0}
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 disabled:opacity-40"
        >
          <WalletIcon class="size-4" />
          Bayar Sekarang
        </Button>
      </div>
    </footer>
  </div>
</div>
