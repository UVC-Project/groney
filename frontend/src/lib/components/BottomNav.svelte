<script lang="ts">
  import { page } from '$app/state';
  import { isTeacher } from '$lib/stores/auth';

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
  class="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] shadow-lg z-50"
  style="border-color: var(--color-primary); padding-bottom: env(safe-area-inset-bottom);"
>
  <div class="flex justify-around items-center h-16">
    {#each navItems as item}
      {@const isActive = currentPath === item.href}
      <a
        href={item.href}
        class="relative flex flex-col items-center justify-center min-w-touch-target min-h-touch-target px-2 transition-all duration-200 group"
        aria-current={isActive ? 'page' : undefined}
      >
        <!-- Active indicator -->
        {#if isActive}
          <span 
            class="absolute -top-[3px] left-1/2 -translate-x-1/2 w-10 h-1 rounded-b-full"
            style="background: var(--color-primary);"
          ></span>
        {/if}
        
        <span 
          class="text-2xl mb-0.5 transition-transform duration-200 {isActive ? 'scale-110' : 'group-hover:scale-105'}"
        >
          {item.icon}
        </span>
        <span 
          class="text-xs font-medium transition-colors {isActive ? 'text-emerald-600 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}"
        >
          {item.label}
        </span>
      </a>
    {/each}
  </div>
</nav>
