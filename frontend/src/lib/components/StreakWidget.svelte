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
		<span class="badge bg-gray-200 text-gray-500 text-base font-bold px-4 py-2">
			🔥 --
		</span>
	{:else if isBroken}
		<!-- Broken streak -->
		<span 
			class="badge bg-gray-200 text-gray-500 text-base font-bold px-4 py-2" 
			title="Streak reset! Log in daily to rebuild"
		>
			💔 {currentStreak}
		</span>
	{:else}
		<!-- Active streak -->
		<span 
			class="badge text-base font-bold px-4 py-2 shadow-sm"
			style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white;"
			title="Best: {longestStreak} days"
		>
			🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
		</span>
	{/if}
{/if}

