<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';

  // Hide bottom nav on teacher routes
  $: isTeacherRoute = $page.url.pathname.startsWith('/teacher');
</script>

<div class="min-h-screen" class:bg-gradient-to-b={!isTeacherRoute} class:from-sky-blue-light={!isTeacherRoute} class:to-grass-green-light={!isTeacherRoute}>
  <!-- Main content area with bottom padding for nav (only for student routes) -->
  <main class:pb-20={!isTeacherRoute}>
    <slot />
  </main>

  <!-- Bottom navigation (hidden on teacher routes) -->
  {#if !isTeacherRoute}
    <BottomNav />
  {/if}
</div>
  import { selectedBackground } from '$lib/stores/backgroundTheme';

  $: bgClass = $selectedBackground.className;
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class="pb-20">
    <slot />
  </main>

  <BottomNav />
</div>
