<!--
  MemberDetail.svelte — Member detail view (modal)
  Shows: profile, stats, tier progress, point history, recent transactions
  Props:
    - member: Member
    - onclose: () => void
    - onedit: (member: Member) => void  (optional)
    - showToast: (kind, msg) => void
-->
<script lang="ts">
  import { api, TIER_CONFIG } from '$lib/api';
  import type { Member } from '$lib/types/domain';
  import type { MemberStats } from '$lib/types/api';
  import TierBadge from './TierBadge.svelte';

  let {
    member,
    onclose,
    onedit,
    showToast = (kind: string, msg: string) => console.log(`[${kind}]`, msg),
  }: {
    member: Member;
    onclose: () => void;
    onedit?: (m: Member) => void;
    showToast?: (kind: 'success' | 'error' | 'info', msg: string) => void;
  } = $props();

  let stats = $state<MemberStats | null>(null);
  let recentTxs = $state<any[]>([]);
  let loading = $state(true);
  let tab = $state<'overview' | 'points' | 'transactions' | 'tier'>('overview');

  const config = $derived(TIER_CONFIG[member.tier]);

  // Point history sorted newest first
  const pointHistory = $derived(
    [...(member.point_history ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    )
  );

  // Tier history sorted newest first
  const tierHistory = $derived(
    [...(member.tier_history ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    )
  );

  $effect(() => {
    loadData();
  });

  async function loadData() {
    loading = true;
    try {
      stats = await api.members.getMemberStats(member.id);
      // Ambil 10 transaksi terakhir dari localStorage
      const txs = await api.orders.listTransactions();
      recentTxs = txs
        .filter((t: any) => t.member_id === member.id)
        .slice(0, 10);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat data';
      showToast('error', msg);
    } finally {
      loading = false;
    }
  }

  function fmtIDR(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
  }
  function fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function fmtDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

<div
  class="backdrop"
  onclick={handleBackdrop}
  onkeydown={() => {}}
  role="button"
  tabindex="-1"
  aria-label="Tutup detail"
>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
    <!-- Header -->
    <div class="header" style="background: linear-gradient(135deg, {config.bg} 0%, white 100%); border-bottom: 3px solid {config.color};">
      <div class="header-content">
        <div class="avatar" style="background: {config.color}; color: white;">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div class="header-text">
          <h2 id="detail-title">{member.name}</h2>
          <div class="header-meta">
            <span class="member-id">{member.id}</span>
            <TierBadge tier={member.tier} size="md" />
          </div>
        </div>
      </div>
      <button class="close-btn" onclick={onclose} aria-label="Tutup">✕</button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class:active={tab === 'overview'} onclick={() => (tab = 'overview')}>
        📊 Ringkasan
      </button>
      <button class:active={tab === 'points'} onclick={() => (tab = 'points')}>
        ⭐ Poin ({member.points})
      </button>
      <button class:active={tab === 'transactions'} onclick={() => (tab = 'transactions')}>
        🧾 Transaksi ({stats?.total_transactions ?? 0})
      </button>
      <button class:active={tab === 'tier'} onclick={() => (tab = 'tier')}>
        🏆 Tier History
      </button>
    </div>

    <!-- Body -->
    <div class="body">
      {#if loading}
        <div class="loading">⏳ Memuat data...</div>
      {:else if tab === 'overview'}
        <!-- OVERVIEW TAB -->
        <div class="section">
          <h3>👤 Profil</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">📱 No. HP</span>
              <span class="info-val">{member.phone}</span>
            </div>
            {#if member.email}
              <div class="info-row">
                <span class="info-label">✉️ Email</span>
                <span class="info-val">{member.email}</span>
              </div>
            {/if}
            {#if member.birthday}
              <div class="info-row">
                <span class="info-label">🎂 Tgl Lahir</span>
                <span class="info-val">{fmtDate(member.birthday)}</span>
              </div>
            {/if}
            {#if member.address}
              <div class="info-row">
                <span class="info-label">🏠 Alamat</span>
                <span class="info-val">{member.address}</span>
              </div>
            {/if}
            <div class="info-row">
              <span class="info-label">📅 Terdaftar</span>
              <span class="info-val">{fmtDate(member.created_at)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">🕐 Tx Terakhir</span>
              <span class="info-val">{fmtDateTime(member.last_transaction_at)}</span>
            </div>
          </div>
        </div>

        {#if stats}
          <div class="section">
            <h3>📈 Statistik</h3>
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">Total Belanja</div>
                <div class="kpi-val">{fmtIDR(stats.total_spend)}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Jumlah Transaksi</div>
                <div class="kpi-val">{stats.total_transactions}x</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Rata-rata</div>
                <div class="kpi-val">{fmtIDR(stats.avg_ticket)}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Poin Saat Ini</div>
                <div class="kpi-val" style="color: {config.color};">{member.points} ⭐</div>
              </div>
            </div>
          </div>
        {/if}

        {#if stats?.tier_progress}
          {@const tp = stats.tier_progress}
          {#if tp.next}
            <div class="section">
              <h3>🎯 Progress ke {TIER_CONFIG[tp.next]?.label ?? '—'}</h3>
              <div class="progress-bar">
                <div class="progress-fill" style="width: {tp.progress_pct}%; background: {config.color};"></div>
              </div>
              <div class="progress-meta">
                <span>{fmtIDR(member.lifetime_spend ?? 0)} / {fmtIDR(TIER_CONFIG[tp.next]?.min_lifetime_spend ?? 0)}</span>
                <span style="color: {config.color};">{tp.progress_pct}%</span>
              </div>
              <p class="progress-hint">
                💡 Belanja <strong>{fmtIDR(tp.spend_to_next)}</strong> lagi untuk upgrade ke <strong>{TIER_CONFIG[tp.next]?.label ?? '—'}</strong> ({TIER_CONFIG[tp.next]?.discount_pct ?? 0}% diskon, {TIER_CONFIG[tp.next]?.point_multiplier ?? 1}x poin)
              </p>
            </div>
          {:else}
            <div class="section tier-max">
              <h3>👑 Tier Tertinggi!</h3>
              <p>Member ini sudah di tier tertinggi (Platinum). Nikmati semua benefit premium: 10% diskon + 3x poin di setiap transaksi.</p>
            </div>
          {/if}
        {/if}

        {#if member.note}
          <div class="section">
            <h3>📝 Catatan Internal</h3>
            <div class="note-box">💬 {member.note}</div>
          </div>
        {/if}

      {:else if tab === 'points'}
        <!-- POINTS TAB -->
        <div class="section">
          <h3>⭐ Riwayat Poin</h3>
          <div class="balance-card" style="background: {config.bg}; border-color: {config.color};">
            <div class="balance-label">Saldo Saat Ini</div>
            <div class="balance-val" style="color: {config.color};">{member.points} ⭐</div>
            {#if stats}
              <div class="balance-sub">
                Total earned: <strong>{stats.total_points_earned}</strong> ·
                Total redeemed: <strong>{stats.total_points_redeemed}</strong>
              </div>
            {/if}
          </div>

          {#if pointHistory.length === 0}
            <div class="empty">Belum ada aktivitas poin</div>
          {:else}
            <div class="timeline">
              {#each pointHistory as entry (entry.id)}
                <div class="timeline-item">
                  <div class="timeline-icon" style="background: {entry.amount > 0 ? '#10B981' : '#DC2626'};">
                    {entry.type === 'earn' ? '⬆️' : entry.type === 'redeem' ? '⬇️' : entry.type === 'expire' ? '⏰' : '🔧'}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-row">
                      <strong style="color: {entry.amount > 0 ? '#059669' : '#DC2626'};">
                        {entry.amount > 0 ? '+' : ''}{entry.amount} poin
                      </strong>
                      <span class="timeline-date">{fmtDateTime(entry.created_at)}</span>
                    </div>
                    <div class="timeline-note">
                      {entry.note ?? entry.type}
                      {#if entry.ref_id}· <code>{entry.ref_id}</code>{/if}
                    </div>
                    <div class="timeline-balance">Saldo: {entry.balance_after} ⭐</div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

      {:else if tab === 'transactions'}
        <!-- TRANSACTIONS TAB -->
        <div class="section">
          <h3>🧾 10 Transaksi Terakhir</h3>
          {#if recentTxs.length === 0}
            <div class="empty">Belum ada transaksi</div>
          {:else}
            <table class="tx-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Tanggal</th>
                  <th class="text-right">Total</th>
                  <th class="text-right">Poin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {#each recentTxs as tx (tx.id)}
                  <tr>
                    <td><code>{tx.invoice_no}</code></td>
                    <td>{fmtDateTime(tx.created_at)}</td>
                    <td class="text-right">{fmtIDR(tx.total)}</td>
                    <td class="text-right">+{Math.floor(tx.total / 10000) * TIER_CONFIG[member.tier].point_multiplier}</td>
                    <td>
                      {#if tx.status === 'completed'}
                        <span class="status-badge done">✓ Selesai</span>
                      {:else if tx.status === 'void'}
                        <span class="status-badge void">⊘ Void</span>
                      {:else}
                        <span class="status-badge">{tx.status}</span>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>

      {:else if tab === 'tier'}
        <!-- TIER HISTORY TAB -->
        <div class="section">
          <h3>🏆 Riwayat Tier</h3>
          {#if tierHistory.length === 0}
            <div class="empty">Belum ada perubahan tier</div>
          {:else}
            <div class="timeline">
              {#each tierHistory as entry, i (i)}
                <div class="timeline-item">
                  <div class="timeline-icon" style="background: {TIER_CONFIG[entry.to].color};">
                    {entry.to === 'Silver' ? '🥈' : entry.to === 'Gold' ? '🥇' : '💎'}
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-row">
                      <strong>
                        {#if entry.from}
                          {TIER_CONFIG[entry.from].label} → {TIER_CONFIG[entry.to].label}
                        {:else}
                          New: {TIER_CONFIG[entry.to].label}
                        {/if}
                      </strong>
                      <span class="timeline-date">{fmtDateTime(entry.created_at)}</span>
                    </div>
                    <div class="timeline-note">{entry.note}</div>
                    <div class="timeline-balance" style="text-transform: uppercase; font-size: 10px; color: #64748B;">
                      Reason: {entry.reason}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="footer">
      {#if onedit}
        <button class="btn-edit" onclick={() => onedit?.(member)}>✏️ Edit Member</button>
      {/if}
      <button class="btn-close" onclick={onclose}>Tutup</button>
    </div>
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
    max-width: 720px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  .header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .header-content {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
  }
  .header-text h2 {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 700;
    color: #0F172A;
  }
  .header-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .member-id {
    font-family: monospace;
    font-size: 12px;
    color: #64748B;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 3px;
  }
  .close-btn {
    background: rgba(0, 0, 0, 0.05);
    border: none;
    font-size: 18px;
    color: #64748B;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 4px;
  }
  .close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  .tabs {
    display: flex;
    border-bottom: 1px solid #E2E8F0;
    background: #F8FAFC;
  }
  .tabs button {
    flex: 1;
    padding: 10px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tabs button:hover {
    color: #0F172A;
    background: rgba(0, 0, 0, 0.02);
  }
  .tabs button.active {
    color: #2563EB;
    border-bottom-color: #2563EB;
    background: white;
  }
  .body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .section {
    margin-bottom: 20px;
  }
  .section h3 {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
    background: #F8FAFC;
    padding: 12px;
    border-radius: 8px;
  }
  .info-row {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .info-label {
    font-size: 11px;
    color: #64748B;
    font-weight: 600;
  }
  .info-val {
    font-size: 14px;
    color: #0F172A;
  }
  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .kpi-card {
    background: #F8FAFC;
    padding: 10px 12px;
    border-radius: 8px;
  }
  .kpi-label {
    font-size: 11px;
    color: #64748B;
    font-weight: 600;
  }
  .kpi-val {
    font-size: 18px;
    font-weight: 700;
    color: #0F172A;
    margin-top: 2px;
  }
  .progress-bar {
    width: 100%;
    height: 12px;
    background: #E2E8F0;
    border-radius: 6px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    transition: width 0.3s;
  }
  .progress-meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #64748B;
    margin-top: 6px;
    font-weight: 600;
  }
  .progress-hint {
    margin-top: 10px;
    padding: 10px;
    background: #FEF3C7;
    border-left: 3px solid #F59E0B;
    font-size: 12px;
    color: #78350F;
    border-radius: 4px;
  }
  .tier-max {
    background: linear-gradient(135deg, #DBEAFE 0%, #FEF3C7 100%);
    padding: 16px;
    border-radius: 8px;
    text-align: center;
  }
  .tier-max p {
    color: #1E40AF;
    font-size: 13px;
    margin: 8px 0 0 0;
  }
  .note-box {
    background: #FEF3C7;
    padding: 10px 12px;
    border-left: 3px solid #F59E0B;
    border-radius: 4px;
    font-size: 13px;
    color: #78350F;
  }
  .balance-card {
    padding: 16px;
    border: 2px solid;
    border-radius: 8px;
    text-align: center;
    margin-bottom: 16px;
  }
  .balance-label {
    font-size: 11px;
    color: #64748B;
    font-weight: 600;
  }
  .balance-val {
    font-size: 32px;
    font-weight: 700;
    margin: 4px 0;
  }
  .balance-sub {
    font-size: 11px;
    color: #64748B;
  }
  .timeline {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .timeline-item {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: #F8FAFC;
    border-radius: 6px;
  }
  .timeline-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .timeline-content {
    flex: 1;
  }
  .timeline-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
  }
  .timeline-date {
    font-size: 11px;
    color: #94A3B8;
  }
  .timeline-note {
    font-size: 12px;
    color: #64748B;
    margin-top: 2px;
  }
  .timeline-note code {
    background: #E2E8F0;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
  }
  .timeline-balance {
    font-size: 11px;
    color: #64748B;
    margin-top: 2px;
  }
  .tx-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  .tx-table th,
  .tx-table td {
    padding: 8px 6px;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }
  .tx-table th {
    background: #F8FAFC;
    font-weight: 600;
    color: #475569;
  }
  .tx-table .text-right {
    text-align: right;
  }
  .tx-table code {
    background: #F1F5F9;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }
  .status-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 600;
  }
  .status-badge.done {
    background: #D1FAE5;
    color: #065F46;
  }
  .status-badge.void {
    background: #FEE2E2;
    color: #991B1B;
  }
  .empty {
    text-align: center;
    padding: 24px;
    color: #94A3B8;
    font-size: 13px;
  }
  .loading {
    text-align: center;
    padding: 32px;
    color: #64748B;
  }
  .footer {
    padding: 12px 20px;
    border-top: 1px solid #E2E8F0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    background: #F8FAFC;
  }
  .btn-edit,
  .btn-close {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  .btn-edit {
    background: #2563EB;
    color: white;
  }
  .btn-edit:hover {
    background: #1D4ED8;
  }
  .btn-close {
    background: #E2E8F0;
    color: #334155;
  }
  .btn-close:hover {
    background: #CBD5E1;
  }
</style>
