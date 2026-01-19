<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';

  // ============================
  //   IMPORT SHOP IMAGES
  // ============================
  import RedCapImg from '$lib/assets/images/shop/red-cap.png';
  import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
  import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
  import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';
  import RainbowColorsImg from '$lib/assets/images/shop/rainbow-colors.png';

  export let data: PageData;

  type Tab = 'groeny' | 'schoolyard';
  let activeTab: Tab = 'groeny';

  type Item = PageData['items'][number];

  // Image lookup by item.id
  const imageMap: Record<string, string> = {
    'red-cap': RedCapImg,
    'blue-cap': BlueCapImg,
    'bow-tie': BowTieImg,
    'sunglasses': SunglassesImg,
    'rainbow-colors': RainbowColorsImg
  };

  function getItemImage(item: Item): string | null {
    if (imageMap[item.id]) return imageMap[item.id];
    // fallback if backend provides one
    // @ts-ignore
    if (item.imageUrl) return item.imageUrl;
    return null;
  }

  // ============================
  //   SPRINT 1 LOCAL STATE
  // ============================
  let coins = data.coins;
  let items = data.items.slice(); // avoid mutating original data

  function onBuyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.owned) return;

    if (coins < item.price) {
      alert('Not enough coins yet – server validation comes in Sprint 2.');
      return;
    }

    coins -= item.price;
    item.owned = true;
  }

  function onApplyClick(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    alert(`Pretending to apply "${item.name}" – avatar integration is next sprint.`);
  }
</script>

<PageWrapper title="Shop">
  <!-- ===================== -->
  <!--   COINS BADGE         -->
  <!-- ===================== -->
  <div class="flex justify-center mb-6">
    <div class="bg-yellow-300 rounded-full px-8 py-3 shadow-lg flex items-center gap-3 border-2 border-yellow-400">
      <span class="text-2xl">🪙</span>
      <span class="font-semibold text-xl">{coins}</span>
    </div>
  </div>

  <!-- ===================== -->
  <!--        TABS           -->
  <!-- ===================== -->
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
    <!-- ===================== -->
    <!--       ITEMS GRID       -->
    <!-- ===================== -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
      {#each items as item}
        <article class="bg-white rounded-3xl shadow-md border-4 border-amber-300 flex flex-col overflow-hidden">
          <!-- IMAGE + TEXT -->
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            {#if getItemImage(item)}
              <div class="h-24 mb-4 flex items-center justify-center">
                <img src={getItemImage(item)} alt={item.name} class="max-h-24" />
              </div>
            {/if}

            <h3 class="font-semibold text-gray-800">{item.name}</h3>
            <p class="text-xs text-gray-500 text-center mt-1">{item.description}</p>
          </div>

          <!-- FOOTER BAR -->
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

    <!-- ===================== -->
    <!--  SCHOOLYARD PLACEHOLDER -->
    <!-- ===================== -->
    <div class="text-center text-gray-500 pb-10">
      <p class="font-medium mb-1">Schoolyard Supplies</p>
      <p class="text-sm">This section will be implemented in a later sprint.</p>
    </div>

  {/if}
</PageWrapper>
