<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    backHref?: string;
    children: Snippet;
  }

  let { title, subtitle, backHref, children }: Props = $props();
</script>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <!-- Back button if provided -->
  {#if backHref}
    <a
      href={backHref}
      class="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors group font-medium"
    >
      <span class="text-xl group-hover:-translate-x-1 transition-transform">←</span>
      <span>Back</span>
    </a>
  {/if}

  <!-- Page Header -->
  <header class="text-center mb-6">
    <h1 class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
      {title}
    </h1>
    {#if subtitle}
      <p class="text-white/80 mt-2 text-lg">{subtitle}</p>
    {/if}
  </header>

  <!-- Content Card -->
  <div class="card text-center">
    {@render children()}
  </div>
</div>
