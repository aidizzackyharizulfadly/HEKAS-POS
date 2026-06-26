<script lang="ts">
  /**
   * Reusable statistic card (KPI tile).
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/shared/StatCard.svelte` (implied).
   *
   * Used by: Manager Beranda (5 KPI), Gudang Beranda, Kasir CommandBar (live metrics),
   *          Manager Penjualan/Inventaris/Keuangan analytics, Manager Laporan KPI.
   */
  import StatusIcon from '$lib/components/shared/StatusIcon.svelte';

  type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

  interface Props {
    label: string;
    value: string | number;
    /** Optional small caption (e.g. "dari kemarin" or "12 item"). */
    hint?: string;
    /** Optional unit suffix (e.g. "Rp", "%", " trx"). */
    unit?: string;
    /** Color tone for icon background + accent. */
    tone?: Tone;
    /** Optional icon name (lucide-svelte). Pass lucide name like "package", "check-circle". */
    icon?: string;
    /** Optional trend indicator (+/-X% or arrow). */
    trend?: { direction: 'up' | 'down' | 'flat'; label: string };
    /** Click handler to make card act as link/button. */
    onclick?: () => void;
    /** Loading state shows skeleton. */
    loading?: boolean;
  }

  let {
    label,
    value,
    hint,
    unit,
    tone = 'neutral',
    icon,
    trend,
    onclick,
    loading = false
  }: Props = $props();

  // Tone → CSS classes (light theme — works on light surface)
  const toneClasses: Record<Tone, { bg: string; text: string; accent: string }> = {
    neutral: { bg: '#F1F5F9', text: '#0F172A', accent: '#64748B' },
    primary: { bg: '#DBEAFE', text: '#1E40AF', accent: '#2563EB' },
    success: { bg: '#D1FAE5', text: '#065F46', accent: '#059669' },
    warning: { bg: '#FEF3C7', text: '#92400E', accent: '#D97706' },
    danger:  { bg: '#FEE2E2', text: '#991B1B', accent: '#DC2626' },
    info:    { bg: '#E0F2FE', text: '#075985', accent: '#0284C7' }
  };

  const tc = $derived(toneClasses[tone]);

  const trendColor = $derived(
    trend?.direction === 'up' ? '#059669' :
    trend?.direction === 'down' ? '#DC2626' : '#64748B'
  );
  const trendIcon = $derived(
    trend?.direction === 'up' ? '↑' :
    trend?.direction === 'down' ? '↓' : '→'
  );
</script>

<button
  type="button"
  class="stat-card"
  class:clickable={!!onclick}
  class:loading
  {onclick}
  disabled={!onclick}
  aria-label="{label}: {value}{unit ? ' ' + unit : ''}{hint ? ' (' + hint + ')' : ''}"
>
  <div class="stat-card__head">
    {#if icon}
      <div
        class="stat-card__icon"
        style="background: {tc.bg}; color: {tc.text}"
        aria-hidden="true"
      >
        <StatusIcon {icon} size={20} />
      </div>
    {/if}
    <div class="stat-card__label">{label}</div>
  </div>

  {#if loading}
    <div class="stat-card__value-skeleton" aria-label="memuat"></div>
    <div class="stat-card__hint-skeleton" aria-label="memuat"></div>
  {:else}
    <div class="stat-card__value" style="color: {tc.text}">
      {value}<span class="stat-card__unit">{unit ?? ''}</span>
    </div>

    {#if hint || trend}
      <div class="stat-card__foot">
        {#if trend}
          <span class="stat-card__trend" style="color: {trendColor}">
            {trendIcon} {trend.label}
          </span>
        {/if}
        {#if hint}
          <span class="stat-card__hint">{hint}</span>
        {/if}
      </div>
    {/if}
  {/if}
</button>

<style>
  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 16px;
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    text-align: left;
    font: inherit;
    color: inherit;
    cursor: default;
    transition: box-shadow 120ms ease, transform 120ms ease;
    min-width: 0;
  }
  .stat-card.clickable {
    cursor: pointer;
  }
  .stat-card.clickable:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    transform: translateY(-1px);
  }
  .stat-card.clickable:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }
  .stat-card:disabled {
    cursor: default;
  }
  .stat-card.loading {
    pointer-events: none;
  }

  .stat-card__head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .stat-card__icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .stat-card__label {
    font-size: 12px;
    font-weight: 500;
    color: #64748B;
    line-height: 1.2;
  }

  .stat-card__value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }
  .stat-card__unit {
    font-size: 14px;
    font-weight: 500;
    margin-left: 2px;
    opacity: 0.75;
  }

  .stat-card__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    margin-top: 2px;
  }
  .stat-card__trend {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .stat-card__hint {
    color: #94A3B8;
  }

  /* Skeleton */
  .stat-card__value-skeleton,
  .stat-card__hint-skeleton {
    background: linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: shimmer 1.2s ease-in-out infinite;
  }
  .stat-card__value-skeleton {
    height: 22px;
    width: 70%;
    margin-top: 2px;
  }
  .stat-card__hint-skeleton {
    height: 10px;
    width: 50%;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
