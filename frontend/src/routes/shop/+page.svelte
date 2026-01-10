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

  // Feedback state
  let bannerMsg = $state<string | null>(null);
  let bannerType = $state<'error' | 'success'>('error');
  let bannerEmoji = $state('');
  let bannerTimeout: ReturnType<typeof setTimeout> | null = null;

  // Loading states - track per item to prevent double actions
  let buyingItemId = $state<string | null>(null);
  let applyingItemId = $state<string | null>(null);

  function showBanner(msg: string, type: 'error' | 'success' = 'error', emoji = '') {
    // Clear any existing timeout to prevent glitchy disappearing
    if (bannerTimeout) {
      clearTimeout(bannerTimeout);
    }
    
    bannerMsg = msg;
    bannerType = type;
    bannerEmoji = emoji || (type === 'success' ? '🎉' : '😕');
    
    bannerTimeout = setTimeout(() => {
      bannerMsg = null;
      bannerTimeout = null;
    }, 3500);
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

  function getKidFriendlyError(err: unknown, fallback: string) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'Oops! That took too long. Try again?';
    }
    return fallback;
  }

  async function onBuyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.owned || buyingItemId) return;

    buyingItemId = id;

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
        showBanner(json.message ?? "Couldn't buy that right now. Try again!", 'error', '😅');
        return;
      }

      coins = json.mascot.coins;
      items = items.map((i) =>
        i.id === id ? { ...i, owned: true } : i
      );

      showBanner(`You got ${item.name}!`, 'success', '🛍️');
    } catch (err) {
      showBanner(getKidFriendlyError(err, 'Something went wrong. Try again!'), 'error');
    } finally {
      buyingItemId = null;
    }
  }

  async function onApplyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || !item.owned || applyingItemId) return;

    applyingItemId = id;

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
        showBanner(json.message ?? "Couldn't equip that. Try again!", 'error', '😅');
        return;
      }

      localStorage.setItem('wardrobe:selectedItemId', id);
      showBanner(`Groeny is now wearing ${item.name}!`, 'success', '✨');
    } catch (err) {
      showBanner(getKidFriendlyError(err, 'Something went wrong. Try again!'), 'error');
    } finally {
      applyingItemId = null;
    }
  }
</script>

<PageWrapper title="Shop">
  {#if bannerMsg}
    <div class="flex justify-center mb-4">
      <div class={bannerType === 'success' ? 'feedback-toast-success' : 'feedback-toast-error'}>
        <span>{bannerEmoji}</span>
        <span>{bannerMsg}</span>
      </div>
    </div>
  {/if}

  <!-- Seed Balance -->
  <div class="flex justify-center mb-6">
    <div class="badge-playful bg-gradient-to-r from-emerald-300 to-green-400 text-emerald-900 shadow-emerald-400/30 text-lg px-6 py-2">
      <span class="text-xl">🌱</span>
      <span class="font-bold">{coins}</span>
      <span class="text-emerald-700 text-sm font-medium">seeds</span>
    </div>
  </div>

  <!-- Shop Grid -->
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each items as item}
      <article class="card-item-amber flex flex-col">
        <!-- Item Display -->
        <div class="flex-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-amber-50/50 to-white">
          <div class="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 border border-amber-100">
            {#if getItemImage(item)}
              <img src={getItemImage(item)} alt={item.name} class="h-14" />
            {:else}
              <span class="text-3xl">🎁</span>
            {/if}
          </div>
          <h3 class="text-base font-bold text-gray-800">{item.name}</h3>
          <p class="text-xs text-gray-500 text-center mt-1 leading-relaxed">{item.description}</p>
        </div>

        <!-- Action Footer -->
        <div class="px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-t border-sky-100 flex items-center justify-between">
          {#if item.owned}
            <span class="badge-playful bg-emerald-100 text-emerald-700 text-xs py-1 px-3">✓ Owned</span>
            <button
              class="btn-action-green"
              onclick={() => onApplyClick(item.id)}
              disabled={applyingItemId === item.id}
            >
              {#if applyingItemId === item.id}
                <span class="spinner-sm"></span>
              {:else}
                Apply
              {/if}
            </button>
          {:else}
            <span class="badge-playful bg-emerald-100 text-emerald-800 text-sm py-1 px-3">🌱 {item.price}</span>
            <button
              class="btn-action-blue"
              onclick={() => onBuyClick(item.id)}
              disabled={coins < item.price || buyingItemId === item.id}
            >
              {#if buyingItemId === item.id}
                <span class="spinner-sm"></span>
              {:else}
                Buy
              {/if}
            </button>
          {/if}
        </div>
      </article>
    {/each}
  </div>
</PageWrapper>
