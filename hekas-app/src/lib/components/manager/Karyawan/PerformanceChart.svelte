<script lang="ts">
  import { fmtIDR } from '$lib/utils/format';
  import type { EmployeePerformance } from '$lib/types/domain';

  interface Props {
    data: EmployeePerformance[];
    metric?: 'transactions' | 'revenue' | 'rating';
    limit?: number;
    onEmployeeClick?: (emp: EmployeePerformance) => void;
  }

  let { data, metric = 'revenue', limit = 10, onEmployeeClick }: Props = $props();

  let visible = $derived(data.slice(0, limit));

  const roleColors: Record<EmployeePerformance['role'], string> = {
    kasir: 'bg-primary',
    gudang: 'bg-warning',
    manager: 'bg-success'
  };

  function metricValue(emp: EmployeePerformance): number {
    return metric === 'transactions' ? emp.transactions : metric === 'revenue' ? emp.revenue : emp.rating;
  }

  function metricLabel(): string {
    return metric === 'transactions' ? 'Transaksi' : metric === 'revenue' ? 'Pendapatan' : 'Rating';
  }

  function formatValue(emp: EmployeePerformance): string {
    if (metric === 'revenue') return fmtIDR(emp.revenue);
    if (metric === 'rating') return emp.rating.toFixed(1) + ' / 5.0';
    return emp.transactions.toLocaleString('id-ID');
  }

  let maxValue = $derived(Math.max(...visible.map(metricValue), 1));
</script>

<div class="bg-surface rounded-2xl border border-default overflow-hidden">
  <div class="px-5 py-4 border-b border-default flex items-center justify-between">
    <div>
      <h3 class="text-headline-sm font-semibold text-default">Performa Karyawan</h3>
      <p class="text-body-sm text-muted mt-0.5">Diurutkan berdasarkan {metricLabel().toLowerCase()}</p>
    </div>
    <div class="flex items-center gap-2 text-label-sm">
      {#each Object.entries(roleColors) as [role, color]}
        <span class="flex items-center gap-1">
          <span class="w-2 h-2 rounded-full {color}"></span>
          <span class="text-muted capitalize">{role}</span>
        </span>
      {/each}
    </div>
  </div>

  {#if visible.length === 0}
    <div class="px-5 py-12 text-center text-muted text-body-sm">
      Belum ada data karyawan.
    </div>
  {:else}
    <ul class="divide-y divide-default">
      {#each visible as emp (emp.employee_id)}
        {@const pct = (metricValue(emp) / maxValue) * 100}
        <li
          class="px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer"
          onclick={() => onEmployeeClick?.(emp)}
          onkeydown={(e) => e.key === 'Enter' && onEmployeeClick?.(emp)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-center gap-3">
            <!-- Avatar -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-label-md font-bold text-on-primary flex-shrink-0 {roleColors[emp.role]}"
            >
              {emp.full_name.charAt(0).toUpperCase()}
            </div>

            <!-- Name + role -->
            <div class="flex-1 min-w-0">
              <p class="text-body-md font-medium text-default truncate">{emp.full_name}</p>
              <p class="text-label-sm text-muted capitalize">{emp.role}</p>
            </div>

            <!-- Bar -->
            <div class="hidden md:block flex-1 max-w-[200px]">
              <div class="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  class="h-full {roleColors[emp.role]} rounded-full transition-all"
                  style:width="{pct}%"
                ></div>
              </div>
            </div>

            <!-- Value -->
            <div class="text-right flex-shrink-0 w-28">
              <p class="text-body-md font-semibold text-default tabular-nums">
                {formatValue(emp)}
              </p>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
