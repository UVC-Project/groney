<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { selectedBackground } from '$lib/stores/backgroundTheme';

  $: bgClass = $selectedBackground.className;
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class="pb-20">
    <slot />
  </main>

  <BottomNav />
</div>