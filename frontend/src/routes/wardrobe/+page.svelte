<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  import DefaultGif from '$lib/assets/images/groney-gif/normal.gif';

  let { data }: { data: PageData } = $props();

  const STORAGE_KEY = 'wardrobe:selectedItemId';

  type Item = PageData['items'][number];

  const allItems: Item[] = data.items ?? [];
  let ownedItems = $derived(allItems.filter((item) => item.owned));

  let selectedItem = $state<Item | null>(null);

  // ✅ New DB IDs
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'hat-blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'acc-bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'acc-sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  const imageMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/shop/red-cap.png',
    'hat-blue-cap': '/src/lib/assets/images/shop/blue-cap.png',
    'acc-bow-tie': '/src/lib/assets/images/shop/bow-tie.png',
    'acc-sunglasses': '/src/lib/assets/images/shop/sunglasses.png'
  };

  function getItemImage(item: Item): string | null {
    return imageMap[item.id] ?? (item as any).imageUrl ?? null;
  }

  let groenySrc = $derived(
    selectedItem && groenyGifMap[selectedItem.id]
      ? groenyGifMap[selectedItem.id]
      : DefaultGif
  );

  // --- API
  const SHOP = 'http://localhost:3005';

  async function equipItem(item: Item) {
    if (!data.classId) return;

    await fetch(`${SHOP}/api/mascot/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: data.classId,
        itemId: item.id
      })
    });
  }

  async function unequipSelected() {
    if (!data.classId || !selectedItem) return;

    // Decide what to clear based on item type
    const itemType = selectedItem.type; // "HAT" | "ACCESSORY"

    await fetch(`${SHOP}/api/mascot/unequip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: data.classId,
        itemType
      })
    });
  }

  async function selectItem(item: Item) {
    selectedItem = item;
    localStorage.setItem(STORAGE_KEY, item.id);

    // ✅ keep DB in sync with selection
    try {
      await equipItem(item);
    } catch (e) {
      console.error('Failed to equip item', e);
    }
  }

  async function clearSelection() {
    // ✅ remove from DB too
    try {
      await unequipSelected();
    } catch (e) {
      console.error('Failed to unequip item', e);
    }

    selectedItem = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  onMount(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;

    const found = allItems.find((i) => i.id === savedId);
    if (found) selectedItem = found;
  });
</script>

<PageWrapper title="Wardrobe">
  <div class="w-full max-w-5xl mx-auto bg-white rounded-[40px] border border-gray-100 px-6 md:px-16 py-10 md:py-14">

    <!-- Groeny -->
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
          <button
            type="button"
            onclick={clearSelection}
            class="px-4 py-2 rounded-full border bg-white hover:bg-red-600 hover:text-white text-sm font-semibold text-gray-800 shadow"
          >
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
        <span class="text-gray-600">
          {selectedItem ? (selectedItem.type ?? 'None') : 'None'}
        </span>
      </div>
    </div>

    <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 mb-4">Your Collection</h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {#each ownedItems as item}
        <button
          type="button"
          onclick={() => selectItem(item)}
          class={`relative bg-white rounded-[28px] shadow-md border-2 hover:shadow-lg transition p-4 flex flex-col items-center ${
            selectedItem?.id === item.id ? 'border-yellow-400' : 'border-gray-200'
          }`}
        >
          {#if selectedItem?.id === item.id}
            <div class="absolute top-3 left-3 bg-sky-100 text-sky-700 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              ✅<span>Equipped</span>
            </div>
          {/if}

          <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-2">
            {#if getItemImage(item)}
              <img src={getItemImage(item)} alt={item.name} class="w-10" />
            {/if}
          </div>

          <p class="text-sm font-semibold text-gray-800">{item.name}</p>
          <p class="text-xs text-gray-500 mt-1 text-center">{item.description}</p>
        </button>
      {/each}
    </div>
  </div>
</PageWrapper>
