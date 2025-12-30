<script lang="ts">
  import ScrollToTopButton from '$lib/components/ScrollToTop.svelte';
  import LogoutModal from '$lib/components/LogoutModal.svelte';
  import BackgroundPicker from '$lib/components/BackgroundPicker.svelte';
  import { user, clearUser } from '$lib/auth/user';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  // Default Groeny gif
  import DefaultGif from '$lib/assets/images/groney-gif/normal.gif';

  let { data }: { data: PageData } = $props();

  let showLogoutModal = $state(false);

  // Coins come from mascot via +page.ts
  let coins = $derived(data.coins);

  // DB-based item IDs → gifs
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'hat-blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'acc-bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'acc-sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  // Read equipped items from mascot
  let equippedHat = $derived(data.equippedHat);
  let equippedAccessory = $derived(data.equippedAccessory);

  // Priority: hat → accessory → default
  let groenySrc = $derived(
    (equippedHat && groenyGifMap[equippedHat]) ||
    (equippedAccessory && groenyGifMap[equippedAccessory]) ||
    DefaultGif
  );

  function logout() {
    showLogoutModal = false;

    if (browser) goto('/auth');
  }

  $: if ($user === null) {
    if (browser) {
      goto('/auth');
    }
  }
</script>

<div class="container mx-auto px-4 py-10">

  <!-- Welcome -->
  <div class="flex justify-between items-center mb-6">
    <p class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-sm font-medium text-gray-800 shadow-lg">
      Welcome!
    </p>
    <div class="flex items-center gap-4">
      <BackgroundPicker />
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-300 text-sm font-medium text-gray-800 shadow-lg"
        onclick={() => showLogoutModal = true}
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Title -->
  <h1 class="text-4xl md:text-6xl font-extrabold text-center text-gray-800 mb-4">
    Groeny
  </h1>

  <!-- Level + coins -->
  <div class="flex justify-center gap-3 mb-6">
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🎖️ 5</div>
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🪙 {coins}</div>
  </div>

  <!-- Mascot -->
  <div class="flex justify-center mb-4">
    <div class="w-80 h-80 rounded-full border-8 border-sky-300 flex items-center justify-center bg-white shadow-lg">
      <img src={groenySrc} class="w-64" alt="Groeny" />
    </div>
  </div>

  <!-- Health -->
  <div class="flex justify-center mb-6">
    <div class="bg-green-100 px-4 py-1 rounded-full font-semibold text-gray-800 text-sm shadow">
      100% Health
    </div>
  </div>

  <!-- XP -->
  <div class="max-w-md mx-auto mb-10">
    <p class="text-gray-800 mb-1 text-sm">XP Progress</p>
    <div class="w-full bg-gray-200 rounded-full h-3 shadow-lg overflow-hidden">
      <div class="bg-green-500 h-full w-[85%]"></div>
    </div>
    <p class="text-right text-gray-800 text-sm mt-1">85 / 100</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-blue-600">
      <div class="text-3xl mb-1">💧</div>
      <p class="text-gray-800 text-sm">THIRST</p>
      <p class="font-extrabold text-xl text-blue-600">100%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-orange-500">
      <div class="text-3xl mb-1">🍎</div>
      <p class="text-gray-800 text-sm">HUNGER</p>
      <p class="font-extrabold text-xl text-orange-500">100%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-sky-500">
      <div class="text-3xl mb-1">🥰</div>
      <p class="text-gray-800 text-sm">HAPPINESS</p>
      <p class="font-extrabold text-xl text-sky-500">100%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-pink-500">
      <div class="text-3xl mb-1">💖</div>
      <p class="text-gray-800 text-sm">LOVE</p>
      <p class="font-extrabold text-xl text-pink-500">100%</p>
    </div>
  </div>

  <LogoutModal open={showLogoutModal} onCancel={() => { showLogoutModal = false; }} onConfirm={logout}/>
  <ScrollToTopButton />
</div>
