<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/state';
  import { selectedBackground } from '$lib/stores/backgroundTheme';
  import { get } from 'svelte/store';
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth';

  // ✅ ADDED
  import PageIntroModal from '$lib/components/PageIntroModal.svelte';
  import { pageIntros } from '$lib/config/pageIntros';

  let { children }: { children: Snippet } = $props();

  let isTeacherRoute = $derived(page.url.pathname.startsWith('/teacher'));
  let isAuthRoute = $derived(
    page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/register')
  );
  let showBottomNav = $derived(!isTeacherRoute && !isAuthRoute);

  let isMobileNavVisible = $state(false);
  let bgClass = $derived($selectedBackground.className);

  const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ];

  const AUTH_ONLY_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ];

  function isPublicRoute(path: string) {
    return PUBLIC_ROUTES.some(
      (route) => path === route || path.startsWith(route + '/')
    );
  }

  // ✅ ADDED: intro modal state
  let showIntro = $state(false);
  let studentName = $state('');
  let isStudent = $state(false);
  let intro = $derived(pageIntros[page.url.pathname]);

  onMount(() => {
    const currentUser = get(user);
    const path = window.location.pathname;

    if (!currentUser && !isPublicRoute(path)) {
      goto('/login');
      return;
    }

    if (currentUser && isPublicRoute(path)) {
      goto('/');
    }

    // ✅ ADDED: determine student + name for intros
    try {
      const role = (
        (currentUser as any)?.role ??
        localStorage.getItem('role') ??
        ''
      ).toString().toUpperCase();

      studentName =
        (currentUser as any)?.username ??
        (currentUser as any)?.name ??
        (currentUser as any)?.firstName ??
        (currentUser as any)?.email ??
        '';

      // fallback to localStorage auth if needed
      if (!studentName) {
        const authData = localStorage.getItem('auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          const u = parsed?.user;
          studentName =
            u?.username ?? u?.name ?? u?.firstName ?? u?.email ?? '';
        }
      }

      isStudent = role === 'STUDENT';
    } catch (e) {
      console.warn('Intro user parse error:', e);
    }
  });

  // ✅ ADDED: show intro per page (map/shop/wardrobe/wiki/...)
  $effect(() => {
    const path = page.url.pathname;

    if (isAuthRoute) {
      showIntro = false;
      return;
    }

    if (isStudent && pageIntros[path]) {
      showIntro = true;
    } else {
      showIntro = false;
    }
  });
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={showBottomNav}>
    {@render children()}
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}

  <!-- ✅ ADDED -->
  <PageIntroModal
    open={showIntro}
    studentName={studentName}
    title={intro?.title ?? ''}
    subtitle={intro?.subtitle ?? ''}
    bullets={intro?.bullets ?? []}
    tipText={intro?.tipText ?? ''}
    emoji={intro?.emoji ?? '👋'}
    onClose={() => (showIntro = false)}
  />
</div>
