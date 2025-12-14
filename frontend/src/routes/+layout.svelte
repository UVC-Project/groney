<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';
  import { selectedBackground } from '$lib/stores/backgroundTheme';

  $: isTeacherRoute = $page.url.pathname.startsWith('/teacher');
  $: isAuthRoute = $page.url.pathname.startsWith('/login') || $page.url.pathname.startsWith('/register');
  $: showBottomNav = !isTeacherRoute && !isAuthRoute;
  $: bgClass = $selectedBackground.className;
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={showBottomNav}>
    <slot />
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}
</div>
