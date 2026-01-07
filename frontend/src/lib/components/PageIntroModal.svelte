<script lang="ts">
  let {
    open = false,
    studentName = '',
    title = '',
    subtitle = '',
    bullets = [],
    tipTitle = 'Tip',
    tipText = '',
    emoji = '👋',
    onClose
  }: {
    open: boolean;
    studentName?: string;
    title: string;
    subtitle?: string;
    bullets?: string[];
    tipTitle?: string;
    tipText?: string;
    emoji?: string;
    onClose: () => void;
  } = $props();

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = open ? 'hidden' : '';
    }
  });

  function close() {
    onClose?.();
  }
</script>

{#if open}
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" onclick={close}></div>

    <div
      class="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6 sm:p-8"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && close()}
      tabindex="0"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-500">
            {emoji} Welcome!
          </p>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">{title}</h2>
          {#if subtitle}
            <p class="text-gray-600 mt-2">{subtitle}</p>
          {/if}
        </div>

        <button
          class="rounded-full px-3 py-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200"
          onclick={close}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {#if bullets?.length}
        <ul class="mt-5 list-disc pl-5 space-y-2 text-gray-600">
          {#each bullets as b}
            <li>{b}</li>
          {/each}
        </ul>
      {/if}

      {#if tipText}
        <div class="mt-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p class="text-emerald-800 font-semibold">{tipTitle}:</p>
          <p class="text-emerald-700 text-sm mt-1">{tipText}</p>
        </div>
      {/if}

      <div class="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg" onclick={close}>
          Enter 🌱
        </button>
      </div>
    </div>
  </div>
{/if}
