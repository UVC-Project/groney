<script lang="ts">
  let title = 'Groeny - Green Schoolyard Gamification';
</script>

<div class="container mx-auto px-4 py-6">
  <div class="text-center mb-8">
    <h1 class="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-2">{title}</h1>
    <p class="text-lg md:text-2xl text-white drop-shadow">Welcome to your Green Schoolyard!</p>
  </div>

  <!-- Placeholder for mascot display -->
  <div class="bg-white rounded-game shadow-game-lg p-6 mb-6 text-center">
    <div class="text-6xl mb-4">🌱</div>
    <h2 class="text-2xl font-bold text-grass-green mb-2">Meet Groeny!</h2>
    <p class="text-gray-600">Your digital mascot is waiting for you...</p>
  </div>

  <!-- Placeholder for stats -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="bg-white rounded-card shadow-game p-4 border-l-4 border-stat-thirst">
      <div class="text-2xl mb-1">💧</div>
      <div class="text-sm text-gray-600">Thirst</div>
      <div class="text-xl font-bold">100</div>
    </div>
    <div class="bg-white rounded-card shadow-game p-4 border-l-4 border-stat-hunger">
      <div class="text-2xl mb-1">🍎</div>
      <div class="text-sm text-gray-600">Hunger</div>
      <div class="text-xl font-bold">100</div>
    </div>
    <div class="bg-white rounded-card shadow-game p-4 border-l-4 border-stat-happiness">
      <div class="text-2xl mb-1">😊</div>
      <div class="text-sm text-gray-600">Happiness</div>
      <div class="text-xl font-bold">100</div>
    </div>
    <div class="bg-white rounded-card shadow-game p-4 border-l-4 border-stat-cleanliness">
      <div class="text-2xl mb-1">✨</div>
      <div class="text-sm text-gray-600">Cleanliness</div>
      <div class="text-xl font-bold">100</div>
    </div>
  </div>

  <!-- Placeholder for activity feed -->
  <div class="bg-white rounded-game shadow-game-lg p-6">
    <h3 class="text-xl font-bold text-grass-green mb-4">Recent Activities</h3>
    <p class="text-gray-500 text-center py-4">No activities yet. Complete missions to see them here!</p>
  </div>
</div>
