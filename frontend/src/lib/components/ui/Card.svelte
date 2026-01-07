<script lang="ts">
  import type { Snippet } from 'svelte';

  type CardVariant = 'default' | 'elevated' | 'interactive' | 'stat';

  interface Props {
    variant?: CardVariant;
    accentColor?: string;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    accentColor,
    class: className = '',
    children,
  }: Props = $props();

  const variantClasses: Record<CardVariant, string> = {
    default: 'card',
    elevated: 'card-elevated',
    interactive: 'card-interactive',
    stat: 'card-stat',
  };

  let cardClass = $derived([variantClasses[variant], className].filter(Boolean).join(' '));
</script>

<div
  class={cardClass}
  style={accentColor ? `border-bottom-color: ${accentColor}` : ''}
>
  {@render children()}
</div>

