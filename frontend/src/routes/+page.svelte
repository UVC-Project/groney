<script>
  import ScrollToTopButton from '$lib/components/ScrollToTop.svelte';
  import LogoutModal from '$lib/components/LogoutModal.svelte';
  import BackgroundPicker from '$lib/components/BackgroundPicker.svelte';
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/auth/context';

  let authed = false;
  // Only redirect on the client
  if (!authed) {
    goto('/login');
  }

  let showLogoutModal = false;

  function logout() {
    showLogoutModal = false;
  }
</script>

<!-- Main container -->
<div class="container mx-auto px-4 py-10">
  <!-- Welcome text + username -->
  <div class="flex justify-between items-center mb-6">
    <p
      class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white text-sm font-medium text-gray-800 shadow-lg"
    >
      Welcome, Boy!
    </p>
    <div class="flex items-center gap-4">
      <BackgroundPicker />
      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-300 text-sm font-medium text-gray-800 shadow-lg"
        on:click={() => (showLogoutModal = true)}>Logout</button
      >
    </div>
  </div>

  <!-- Title -->
  <h1 class="text-4xl md:text-6xl font-extrabold text-center text-gray-800 mb-4">Groeny</h1>

  <!-- Level + coins -->
  <div class="flex justify-center gap-3 mb-6">
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🎖️ 5</div>
    <div class="bg-yellow-300 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg">🪙 50</div>
  </div>

  <!-- Mascot circle -->
  <div class="flex justify-center mb-4">
    <div
      class="w-80 h-80 rounded-full border-8 border-sky-300 flex items-center justify-center bg-white shadow-lg"
    >
      <img src="/src/lib/assets/images/groeny.gif" class="w-64" alt="Groeny" />
    </div>
  </div>

  <!-- Health badge -->
  <div class="flex justify-center mb-6">
    <div class="bg-green-100 px-4 py-1 rounded-full font-semibold text-gray-800 text-sm shadow">
      100% Health
    </div>
  </div>

  <!-- XP Progress -->
  <div class="max-w-md mx-auto mb-10">
    <p class="text-gray-800 mb-1 text-sm">XP Progress</p>
    <div class="w-full bg-gray-200 rounded-full h-3 shadow-lg overflow-hidden">
      <div class="bg-green-500 h-full w-[85%]"></div>
    </div>
    <p class="text-right text-gray-800 text-sm mt-1">85 / 100</p>
  </div>

  <!-- Stats Row -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
    <!-- Thrist -->
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-blue-600">
      <div class="text-3xl mb-1">💧</div>
      <p class="text-gray-800 text-sm">THIRST</p>
      <p class="font-extrabold text-xl text-blue-600">100%</p>
    </div>

    <!-- Hunger -->
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-orange-500">
      <div class="text-3xl mb-1">🍎</div>
      <p class="text-gray-800 text-sm">HUNGER</p>
      <p class="font-extrabold text-xl text-orange-500">100%</p>
    </div>

    <!-- Happiness -->
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-sky-500">
      <div class="text-3xl mb-1">🥰</div>
      <p class="text-gray-800 text-sm">HAPPINESS</p>
      <p class="font-extrabold text-xl text-sky-500">100%</p>
    </div>

    <!-- Love -->
    <div class="bg-white rounded-3xl shadow-lg p-4 text-center border-b-4 border-pink-500">
      <div class="text-3xl mb-1">💖</div>
      <p class="text-gray-800 text-sm">LOVE</p>
      <p class="font-extrabold text-xl text-pink-500">100%</p>
    </div>
  </div>

  <!-- Recent activities -->
  <div class="max-w-5xl mx-auto mt-10">
    <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4">Recent activities</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <!-- Card 1 -->
      <article class="bg-white rounded-[32px] shadow-lg p-4 md:p-5 border-b-4 border-green-400">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm md:text-base">
          Boy completed Water the Flowers!
        </h3>

        <div class="overflow-hidden rounded-2xl mb-3">
          <img
            src="/src/lib/assets/images/water.jpg"
            alt="Water the Flowers"
            class="w-full h-44 md:h-56 object-cover"
          />
        </div>

        <p class="text-xs md:text-sm text-gray-800">23/11/2025</p>
      </article>

      <!-- Card 2 -->
      <article class="bg-white rounded-[32px] shadow-lg p-4 md:p-5 border-b-4 border-green-400">
        <h3 class="font-semibold text-gray-800 mb-3 text-sm md:text-base">
          Boy completed Harvest Vegetables!
        </h3>

        <div class="overflow-hidden rounded-2xl mb-3">
          <img
            src="/src/lib/assets/images/harvest.jpg"
            alt="Harvest Vegetables"
            class="w-full h-44 md:h-56 object-cover"
          />
        </div>

        <p class="text-xs md:text-sm text-gray-800">28/11/2025</p>
      </article>
    </div>
  </div>
  <LogoutModal
    open={showLogoutModal}
    onCancel={() => (showLogoutModal = false)}
    onConfirm={logout}
  />
  <ScrollToTopButton />
</div>
