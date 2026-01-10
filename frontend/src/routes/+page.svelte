<script lang="ts">
  import ScrollToTopButton from '$lib/components/ScrollToTop.svelte';
  import LogoutModal from '$lib/components/LogoutModal.svelte';
  import BackgroundPicker from '$lib/components/BackgroundPicker.svelte';
  import StreakWidget from '$lib/components/StreakWidget.svelte';
  import WeatherWidget from '$lib/components/WeatherWidget.svelte';
  import type { PageData } from './$types';
  import type { MascotData } from './+page';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { MASCOT_ENGINE_URL, API_BASE_URL } from '$lib/config';
  import { milestoneRewardStore, clearMilestoneReward, streakResetStore, clearStreakReset } from '$lib/stores/auth';


  // Groeny gifs for different states
  import NormalGif from '$lib/assets/images/groney-gif/normal.gif';
  import SadGif from '$lib/assets/images/groney-gif/sad.gif';
  import SickGif from '$lib/assets/images/groney-gif/Sick.gif';
  import CryGif from '$lib/assets/images/groney-gif/cry.gif';

  let { data }: { data: PageData } = $props();

  let displayName = $state<string>(''); 
  let showLogoutModal = $state(false);
  let showMilestoneReward = $state(false);
  let milestoneReward = $state<{ streakDay: number; coinsEarned: number; message: string } | null>(null);
  let milestoneTimeout: ReturnType<typeof setTimeout> | null = null;

  // Streak reset message state
  let showStreakReset = $state(false);
  let streakResetInfo = $state<{ previousStreak: number } | null>(null);
  let streakResetTimeout: ReturnType<typeof setTimeout> | null = null;

  // Live mascot data (updated via polling)
  // Initialize with empty object, will be set from data in effect
  let liveMascot = $state<MascotData | null>(null);
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  // Initialize liveMascot from data when component mounts or data changes
  $effect(() => {
    if (data.mascot && !liveMascot) {
      liveMascot = data.mascot;
      // Set classId once for activity fetching (won't change during session)
      if (!classIdForActivities && data.mascot.classId) {
        classIdForActivities = data.mascot.classId;
      }
    }
  });

  // Polling interval in milliseconds (5 seconds for testing, increase for production)
  const POLL_INTERVAL = 5000;

  // Activity feed
  type ActivityFilter = 'all' | 'mine';
  let activityFilter = $state<ActivityFilter>('all');
  let activities = $state<any[]>([]);
  let isLoadingActivities = $state(false);
  
  // Store classId separately to avoid re-fetching activities when mascot polls
  let classIdForActivities = $state<string | null>(null);

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

  // Fetch activities when filter changes
  async function fetchActivities() {
    isLoadingActivities = true;
    try {
        let userId = '';
        const authData = localStorage.getItem('auth');
        let userRole = 'STUDENT'; 
        
        if (authData) {
            const parsed = JSON.parse(authData);
            userId = parsed?.user?.id;
        }

        // Use stable classId (not liveMascot) to avoid re-fetching on mascot poll
        const classId = classIdForActivities;
        if (!classId && activityFilter !== 'mine') {
            activities = [];
            return;
        }
        
        const endpoint = activityFilter === 'mine'
            ? `${API_BASE_URL}/api/student/activities`
            : `${API_BASE_URL}/api/student/activities/class?classId=${classId}`;

        const res = await fetch(endpoint, {
            headers: {
                'x-user-id': userId,
                'x-user-role': userRole,
            }
        });

        if (res.ok) {
            activities = await res.json();
        } else {
            console.warn('Failed to fetch activities, using mock data');
            activities = []; 
        }
    } catch (err) {
        console.error('Error loading activities:', err);
    } finally {
        isLoadingActivities = false;
    }
  }

  // Reactively fetch when filter changes or classId becomes available
  $effect(() => {
      // Track filter and classId to trigger re-fetch appropriately
      const currentFilter = activityFilter;
      const currentClassId = classIdForActivities;
      
      // Only fetch if we have a classId (or filter is 'mine')
      if (currentClassId || currentFilter === 'mine') {
        fetchActivities();
      }
  });
  
  // Helper to format dates
  function formatDate(dateString: string) {
      return new Date(dateString).toLocaleDateString('en-GB');
  }

  // Helper function to resolve photo URLs (handles both relative API paths and absolute URLs)
  function resolvePhotoUrl(photoUrl: string | null): string | null {
    if (!photoUrl) return null;
    // If it's a relative path starting with /api, prepend API_BASE_URL
    if (photoUrl.startsWith('/api/')) {
      return `${API_BASE_URL}${photoUrl}`;
    }
    // Otherwise return as-is (for absolute URLs)
    return photoUrl;
  }

  // Track if the messages have already been shown
  let rewardShown = false;
  let resetShown = false;

  // Mission decision notifications
  type MissionDecision = {
    id: string;
    missionTitle: string;
    status: 'completed' | 'rejected';
    xpReward: number;
    coinReward: number;
    reviewedAt: string;
  };
  let missionDecisions = $state<MissionDecision[]>([]);
  let currentDecisionIndex = $state(0);
  let showDecisionNotification = $state(false);

  // Fetch recent mission decisions
  async function fetchRecentDecisions() {
    try {
      const authData = localStorage.getItem('auth');
      if (!authData) return;
      
      const parsed = JSON.parse(authData);
      const userId = parsed?.user?.id;
      const userRole = parsed?.user?.role || 'STUDENT';
      const token = parsed?.token;
      
      if (!userId) return;

      // Get last seen timestamp from localStorage
      const lastSeenKey = `missionDecisions_lastSeen_${userId}`;
      const lastSeen = localStorage.getItem(lastSeenKey);
      
      const url = lastSeen 
        ? `${API_BASE_URL}/api/student/recent-decisions?since=${encodeURIComponent(lastSeen)}`
        : `${API_BASE_URL}/api/student/recent-decisions`;

      const res = await fetch(url, {
        headers: {
          'x-user-id': userId,
          'x-user-role': userRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const decisions = await res.json();
        if (decisions.length > 0) {
          missionDecisions = decisions;
          currentDecisionIndex = 0;
          showDecisionNotification = true;
          
          // Update last seen to now
          localStorage.setItem(lastSeenKey, new Date().toISOString());
        }
      }
    } catch (err) {
      console.error('Error fetching mission decisions:', err);
    }
  }

  function dismissDecisionNotification() {
    if (currentDecisionIndex < missionDecisions.length - 1) {
      // Show next notification
      currentDecisionIndex++;
    } else {
      // All notifications shown
      showDecisionNotification = false;
      missionDecisions = [];
      currentDecisionIndex = 0;
    }
  }

  // Auto-dismiss after 5 seconds
  $effect(() => {
    if (showDecisionNotification) {
      const timeout = setTimeout(() => {
        dismissDecisionNotification();
      }, 5000);
      return () => clearTimeout(timeout);
    }
  });

  // Start polling on mount and check for milestone reward / streak reset
  onMount(() => {
    // ✅ Read logged-in user's display name from localStorage
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      const user = parsed?.user;

        const role = (
        parsed?.role ??
        user?.role ??
        localStorage.getItem('role') ??
        ''
      ).toString().toUpperCase();

      // Pick the best available field (adjust if needed)
      displayName =
        user?.username ??
        user?.name ??
        user?.firstName ??
        user?.email ??
        '';
    }
  } catch (e) {
    console.warn('Failed to parse auth from localStorage', e);
    displayName = '';
  }
    pollInterval = setInterval(fetchMascot, POLL_INTERVAL);
    
    // Fetch recent mission decisions on page load
    fetchRecentDecisions();
    
    // Check current value immediately (in case reward was set before component mounted)
    const currentReward = get(milestoneRewardStore);
    if (currentReward && !rewardShown) {
      showMilestoneRewardForReward(currentReward);
    }
    
    // Check for streak reset
    const currentReset = get(streakResetStore);
    if (currentReset && !resetShown) {
      showStreakResetMessage(currentReset);
    }
    
    // Subscribe to milestone reward store for future changes
    const unsubscribeMilestone = milestoneRewardStore.subscribe((reward) => {
      if (reward && !rewardShown) {
        showMilestoneRewardForReward(reward);
      }
    });
    
    // Subscribe to streak reset store for future changes
    const unsubscribeReset = streakResetStore.subscribe((reset) => {
      if (reset && !resetShown) {
        showStreakResetMessage(reset);
      }
    });
    
    return () => {
      unsubscribeMilestone();
      unsubscribeReset();
    };
  });

  // Helper function to show milestone reward popup
  function showMilestoneRewardForReward(reward: { streakDay: number; coinsEarned: number; message: string }) {
    // Prevent showing the same reward twice
    if (rewardShown) return;
    rewardShown = true;
    
    milestoneReward = reward;
    showMilestoneReward = true;
    
    // Clear the store immediately so it won't reappear on navigation/refresh
    clearMilestoneReward();
    
    // Fetch updated mascot data immediately to show new coin balance
    fetchMascot();
    
    // Clear any existing timeout
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
    }
    
    // Auto-dismiss after 5 seconds
    milestoneTimeout = setTimeout(() => {
      dismissMilestoneReward();
    }, 5000);
  }

  // Helper function to show streak reset message
  function showStreakResetMessage(reset: { previousStreak: number }) {
    // Prevent showing the same reset message twice
    if (resetShown) return;
    resetShown = true;
    
    streakResetInfo = reset;
    showStreakReset = true;
    
    // Clear the store immediately so it won't reappear on navigation/refresh
    clearStreakReset();
    
    // Clear any existing timeout
    if (streakResetTimeout) {
      clearTimeout(streakResetTimeout);
    }
    
    // Auto-dismiss after 5 seconds
    streakResetTimeout = setTimeout(() => {
      dismissStreakReset();
    }, 5000);
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
    }
    if (streakResetTimeout) {
      clearTimeout(streakResetTimeout);
    }
  });

  // Dismiss milestone reward message
  function dismissMilestoneReward() {
    showMilestoneReward = false;
    milestoneReward = null;
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
      milestoneTimeout = null;
    }
  }

  // Dismiss streak reset message
  function dismissStreakReset() {
    showStreakReset = false;
    streakResetInfo = null;
    if (streakResetTimeout) {
      clearTimeout(streakResetTimeout);
      streakResetTimeout = null;
    }
  }

  // Use live data (with fallbacks for when liveMascot is null during initial load)
  let coins = $derived(liveMascot?.coins ?? 0);
  let level = $derived(liveMascot?.level ?? 1);
  let health = $derived(liveMascot?.health ?? 100);
  let state = $derived(liveMascot?.state ?? 'normal');
  let levelProgress = $derived(liveMascot?.levelProgress ?? { current: 0, required: 100, percentage: 0 });

  // Stats
  let thirst = $derived(liveMascot?.thirst ?? 100);
  let hunger = $derived(liveMascot?.hunger ?? 100);
  let happiness = $derived(liveMascot?.happiness ?? 100);
  let cleanliness = $derived(liveMascot?.cleanliness ?? 100);

  // Equipped items
  let equippedHat = $derived(liveMascot?.equippedHat);
  let equippedAccessory = $derived(liveMascot?.equippedAccessory);

  // DB-based item IDs → gifs (with equipped items)
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'hat-blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'acc-bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'acc-sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  // State-based gifs based on health percentage
  // Health 51-100%: Normal, 25-50%: Sad, 1-24%: Sick
  const stateGifMap: Record<string, string> = {
    'normal': NormalGif,
    'sad': SadGif,
    'sick': SickGif,
  };

  // Priority: 
  // - If sick/sad state → show health state GIF (overrides wardrobe)
  // - If normal state → show wardrobe item if equipped, otherwise normal GIF
  let groenySrc = $derived(
    state !== 'normal' 
      ? (stateGifMap[state] || NormalGif)  // Sick/sad overrides wardrobe
      : (
          (equippedHat && groenyGifMap[equippedHat]) ||
          (equippedAccessory && groenyGifMap[equippedAccessory]) ||
          NormalGif
        )
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
<div class="container mx-auto px-4 py-6 max-w-4xl relative">

  <!-- Weather Widget - Absolute positioned -->
  <div class="absolute top-20 right-0 z-10 hidden sm:block">
    <WeatherWidget />
  </div>

  <!-- Welcome + Controls -->
  <div class="flex justify-between items-center mb-4">
    <p class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-100 bg-white text-sm font-bold text-gray-800 shadow-md">
      Welcome{displayName ? `, ${displayName}` : ''}! 👋
    </p>
    <div class="flex items-center gap-3">
      <BackgroundPicker />
      <button
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] text-sm font-bold text-gray-700 shadow-md transition-all min-h-[44px]"
        onclick={() => showLogoutModal = true}
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Title -->
  <h1 class="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">
    Groeny
  </h1>

  <!-- Milestone Reward Message -->
  {#if showMilestoneReward && milestoneReward}
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
         onclick={dismissMilestoneReward}
         onkeydown={(e) => e.key === 'Escape' && dismissMilestoneReward()}
         role="button"
         tabindex="0">
      <!-- Backdrop with subtle blur -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      
      <!-- Popup card -->
      <div class="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm text-center animate-bounce-in mb-4 sm:mb-0"
           onclick={(e) => e.stopPropagation()}
           onkeydown={(e) => e.stopPropagation()}
           role="dialog"
           aria-labelledby="milestone-title"
           tabindex="-1">
        <div class="text-4xl sm:text-5xl mb-3">🔥</div>
        <h2 id="milestone-title" class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          {milestoneReward.streakDay}-day streak!
        </h2>
        <div class="bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 inline-block mb-3">
          <span class="text-lg sm:text-xl font-bold text-yellow-600">🪙 +{milestoneReward.coinsEarned} coins</span>
        </div>
        <p class="text-gray-500 text-base sm:text-lg mb-4">{milestoneReward.message}</p>
        <button
          class="btn-primary w-full sm:w-auto"
          onclick={dismissMilestoneReward}
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  {/if}

  <!-- Streak Reset Message -->
  {#if showStreakReset && streakResetInfo}
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
         onclick={dismissStreakReset}
         onkeydown={(e) => e.key === 'Escape' && dismissStreakReset()}
         role="button"
         tabindex="0">
      <!-- Backdrop with subtle blur -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      
      <!-- Popup card -->
      <div class="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-xs sm:max-w-sm text-center animate-bounce-in mb-4 sm:mb-0"
           onclick={(e) => e.stopPropagation()}
           onkeydown={(e) => e.stopPropagation()}
           role="dialog"
           aria-labelledby="streak-reset-title"
           tabindex="-1">
        <div class="text-4xl sm:text-5xl mb-3">💪</div>
        <h2 id="streak-reset-title" class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Welcome back!
        </h2>
        <p class="text-gray-500 text-base mb-3">Your streak has reset, but that's okay!</p>
        <div class="bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 inline-block mb-3">
          <span class="text-base font-medium text-gray-600">Previous streak: {streakResetInfo.previousStreak} days</span>
        </div>
        <p class="text-gray-600 text-base sm:text-lg mb-4">Let's start fresh together! 🌱</p>
        <button
          class="btn-primary w-full sm:w-auto"
          onclick={dismissStreakReset}
        >
          Let's go! 💪
        </button>
      </div>
    </div>
  {/if}

  <!-- Mission Decision Notification -->
  {#if showDecisionNotification && missionDecisions.length > 0}
    {@const decision = missionDecisions[currentDecisionIndex]}
    <div class="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-slide-down">
      <div class="bg-white rounded-2xl shadow-2xl border-2 {decision.status === 'completed' ? 'border-green-300' : 'border-red-300'} overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-3 {decision.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{decision.status === 'completed' ? '🎉' : '😔'}</span>
              <span class="font-bold text-white">
                {decision.status === 'completed' ? 'Mission Approved!' : 'Mission Rejected'}
              </span>
            </div>
            <button 
              onclick={dismissDecisionNotification}
              class="text-white/80 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-4">
          <p class="font-semibold text-gray-800 mb-2">{decision.missionTitle}</p>
          
          {#if decision.status === 'completed'}
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                ⭐ +{decision.xpReward} XP
              </span>
              <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                🪙 +{decision.coinReward} Coins
              </span>
            </div>
          {:else}
            <p class="text-gray-500 text-sm">Try again with a clearer photo!</p>
          {/if}
          
          {#if missionDecisions.length > 1}
            <p class="text-xs text-gray-400 mt-3">
              {currentDecisionIndex + 1} of {missionDecisions.length} notifications
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Level + coins + streak -->
  <div class="flex justify-center gap-3 mb-4">
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🎖️ {level}</div>
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🪙 {coins}</div>
    <StreakWidget />
  </div>

  <!-- Mascot -->
  <div class="flex justify-center mb-4">
    <div class="w-64 h-64 md:w-72 md:h-72 rounded-full border-8 border-sky-300 flex items-center justify-center bg-white shadow-lg">
      <img src={groenySrc} class="w-48 md:w-56" alt="Groeny" />
    </div>
  </div>

  <!-- Health -->
  <div class="flex justify-center mb-4">
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
  <div class="max-w-md mx-auto mb-6">
    <p class="text-gray-700 mb-1 text-sm font-semibold">XP Progress (Level {level})</p>
    <div class="w-full bg-gray-200 rounded-full h-3 shadow-lg overflow-hidden">
      <div class="{healthColor} h-full transition-all duration-500" style="width: {levelProgress.percentage}%"></div>
    </div>
    <p class="text-right text-gray-500 text-xs mt-1">{levelProgress.current} / {levelProgress.required}</p>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-blue-600">
      <div class="text-3xl mb-1">💧</div>
      <p class="text-gray-500 text-xs font-bold uppercase tracking-wide">Thirst</p>
      <p class="font-extrabold text-2xl transition-all duration-500 {getStatColor(thirst)}">{thirst}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-orange-500">
      <div class="text-3xl mb-1">🍎</div>
      <p class="text-gray-500 text-xs font-bold uppercase tracking-wide">Hunger</p>
      <p class="font-extrabold text-2xl transition-all duration-500 {getStatColor(hunger)}">{hunger}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-sky-500">
      <div class="text-3xl mb-1">🥰</div>
      <p class="text-gray-500 text-xs font-bold uppercase tracking-wide">Happiness</p>
      <p class="font-extrabold text-2xl transition-all duration-500 {getStatColor(happiness)}">{happiness}%</p>
    </div>
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-pink-500">
      <div class="text-3xl mb-1">🧹</div>
      <p class="text-gray-500 text-xs font-bold uppercase tracking-wide">Clean</p>
      <p class="font-extrabold text-2xl transition-all duration-500 {getStatColor(cleanliness)}">{cleanliness}%</p>
    </div>
  </div>

  <!-- Activity Feed -->
   <div class="mt-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
      <h2 class="text-xl md:text-2xl font-bold text-gray-800">Recent Activities</h2>
      
      <div class="bg-gray-100 p-1.5 rounded-2xl inline-flex self-start sm:self-auto">
        <button 
          class={activityFilter === 'all' ? 'btn-chip-active' : 'btn-chip-inactive'}
          onclick={() => activityFilter = 'all'}
        >
          🏫 Whole Class
        </button>
        <button 
          class={activityFilter === 'mine' ? 'btn-chip-active' : 'btn-chip-inactive'}
          onclick={() => activityFilter = 'mine'}
        >
          👤 My Activity
        </button>
      </div>
    </div>

    {#if isLoadingActivities}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
            <div class="h-56 bg-gray-100 rounded-3xl animate-pulse"></div>
        </div>
    {:else if activities.length > 0}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each activities as activity}
            <article class="bg-white rounded-3xl shadow-md p-4 border border-gray-100 transition-transform hover:scale-[1.01]">
              <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {activity.userName?.charAt(0) || '?'}
                  </div>
                  <p class="text-gray-700 text-sm leading-snug">
                      <span class="font-bold text-blue-600">{activity.userName}</span> completed <span class="font-semibold">{activity.missionTitle}</span>!
                  </p>
              </div>

              <div class="overflow-hidden rounded-2xl mb-3 bg-gray-50 relative group">
                {#if activity.imageUrl}
                    <img src={resolvePhotoUrl(activity.imageUrl)} alt={activity.missionTitle} class="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105">
                {:else}
                    <div class="w-full h-40 flex items-center justify-center text-gray-400 text-sm">
                        No photo submitted
                    </div>
                {/if}
              </div>

              <p class="text-xs text-gray-400 flex items-center gap-1">
                  📅 {formatDate(activity.createdAt)}
              </p>
            </article>
          {/each}
        </div>
    {:else}
        <div class="text-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <p class="text-4xl mb-2">📭</p>
            <p class="text-gray-700 font-semibold">No recent activities yet</p>
            {#if activityFilter === 'mine'}
                <p class="text-gray-500 text-sm mt-1">Complete some missions to see them here!</p>
            {/if}
        </div>
    {/if}
  </div>
  
  <LogoutModal open={showLogoutModal} onCancel={() => { showLogoutModal = false; }} onConfirm={logout}/>
  <ScrollToTopButton />
</div>
