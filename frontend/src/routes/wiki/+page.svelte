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

  <div class="space-y-2 text-left">

<!-- Getting started -->
    <div class="border-l-4 border-grass-green pl-4 py-1">
      <button class="w-full flex items-center justify-between gap-2 py-2" onclick={() => (openGroeny = !openGroeny)}>
        <h3 class="text-base font-bold text-gray-800">Getting Started</h3>
        <span class={`text-sm transition-transform duration-200 ${openGroeny ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openGroeny}
        <p class="text-gray-600 text-sm leading-relaxed pb-2">
          Welcome to Green Schoolyards! Your class has Groeny, a special character that represents your entire schoolyard. By completing missions, you help Groeny grow healthy and strong. Work together as a team to keep all stats high!
        </p>
      {/if}
    </div>

<!-- How to care -->
    <div class="border-l-4 border-sky-blue pl-4 py-1">
      <button class="w-full flex items-center justify-between gap-2 py-2" onclick={() => (openHowToPlay = !openHowToPlay)}>
        <h3 class="text-base font-bold text-gray-800">How to Care for Groeny</h3>
        <span class={`text-sm transition-transform duration-200 ${openHowToPlay ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openHowToPlay}
        <p class="text-gray-600 text-sm leading-relaxed pb-2">
          Groeny has four needs: Thirst 💧, Hunger 🍎, Happiness 🥰, and Love 💖. Complete missions to boost these stats. Tap Groeny to give it love and increase happiness! The healthier Groeny is, the better your class score.
        </p>
      {/if}
    </div>

<!-- Completing Missions -->
    <div class="border-l-4 border-sunshine-yellow pl-4 py-1">
      <button
        class="w-full flex items-center justify-between gap-2 py-2" onclick={() => (openStats = !openStats)}>
        <h3 class="text-base font-bold text-gray-800">Completing Missions</h3>
        <span class={`text-sm transition-transform duration-200 ${openStats ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openStats}
        <p class="text-gray-600 text-sm leading-relaxed pb-2">
          Find missions on the Map page by tapping on different schoolyard sectors. Most missions require a photo as proof that you completed the work. Take a clear photo showing what you did, then wait for your teacher to approve it!
        </p>
      {/if}
    </div>

<!-- Earning coins & Xp -->
    <div class="border-l-4 border-red-500 pl-4 py-1">
      <button
        class="w-full flex items-center justify-between gap-2 py-2" onclick={() => (coins = !coins)}>
        <h3 class="text-base font-bold text-gray-800">Earning Coins & XP</h3>
        <span class={`text-sm transition-transform duration-200 ${coins ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if coins}
        <p class="text-gray-600 text-sm leading-relaxed pb-2">
          Every completed mission gives you XP (experience points) and coins. XP helps Groeny level up, while coins can be spent in the Shop on fun customizations or real schoolyard supplies. The more missions you complete, the more you earn!
        </p>
      {/if}
    </div>

<!-- Class Leaderboard -->
    <div class="border-l-4 border-orange-500 pl-4 py-1">
      <button
        class="w-full flex items-center justify-between gap-2 py-2" onclick={() => (leaderBoard = !leaderBoard)}>
        <h3 class="text-base font-bold text-gray-800">Class Leaderboard</h3>
        <span class={`text-sm transition-transform duration-200 ${leaderBoard ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if leaderBoard}
        <p class="text-gray-600 text-sm leading-relaxed pb-2">
          Groeny's total health becomes your class score. Compete with other classes to see who takes the best care of their schoolyard. Work together to reach the top!
        </p>
      {/if}
    </div>
  </div>
</PageWrapper>
