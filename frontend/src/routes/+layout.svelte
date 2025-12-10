<script lang="ts">
  import '../app.css';
  import BottomNav from '$lib/components/BottomNav.svelte';
  import { page } from '$app/stores';
  import { selectedBackground } from '$lib/stores/backgroundTheme';

  $: isTeacherRoute = $page.url.pathname.startsWith('/teacher');
  $: bgClass = $selectedBackground.className;

  	import { getUser } from '$lib/auth/user';

	let user = getUser();
</script>

<div class={`min-h-screen ${bgClass}`}>
  <main class:pb-20={!isTeacherRoute}>
    <h1>Welcome, {user?.username}!</h1>
<p>Your role: {user?.role}</p>
<p>Class ID: {user?.classId}</p>
    <slot />
  </main>

  {#if !isTeacherRoute}
    <BottomNav />
  {/if}
</div>
