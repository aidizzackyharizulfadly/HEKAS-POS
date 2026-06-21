<script lang="ts">
  /**
   * Reusable empty-state placeholder.
   * Matches FRONTEND_ARCHITECTURE §3 `lib/components/shared/EmptyState.svelte`.
   *
   * Used by: every list page (orders empty, products empty, members empty, etc).
   */

  interface Props {
    /** Big emoji or icon. */
    icon?: string;
    title: string;
    description?: string;
    /** Optional CTA button. */
    actionLabel?: string;
    onaction?: () => void;
    /** Smaller variant for inline empty (e.g. table row). */
    compact?: boolean;
  }

  let {
    icon = '📭',
    title,
    description,
    actionLabel,
    onaction,
    compact = false
  }: Props = $props();
</script>

<div class="empty-state" class:compact role="status" aria-live="polite">
  <div class="empty-state__icon" aria-hidden="true">{icon}</div>
  <h3 class="empty-state__title">{title}</h3>
  {#if description}
    <p class="empty-state__desc">{description}</p>
  {/if}
  {#if actionLabel && onaction}
    <button
      type="button"
      class="empty-state__action"
      onclick={onaction}
    >
      {actionLabel}
    </button>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 48px 24px;
    color: #64748B;
  }
  .empty-state.compact {
    padding: 24px 16px;
  }
  .empty-state__icon {
    font-size: 48px;
    line-height: 1;
    margin-bottom: 12px;
    opacity: 0.85;
  }
  .compact .empty-state__icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  .empty-state__title {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    margin: 0 0 4px;
  }
  .compact .empty-state__title {
    font-size: 13px;
  }
  .empty-state__desc {
    font-size: 13px;
    color: #94A3B8;
    max-width: 360px;
    margin: 0 0 16px;
    line-height: 1.5;
  }
  .compact .empty-state__desc {
    font-size: 12px;
    margin-bottom: 0;
  }
  .empty-state__action {
    padding: 8px 18px;
    background: #2563EB;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms;
  }
  .empty-state__action:hover {
    background: #1D4ED8;
  }
  .empty-state__action:focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
  }
</style>
