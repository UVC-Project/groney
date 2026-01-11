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

  // Feedback state
  let bannerMsg = $state<string | null>(null);
  let bannerType = $state<'error' | 'success'>('success');
  let bannerEmoji = $state('');
  let bannerTimeout: ReturnType<typeof setTimeout> | null = null;

  // Loading states
  let isEquipping = $state(false);
  let isUnequipping = $state(false);

  function showBanner(msg: string, type: 'error' | 'success', emoji = '') {
    // Clear any existing timeout to prevent glitchy disappearing
    if (bannerTimeout) {
      clearTimeout(bannerTimeout);
    }
    
    bannerMsg = msg;
    bannerType = type;
    bannerEmoji = emoji || (type === 'success' ? '✨' : '😕');
    
    bannerTimeout = setTimeout(() => {
      bannerMsg = null;
      bannerTimeout = null;
    }, 3000);
  }

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
    if (isEquipping) return;
    isEquipping = true;

    // Optimistically update UI
    selectedItem = item;
    localStorage.setItem(STORAGE_KEY, item.id);

    try {
      await equipItem(item);
      showBanner(`Groeny is now wearing ${item.name}!`, 'success', '👔');
    } catch (e) {
      console.error('Failed to equip item', e);
      showBanner("Couldn't put that on. Try again!", 'error', '😅');
      // Revert on failure
      selectedItem = null;
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      isEquipping = false;
    }
  }

  async function clearSelection() {
    if (isUnequipping || !selectedItem) return;
    isUnequipping = true;

    const prevItem = selectedItem;

    try {
      await unequipSelected();
      selectedItem = null;
      localStorage.removeItem(STORAGE_KEY);
      showBanner('Item removed!', 'success', '👋');
    } catch (e) {
      console.error('Failed to unequip item', e);
      showBanner("Couldn't remove that. Try again!", 'error', '😅');
      // Keep the item on failure
      selectedItem = prevItem;
    } finally {
      isUnequipping = false;
    }
  }

  onMount(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (!savedId) return;

    const found = allItems.find((i) => i.id === savedId);
    if (found) selectedItem = found;
  });
</script>

<PageWrapper title="Wardrobe">
  {#if bannerMsg}
    <div class="flex justify-center mb-4">
      <div class={bannerType === 'success' ? 'feedback-toast-success' : 'feedback-toast-error'}>
        <span>{bannerEmoji}</span>
        <span>{bannerMsg}</span>
      </div>
    </div>
  {/if}

  <!-- Groeny Preview -->
  <div class="flex justify-center mb-6">
    <div class="relative">
      <div class="absolute -inset-3 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-yellow-200 opacity-50 blur-md"></div>
      <div class="relative w-36 md:w-44 p-4 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
        <img src={groenySrc} alt="Groeny Wardrobe" class="w-full drop-shadow-lg" />
      </div>
    </div>
  </div>

  <!-- Currently Wearing Section -->
  <div class="card-playful max-w-sm mx-auto mb-6 text-center">
    <div class="flex items-center justify-center gap-2 mb-4">
      <span class="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-lg">👔</span>
      <h2 class="text-lg font-bold text-gray-800">Currently Wearing</h2>
    </div>

    {#if selectedItem}
      <div class="surface-info mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-gray-500 text-sm font-medium">Item:</span>
          <span class="badge-playful bg-purple-100 text-purple-700 text-sm py-1">{selectedItem.name}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500 text-sm font-medium">Type:</span>
          <span class="badge-playful bg-gray-100 text-gray-600 text-sm py-1">{selectedItem.type ?? 'Accessory'}</span>
        </div>
      </div>
      <button
        type="button"
        onclick={clearSelection}
        disabled={isUnequipping}
        class="btn-danger w-full"
      >
        {#if isUnequipping}
          <span class="spinner-sm"></span>
          <span>Removing...</span>
        {:else}
          Remove Item
        {/if}
      </button>
    {:else}
      <div class="surface-info">
        <p class="text-gray-500 text-sm">No item equipped</p>
        <p class="text-gray-400 text-xs mt-1">Select an item from your collection below!</p>
      </div>
    {/if}
  </div>

  <!-- Collection Section -->
  <div class="flex items-center gap-2 mb-4">
    <span class="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-lg">✨</span>
    <h3 class="text-lg font-bold text-gray-800">Your Collection</h3>
    <span class="badge-playful bg-gray-100 text-gray-600 text-sm py-1 ml-auto">{ownedItems.length} items</span>
  </div>

  {#if ownedItems.length === 0}
    <div class="empty-state">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <span class="text-3xl">🛍️</span>
      </div>
      <p class="font-bold text-gray-700 text-lg">No items yet</p>
      <p class="text-gray-500 text-sm mt-1">Visit the shop to get some cool accessories!</p>
    </div>
  {:else}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      {#each ownedItems as item}
        <button
          type="button"
          onclick={() => selectItem(item)}
          disabled={isEquipping}
          class="card-item-blue relative p-4 flex flex-col items-center min-h-[130px] hover:shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-70 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 {selectedItem?.id === item.id ? 'ring-2 ring-yellow-400 border-yellow-300' : ''}"
        >
          {#if selectedItem?.id === item.id}
            <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              ✓
            </div>
          {/if}

          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-sm flex items-center justify-center mb-2 border border-gray-100">
            {#if getItemImage(item)}
              <img src={getItemImage(item)} alt={item.name} class="w-10" />
            {:else}
              <span class="text-2xl">🎁</span>
            {/if}
          </div>

          <p class="text-base font-bold text-gray-800">{item.name}</p>
          <p class="text-sm text-gray-500 mt-1.5 text-center leading-relaxed line-clamp-2">{item.description}</p>
        </button>
      {/each}
    </div>
  {/if}
</PageWrapper>
