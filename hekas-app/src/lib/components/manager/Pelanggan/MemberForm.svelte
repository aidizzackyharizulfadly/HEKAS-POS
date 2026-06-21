<!--
  MemberForm.svelte — Create / Edit member form (modal)
  Props:
    - member: Member | null  (null = create mode, ada = edit mode)
    - onsave: (member: Member) => void
    - onclose: () => void
    - showToast: (kind, msg) => void  (signature kasir: (kind, msg))
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import { api, TIER_CONFIG } from '$lib/api';
  import type { Member } from '$lib/types/domain';

  let {
    member = null,
    onsave,
    onclose,
    showToast = (kind: 'success' | 'error' | 'info', msg: string) => console.log(`[${kind}]`, msg),
  }: {
    member?: Member | null;
    onsave?: (m: Member) => void;
    onclose: () => void;
    showToast?: (kind: 'success' | 'error' | 'info', msg: string) => void;
  } = $props();

  const isEdit = $derived(!!member);

  // Form state (untrack: initial value only, user edits are independent of prop changes)
  let name = $state(untrack(() => member?.name ?? ''));
  let phone = $state(untrack(() => member?.phone ?? ''));
  let email = $state(untrack(() => member?.email ?? ''));
  let address = $state(untrack(() => member?.address ?? ''));
  let birthday = $state(untrack(() => member?.birthday ?? ''));
  let tier = $state<Member['tier']>(untrack(() => member?.tier ?? 'Silver'));
  let points = $state<number>(untrack(() => member?.points ?? 0));
  let note = $state(untrack(() => member?.note ?? ''));

  let saving = $state(false);
  let errors = $state<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nama wajib diisi';
    if (!phone.trim()) {
      e.phone = 'No. HP wajib diisi';
    } else {
      // Validasi format: 08xxx atau +62xxx, minimal 10 digit
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        e.phone = 'No. HP tidak valid (10-15 digit)';
      }
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Format email tidak valid';
    }
    if (points < 0) e.points = 'Poin tidak boleh negatif';
    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      e.birthday = 'Format tanggal: YYYY-MM-DD';
    }
    errors = e;
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;

    saving = true;
    try {
      let result: Member;
      if (isEdit && member) {
        result = await api.members.updateMember(member.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          birthday: birthday || undefined,
          note: note.trim() || undefined,
        });
        // Tier & points diupdate terpisah (butuh alasan/permission check)
        if (tier !== member.tier) {
          result = await api.members.setTierManual(member.id, tier, 'Override dari form edit');
        }
        showToast('success', `Member ${result.name} berhasil diupdate`);
      } else {
        result = await api.members.createMember({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          birthday: birthday || undefined,
          tier,
          points: points > 0 ? points : undefined,
          note: note.trim() || undefined,
        });
        showToast('success', `Member baru ${result.name} (${result.id}) berhasil dibuat`);
      }
      onsave?.(result);
      onclose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan member';
      showToast('error', msg);
    } finally {
      saving = false;
    }
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget && !saving) onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !saving) onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="backdrop"
  onclick={handleBackdrop}
  onkeydown={() => {}}
  role="button"
  tabindex="-1"
  aria-label="Tutup form"
>
  <div class="modal" role="dialog" aria-modal="true" tabindex="-1" aria-labelledby="form-title">
    <div class="header">
      <h2 id="form-title">{isEdit ? '✏️ Edit Member' : '➕ Tambah Member Baru'}</h2>
      <button class="close-btn" onclick={onclose} disabled={saving} aria-label="Tutup">✕</button>
    </div>

    <form onsubmit={handleSubmit} class="form">
      <div class="grid">
        <!-- Nama -->
        <div class="field full">
          <label for="f-name">Nama Lengkap <span class="req">*</span></label>
          <input
            id="f-name"
            type="text"
            bind:value={name}
            placeholder="cth: Budi Santoso"
            disabled={saving}
            class:err={errors.name}
          />
          {#if errors.name}<span class="err-msg">{errors.name}</span>{/if}
        </div>

        <!-- Phone -->
        <div class="field">
          <label for="f-phone">No. HP <span class="req">*</span></label>
          <input
            id="f-phone"
            type="tel"
            bind:value={phone}
            placeholder="08xxx atau +62xxx"
            disabled={saving}
            class:err={errors.phone}
          />
          {#if errors.phone}<span class="err-msg">{errors.phone}</span>{/if}
        </div>

        <!-- Email -->
        <div class="field">
          <label for="f-email">Email</label>
          <input
            id="f-email"
            type="email"
            bind:value={email}
            placeholder="nama@email.com"
            disabled={saving}
            class:err={errors.email}
          />
          {#if errors.email}<span class="err-msg">{errors.email}</span>{/if}
        </div>

        <!-- Birthday -->
        <div class="field">
          <label for="f-birthday">Tanggal Lahir</label>
          <input
            id="f-birthday"
            type="date"
            bind:value={birthday}
            disabled={saving}
            class:err={errors.birthday}
          />
          {#if errors.birthday}<span class="err-msg">{errors.birthday}</span>{/if}
        </div>

        <!-- Tier -->
        <div class="field">
          <label for="f-tier">Tier</label>
          <select id="f-tier" bind:value={tier} disabled={saving || isEdit}>
            <option value="Silver">🥈 Silver (0% diskon, 1x poin)</option>
            <option value="Gold">🥇 Gold (5% diskon, 2x poin)</option>
            <option value="Platinum">💎 Platinum (10% diskon, 3x poin)</option>
          </select>
          {#if isEdit}
            <span class="hint">Tier di-overwrite manual via dropdown ini. Auto-upgrade berdasarkan lifetime_spend berjalan di background.</span>
          {/if}
        </div>

        <!-- Points (hanya untuk create) -->
        {#if !isEdit}
          <div class="field">
            <label for="f-points">Poin Awal</label>
            <input
              id="f-points"
              type="number"
              min="0"
              bind:value={points}
              placeholder="0"
              disabled={saving}
              class:err={errors.points}
            />
            {#if errors.points}<span class="err-msg">{errors.points}</span>{/if}
          </div>
        {/if}

        <!-- Address -->
        <div class="field full">
          <label for="f-address">Alamat</label>
          <textarea
            id="f-address"
            bind:value={address}
            placeholder="Alamat lengkap (opsional)"
            rows="2"
            disabled={saving}
          ></textarea>
        </div>

        <!-- Note (manager only) -->
        <div class="field full">
          <label for="f-note">Catatan Internal</label>
          <textarea
            id="f-note"
            bind:value={note}
            placeholder="Catatan khusus (tidak terlihat member)"
            rows="2"
            disabled={saving}
          ></textarea>
        </div>
      </div>

      <div class="footer">
        <button type="button" class="btn-cancel" onclick={onclose} disabled={saving}>
          ❌ Batal
        </button>
        <button type="submit" class="btn-save" disabled={saving}>
          {#if saving}⏳ Menyimpan...{:else if isEdit}💾 Update{:else}➕ Tambah{/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }
  .modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .header {
    padding: 16px 20px;
    border-bottom: 1px solid #E2E8F0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0F172A;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: #64748B;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
  }
  .close-btn:hover:not(:disabled) {
    background: #F1F5F9;
    color: #0F172A;
  }
  .form {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 16px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .field.full {
    grid-column: 1 / -1;
  }
  .field label {
    font-size: 12px;
    font-weight: 600;
    color: #334155;
  }
  .req {
    color: #DC2626;
  }
  .field input,
  .field select,
  .field textarea {
    padding: 8px 10px;
    border: 1px solid #CBD5E1;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    color: #0F172A;
    background: white;
    transition: border-color 0.15s;
  }
  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    outline: none;
    border-color: #2563EB;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .field input:disabled,
  .field select:disabled,
  .field textarea:disabled {
    background: #F8FAFC;
    cursor: not-allowed;
  }
  .field input.err,
  .err-msg {
    font-size: 11px;
    color: #DC2626;
  }
  .hint {
    font-size: 10px;
    color: #64748B;
    font-style: italic;
  }
  .footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .btn-cancel,
  .btn-save {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-cancel {
    background: #F1F5F9;
    color: #334155;
  }
  .btn-cancel:hover:not(:disabled) {
    background: #E2E8F0;
  }
  .btn-save {
    background: #2563EB;
    color: white;
  }
  .btn-save:hover:not(:disabled) {
    background: #1D4ED8;
  }
  .btn-cancel:disabled,
  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
