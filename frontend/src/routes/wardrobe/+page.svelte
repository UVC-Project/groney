<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';

  // Shop item images (same as shop page)
  import RedCapImg from '$lib/assets/images/shop/red-cap.png';
  import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
  import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
  import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';

  // Groeny gifs
  import DefaultGif from '$lib/assets/images/groney-gif/normal.gif';
  import RedHatGif from '$lib/assets/images/groney-gif/redHat.gif';
  import BlueHatGif from '$lib/assets/images/groney-gif/blueHat.gif';
  import BowTieGif from '$lib/assets/images/groney-gif/bowTie.gif';
  import SunglassesGif from '$lib/assets/images/groney-gif/sunglasses.gif';

  export let data: PageData;

  const API_BASE = 'http://localhost:3005';

  type Item = PageData['items'][number];

  // Only show owned items in the collection
  $: ownedItems = (data.items ?? []).filter((i) => i.owned);

  // Equipped from DB (truth source)
  let equippedHat: string | null = data.equippedHat ?? null;
  let equippedAccessory: string | null = data.equippedAccessory ?? null;

  // Optional: show a preview when clicking an item (does not auto-equip)
  let selectedItem: Item | null = null;

  // Map DB IDs -> images
  const imageMap: Record<string, string> = {
    'hat-red-cap': RedCapImg,
    'hat-blue-cap': BlueCapImg,
    'acc-bow-tie': BowTieImg,
    'acc-sunglasses': SunglassesImg
  };

  // Map DB IDs -> gifs
  const gifMap: Record<string, string> = {
    'hat-red-cap': RedHatGif,
    'hat-blue-cap': BlueHatGif,
    'acc-bow-tie': BowTieGif,
    'acc-sunglasses': SunglassesGif
  };

  function getItemImage(item: Item): string | null {
    if (imageMap[item.id]) return imageMap[item.id];
    // backend fallback
    // @ts-expect-error imageUrl comes from backend
    if (item.imageUrl) return item.imageUrl;
    return null;
  }

  function isEquipped(item: Item) {
    return item.id === equippedHat || item.id === equippedAccessory;
  }

  $: groenySrc =
    (selectedItem && gifMap[selectedItem.id]) ||
    (equippedHat && gifMap[equippedHat]) ||
    (equippedAccessory && gifMap[equippedAccessory]) ||
    DefaultGif;

  function selectItem(item: Item) {
    selectedItem = item;
  }

  let bannerMsg: string | null = null;
  let bannerType: 'error' | 'success' = 'success';

  function showBanner(msg: string, type: 'error' | 'success' = 'success') {
    bannerMsg = msg;
    bannerType = type;
    window.setTimeout(() => (bannerMsg = null), 3500);
  }

  async function onEquipClick(item: Item) {
    if (!data.classId) {
      showBanner('No class found for this user.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/mascot/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: data.classId,
          itemId: item.id,
          userId: data.userId // optional ownership enforcement
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner(json.message ?? 'Equip failed', 'error');
        return;
      }

      // Update equipped state based on item type
      if (item.type === 'HAT') equippedHat = item.id;
      if (item.type === 'ACCESSORY') equippedAccessory = item.id;

      selectedItem = item;
      showBanner('Equipped!', 'success');
    } catch (err) {
      showBanner('Service unavailable.', 'error');
    }
  }

  function clearPreview() {
    selectedItem = null;
  }
</script>

<PageWrapper title="Wardrobe">
  {#if bannerMsg}
    <div class="flex justify-center mb-4">
      <div
        class={`px-5 py-2 rounded-full text-sm font-semibold border ${
          bannerType === 'success'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : 'bg-rose-100 text-rose-800 border-rose-200'
        }`}
      >
        {bannerMsg}
      </div>
    </div>
  {/if}

  <div class="w-full max-w-5xl mx-auto bg-white rounded-[40px] border border-gray-100 px-6 md:px-16 py-10 md:py-14">

    <!-- Groeny Image -->
    <div class="flex justify-center mb-10">
      <div class="relative w-40 md:w-56">
        <img src={groenySrc} alt="Groeny Wardrobe" class="w-full drop-shadow-lg" />
      </div>
    </div>

    <h2 class="text-xl md:text-2xl font-extrabold text-center text-gray-800 mb-6">
      Currently Equipped
    </h2>

    <div class="space-y-3 max-w-xl mx-auto mb-10">
      <div class="flex items-center justify-between bg-gray-300 rounded-full px-6 py-3 text-sm md:text-base">
        <span class="text-gray-700 font-medium">Hat:</span>
        <span class="text-gray-600">{equippedHat ?? 'None'}</span>
      </div>

      <div class="flex items-center justify-between bg-gray-300 rounded-full px-6 py-3 text-sm md:text-base">
        <span class="text-gray-700 font-medium">Accessory:</span>
        <span class="text-gray-600">{equippedAccessory ?? 'None'}</span>
      </div>

      {#if selectedItem}
        <div class="flex justify-center pt-2">
          <button
            type="button"
            on:click={clearPreview}
            class="px-4 py-2 rounded-full border bg-white hover:bg-gray-100 text-sm font-semibold text-gray-800 shadow"
          >
            Clear preview
          </button>
        </div>
      {/if}
    </div>

    <!-- Collection -->
    <h3 class="text-xl md:text-2xl font-extrabold text-gray-800 mb-4">Your Collection</h3>

    {#if ownedItems.length === 0}
      <p class="text-sm text-gray-500">You don’t own any items yet. Buy something in the Shop first 🙂</p>
    {:else}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {#each ownedItems as item}
          <div class={`relative bg-white rounded-[28px] shadow-md border-2 transition p-4 flex flex-col items-center ${
            selectedItem?.id === item.id ? 'border-yellow-400' : 'border-gray-200'
          }`}>
            {#if isEquipped(item)}
              <div class="absolute top-3 left-3 bg-sky-100 text-sky-700 text-[10px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                ✅<span>Equipped</span>
              </div>
            {/if}

            <button type="button" on:click={() => selectItem(item)} class="w-full flex flex-col items-center">
              <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-2">
                {#if getItemImage(item)}
                  <img src={getItemImage(item)} alt={item.name} class="w-10" />
                {/if}
              </div>

              <p class="text-sm font-semibold text-gray-800">{item.name}</p>
              <p class="text-xs text-gray-500 mt-1 text-center">{item.description}</p>
            </button>

            <div class="mt-3 w-full flex justify-center">
              <button
                class="text-xs font-semibold rounded-full px-4 py-1 bg-emerald-400 text-white disabled:opacity-60"
                on:click={() => onEquipClick(item)}
                disabled={isEquipped(item)}
                type="button"
              >
                {isEquipped(item) ? 'Equipped' : 'Equip'}
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</PageWrapper>
