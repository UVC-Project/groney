<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children: Snippet;
  }

  let { title, children }: Props = $props();
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <h1 class="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-6 text-center tracking-tight">
    {title}
  </h1>

  <div class="bg-white rounded-game shadow-game-lg p-6">
    {@render children()}
  </div>
</div>
