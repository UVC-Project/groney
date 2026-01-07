<script lang="ts">
  // Props
  let {
    open = false,
    studentName = '',
    onClose
  }: {
    open: boolean;
    studentName?: string;
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
  <div
    class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop + blur -->
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onclick={close}
    ></div>

    <!-- Card -->
    <div
      class="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl p-6 sm:p-8"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && close()}
      tabindex="0"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-500">
            Welcome{studentName ? `, ${studentName}` : ''} 👋
          </p>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800 mt-1">
            This is your Groeny Home
          </h2>
        </div>

        <button
          class="rounded-full px-3 py-1 text-sm font-semibold bg-gray-100 hover:bg-gray-200"
          onclick={close}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div class="mt-5 space-y-3 text-gray-700 leading-relaxed">
        <p>
          Here you take care of <span class="font-bold text-emerald-600">Groeny</span> by completing green missions with your class.
        </p>

        <ul class="list-disc pl-5 space-y-2 text-gray-600">
          <li>Check Groeny’s stats (health, thirst, happiness…).</li>
          <li>Complete missions to earn seeds 🪙 and grow your streak 🔥.</li>
          <li>See what your classmates have done in “Recent activities”.</li>
        </ul>

        <div class="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p class="text-emerald-800 font-semibold">Tip:</p>
          <p class="text-emerald-700 text-sm mt-1">
            Do at least one mission every day to keep your streak alive!
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">

        <button
          class="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg"
          onclick={close}
        >
          Enter Home 🌱
        </button>
      </div>
    </div>
  </div>
{/if}
