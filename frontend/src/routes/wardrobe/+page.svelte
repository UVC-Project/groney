<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';

  import DefaultGif from '$lib/assets/images/groney-gif/normal.gif';
  import RedHatGif from '$lib/assets/images/groney-gif/redHat.gif';
  import BlueHatGif from '$lib/assets/images/groney-gif/blueHat.gif';
  import BowTieGif from '$lib/assets/images/groney-gif/bowTie.gif';
  import SunglassesGif from '$lib/assets/images/groney-gif/sunglasses.gif';

  import RedCapImg from '$lib/assets/images/shop/red-cap.png';
  import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
  import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
  import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';

  let { data }: { data: PageData } = $props();

  const STORAGE_KEY = 'wardrobe:selectedItemId';

  type Item = PageData['items'][number];

  const allItems: Item[] = data.items ?? [];
  let ownedItems = $derived(allItems.filter((item) => item.owned));

  let selectedItem = $state<Item | null>(null);

  // ✅ Use imported assets
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': RedHatGif,
    'hat-blue-cap': BlueHatGif,
    'acc-bow-tie': BowTieGif,
    'acc-sunglasses': SunglassesGif,
  };

  const imageMap: Record<string, string> = {
    'hat-red-cap': RedCapImg,
    'hat-blue-cap': BlueCapImg,
    'acc-bow-tie': BowTieImg,
    'acc-sunglasses': SunglassesImg,
  };

  function getItemImage(item: Item): string | null {
    return imageMap[item.id] ?? (item as any).imageUrl ?? null;
  }

  let groenySrc = $derived(
    selectedItem && groenyGifMap[selectedItem.id] ? groenyGifMap[selectedItem.id] : DefaultGif
  );

  // --- API
  import { MASCOT_ENGINE_URL } from '$lib/config';

  async function equipItem(item: Item) {
    if (!data.classId) return;

    await fetch(`${MASCOT_ENGINE_URL}/api/mascot/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: data.classId,
        itemId: item.id,
      }),
    });
  }

  async function unequipSelected() {
    if (!data.classId || !selectedItem) return;

    // Decide what to clear based on item type
    const itemType = selectedItem.type; // "HAT" | "ACCESSORY"

    await fetch(`${MASCOT_ENGINE_URL}/api/mascot/unequip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: data.classId,
        itemType,
      }),
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
  <!-- Groeny -->
  <div class="flex justify-center mb-6">
    <div class="relative w-32 md:w-40">
      <img src={groenySrc} alt="Groeny Wardrobe" class="w-full drop-shadow-lg" />
    </div>
  </div>

  <h2 class="text-lg md:text-xl font-extrabold text-center text-gray-800 mb-4">
    Currently Wearing
  </h2>

  <div class="space-y-2 max-w-sm mx-auto mb-6">
    {#if selectedItem}
      <div class="flex justify-center mb-4">
        <button
          type="button"
          onclick={clearSelection}
          class="px-4 py-2 rounded-full border bg-white hover:bg-red-600 hover:text-white text-sm font-semibold text-gray-800 shadow"
        >
          Remove item
        </button>
      </div>
    {/if}

    <div
      class="flex items-center justify-between bg-gray-200 rounded-full px-4 py-2 text-sm"
    >
      <span class="text-gray-700 font-medium">Name:</span>
      <span class="text-gray-600">{selectedItem ? selectedItem.name : 'None'}</span>
    </div>

    <div
      class="flex items-center justify-between bg-gray-200 rounded-full px-4 py-2 text-sm"
    >
      <span class="text-gray-700 font-medium">Type:</span>
      <span class="text-gray-600">
        {selectedItem ? (selectedItem.type ?? 'None') : 'None'}
      </span>
    </div>
  </div>

  <h3 class="text-lg md:text-xl font-extrabold text-gray-800 mb-4">Your Collection</h3>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each ownedItems as item}
      <button
        type="button"
        onclick={() => selectItem(item)}
        class={`relative bg-white rounded-2xl shadow-md border-2 hover:shadow-lg transition p-3 flex flex-col items-center ${
          selectedItem?.id === item.id ? 'border-yellow-400' : 'border-gray-200'
        }`}
      >
        {#if selectedItem?.id === item.id}
          <div
            class="absolute top-2 left-2 bg-sky-100 text-sky-700 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1"
          >
            ✅<span>Equipped</span>
          </div>
        {/if}

        <div class="w-14 h-14 rounded-xl bg-white flex items-center justify-center mb-2">
          {#if getItemImage(item)}
            <img src={getItemImage(item)} alt={item.name} class="w-10" />
          {/if}
        </div>

        <p class="text-sm font-semibold text-gray-800">{item.name}</p>
        <p class="text-xs text-gray-500 mt-1 text-center">{item.description}</p>
      </button>
    {/each}
  </div>
</PageWrapper>
