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
		'/verify-email'
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

  // ✅ ADDED: per-user key (must match the userId you log in pages)
  let userKey = $state('');

  // ✅ ADDED: per-user, per-page storage helpers
  function getSeenPagesKey(key: string) {
    return `groeny:intro_seen_pages:${key}`;
  }

  function readSeenPages(key: string): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(getSeenPagesKey(key));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeSeenPages(key: string, pages: Record<string, boolean>) {
    localStorage.setItem(getSeenPagesKey(key), JSON.stringify(pages));
  }

  function hasSeenPageIntro(key: string, path: string): boolean {
    const pages = readSeenPages(key);
    return pages[path] === true;
  }

  function markSeenPageIntro(key: string, path: string) {
    const pages = readSeenPages(key);
    pages[path] = true;
    writeSeenPages(key, pages);
  }

onMount(() => {
  const path = window.location.pathname;

  const unsub = user.subscribe((currentUser) => {
    // 1) redirect rules (reactive after login/logout)
    if (!currentUser && !isPublicRoute(path)) {
      goto('/login');
      return;
    }

    if (currentUser && isPublicRoute(path)) {
      goto('/');
      return;
    }

    // 2) compute student + name + userKey every time user changes
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

      // fallback to localStorage auth if needed (for name only)
      if (!studentName) {
        const authData = localStorage.getItem('auth');
        if (authData) {
          try {
            const parsed = JSON.parse(authData);
            const u = parsed?.user;
            studentName =
              u?.username ?? u?.name ?? u?.firstName ?? u?.email ?? '';
          } catch {}
        }
      }

      isStudent = role === 'STUDENT';

      const lsUserId = localStorage.getItem('userId') ?? '';

      let authUserId = '';
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          authUserId = parsed?.user?.id ?? '';
        } catch {}
      }

      userKey = (currentUser as any)?.id || lsUserId || authUserId || '';

    } catch (e) {
      console.warn('Intro user parse error:', e);
    }
  });

  return () => unsub();
});


  // ✅ show intro only once per page, per userId
  $effect(() => {
    const path = page.url.pathname;

    if (isAuthRoute) {
      showIntro = false;
      return;
    }

    // only for student + only if that page has intro content
    if (!isStudent || !pageIntros[path]) {
      showIntro = false;
      return;
    }

    // wait until we know the userId
    if (!userKey) {
      showIntro = false;
      return;
    }

    // ✅ only show if the user has not seen THIS page intro before
    showIntro = !hasSeenPageIntro(userKey, path);
  });
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={showBottomNav}>
    {@render children()}
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}

  <PageIntroModal
    open={showIntro}
    studentName={studentName}
    title={intro?.title ?? ''}
    subtitle={intro?.subtitle ?? ''}
    bullets={intro?.bullets ?? []}
    tipText={intro?.tipText ?? ''}
    emoji={intro?.emoji ?? '👋'}
    onClose={() => {
      const path = page.url.pathname;
      if (userKey) markSeenPageIntro(userKey, path);
      showIntro = false;
    }}
  />
</div>
