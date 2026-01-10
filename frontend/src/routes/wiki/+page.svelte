<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  let openGroeny = $state(false);
  let openHowToPlay = $state(false);
  let openStats = $state(false);
  let coins = $state(false);
  let leaderBoard = $state(false);
</script>

<PageWrapper title="Wiki & Help">
  <div class="text-center mb-6">
    <div class="text-5xl mb-3">📚</div>
    <h2 class="text-lg md:text-xl font-bold text-green-600">Learn About Green Schoolyards</h2>
  </div>

  <div class="space-y-3 text-left">

<!-- Getting started -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        class="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]" 
        onclick={() => (openGroeny = !openGroeny)}
      >
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-grass-green rounded-full"></span>
          <h3 class="text-base font-bold text-gray-800">Getting Started</h3>
        </div>
        <span class={`text-sm transition-transform duration-200 ${openGroeny ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>
      {#if openGroeny}
        <p class="text-gray-600 text-sm leading-relaxed px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          Welcome to Green Schoolyards! Your class has Groeny, a special character that represents your entire schoolyard. By completing missions, you help Groeny grow healthy and strong. Work together as a team to keep all stats high!
        </p>
      {/if}
    </div>

<!-- How to care -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        class="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]" 
        onclick={() => (openHowToPlay = !openHowToPlay)}
      >
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-sky-blue rounded-full"></span>
          <h3 class="text-base font-bold text-gray-800">How to Care for Groeny</h3>
        </div>
        <span class={`text-sm transition-transform duration-200 ${openHowToPlay ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>
      {#if openHowToPlay}
        <p class="text-gray-600 text-sm leading-relaxed px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          Groeny has four needs: Thirst 💧, Hunger 🍎, Happiness 🥰, and Love 💖. Complete missions to boost these stats. Tap Groeny to give it love and increase happiness! The healthier Groeny is, the better your class score.
        </p>
      {/if}
    </div>

<!-- Completing Missions -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        class="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]" 
        onclick={() => (openStats = !openStats)}
      >
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-sunshine-yellow rounded-full"></span>
          <h3 class="text-base font-bold text-gray-800">Completing Missions</h3>
        </div>
        <span class={`text-sm transition-transform duration-200 ${openStats ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>
      {#if openStats}
        <p class="text-gray-600 text-sm leading-relaxed px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          Find missions on the Map page by tapping on different schoolyard sectors. Most missions require a photo as proof that you completed the work. Take a clear photo showing what you did, then wait for your teacher to approve it!
        </p>
      {/if}
    </div>

<!-- Earning coins & Xp -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        class="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]" 
        onclick={() => (coins = !coins)}
      >
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-red-500 rounded-full"></span>
          <h3 class="text-base font-bold text-gray-800">Earning Coins & XP</h3>
        </div>
        <span class={`text-sm transition-transform duration-200 ${coins ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>
      {#if coins}
        <p class="text-gray-600 text-sm leading-relaxed px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          Every completed mission gives you XP (experience points) and coins. XP helps Groeny level up, while coins can be spent in the Shop on fun customizations or real schoolyard supplies. The more missions you complete, the more you earn!
        </p>
      {/if}
    </div>

<!-- Class Leaderboard -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        class="w-full flex items-center justify-between gap-2 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[52px]" 
        onclick={() => (leaderBoard = !leaderBoard)}
      >
        <div class="flex items-center gap-3">
          <span class="w-1.5 h-8 bg-orange-500 rounded-full"></span>
          <h3 class="text-base font-bold text-gray-800">Class Leaderboard</h3>
        </div>
        <span class={`text-sm transition-transform duration-200 ${leaderBoard ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>
      {#if leaderBoard}
        <p class="text-gray-600 text-sm leading-relaxed px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          Groeny's total health becomes your class score. Compete with other classes to see who takes the best care of their schoolyard. Work together to reach the top!
        </p>
      {/if}
    </div>
  </div>
</PageWrapper>
