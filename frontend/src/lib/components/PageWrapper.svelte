<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<div class="container mx-auto px-4 py-6">
  <h1 class="text-3xl font-bold text-white drop-shadow-lg mb-6 text-center">
    {title}
  </h1>

  <div class="bg-white rounded-game shadow-game-lg p-6 text-center">
    {@render children()}
  </div>
</div>
