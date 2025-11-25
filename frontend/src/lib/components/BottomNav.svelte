<script lang="ts">
  import { page } from '$app/stores';

  const navItems = [
    { href: '/', label: 'Home', icon: '🏡' },
    { href: '/map', label: 'Map', icon: '🧭' },
    { href: '/shop', label: 'Shop', icon: '🛒' },
    { href: '/wardrobe', label: 'Wardrobe', icon: '👔' },
    { href: '/wiki', label: 'Wiki', icon: '📚' },
  ];

  $: currentPath = $page.url.pathname;
</script>

<nav
  class="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-green-500 shadow-game-lg z-50"
  style="padding-bottom: env(safe-area-inset-bottom);"
>
  <div class="flex justify-around items-center h-16">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center min-w-touch-target min-h-touch-target px-2 transition-colors"
        class:text-black={currentPath === item.href}
        class:font-bold={currentPath === item.href}
        class:text-gray-600={currentPath !== item.href}
      >
        <span class="text-2xl mb-1">{item.icon}</span>
        <span class="text-xs">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
