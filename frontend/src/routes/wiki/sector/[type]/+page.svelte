<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getSectorWikiContent, allSectorTypes } from '$lib/data/sectorWikiContent';
  import PageWrapper from '$lib/components/PageWrapper.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let sectorType = $derived($page.params.type?.toUpperCase() || '');
  let content = $derived(getSectorWikiContent(sectorType));

  // Missions from the load function
  let missions = $derived(data.missions || []);
  let isLoggedIn = $derived(data.isLoggedIn || false);

  // For accordion sections
  let openFacts = $state(true);
  let openActivities = $state(false);
  let openCare = $state(false);
  let openMissions = $state(true);

  // Get status display info
  function getMissionStatusDisplay(status: string) {
    switch (status) {
      case 'available':
        return { label: 'Available', color: 'bg-green-100 text-green-700', icon: '🎯' };
      case 'my_active':
        return { label: 'Your Mission', color: 'bg-blue-100 text-blue-700', icon: '📋' };
      case 'taken':
        return { label: 'In Progress', color: 'bg-orange-100 text-orange-700', icon: '🔒' };
      case 'cooldown':
        return { label: 'Cooldown', color: 'bg-gray-100 text-gray-600', icon: '⏱️' };
      case 'max_reached':
        return { label: 'Completed', color: 'bg-purple-100 text-purple-700', icon: '✅' };
      default:
        return { label: 'Available', color: 'bg-green-100 text-green-700', icon: '🎯' };
    }
  }

  function goToMap() {
    goto('/map');
  }
</script>

<svelte:head>
  <title>{content?.title || 'Sector Wiki'} - Groney</title>
</svelte:head>

{#if content}
  <div class="min-h-screen" style="background: linear-gradient(135deg, {content.color}15 0%, white 50%, {content.color}10 100%);">
    <div class="max-w-2xl mx-auto px-4 py-6 pb-24">
      <!-- Hero Section -->
      <div class="text-center mb-8">
        <div 
          class="text-8xl mb-4 animate-bounce"
          style="animation-duration: 2s;"
        >
          {content.emoji}
        </div>
        <h1 class="text-3xl font-bold mb-2" style="color: {content.color};">
          {content.title}
        </h1>
        <p class="text-lg text-gray-600 italic">
          {content.subtitle}
        </p>
      </div>

      <!-- Introduction Card -->
      <div 
        class="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4"
        style="border-color: {content.color};"
      >
        <p class="text-gray-700 text-lg leading-relaxed">
          {content.introduction}
        </p>
      </div>

      <!-- Did You Know Highlight -->
      <div 
        class="rounded-2xl p-6 mb-6 text-white"
        style="background: linear-gradient(135deg, {content.color} 0%, {content.color}dd 100%);"
      >
        <div class="flex items-start gap-3">
          <span class="text-3xl">💡</span>
          <div>
            <h3 class="font-bold text-lg mb-2">Did You Know?</h3>
            <p class="text-white/95 leading-relaxed">
              {content.didYouKnow}
            </p>
          </div>
        </div>
      </div>

      <!-- Fun Facts Accordion -->
      <div class="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <button 
          class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
          onclick={() => openFacts = !openFacts}
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎯</span>
            <h2 class="text-xl font-bold text-gray-800">Fun Facts</h2>
          </div>
          <span class={`text-xl transition-transform duration-300 ${openFacts ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </button>
        
        {#if openFacts}
          <div class="px-5 pb-5 space-y-3">
            {#each content.funFacts as fact, i}
              <div 
                class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                style="animation: slideIn 0.3s ease-out {i * 0.1}s both;"
              >
                <span 
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style="background-color: {content.color};"
                >
                  {i + 1}
                </span>
                <p class="text-gray-700 pt-1">{fact}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Activities Accordion -->
      <div class="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <button 
          class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
          onclick={() => openActivities = !openActivities}
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎮</span>
            <h2 class="text-xl font-bold text-gray-800">Activities</h2>
          </div>
          <span class={`text-xl transition-transform duration-300 ${openActivities ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </button>
        
        {#if openActivities}
          <div class="px-5 pb-5 space-y-4">
            {#each content.activities as activity, i}
              <div 
                class="p-4 rounded-xl border-2 hover:shadow-md transition-shadow"
                style="border-color: {content.color}30; animation: slideIn 0.3s ease-out {i * 0.1}s both;"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-3xl">{activity.emoji}</span>
                  <h3 class="font-bold text-gray-800">{activity.title}</h3>
                </div>
                <p class="text-gray-600 ml-12">{activity.description}</p>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Care Guide Accordion -->
      <div class="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
        <button 
          class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
          onclick={() => openCare = !openCare}
        >
          <div class="flex items-center gap-3">
            <span class="text-2xl">🌱</span>
            <h2 class="text-xl font-bold text-gray-800">{content.careGuide.title}</h2>
          </div>
          <span class={`text-xl transition-transform duration-300 ${openCare ? 'rotate-180' : ''}`}>
            ⬇️
          </span>
        </button>
        
        {#if openCare}
          <div class="px-5 pb-5">
            <ul class="space-y-3">
              {#each content.careGuide.steps as step, i}
                <li 
                  class="flex items-center gap-3 p-3 rounded-xl bg-green-50"
                  style="animation: slideIn 0.3s ease-out {i * 0.1}s both;"
                >
                  <span class="text-xl">✅</span>
                  <span class="text-gray-700">{step}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Related Missions Section -->
      {#if isLoggedIn}
        <div class="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <button 
            class="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            onclick={() => openMissions = !openMissions}
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">🎯</span>
              <h2 class="text-xl font-bold text-gray-800">Missions Here</h2>
              {#if missions.length > 0}
                <span class="px-2 py-0.5 text-xs font-bold rounded-full text-white" style="background-color: {content.color};">
                  {missions.length}
                </span>
              {/if}
            </div>
            <span class={`text-xl transition-transform duration-300 ${openMissions ? 'rotate-180' : ''}`}>
              ⬇️
            </span>
          </button>
          
          {#if openMissions}
            <div class="px-5 pb-5">
              {#if missions.length > 0}
                <div class="space-y-3">
                  {#each missions as mission, i}
                    {@const statusDisplay = getMissionStatusDisplay(mission.missionStatus || 'available')}
                    <button
                      onclick={goToMap}
                      class="w-full text-left p-4 rounded-xl border-2 hover:shadow-md transition-all hover:scale-[1.01]"
                      style="border-color: {content.color}30; animation: slideIn 0.3s ease-out {i * 0.1}s both;"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <h3 class="font-bold text-gray-800">{mission.title}</h3>
                            <span class="px-2 py-0.5 text-xs font-semibold rounded-full {statusDisplay.color}">
                              {statusDisplay.icon} {statusDisplay.label}
                            </span>
                          </div>
                          <p class="text-gray-600 text-sm line-clamp-2">{mission.description}</p>
                          {#if mission.sectorName}
                            <p class="text-xs text-gray-400 mt-1">📍 {mission.sectorName}</p>
                          {/if}
                        </div>
                        <div class="flex flex-col items-end gap-1 flex-shrink-0">
                          <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            ⭐ +{mission.xpReward} XP
                          </span>
                          <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                            🪙 +{mission.coinReward}
                          </span>
                        </div>
                      </div>
                    </button>
                  {/each}
                </div>
                <p class="text-center text-sm text-gray-500 mt-4">
                  Tap a mission to go to the map and start it! 🗺️
                </p>
              {:else}
                <div class="text-center py-6">
                  <div class="text-4xl mb-3">🔍</div>
                  <p class="text-gray-600">No missions available in this sector right now.</p>
                  <p class="text-sm text-gray-400 mt-1">Check back later or ask your teacher!</p>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {:else}
        <!-- Not logged in - show login prompt -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-200">
          <div class="flex items-start gap-4">
            <span class="text-3xl">🔐</span>
            <div>
              <h3 class="font-bold text-gray-800 mb-1">Want to see missions?</h3>
              <p class="text-gray-600 text-sm mb-3">
                Log in to see available missions for this sector and start helping your schoolyard!
              </p>
              <a 
                href="/login" 
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                <span>🚀</span>
                <span>Log In</span>
              </a>
            </div>
          </div>
        </div>
      {/if}

      <!-- Back to Map Link -->
      <div class="text-center">
        <a 
          href="/map" 
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          style="background-color: {content.color};"
        >
          <span>🗺️</span>
          <span>Back to the map</span>
        </a>
      </div>
    </div>
  </div>
{:else}
  <PageWrapper title="Sector not found">
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🤔</div>
      <h2 class="text-2xl font-bold text-gray-700 mb-4">Oops! We don't know this sector.</h2>
      <p class="text-gray-500 mb-6">
        Try one of these sectors:
      </p>
      <div class="flex flex-wrap justify-center gap-2">
        {#each allSectorTypes as type}
          <a 
            href="/wiki/sector/{type.toLowerCase()}"
            class="px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            {type}
          </a>
        {/each}
      </div>
    </div>
  </PageWrapper>
{/if}

<style>
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
