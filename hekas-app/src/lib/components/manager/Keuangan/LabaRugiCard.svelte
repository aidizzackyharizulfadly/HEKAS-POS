<script lang="ts">
  import { fmtIDR, formatPercent } from '$lib/utils/format';
  import type { LabaRugiSummary } from '$lib/types/domain';

  interface Props {
    summary: LabaRugiSummary;
  }

  let { summary }: Props = $props();

  let isProfit = $derived(summary.net_profit >= 0);
  let isGrowing = $derived(summary.growth_pct >= 0);
</script>

<div class="bg-surface rounded-2xl border border-default overflow-hidden">
  <div class="px-5 py-4 border-b border-default">
    <h3 class="text-headline-sm font-semibold text-default">Laba Rugi</h3>
    <p class="text-body-sm text-muted mt-0.5">Periode {summary.range.from} — {summary.range.to}</p>
  </div>

  <div class="p-5 space-y-4">
    <!-- Big net profit -->
    <div class="text-center py-4">
      <p class="text-label-md text-muted uppercase tracking-wide">Net Profit</p>
      <p
        class="text-numeral-xl font-bold tabular-nums mt-1"
        class:text-success={isProfit}
        class:text-error={!isProfit}
      >
        {isProfit ? '+' : ''}{fmtIDR(summary.net_profit)}
      </p>
      <div class="flex items-center justify-center gap-2 mt-2">
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sm font-semibold"
          class:bg-success-soft={isGrowing}
          class:text-success={isGrowing}
          class:bg-error-soft={!isGrowing}
          class:text-error={!isGrowing}
        >
          {isGrowing ? '↑' : '↓'} {formatPercent(Math.abs(summary.growth_pct))}
        </span>
        <span class="text-label-sm text-muted">vs periode sebelumnya</span>
      </div>
    </div>

    <!-- Breakdown -->
    <div class="space-y-3 border-t border-default pt-4">
      <div class="flex items-center justify-between">
        <span class="text-body-sm text-muted">Pendapatan</span>
        <span class="text-body-md font-semibold text-default tabular-nums">
          {fmtIDR(summary.revenue)}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-body-sm text-muted">HPP (COGS)</span>
        <span class="text-body-md text-error tabular-nums">−{fmtIDR(summary.cogs)}</span>
      </div>
      <div class="flex items-center justify-between border-t border-default pt-2">
        <span class="text-body-sm font-medium text-default">Laba Kotor</span>
        <span class="text-body-md font-semibold text-default tabular-nums">
          {fmtIDR(summary.gross_profit)}
        </span>
      </div>
      <div class="flex items-center justify-between text-label-sm">
        <span class="text-muted">Gross margin</span>
        <span class="text-muted tabular-nums">{formatPercent(summary.gross_margin_pct)}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-body-sm text-muted">Biaya Operasional</span>
        <span class="text-body-md text-error tabular-nums">−{fmtIDR(summary.operating_expenses)}</span>
      </div>
    </div>
  </div>
</div>
