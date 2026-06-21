<script lang="ts">
  /**
   * Reusable confirmation dialog with optional danger variant.
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/shared/ConfirmDialog.svelte`.
   *
   * Used by: void order, delete product, reset data, reject SJ, etc.
   */

  type Variant = 'default' | 'danger' | 'warning';

  interface Props {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
    /** Optional note/checkbox requirement (e.g. type "RESET" to confirm). */
    requireText?: string;
    /** Optional explanatory text shown below (e.g. reason for void). */
    textValue?: string;
    ontextInput?: (v: string) => void;
    textPlaceholder?: string;
    textLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
  }

  let {
    open,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    variant = 'default',
    requireText,
    textValue = '',
    ontextInput,
    textPlaceholder = '',
    textLabel = '',
    onconfirm,
    oncancel
  }: Props = $props();

  let dialog = $state<HTMLDialogElement | undefined>();

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  });

  const variantColors: Record<Variant, { bg: string; text: string; btn: string; btnHover: string }> = {
    default: { bg: '#EFF6FF', text: '#1E40AF', btn: '#2563EB', btnHover: '#1D4ED8' },
    danger:  { bg: '#FEE2E2', text: '#991B1B', btn: '#DC2626', btnHover: '#B91C1C' },
    warning: { bg: '#FEF3C7', text: '#92400E', btn: '#D97706', btnHover: '#B45309' }
  };

  const vc = $derived(variantColors[variant]);

  const canConfirm = $derived(
    !requireText || textValue.trim() === requireText
  );

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (canConfirm) onconfirm();
  }
</script>

<dialog
  bind:this={dialog}
  oncancel={(e) => { e.preventDefault(); oncancel(); }}
  aria-labelledby="confirm-title"
>
  <form method="dialog" onsubmit={handleSubmit}>
    <div class="confirm-dialog__head" style="background: {vc.bg}; color: {vc.text}">
      <div class="confirm-dialog__icon" aria-hidden="true">
        {variant === 'danger' ? '⚠️' : variant === 'warning' ? '⚠' : '❔'}
      </div>
      <h2 id="confirm-title" class="confirm-dialog__title">{title}</h2>
    </div>

    <div class="confirm-dialog__body">
      {#if description}
        <p class="confirm-dialog__desc">{description}</p>
      {/if}

      {#if ontextInput}
        <label class="confirm-dialog__field">
          <span class="confirm-dialog__field-label">
            {textLabel || (requireText ? `Ketik "${requireText}" untuk konfirmasi` : 'Catatan')}
          </span>
          <input
            type="text"
            class="confirm-dialog__input"
            placeholder={textPlaceholder}
            value={textValue}
            oninput={(e) => ontextInput?.((e.target as HTMLInputElement).value)}
            autocomplete="off"
            autofocus
          />
        </label>
      {/if}
    </div>

    <div class="confirm-dialog__actions">
      <button
        type="button"
        class="btn btn--ghost"
        onclick={oncancel}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        class="btn btn--solid"
        style="background: {vc.btn};"
        disabled={!canConfirm}
        onmouseover={(e) => { (e.currentTarget as HTMLElement).style.background = vc.btnHover; }}
        onmouseout={(e) => { (e.currentTarget as HTMLElement).style.background = vc.btn; }}
      >
        {confirmLabel}
      </button>
    </div>
  </form>
</dialog>

<style>
  dialog {
    border: none;
    border-radius: 12px;
    padding: 0;
    background: #ffffff;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
    max-width: 420px;
    width: 92%;
  }
  dialog::backdrop {
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(2px);
  }
  form {
    display: flex;
    flex-direction: column;
    margin: 0;
  }
  .confirm-dialog__head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-radius: 12px 12px 0 0;
  }
  .confirm-dialog__icon {
    font-size: 20px;
  }
  .confirm-dialog__title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }
  .confirm-dialog__body {
    padding: 20px;
  }
  .confirm-dialog__desc {
    margin: 0 0 12px;
    color: #334155;
    font-size: 14px;
    line-height: 1.5;
  }
  .confirm-dialog__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .confirm-dialog__field-label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
  }
  .confirm-dialog__input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    font-size: 14px;
    font: inherit;
    box-sizing: border-box;
  }
  .confirm-dialog__input:focus {
    outline: 2px solid #2563EB;
    outline-offset: 1px;
    border-color: #2563EB;
  }
  .confirm-dialog__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 12px 20px 20px;
    border-top: 1px solid #F1F5F9;
  }
  .btn {
    padding: 8px 18px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms;
    font-family: inherit;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn--ghost {
    background: transparent;
    color: #475569;
    border: 1px solid #CBD5E1;
  }
  .btn--ghost:hover {
    background: #F1F5F9;
  }
  .btn--solid {
    color: #ffffff;
  }
</style>
