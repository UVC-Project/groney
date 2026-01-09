<script lang="ts">
  import { page } from '$app/stores';
  import { getSectorWikiContent, allSectorTypes } from '$lib/data/sectorWikiContent';
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  let sectorType = $derived($page.params.type?.toUpperCase() || '');
  let content = $derived(getSectorWikiContent(sectorType));

  // For accordion sections
  let openFacts = $state(true);
  let openActivities = $state(false);
  let openCare = $state(false);
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
