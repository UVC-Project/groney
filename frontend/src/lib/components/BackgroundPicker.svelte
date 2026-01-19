<script lang="ts">
  import { backgroundOptions, selectedBackground } from '$lib/stores/backgroundTheme';
  import type { BackgroundOption } from '$lib/stores/backgroundTheme';
  import { get } from 'svelte/store';

  let open = $state(false);

  let current = $state(get(selectedBackground));
  
  $effect(() => {
    const unsubscribe = selectedBackground.subscribe(value => {
      current = value;
    });
    return unsubscribe;
  });

  function toggle() {
    open = !open;
  }

  function choose(bg: BackgroundOption) {
    selectedBackground.set(bg);
    open = false;
  }
</script>

<div class="relative inline-block text-left">
  
  <button
    type="button" 
    class="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-medium text-gray-700 shadow-md transition-all h-full"
    onclick={toggle}
    aria-expanded={open}
    aria-haspopup="true"
  >
    <div class={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm ${current.className}`}></div>
    <span class="hidden sm:inline">Background:</span>
    <span class="font-semibold">{current.name}</span>
    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </button>

  
  {#if open}
    <!-- Backdrop for mobile -->
    <div 
      class="fixed inset-0 z-10 sm:hidden" 
      onclick={() => open = false}
      onkeydown={(e) => e.key === 'Escape' && (open = false)}
      role="button"
      tabindex="-1"
      aria-label="Close menu"
    ></div>
    
    <div
      class="absolute right-0 mt-2 w-44 sm:w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-1.5 sm:p-2"
    >
      {#each backgroundOptions as bg}
        <button
          class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs sm:text-sm text-left hover:bg-gray-50 transition-colors
                  {current.id === bg.id ? 'bg-gray-100 font-semibold' : ''}"
          onclick={() => choose(bg)}
        >
          <div class="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-sm {bg.className}"></div>
          <span>{bg.name}</span>
          {#if current.id === bg.id}
            <svg class="w-4 h-4 text-emerald-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>
