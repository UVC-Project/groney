<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';
  import { selectedBackground } from '$lib/stores/backgroundTheme';

  $: isTeacherRoute = $page.url.pathname.startsWith('/teacher');
  $: bgClass = $selectedBackground.className;
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={!isTeacherRoute}>
    <slot />
  </main>

  {#if !isTeacherRoute}
    <BottomNav />
  {/if}
</div>
