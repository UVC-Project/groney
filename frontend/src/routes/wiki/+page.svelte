<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  let openGroeny = $state(false);
  let openHowToPlay = $state(false);
  let openStats = $state(false);
  let coins = $state(false);
  let leaderBoard = $state(false);
</script>

<PageWrapper title="Wiki & Help">
  <!-- Header Section -->
  <div class="text-center mb-6">
    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-3 shadow-sm">
      <span class="text-3xl">📚</span>
    </div>
    <h2 class="text-lg md:text-xl font-bold text-emerald-600">Learn About Green Schoolyards</h2>
    <p class="text-gray-500 text-sm mt-1">Tap any topic to learn more!</p>
  </div>

  <!-- Accordion List -->
  <div class="space-y-3 text-left">

    <!-- Getting started -->
    <div class="card-accordion">
      <button 
        class="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 focus-visible:rounded-2xl" 
        onclick={() => (openGroeny = !openGroeny)}
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm shadow-green-500/20">
            <span class="text-lg text-white">🌱</span>
          </div>
          <h3 class="text-base font-bold text-gray-800">Getting Started</h3>
        </div>
        <span class={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${openGroeny ? 'rotate-90 bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>▶</span>
      </button>
      {#if openGroeny}
        <div class="px-4 pb-4 pt-1 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <p class="text-gray-600 text-sm leading-relaxed">
            Welcome to Green Schoolyards! Your class has Groeny, a special character that represents your entire schoolyard. By completing missions, you help Groeny grow healthy and strong. Work together as a team to keep all stats high!
          </p>
        </div>
      {/if}
    </div>

    <!-- How to care -->
    <div class="card-accordion">
      <button 
        class="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 focus-visible:rounded-2xl" 
        onclick={() => (openHowToPlay = !openHowToPlay)}
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm shadow-blue-500/20">
            <span class="text-lg text-white">💚</span>
          </div>
          <h3 class="text-base font-bold text-gray-800">How to Care for Groeny</h3>
        </div>
        <span class={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${openHowToPlay ? 'rotate-90 bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>▶</span>
      </button>
      {#if openHowToPlay}
        <div class="px-4 pb-4 pt-1 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <p class="text-gray-600 text-sm leading-relaxed">
            Groeny has four needs: Thirst 💧, Hunger 🍎, Happiness 🥰, and Cleanliness 🧹. Complete missions to boost these stats. The healthier Groeny is, the better your class score!
          </p>
        </div>
      {/if}
    </div>

    <!-- Completing Missions -->
    <div class="card-accordion">
      <button 
        class="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 focus-visible:rounded-2xl" 
        onclick={() => (openStats = !openStats)}
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
            <span class="text-lg text-white">🎯</span>
          </div>
          <h3 class="text-base font-bold text-gray-800">Completing Missions</h3>
        </div>
        <span class={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${openStats ? 'rotate-90 bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>▶</span>
      </button>
      {#if openStats}
        <div class="px-4 pb-4 pt-1 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <p class="text-gray-600 text-sm leading-relaxed">
            Find missions on the Map page by tapping on different schoolyard sectors. Most missions require a photo as proof. Take a clear photo showing what you did, then wait for your teacher to approve it!
          </p>
        </div>
      {/if}
    </div>

    <!-- Earning seeds & XP -->
    <div class="card-accordion">
      <button 
        class="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 focus-visible:rounded-2xl" 
        onclick={() => (coins = !coins)}
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-sm shadow-purple-500/20">
            <span class="text-lg text-white">⭐</span>
          </div>
          <h3 class="text-base font-bold text-gray-800">Earning Seeds & XP</h3>
        </div>
        <span class={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${coins ? 'rotate-90 bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>▶</span>
      </button>
      {#if coins}
        <div class="px-4 pb-4 pt-1 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <p class="text-gray-600 text-sm leading-relaxed">
            Every completed mission gives you XP (experience points) and seeds. XP helps Groeny level up, while seeds can be spent in the Shop on fun customizations or real schoolyard supplies!
          </p>
        </div>
      {/if}
    </div>

    <!-- Class Leaderboard -->
    <div class="card-accordion">
      <button 
        class="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 focus-visible:rounded-2xl" 
        onclick={() => (leaderBoard = !leaderBoard)}
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
            <span class="text-lg text-white">🏆</span>
          </div>
          <h3 class="text-base font-bold text-gray-800">Class Leaderboard</h3>
        </div>
        <span class={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${leaderBoard ? 'rotate-90 bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>▶</span>
      </button>
      {#if leaderBoard}
        <div class="px-4 pb-4 pt-1 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
          <p class="text-gray-600 text-sm leading-relaxed">
            Groeny's total health becomes your class score. Compete with other classes to see who takes the best care of their schoolyard. Work together to reach the top!
          </p>
        </div>
      {/if}
    </div>
  </div>
</PageWrapper>
