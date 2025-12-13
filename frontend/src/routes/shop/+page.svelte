<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';

  import RedCapImg from '$lib/assets/images/shop/red-cap.png';
  import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
  import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
  import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';

  export let data: PageData;

  type Tab = 'groeny' | 'schoolyard';
  let activeTab: Tab = 'groeny';

  type Item = PageData['items'][number];

  const imageMap: Record<string, string> = {
    'red-cap': RedCapImg,
    'blue-cap': BlueCapImg,
    'bow-tie': BowTieImg,
    sunglasses: SunglassesImg
  };

  function getItemImage(item: Item): string | null {
    if (imageMap[item.id]) return imageMap[item.id];
    // @ts-expect-error backend imageUrl fallback
    if (item.imageUrl) return item.imageUrl;
    return null;
  }

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3005';

  let coins = data.coins;
  let items = data.items.slice();

  let bannerMsg: string | null = null;
  let bannerType: 'error' | 'success' = 'error';

  function showBanner(msg: string, type: 'error' | 'success' = 'error') {
    bannerMsg = msg;
    bannerType = type;
    window.setTimeout(() => (bannerMsg = null), 3500);
  }

  async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  function getNetworkErrorMessage(err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'Request timed out. The gateway/service may be slow or down.';
    }
    return 'Service is offline or unreachable. Please try again.';
  }

  async function onBuyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.owned) return;

    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/api/shop/purchase`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-1',
            classId: 'class-1',
            itemId: id
          })
        },
        6000
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner((json as any).message ?? 'Failed to purchase item');
        return;
      }

      coins = (json as any).mascot.coins;
      items = items.map((i) => (i.id === id ? { ...i, owned: true } : i));
      showBanner('Purchased!', 'success');
    } catch (err) {
      showBanner(getNetworkErrorMessage(err));
    }
  }

  async function onApplyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || !item.owned) return;

    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/api/mascot/equip`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            classId: 'class-1',
            itemId: id
          })
        },
        6000
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner((json as any).message ?? 'Failed to equip item');
        return;
      }

      localStorage.setItem('wardrobe:selectedItemId', id);
      showBanner('Equipped!', 'success');
    } catch (err) {
      showBanner(getNetworkErrorMessage(err));
    }
  }
</script>

<PageWrapper title="Shop">
  {#if bannerMsg}
    <div class="flex justify-center mb-4">
      <div
        class={`px-5 py-2 rounded-full shadow-md text-sm font-semibold ${
          bannerType === 'success'
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-rose-100 text-rose-800 border border-rose-200'
        }`}
      >
        {bannerMsg}
      </div>
    </div>
  {/if}

  <div class="flex justify-center mb-6">
    <div
      class="bg-yellow-300 rounded-full px-8 py-3 shadow-lg flex items-center gap-3 border-2 border-yellow-400"
    >
      <span class="text-2xl">🪙</span>
      <span class="font-semibold text-xl">{coins}</span>
    </div>
  </div>

  <div class="flex justify-center mb-8">
    <div class="bg-white rounded-full shadow-inner flex overflow-hidden border border-green-300">
      <button
        class={`px-6 py-2 text-sm font-semibold transition-colors ${
          activeTab === 'groeny'
            ? 'bg-green-400 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        on:click={() => (activeTab = 'groeny')}
      >
        Groeny Items
      </button>

      <button
        class={`px-6 py-2 text-sm font-semibold transition-colors ${
          activeTab === 'schoolyard'
            ? 'bg-green-400 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        on:click={() => (activeTab = 'schoolyard')}
      >
        Schoolyard Supplies
      </button>
    </div>
  </div>

  {#if activeTab === 'groeny'}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
      {#each items as item}
        <article
          class="bg-white rounded-3xl shadow-md border-4 border-amber-300 flex flex-col overflow-hidden"
        >
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            {#if getItemImage(item)}
              <div class="h-24 mb-4 flex items-center justify-center">
                <img src={getItemImage(item)} alt={item.name} class="max-h-24" />
              </div>
            {/if}

            <h3 class="font-semibold text-gray-800">{item.name}</h3>
            <p class="text-xs text-gray-500 text-center mt-1">{item.description}</p>
          </div>

          <div class="px-6 py-3 bg-sky-100 flex items-center justify-between">
            {#if item.owned}
              <span class="text-xs font-semibold text-emerald-600">Owned</span>
            {:else}
              <span class="text-sm flex items-center gap-1 text-gray-700">
                <span>🪙</span>{item.price}
              </span>
            {/if}

            {#if item.owned}
              <button
                type="button"
                class="text-xs font-semibold rounded-full px-4 py-1 bg-emerald-400 text-white hover:bg-emerald-500 transition-colors"
                on:click={() => onApplyClick(item.id)}
              >
                Apply
              </button>
            {:else}
              <button
                type="button"
                class="text-xs font-semibold rounded-full px-4 py-1 bg-blue-400 text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
                on:click={() => onBuyClick(item.id)}
                disabled={coins < item.price}
              >
                Buy
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="text-center text-gray-500 pb-10">
      <p class="font-medium mb-1">Schoolyard Supplies</p>
      <p class="text-sm">This section will be implemented in a later sprint.</p>
    </div>
  {/if}
</PageWrapper>
