<script lang="ts">
	let { variant = 'card', count = 1 }: { variant?: 'card' | 'list' | 'stat' | 'text'; count?: number } = $props();
</script>

{#if variant === 'card'}
	{#each Array(count) as _, i}
		<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 animate-pulse">
			<div class="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
			<div class="h-4 bg-slate-200 rounded w-full mb-2"></div>
			<div class="h-4 bg-slate-200 rounded w-5/6"></div>
		</div>
	{/each}
{:else if variant === 'list'}
	{#each Array(count) as _, i}
		<div class="flex items-center gap-4 p-4 bg-slate-50/80 rounded-xl animate-pulse">
			<div class="w-12 h-12 bg-slate-200 rounded-full"></div>
			<div class="flex-1">
				<div class="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
				<div class="h-3 bg-slate-200 rounded w-1/4"></div>
			</div>
		</div>
	{/each}
{:else if variant === 'stat'}
	{#each Array(count) as _, i}
		<div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/60 p-5 animate-pulse">
			<div class="flex items-center gap-3 mb-2">
				<div class="w-10 h-10 bg-slate-200 rounded-lg"></div>
				<div class="h-3 bg-slate-200 rounded w-16"></div>
			</div>
			<div class="h-8 bg-slate-200 rounded w-20"></div>
		</div>
	{/each}
{:else if variant === 'text'}
	{#each Array(count) as _, i}
		<div class="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
	{/each}
{/if}

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
