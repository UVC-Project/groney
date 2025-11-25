<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let activeTab = $state<'overview' | 'missions' | 'submissions' | 'map'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'missions' as const, label: 'Missions', icon: '🎯' },
    { id: 'submissions' as const, label: 'Submissions', icon: '📝' },
    { id: 'map' as const, label: 'Map', icon: '🗺️' },
  ];

  function handleLogout() {
    // TODO: Implement logout functionality
    window.location.href = '/';
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 font-teacher">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
    <div class="container mx-auto px-4 lg:px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span class="text-white text-xl">🌱</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              Teacher Dashboard
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Welcome, John!
            </p>
          </div>
        </div>
        <button
          onclick={handleLogout}
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all min-h-touch-target flex-shrink-0 hover:shadow-md"
          aria-label="Logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Tab Navigation -->
  <nav class="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 sticky top-[72px] z-30">
    <div class="container mx-auto px-4 lg:px-6">
      <div class="flex gap-1 overflow-x-auto scrollbar-hide">
        {#each tabs as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="relative flex items-center gap-2 px-4 sm:px-6 py-3.5 font-medium transition-all min-h-touch-target whitespace-nowrap group"
            class:text-emerald-600={activeTab === tab.id}
            class:text-slate-600={activeTab !== tab.id}
            class:hover:text-slate-900={activeTab !== tab.id}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span class="text-lg transition-transform group-hover:scale-110">{tab.icon}</span>
            <span class="text-sm sm:text-base font-semibold">{tab.label}</span>
            {#if activeTab === tab.id}
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="container mx-auto px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
    {#if activeTab === 'overview'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Class Overview</h2>
        <p class="text-slate-600">Overview content coming soon...</p>
      </div>
    {:else if activeTab === 'missions'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Missions</h2>
        <p class="text-slate-600">Missions content coming soon...</p>
      </div>
    {:else if activeTab === 'submissions'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Pending Submissions</h2>
        <p class="text-slate-600">Submissions content coming soon...</p>
      </div>
    {:else if activeTab === 'map'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Schoolyard Map</h2>
        <p class="text-slate-600">Map content coming soon...</p>
      </div>
    {/if}
  </main>
</div>
