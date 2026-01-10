<script lang="ts">
  import { onMount } from 'svelte';
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  import GlovesImg from '$lib/assets/images/supplies/gloves.png';
  import SeedsImg from '$lib/assets/images/supplies/seeds.png';
  import WateringCanImg from '$lib/assets/images/supplies/watering-can.png';

  type Supply = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null; // kept for compatibility, but we won't use it for rendering
  };

  let { data }: { data: { supplies: Supply[] } } = $props();

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  // ✅ Get real logged-in user + class from localStorage (auth store)
  type StoredAuth = {
    user?: { id: string };
    classes?: { id: string }[];
  };

  let userId = $state('');
  let classId = $state('');

  onMount(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (!raw) return;

      const parsed: StoredAuth = JSON.parse(raw);
      userId = parsed.user?.id ?? '';
      classId = parsed.classes?.[0]?.id ?? ''; // first class for now
    } catch {
      // ignore
    }
  });

  let bannerMsg = $state<string | null>(null);
  let bannerType = $state<'error' | 'success'>('success');

  function showBanner(msg: string, type: 'error' | 'success') {
    bannerMsg = msg;
    bannerType = type;
    window.setTimeout(() => (bannerMsg = null), 3500);
  }

  const imageMap: Record<string, string> = {
    gloves: GlovesImg,
    seeds: SeedsImg,
    'watering-can': WateringCanImg
  };

  function slugify(value: string) {
    return value.trim().toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
  }

  function getSupplyImage(supply: Supply): string | null {
    const byId = imageMap[supply.id];
    if (byId) return byId;

    const byName = imageMap[slugify(supply.name)];
    if (byName) return byName;

    return null;
  }

  type FetchOptions = {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };

  async function fetchWithTimeout(url: string, options: FetchOptions = {}, timeoutMs = 6000) {
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

  async function onRequestClick(supply: Supply) {
    // ✅ Guard: must have real IDs
    if (!userId || !classId) {
      showBanner('Please log in and select a class first.', 'error');
      return;
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/supply-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, classId, supplyId: supply.id })
      });

      const json: { message?: string } = await res.json().catch(() => ({}));

      if (!res.ok) {
        showBanner(json.message ?? 'Failed to request supply', 'error');
        return;
      }

      showBanner('Request sent to your teacher!', 'success');
    } catch (err) {
      showBanner(getNetworkErrorMessage(err), 'error');
    }
  }
</script>

<PageWrapper title="Schoolyard Supplies">
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

  {#if data.supplies.length === 0}
    <div class="empty-state">
      <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <span class="text-3xl">🌱</span>
      </div>
      <p class="font-bold text-gray-700 text-lg mb-1">No supplies found</p>
      <p class="text-sm text-gray-500">Check back later for gardening supplies!</p>
    </div>
  {:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.supplies as supply}
        <article class="card-item-green flex flex-col">
          <!-- Supply Display -->
          <div class="flex-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-emerald-50/50 to-white">
            <div class="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 border border-emerald-100">
              {#if getSupplyImage(supply)}
                <img src={getSupplyImage(supply)} alt={supply.name} class="max-h-14" />
              {:else}
                <span class="text-3xl">🧰</span>
              {/if}
            </div>
            <h3 class="text-base font-bold text-gray-800">{supply.name}</h3>
            <p class="text-xs text-gray-500 text-center mt-1 leading-relaxed">{supply.description}</p>
          </div>

          <!-- Action Footer -->
          <div class="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100 flex items-center justify-between">
            <span class="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span>📋</span> Ask your teacher
            </span>
            <button
              type="button"
              class="btn-action-green"
              onclick={() => onRequestClick(supply)}
            >
              Request
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</PageWrapper>
