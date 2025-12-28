<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/state';
  import { selectedBackground } from '$lib/stores/backgroundTheme';
  import { get } from 'svelte/store';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let isTeacherRoute = $derived(page.url.pathname.startsWith('/teacher'));
  let isAuthRoute = $derived(page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/register'));
  let showBottomNav = $derived(!isTeacherRoute && !isAuthRoute);
  
  let bgValue = $state(get(selectedBackground));
  
  $effect(() => {
    const unsubscribe = selectedBackground.subscribe(value => {
      bgValue = value;
    });
    return unsubscribe;
  });
  
  let bgClass = $derived(bgValue.className);
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={showBottomNav}>
    {@render children()}
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}
</div>
