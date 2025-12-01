<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
</script>

<div class="min-h-screen bg-gradient-to-b from-sky-blue-light to-grass-green-light">
  <!-- Main content area with bottom padding for nav -->
  <main class="pb-20">
    <slot />
  </main>

  <!-- Bottom navigation -->
  <BottomNav />
</div>
