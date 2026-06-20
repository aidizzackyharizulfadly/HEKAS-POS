<!--
  TierBadge.svelte — Reusable tier badge for Member
  Props:
    - tier: 'Silver' | 'Gold' | 'Platinum'
    - size: 'sm' | 'md' | 'lg' (default: 'md')
    - showIcon: boolean (default: true)
-->
<script lang="ts">
  import { TIER_CONFIG } from '$lib/api';

  let {
    tier,
    size = 'md',
    showIcon = true,
  }: {
    tier: 'Silver' | 'Gold' | 'Platinum';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
  } = $props();

  const config = $derived(TIER_CONFIG[tier]);

  const sizes = {
    sm: { padding: '2px 6px', fontSize: '10px', iconSize: '8px' },
    md: { padding: '3px 8px', fontSize: '11px', iconSize: '10px' },
    lg: { padding: '5px 10px', fontSize: '12px', iconSize: '12px' },
  };
  const sz = $derived(sizes[size]);
</script>

<span
  class="tier-badge"
  style="
    background: {config.bg};
    color: {config.color};
    padding: {sz.padding};
    font-size: {sz.fontSize};
    font-weight: 600;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    border: 1px solid {config.color}30;
  "
>
  {#if showIcon}
    <span style="font-size: {sz.iconSize}; line-height: 1;">
      {#if tier === 'Silver'}🥈{:else if tier === 'Gold'}🥇{:else}💎{/if}
    </span>
  {/if}
  {config.label}
</span>
