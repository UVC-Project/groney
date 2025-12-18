<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';
  import type { ShopItem } from '$lib/shop/mockData';
  import { onMount } from 'svelte';
  import DefaultGif from '$lib/assets/images/groney-gif/normal.gif';

  export let data: PageData;

  const STORAGE_KEY = 'wardrobe:selectedItemId';
  const allItems: ShopItem[] = data.items;
  $: ownedItems = allItems.filter(item => item.owned);

  let selectedItem: ShopItem | null = null;

  const groenyGifMap: Record<string, string> = {
    'red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  const imageMap: Record<string, string> = {
    'red-cap': '/src/lib/assets/images/shop/red-cap.png',
    'blue-cap': '/src/lib/assets/images/shop/blue-cap.png',
    'bow-tie': '/src/lib/assets/images/shop/bow-tie.png',
    'sunglasses': '/src/lib/assets/images/shop/sunglasses.png'
  };

  function getItemImage(item: ShopItem): string | null {
    return imageMap[item.id] ?? item.imageUrl ?? null;
  }

  $: groenySrc =
    selectedItem && groenyGifMap[selectedItem.id]
      ? groenyGifMap[selectedItem.id]
      : DefaultGif;

  function selectItem(item: ShopItem) {
    selectedItem = item;
    localStorage.setItem(STORAGE_KEY, item.id);
  }

  function clearSelection() {
    selectedItem = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  onMount(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;
    const found = allItems.find(i => i.id === savedId);
    if (found) selectedItem = found;
  });
</script>

<PageWrapper title="Wardrobe">
  <div class="w-full max-w-5xl mx-auto bg-white rounded-[40px] border border-gray-100 px-6 md:px-16 py-10 md:py-14">
    
    <!-- Groeny Image -->
    <div class="flex justify-center mb-10">
      <div class="relative w-40 md:w-56">
        <img src={groenySrc} alt="Groeny Wardrobe" class="w-full drop-shadow-lg" />
      </div>
    </div>

    <h2 class="text-xl md:text-2xl font-extrabold text-center text-gray-800 mb-6">
      Currently Wearing
    </h2>

    <div class="space-y-3 max-w-xl mx-auto mb-10">
      {#if selectedItem}
        <div class="flex justify-center mb-10">
          <button type="button" on:click={clearSelection} class="px-4 py-2 rounded-full border bg-white hover:bg-red-600 text-sm font-semibold text-gray-800 shadow">
            Remove item
          </button>
        </div>
      {/if}

      <div class="flex items-center justify-between bg-gray-300 rounded-full px-6 py-3 text-sm md:text-base">
        <span class="text-gray-700 font-medium">Name:</span>
        <span class="text-gray-600">{selectedItem ? selectedItem.name : 'None'}</span>
      </div>

      <div class="flex items-center justify-between bg-gray-300 rounded-full px-6 py-3 text-sm md:text-base">
        <span class="text-gray-700 font-medium">Type:</span>
        <span class="text-gray-600">{selectedItem ? (selectedItem.type ? selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1) : 'None') : 'None'}</span>
      </div>
    </div>

    <!-- Collection -->
    <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 mb-4">Your Collection</h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {#each ownedItems as item}
        <button type="button" on:click={() => selectItem(item)} class={`relative bg-white rounded-[28px] shadow-md border-2 hover:shadow-lg transition p-4 flex flex-col items-center ${selectedItem?.id === item.id ? 'border-yellow-400' : 'border-gray-200'}`}>
          {#if selectedItem?.id === item.id}
            <div class="absolute top-3 left-3 bg-sky-100 text-sky-700 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              ✅<span>Equipped</span>
            </div>
          {/if}

          <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-2">
            <img src={getItemImage(item)} alt={item.name} class="w-10" />
          </div>

          <p class="text-sm font-semibold text-gray-800">{item.name}</p>
          <p class="text-xs text-gray-500 mt-1 text-center">{item.description}</p>
        </button>
      {/each}
    </div>
  </div>
</PageWrapper>
