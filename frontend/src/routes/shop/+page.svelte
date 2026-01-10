<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';

  import RedCapImg from '$lib/assets/images/shop/red-cap.png';
  import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
  import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
  import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';

  let { data }: { data: PageData } = $props();

  // IDs provided by +page.ts
  const userId = data.userId;
  const classId = data.classId;

  type Item = PageData['items'][number];

  const imageMap: Record<string, string> = {
    'hat-red-cap': RedCapImg,
    'hat-blue-cap': BlueCapImg,
    'acc-bow-tie': BowTieImg,
    'acc-sunglasses': SunglassesImg
  };

  function getItemImage(item: Item): string | null {
    if (imageMap[item.id]) return imageMap[item.id];
    // backend fallback
    // @ts-expect-error imageUrl comes from backend
    if (item.imageUrl) return item.imageUrl;
    return null;
  }

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  let coins = $state(data.coins);
  let items = $state([...data.items]);

  let bannerMsg = $state<string | null>(null);
  let bannerType = $state<'error' | 'success'>('error');

  function showBanner(msg: string, type: 'error' | 'success' = 'error') {
    bannerMsg = msg;
    bannerType = type;
    window.setTimeout(() => (bannerMsg = null), 3500);
  }

  type FetchOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };

  async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {},
    timeoutMs = 6000
  ) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function getNetworkErrorMessage(err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }
    return 'Service unavailable.';
  }

  async function onBuyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.owned) return;

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          classId,
          itemId: id
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner(json.message ?? 'Purchase failed');
        return;
      }

      coins = json.mascot.coins;
      items = items.map((i) =>
        i.id === id ? { ...i, owned: true } : i
      );

      showBanner('Purchased!', 'success');
    } catch (err) {
      showBanner(getNetworkErrorMessage(err));
    }
  }

  async function onApplyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || !item.owned) return;

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/mascot/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          itemId: id
        })
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner(json.message ?? 'Equip failed');
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

  <div class="flex justify-center mb-6">
    <div class="bg-yellow-300 rounded-full px-6 py-2 flex items-center gap-2 border-2 border-yellow-400">
      <span class="text-xl">🪙</span>
      <span class="font-semibold text-lg">{coins}</span>
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each items as item}
      <article class="bg-white rounded-3xl shadow-md border-4 border-amber-300 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col items-center justify-center p-4">
          {#if getItemImage(item)}
            <img src={getItemImage(item)} alt={item.name} class="h-20 mb-3" />
          {/if}

          <h3 class="font-semibold text-gray-800">{item.name}</h3>
          <p class="text-xs text-gray-500 text-center mt-1">{item.description}</p>
        </div>

        <div class="px-4 py-3 bg-sky-100 flex items-center justify-between">
          {#if item.owned}
            <span class="text-xs font-semibold text-emerald-600">Owned</span>
            <button
              class="text-xs font-semibold rounded-full px-4 py-1 bg-emerald-400 text-white"
              onclick={() => onApplyClick(item.id)}
            >
              Apply
            </button>
          {:else}
            <span class="text-sm text-gray-700">🪙 {item.price}</span>
            <button
              class="text-xs font-semibold rounded-full px-4 py-1 bg-blue-400 text-white disabled:opacity-60"
              onclick={() => onBuyClick(item.id)}
              disabled={coins < item.price}
            >
              Buy
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</PageWrapper>
