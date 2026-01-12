<script lang="ts">
  interface Props {
    open?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let { open = false, onConfirm = () => {}, onCancel = () => {} }: Props = $props();
</script>

{#if open}
  <!-- Overlay -->
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

    <!-- Modal box -->
    <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 text-center">
      <div class="text-4xl mb-3">👋</div>
      <h2 class="text-xl font-bold text-gray-800 mb-2">Leaving already?</h2>

      <p class="text-gray-600 text-sm mb-6">You will need to login again to access your Groeny.</p>

      <div class="flex gap-3">
        <button class="btn-secondary flex-1" onclick={onCancel}>Stay</button>
        <button 
          class="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-red-500/25 hover:bg-red-600 active:scale-[0.98] transition-all duration-150 min-h-[48px]" 
          onclick={onConfirm}
        >
          Logout
        </button>
      </div>
    </div>
  </div>
{/if}
