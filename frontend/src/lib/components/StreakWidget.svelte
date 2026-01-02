<script lang="ts">
	import { userStreak, isStudent } from '$lib/stores/auth';

	// Get streak from store
	let streak = $derived($userStreak);
	let studentUser = $derived($isStudent);

	// Computed values
	let currentStreak = $derived(streak?.current ?? 0);
	let longestStreak = $derived(streak?.longest ?? 0);
	let isBroken = $derived(streak?.broken ?? false);
</script>

{#if studentUser}
	{#if !streak}
		<!-- No streak data yet -->
		<div class="bg-gray-300 px-4 py-1 rounded-full font-bold text-gray-600 shadow-lg">
			🔥 --
		</div>
	{:else if isBroken}
		<!-- Broken steak -->
		<div class="bg-gray-300 px-4 py-1 rounded-full font-bold text-gray-500 shadow-lg" title="Streak reset! Log in daily to rebuild">
			💔 {currentStreak}
		</div>
	{:else}
		<!-- Active streak -->
		<div class="bg-orange-400 px-4 py-1 rounded-full font-bold text-gray-800 shadow-lg" title="Best: {longestStreak} days">
			🔥 {currentStreak}
		</div>
	{/if}
{/if}

