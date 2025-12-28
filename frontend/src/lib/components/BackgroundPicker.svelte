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
    type="button" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-300 text-sm font-medium text-gray-800 shadow-lg" onclick={toggle}>
    <span>Background mode:</span>
    <span class="font-semibold">{current.name}</span>
  </button>

  
  {#if open}
    <div
      class="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border z-20 p-2"
    >
      {#each backgroundOptions as bg}
        <button
          class={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-left
                  hover:bg-gray-100
                  ${current.id === bg.id ? 'bg-gray-100 font-semibold' : ''}`}
          onclick={() => choose(bg)}
        >
          <div class={`w-8 h-8 rounded-full border ${bg.className}`}></div>
          <span>{bg.name}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
