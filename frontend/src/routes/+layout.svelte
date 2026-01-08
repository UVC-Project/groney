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

  let { children }: { children: Snippet } = $props();

  let isTeacherRoute = $derived(page.url.pathname.startsWith('/teacher'));
  let isAuthRoute = $derived(
    page.url.pathname.startsWith('/login') || page.url.pathname.startsWith('/register')
  );
  let showBottomNav = $derived(!isTeacherRoute && !isAuthRoute);

  // We can just use the store value directly with the $ syntax in the template or derived logic.
  // Converting store to state for derived usage:
  // However, mixing legacy stores and runes: best to just use $selectedBackground directly in derived.
  let isMobileNavVisible = $state(false); // Example state
  
  // Directly access store value automatically reactive
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
	});
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={showBottomNav}>
    {@render children()}
  </main>

  {#if showBottomNav}
    <BottomNav />
  {/if}
</div>
