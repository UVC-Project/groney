<script lang="ts">
  import { toast, type Toast } from '$lib/stores/toast';
  import { flip } from 'svelte/animate';

  let toasts = $state<Toast[]>([]);

  $effect(() => {
    const unsubscribe = toast.subscribe((value) => {
      toasts = value;
    });
    return unsubscribe;
  });

  const typeStyles: Record<Toast['type'], { bg: string; icon: string }> = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ️',
    },
  };
</script>

{#if toasts.length > 0}
  <div
    class="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4"
    role="region"
    aria-label="Notifications"
  >
    {#each toasts as t (t.id)}
      <div
        animate:flip={{ duration: 200 }}
        class="animate-slide-up {typeStyles[t.type].bg} border rounded-xl px-4 py-3 shadow-lg flex items-center gap-3"
        role="alert"
      >
        <span class="text-lg flex-shrink-0">{typeStyles[t.type].icon}</span>
        <p class="flex-1 text-sm font-medium">{t.message}</p>
        <button
          type="button"
          class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1"
          onclick={() => toast.remove(t.id)}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
{/if}

