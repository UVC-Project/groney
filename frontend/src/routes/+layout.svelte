<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen flex-col justify-between">
	<header class="flex items-center justify-between bg-orange-50 p-4">
		<h1 class="text-lg">Groney</h1>

		<nav class="flex gap-4">
			<a href="/" class="font-medium" class:text-green-500={$page.url.pathname === '/'}>Home</a>
		</nav>
	</header>

	<main>
		{@render children?.()}
	</main>

	<footer class="">
		<p class="p-2 text-center">Made with ❤️ by A.S.K</p>
	</footer>
</div>
