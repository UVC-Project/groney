<script lang="ts">
  import PageWrapper from '$lib/components/PageWrapper.svelte';

  let openGroeny = false;
  let openHowToPlay = false;
  let openStats = false;
</script>

<PageWrapper title="Wiki & Help">
  <div class="text-6xl mb-4">📚</div>
  <h2 class="text-2xl font-bold text-green-500 mb-2">Learn About Green Schoolyards</h2>

  <div class="space-y-4 mt-6 text-left">

<!-- What is Groeny? -->
    <div class="border-l-4 border-grass-green pl-4">
      <button class="w-full flex items-center justify-between gap-2 py-2" on:click={() => (openGroeny = !openGroeny)}>
        <h3 class="font-bold text-lg text-gray-800">What is Groeny?</h3>
        <span class={`text-sm transition-transform duration-200 ${openGroeny ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openGroeny}
        <p class="text-gray-600 mt-1">
          Groeny is your digital mascot that represents your class's green schoolyard.
          Keep Groeny healthy by completing maintenance tasks!
        </p>
      {/if}
    </div>

<!-- How to Play -->
    <div class="border-l-4 border-sky-blue pl-4">
      <button class="w-full flex items-center justify-between gap-2 py-2" on:click={() => (openHowToPlay = !openHowToPlay)}>
        <h3 class="font-bold text-lg text-gray-800">How to Play</h3>
        <span class={`text-sm transition-transform duration-200 ${openHowToPlay ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openHowToPlay}
        <p class="text-gray-600 mt-1">
          Complete missions around your schoolyard, take photos as proof, and earn
          rewards to level up Groeny and unlock cool items!
        </p>
      {/if}
    </div>

<!-- Stats Explained -->
    <div class="border-l-4 border-sunshine-yellow pl-4">
      <button
        class="w-full flex items-center justify-between gap-2 py-2" on:click={() => (openStats = !openStats)}>
        <h3 class="font-bold text-lg text-gray-800">Stats Explained</h3>
        <span class={`text-sm transition-transform duration-200 ${openStats ? 'rotate-90' : 'rotate-0'}`}>▶️</span>
      </button>

      {#if openStats}
        <p class="text-gray-600 mt-1">
          Groeny has four stats: Thirst 💧, Hunger 🍎, Happiness 😊, and Cleanliness ✨.
          Complete missions to keep these stats high!
        </p>
      {/if}
    </div>
  </div>
</PageWrapper>
