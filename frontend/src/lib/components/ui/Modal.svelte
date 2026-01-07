<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    title?: string;
    subtitle?: string;
    onClose?: () => void;
    showHeader?: boolean;
    children: Snippet;
    footer?: Snippet;
  }

  let {
    open,
    title = '',
    subtitle = '',
    onClose,
    showHeader = true,
    children,
    footer,
  }: Props = $props();

  function handleBackdropClick() {
    onClose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose?.();
    }
  }
</script>

{#if open}
  <div
    class="modal-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
  >
    <div
      class="modal-content"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      {#if showHeader && title}
        <div class="modal-header">
          <h2 id="modal-title" class="text-xl font-bold">{title}</h2>
          {#if subtitle}
            <p class="text-white/80 text-sm mt-1">{subtitle}</p>
          {/if}
        </div>
      {/if}

      <div class="modal-body">
        {@render children()}
      </div>

      {#if footer}
        <div class="modal-footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

