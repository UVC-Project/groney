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
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

    <!-- Modal box -->
    <div class="bg-white rounded-2xl shadow-xl w-80 p-6 text-center">
      <h2 class="text-lg font-semibold text-gray-800 mb-3">Are you sure you want to logout?</h2>

      <p class="text-gray-700 text-sm mb-6">You will need to login again to access your Groeny.</p>

      <div class="flex justify-center gap-4">
        <button class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300" onclick={onCancel}>Cancel</button>

        <button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onclick={onConfirm}>Yes, logout</button>
      </div>
    </div>
  </div>
{/if}
