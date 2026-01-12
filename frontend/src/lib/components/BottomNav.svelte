<script lang="ts">
  import { page } from '$app/state';
  import { isTeacher } from '$lib/stores/auth';

  // New order: Shop, Wardrobe, Map, Home (center), Supplies, Wiki, Profile
  const studentNavItems = [
    { href: '/shop', label: 'Shop', iconId: 'shop' },
    { href: '/wardrobe', label: 'Wardrobe', iconId: 'wardrobe' },
    { href: '/map', label: 'Map', iconId: 'map' },
    { href: '/', label: 'Home', iconId: 'home', isCenter: true },
    { href: '/supplies', label: 'Supplies', iconId: 'supplies' },
    { href: '/wiki', label: 'Wiki', iconId: 'wiki' },
    { href: '/profile', label: 'Profile', iconId: 'profile' },
  ];

  const teacherNavItems = [
    { href: '/shop', label: 'Shop', iconId: 'shop' },
    { href: '/map', label: 'Map', iconId: 'map' },
    { href: '/', label: 'Home', iconId: 'home', isCenter: true },
    { href: '/teacher', label: 'Dashboard', iconId: 'dashboard' },
    { href: '/wiki', label: 'Wiki', iconId: 'wiki' },
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

  function isActive(href: string): boolean {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  }
</script>

<nav
  class="dock-container fixed bottom-0 left-0 right-0 z-50 flex justify-center px-3 pb-2"
  style="padding-bottom: max(env(safe-area-inset-bottom), 8px);"
>
  <div class="dock">
    {#each navItems as item}
      {@const active = isActive(item.href)}
      <a
        href={item.href}
        class="dock-item"
        class:active
        class:center-item={item.isCenter}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
      >
        <div class="dock-icon" class:center-icon={item.isCenter}>
          {#if item.iconId === 'home'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          {:else if item.iconId === 'map'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          {:else if item.iconId === 'shop'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          {:else if item.iconId === 'supplies'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          {:else if item.iconId === 'wardrobe'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
            </svg>
          {:else if item.iconId === 'wiki'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          {:else if item.iconId === 'profile'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          {:else if item.iconId === 'dashboard'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          {/if}
        </div>
        <span class="dock-label">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .dock-container {
    pointer-events: none;
  }

  .dock {
    pointer-events: auto;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 22px;
    padding: 6px 10px 8px;
    box-shadow: 
      0 2px 20px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }

  .dock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 8px 4px;
    border-radius: 14px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    min-width: 44px;
    color: #6b7280;
  }

  .dock-item:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .dock-item:active {
    transform: scale(0.95);
  }

  .dock-item.active {
    color: #10b981;
  }

  .dock-item.active .dock-icon {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
  }

  .dock-item.center-item {
    margin: 0 4px;
  }

  .dock-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 5px;
  }

  .dock-icon svg {
    width: 100%;
    height: 100%;
  }

  .dock-icon.center-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  }

  .dock-item.active .dock-icon.center-icon {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  .dock-label {
    font-size: 10px;
    font-weight: 600;
    margin-top: 3px;
    white-space: nowrap;
    transition: color 0.2s;
  }

  .dock-item.active .dock-label {
    color: #10b981;
  }

  /* Focus styles for accessibility */
  .dock-item:focus {
    outline: none;
  }

  .dock-item:focus-visible {
    outline: 2px solid #10b981;
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .dock-item,
    .dock-icon {
      transition: none;
    }
  }

  /* Smaller screens - tighter spacing */
  @media (max-width: 380px) {
    .dock {
      gap: 0;
      padding: 5px 6px 6px;
    }
    .dock-item {
      padding: 5px 5px 3px;
      min-width: 38px;
    }
    .dock-icon {
      width: 28px;
      height: 28px;
    }
    .dock-icon.center-icon {
      width: 34px;
      height: 34px;
    }
    .dock-label {
      font-size: 9px;
    }
  }
</style>
