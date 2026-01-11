<script lang="ts">
  import { page } from '$app/state';
  import { isTeacher } from '$lib/stores/auth';
  import { get } from 'svelte/store';

  const studentNavItems = [
    { href: '/', label: 'Home', icon: '🏡' },
    { href: '/map', label: 'Map', icon: '🧭' },
    { href: '/shop', label: 'Shop', icon: '🛒' },
    { href: '/supplies', label: 'Supplies', icon: '🧤' },
    { href: '/wardrobe', label: 'Wardrobe', icon: '👔' },
    { href: '/wiki', label: 'Wiki', icon: '📚' },
  ];

  const teacherNavItems = [
    { href: '/', label: 'Home', icon: '🏡' },
    { href: '/teacher', label: 'Dashboard', icon: '📊' },
    { href: '/map', label: 'Map', icon: '🧭' },
    { href: '/wiki', label: 'Wiki', icon: '📚' },
  ];

  let currentPath = $derived(page.url.pathname);
  let isTeacherValue = $state(false);
  
  $effect(() => {
    const unsubscribe = isTeacher.subscribe(value => {
      isTeacherValue = value;
    });
    return unsubscribe;
  });
  
  let navItems = $derived(isTeacherValue ? teacherNavItems : studentNavItems);
</script>

<nav
  class="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-green-500 shadow-game-lg z-50"
  style="padding-bottom: env(safe-area-inset-bottom);"
>
  <div class="flex justify-around items-center h-20">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center justify-center min-w-touch-target min-h-touch-target px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:rounded-lg"
        class:text-black={currentPath === item.href}
        class:font-bold={currentPath === item.href}
        class:text-gray-600={currentPath !== item.href}
      >
        <span class="text-3xl mb-1.5">{item.icon}</span>
        <span class="text-sm">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>
