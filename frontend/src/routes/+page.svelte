<script lang="ts">
  import { Button, Badge, Modal, StatCard, Alert } from '$lib/components/ui';
  import ScrollToTopButton from '$lib/components/ScrollToTop.svelte';
  import LogoutModal from '$lib/components/LogoutModal.svelte';
  import BackgroundPicker from '$lib/components/BackgroundPicker.svelte';
  import StreakWidget from '$lib/components/StreakWidget.svelte';
  import type { PageData } from './$types';
  import type { MascotData } from './+page';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { MASCOT_ENGINE_URL, API_BASE_URL } from '$lib/config';
  import { milestoneRewardStore, clearMilestoneReward, streakResetStore, clearStreakReset } from '$lib/stores/auth';
  import { toast } from '$lib/stores/toast';

  // Groeny gifs for different states
  import NormalGif from '$lib/assets/images/groney-gif/normal.gif';

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
  let liveMascot = $state<MascotData>(data.mascot);
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  // Polling interval in milliseconds (5 seconds for testing, increase for production)
  const POLL_INTERVAL = 5000;

  // Activity feed
  type ActivityFilter = 'all' | 'mine';
  let activityFilter = $state<ActivityFilter>('all');
  let activities = $state<any[]>([]);
  let isLoadingActivities = $state(false);

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

      const endpoint = activityFilter === 'mine'
        ? `${API_BASE_URL}/api/student/activities`
        : `${API_BASE_URL}/api/student/activities/class?classId=${liveMascot.classId}`;

      const res = await fetch(endpoint, {
        headers: {
          'x-user-id': userId,
          'x-user-role': userRole,
        }
      });

      if (res.ok) {
        activities = await res.json();
      } else {
        console.warn('Failed to fetch activities');
        activities = []; 
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      isLoadingActivities = false;
    }
  }

  // Reactively fetch when filter changes
  $effect(() => {
    fetchActivities();
  });
  
  // Helper to format dates
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB');
  }

  // Helper function to resolve photo URLs
  function resolvePhotoUrl(photoUrl: string | null): string | null {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('/api/')) {
      return `${API_BASE_URL}${photoUrl}`;
    }
    return photoUrl;
  }

  // Track if the messages have already been shown
  let rewardShown = false;
  let resetShown = false;

  // Start polling on mount and check for milestone reward / streak reset
  onMount(() => {
    try {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const user = parsed?.user;
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
    
    // Check current value immediately
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
    if (rewardShown) return;
    rewardShown = true;
    
    milestoneReward = reward;
    showMilestoneReward = true;
    
    clearMilestoneReward();
    fetchMascot();
    
    if (milestoneTimeout) {
      clearTimeout(milestoneTimeout);
    }
    
    milestoneTimeout = setTimeout(() => {
      dismissMilestoneReward();
    }, 5000);
  }

  // Helper function to show streak reset message
  function showStreakResetMessage(reset: { previousStreak: number }) {
    if (resetShown) return;
    resetShown = true;
    
    streakResetInfo = reset;
    showStreakReset = true;
    
    clearStreakReset();
    
    if (streakResetTimeout) {
      clearTimeout(streakResetTimeout);
    }
    
    streakResetTimeout = setTimeout(() => {
      dismissStreakReset();
    }, 5000);
  }

  // Cleanup on destroy
  onDestroy(() => {
    if (pollInterval) clearInterval(pollInterval);
    if (milestoneTimeout) clearTimeout(milestoneTimeout);
    if (streakResetTimeout) clearTimeout(streakResetTimeout);
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

  // DB-based item IDs → gifs
  const groenyGifMap: Record<string, string> = {
    'hat-red-cap': '/src/lib/assets/images/groney-gif/redHat.gif',
    'hat-blue-cap': '/src/lib/assets/images/groney-gif/blueHat.gif',
    'acc-bow-tie': '/src/lib/assets/images/groney-gif/bowTie.gif',
    'acc-sunglasses': '/src/lib/assets/images/groney-gif/sunglasses.gif'
  };

  // State-based gifs
  const stateGifMap: Record<string, string> = {
    'normal': NormalGif,
    'sad': NormalGif,
    'sick': NormalGif,
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
    health >= 51 ? 'bg-emerald-500' :
    health >= 25 ? 'bg-amber-500' :
    'bg-red-500'
  );

  let healthTextColor = $derived(
    health >= 51 ? 'text-emerald-700 bg-emerald-100' :
    health >= 25 ? 'text-amber-700 bg-amber-100' :
    'text-red-700 bg-red-100'
  );

  function logout() {
    showLogoutModal = false;
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('auth');
    toast.success('Logged out successfully');
    goto('/login');
  }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- ============================================
       HEADER SECTION
       ============================================ -->
  <header class="flex justify-between items-center section-gap">
    <div class="badge-primary text-base">
      👋 Welcome{displayName ? `, ${displayName}` : ''}!
    </div>
    <div class="flex items-center gap-3">
      <BackgroundPicker />
      <Button variant="secondary" size="sm" onclick={() => showLogoutModal = true}>
        Logout
      </Button>
    </div>
  </header>

  <!-- ============================================
       TITLE & QUICK STATS
       ============================================ -->
  <section class="text-center section-gap">
    <h1 class="heading-1 mb-6">Groeny</h1>
    
    <!-- Level, Coins, Streak Badges -->
    <div class="flex justify-center flex-wrap gap-3">
      <Badge variant="accent" size="lg">🎖️ Level {level}</Badge>
      <Badge variant="accent" size="lg">🪙 {coins} Coins</Badge>
      <StreakWidget />
    </div>
  </section>

  <!-- ============================================
       MASCOT DISPLAY
       ============================================ -->
  <section class="flex flex-col items-center section-gap-lg">
    <!-- Mascot Avatar -->
    <div class="relative">
      <div 
        class="w-72 h-72 md:w-80 md:h-80 rounded-full bg-white flex items-center justify-center shadow-xl"
        style="border: 6px solid var(--color-primary);"
      >
        <img 
          src={groenySrc} 
          class="w-56 md:w-64 drop-shadow-lg" 
          alt="Groeny mascot" 
        />
      </div>
      
      <!-- State indicator -->
      {#if state === 'sad' || state === 'sick'}
        <div class="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Badge variant={state === 'sick' ? 'error' : 'warning'}>
            {state === 'sick' ? '🤒 Feeling sick' : '😢 Feeling sad'}
          </Badge>
        </div>
      {/if}
    </div>

    <!-- Health Badge -->
    <div class="mt-4">
      <span class="badge {healthTextColor} text-base font-bold px-6 py-2">
        ❤️ {health}% Health
      </span>
    </div>
  </section>

  <!-- ============================================
       XP PROGRESS BAR
       ============================================ -->
  <section class="section-gap">
    <div class="card max-w-md mx-auto">
      <div class="flex justify-between items-center mb-2">
        <span class="text-label">XP Progress</span>
        <span class="text-sm font-medium text-gray-600">Level {level}</span>
      </div>
      <div class="stat-bar">
        <div class="stat-bar-fill {healthColor}" style="width: {levelProgress.percentage}%"></div>
      </div>
      <div class="flex justify-between mt-2">
        <span class="text-helper">{levelProgress.current} XP</span>
        <span class="text-helper">{levelProgress.required} XP</span>
      </div>
    </div>
  </section>

  <!-- ============================================
       MASCOT STATS GRID
       ============================================ -->
  <section class="section-gap-lg">
    <h2 class="heading-3 text-center mb-6">Groeny's Needs</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        label="Thirst" 
        value={thirst} 
        icon="💧" 
        accentColor="var(--color-stat-thirst)"
      />
      <StatCard 
        label="Hunger" 
        value={hunger} 
        icon="🍎" 
        accentColor="var(--color-stat-hunger)"
      />
      <StatCard 
        label="Happiness" 
        value={happiness} 
        icon="🥰" 
        accentColor="var(--color-stat-happiness)"
      />
      <StatCard 
        label="Cleanliness" 
        value={cleanliness} 
        icon="🧹" 
        accentColor="var(--color-stat-cleanliness)"
      />
    </div>
  </section>

  <!-- ============================================
       ACTIVITY FEED
       ============================================ -->
  <section class="pb-20">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 class="heading-3">Recent Activities</h2>
      
      <!-- Filter Toggle -->
      <div class="bg-gray-100 p-1 rounded-xl inline-flex self-start sm:self-auto">
        <button 
          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 {activityFilter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => activityFilter = 'all'}
        >
          🏫 Class
        </button>
        <button 
          class="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 {activityFilter === 'mine' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => activityFilter = 'mine'}
        >
          👤 Mine
        </button>
      </div>
    </div>

    {#if isLoadingActivities}
      <!-- Loading Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each [1, 2] as _}
          <div class="card animate-pulse">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-gray-200"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div class="h-44 bg-gray-200 rounded-xl mb-3"></div>
            <div class="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        {/each}
      </div>
    {:else if activities.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each activities as activity}
          <article class="card-interactive">
            <!-- User & Mission Info -->
            <div class="flex items-center gap-3 mb-4">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style="background: var(--color-secondary-light); color: var(--color-secondary);"
              >
                {activity.userName?.charAt(0) || '?'}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 text-sm truncate">
                  <span style="color: var(--color-secondary);">{activity.userName}</span> completed
                </p>
                <p class="text-xs text-gray-500 truncate">{activity.missionTitle}</p>
              </div>
            </div>

            <!-- Photo -->
            <div class="overflow-hidden rounded-xl mb-3 bg-gray-100 relative group">
              {#if activity.imageUrl}
                <img 
                  src={resolvePhotoUrl(activity.imageUrl)} 
                  alt={activity.missionTitle} 
                  class="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              {:else}
                <div class="w-full h-44 flex items-center justify-center text-gray-400">
                  📷 No photo
                </div>
              {/if}
            </div>

            <!-- Date -->
            <p class="text-helper flex items-center gap-1">
              📅 {formatDate(activity.createdAt)}
            </p>
          </article>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="card text-center py-12" style="border: 2px dashed var(--color-border);">
        <p class="text-4xl mb-3">📭</p>
        <p class="font-medium text-gray-600 mb-1">No recent activities</p>
        {#if activityFilter === 'mine'}
          <p class="text-helper">Complete some missions to see them here!</p>
        {:else}
          <p class="text-helper">Be the first to complete a mission!</p>
        {/if}
      </div>
    {/if}
  </section>

  <!-- ============================================
       MILESTONE REWARD MODAL
       ============================================ -->
  {#if showMilestoneReward && milestoneReward}
    <div 
      class="modal-backdrop"
      onclick={dismissMilestoneReward}
      onkeydown={(e) => e.key === 'Escape' && dismissMilestoneReward()}
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <div 
        class="modal-content text-center animate-bounce-in max-w-sm"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="document"
        tabindex="-1"
      >
        <div class="p-8">
          <div class="text-6xl mb-4">🔥</div>
          <h2 class="heading-2 mb-2">{milestoneReward.streakDay}-day streak!</h2>
          <div class="mb-4">
            <Badge variant="accent" size="lg">🪙 +{milestoneReward.coinsEarned} coins</Badge>
          </div>
          <p class="text-gray-500 text-lg mb-6">{milestoneReward.message}</p>
          <Button onclick={dismissMilestoneReward} class="w-full">
            Awesome! 🎉
          </Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- ============================================
       STREAK RESET MODAL
       ============================================ -->
  {#if showStreakReset && streakResetInfo}
    <div 
      class="modal-backdrop"
      onclick={dismissStreakReset}
      onkeydown={(e) => e.key === 'Escape' && dismissStreakReset()}
      role="dialog"
      aria-modal="true"
      tabindex="0"
    >
      <div 
        class="modal-content text-center animate-bounce-in max-w-sm"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="document"
        tabindex="-1"
      >
        <div class="p-8">
          <div class="text-6xl mb-4">💪</div>
          <h2 class="heading-2 mb-2">Welcome back!</h2>
          <p class="text-gray-500 mb-4">Your streak has reset, but that's okay!</p>
          <div class="mb-4">
            <Badge variant="secondary">Previous: {streakResetInfo.previousStreak} days</Badge>
          </div>
          <p class="text-gray-600 text-lg mb-6">Let's start fresh together! 🌱</p>
          <Button onclick={dismissStreakReset} class="w-full">
            Let's go!
          </Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- ============================================
       LOGOUT MODAL
       ============================================ -->
  <LogoutModal 
    open={showLogoutModal} 
    onCancel={() => { showLogoutModal = false; }} 
    onConfirm={logout}
  />
  
  <ScrollToTopButton />
</div>
