<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  type Supply = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };

  export let data: { supplies: Supply[] };

  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

  // TODO later: replace with real values from login/class selection
  const userId = 'user-1';
  const classId = 'class-1';

  let bannerMsg: string | null = null;
  let bannerType: 'error' | 'success' = 'success';

  function showBanner(msg: string, type: 'error' | 'success') {
    bannerMsg = msg;
    bannerType = type;
    window.setTimeout(() => (bannerMsg = null), 3500);
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
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/supplies/request`, {
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

  {#if data.supplies.length === 0}
    <div class="text-center text-gray-500 pb-10">
      <p class="font-medium mb-1">No supplies found</p>
      <p class="text-sm">Seed the DB and make sure supply-service + gateway are running.</p>
    </div>
  {:else}
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
      {#each data.supplies as supply}
        <article class="bg-white rounded-3xl shadow-md border-4 border-green-200 flex flex-col overflow-hidden">
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            {#if supply.imageUrl}
              <div class="h-24 mb-4 flex items-center justify-center">
                <img src={supply.imageUrl} alt={supply.name} class="max-h-24" />
              </div>
            {/if}

            <h3 class="font-semibold text-gray-800">{supply.name}</h3>
            <p class="text-xs text-gray-500 text-center mt-1">{supply.description}</p>
          </div>

          <div class="px-6 py-3 bg-green-50 flex items-center justify-end">
            <button
              type="button"
              class="text-xs font-semibold rounded-full px-4 py-1 bg-green-500 text-white hover:bg-green-600 transition-colors"
              on:click={() => onRequestClick(supply)}
            >
              Request
            </button>
          </div>
        </article>
      {/each}
    </div>
  {/if}
</PageWrapper>
