<script lang="ts">
  import type { Snippet } from 'svelte';

  type AlertVariant = 'success' | 'error' | 'warning' | 'info';

  interface Props {
    variant?: AlertVariant;
    icon?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'info',
    icon,
    dismissible = false,
    onDismiss,
    class: className = '',
    children,
  }: Props = $props();

  const variantClasses: Record<AlertVariant, string> = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  const defaultIcons: Record<AlertVariant, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  let alertClass = $derived([variantClasses[variant], className].filter(Boolean).join(' '));
  let displayIcon = $derived(icon ?? defaultIcons[variant]);
</script>

<div class={alertClass} role="alert">
  <div class="flex items-start gap-3">
    <span class="flex-shrink-0 text-base">{displayIcon}</span>
    <div class="flex-1">
      {@render children()}
    </div>
    {#if dismissible && onDismiss}
      <button
        type="button"
        class="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        onclick={onDismiss}
        aria-label="Dismiss"
      >
        ✕
      </button>
    {/if}
  </div>
</div>

