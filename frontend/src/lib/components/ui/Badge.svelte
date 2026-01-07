<script lang="ts">
  import type { Snippet } from 'svelte';

  type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  type BadgeSize = 'sm' | 'md' | 'lg';

  interface Props {
    variant?: BadgeVariant;
    size?: BadgeSize;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    children,
  }: Props = $props();

  const variantClasses: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'text-xs px-2 py-1',
    md: '',
    lg: 'badge-lg',
  };

  let badgeClass = $derived(
    [variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ')
  );
</script>

<span class={badgeClass}>
  {@render children()}
</span>

