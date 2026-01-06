<script lang="ts">
  import ScrollToTopButton from '$lib/components/ScrollToTop.svelte';
  import LogoutModal from '$lib/components/LogoutModal.svelte';
  import BackgroundPicker from '$lib/components/BackgroundPicker.svelte';
  import StreakWidget from '$lib/components/StreakWidget.svelte';
  import type { PageData } from './$types';
  import type { MascotData } from './+page';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { MASCOT_ENGINE_URL } from '$lib/config';
  import { milestoneRewardStore, clearMilestoneReward } from '$lib/stores/auth';

  // Groeny gifs for different states
  import NormalGif from '$lib/assets/images/groney-gif/normal.gif';

  let { data }: { data: PageData } = $props();

  let showLogoutModal = $state(false);
  let showMilestoneReward = $state(false);
  let milestoneReward = $state<{ streakDay: number; coinsEarned: number; message: string } | null>(null);
  let milestoneTimeout: ReturnType<typeof setTimeout> | null = null;

  // Live mascot data (updated via polling)
  let liveMascot = $state<MascotData>(data.mascot);
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  // Polling interval in milliseconds (5 seconds for testing, increase for production)
  const POLL_INTERVAL = 5000;

  // Fetch latest mascot data
  async function fetchMascot() {
    try {
      let userId = '';
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        userId = parsed?.user?.id ?? '';
      }
      
      if (!userId) return;

      const res = await fetch(
        `${MASCOT_ENGINE_URL}/api/mascot/by-user/${encodeURIComponent(userId)}?t=${Date.now()}`,
        { cache: 'no-store' }
      );

      if (res.ok) {
        liveMascot = await res.json();
      }
    } catch (err) {
      console.error('Error polling mascot:', err);
    }
  }

  // Start polling on mount and check for milestone reward
  onMount(() => {
    pollInterval = setInterval(fetchMascot, POLL_INTERVAL);
    
    // Check current value immediately (in case reward was set before component mounted)
    const currentReward = get(milestoneRewardStore);
    if (currentReward) {
      console.log('📦 Found existing milestone reward:', currentReward);
      showMilestoneRewardForReward(currentReward);
    }
    
    // Subscribe to milestone reward store for future changes
    const unsubscribe = milestoneRewardStore.subscribe((reward) => {
      console.log('📦 Milestone store value changed:', reward);
      if (reward) {
        showMilestoneRewardForReward(reward);
      }
    });
    
    return () => {
      unsubscribe();
    };
  });

  // Helper function to show milestone reward popup
  function showMilestoneRewardForReward(reward: { streakDay: number; coinsEarned: number; message: string }) {
    console.log('🎯 Showing milestone popup!', reward);
    milestoneReward = reward;
    showMilestoneReward = true;
    
    // Clear any existing timeout
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
    }
    
    // Auto-dismiss after 6 seconds
    milestoneTimeout = setTimeout(() => {
      dismissMilestoneReward();
    }, 6000);
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
    }
  });

  // Dismiss milestone reward message
  function dismissMilestoneReward() {
    showMilestoneReward = false;
    milestoneReward = null;
    clearMilestoneReward();
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
      milestoneTimeout = null;
    }
  }

  // Use live data
  let coins = $derived(liveMascot.coins);
  let level = $derived(liveMascot.level);
  let health = $derived(liveMascot.health);
  let state = $derived(liveMascot.state);
  let levelProgress = $derived(liveMascot.levelProgress);

  // Stats
  let thirst = $derived(liveMascot.thirst);
  let hunger = $derived(liveMascot.hunger);
  let happiness = $derived(liveMascot.happiness);
  let cleanliness = $derived(liveMascot.cleanliness);

  // Equipped items
  let equippedHat = $derived(liveMascot.equippedHat);
  let equippedAccessory = $derived(liveMascot.equippedAccessory);

  // DB-based item IDs → gifs (with equipped items)
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'hat-blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'acc-bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'acc-sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  // State-based gifs (sad/sick versions)
  // TODO: Add actual sad and sick gifs when available
  const stateGifMap: Record<string, string> = {
    'normal': NormalGif,
    'sad': NormalGif,    // Replace with sad gif when available
    'sick': NormalGif,   // Replace with sick gif when available
  };

  // Priority: equipped item → state-based default
  let groenySrc = $derived(
    (equippedHat && groenyGifMap[equippedHat]) ||
    (equippedAccessory && groenyGifMap[equippedAccessory]) ||
    stateGifMap[state] ||
    NormalGif
  );

  // Health color based on percentage
  let healthColor = $derived(
    health >= 51 ? 'bg-green-500' :
    health >= 25 ? 'bg-yellow-500' :
    'bg-red-500'
  );

  let healthBgColor = $derived(
    health >= 51 ? 'bg-green-100' :
    health >= 25 ? 'bg-yellow-100' :
    'bg-red-100'
  );

  // Stat color helper
  function getStatColor(value: number): string {
    if (value >= 51) return 'text-green-600';
    if (value >= 25) return 'text-yellow-600';
    return 'text-red-600';
  }

  function logout() {
    showLogoutModal = false;
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('auth');
    goto('/login');
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

  <!-- Milestone Reward Message -->
  {#if showMilestoneReward && milestoneReward}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
         onclick={dismissMilestoneReward}
         onkeydown={(e) => e.key === 'Escape' && dismissMilestoneReward()}
         role="button"
         tabindex="0">
      <div class="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm text-center animate-bounce-in"
           onclick={(e) => e.stopPropagation()}
           onkeydown={(e) => e.stopPropagation()}
           role="dialog"
           tabindex="-1">
        <div class="text-5xl mb-4">🔥</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          {milestoneReward.streakDay}-day streak!
        </h2>
        <div class="bg-yellow-100 rounded-full px-4 py-2 inline-block mb-3">
          <span class="text-xl font-bold text-yellow-700">🪙 +{milestoneReward.coinsEarned} coins</span>
        </div>
        <p class="text-gray-600 text-lg mb-4">{milestoneReward.message}</p>
        <button
          class="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
          onclick={dismissMilestoneReward}
        >
          Awesome!
        </button>
      </div>
    </div>
  {/if}

  <!-- Level + coins + streak -->
  <div class="flex justify-center gap-3 mb-6">
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🎖️ {level}</div>
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🪙 {coins}</div>
    <StreakWidget />
  </div>

  <!-- Mascot -->
  <div class="flex justify-center mb-4">
    <div class="w-80 h-80 rounded-full border-8 border-sky-300 flex items-center justify-center bg-white shadow-lg">
      <img src={groenySrc} class="w-64" alt="Groeny" />
    </div>
  </div>

  <!-- Health -->
  <div class="flex justify-center mb-6">
    <div class="{healthBgColor} px-4 py-1 rounded-full font-semibold text-gray-800 text-sm shadow">
      {health}% Health
      {#if state === 'sad'}
        <span class="ml-1">😢</span>
      {:else if state === 'sick'}
        <span class="ml-1">🤒</span>
      {/if}
    </div>
  </div>

  <!-- XP Progress -->
  <div class="max-w-md mx-auto mb-10">
    <p class="text-gray-800 mb-1 text-sm">XP Progress (Level {level})</p>
    <div class="w-full bg-gray-200 rounded-full h-3 shadow-lg overflow-hidden">
      <div class="{healthColor} h-full transition-all duration-500" style="width: {levelProgress.percentage}%"></div>
    </div>
    <p class="text-right text-gray-800 text-sm mt-1">{levelProgress.current} / {levelProgress.required}</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-blue-600">
      <div class="text-3xl mb-1">💧</div>
      <p class="text-gray-800 text-sm">THIRST</p>
      <p class="font-extrabold text-xl transition-all duration-500 {getStatColor(thirst)}">{thirst}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-orange-500">
      <div class="text-3xl mb-1">🍎</div>
      <p class="text-gray-800 text-sm">HUNGER</p>
      <p class="font-extrabold text-xl transition-all duration-500 {getStatColor(hunger)}">{hunger}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-sky-500">
      <div class="text-3xl mb-1">🥰</div>
      <p class="text-gray-800 text-sm">HAPPINESS</p>
      <p class="font-extrabold text-xl transition-all duration-500 {getStatColor(happiness)}">{happiness}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-pink-500">
      <div class="text-3xl mb-1">🧹</div>
      <p class="text-gray-800 text-sm">CLEANLINESS</p>
      <p class="font-extrabold text-xl transition-all duration-500 {getStatColor(cleanliness)}">{cleanliness}%</p>
    </div>
  </div>

  <LogoutModal open={showLogoutModal} onCancel={() => { showLogoutModal = false; }} onConfirm={logout}/>
  <ScrollToTopButton />
</div>
