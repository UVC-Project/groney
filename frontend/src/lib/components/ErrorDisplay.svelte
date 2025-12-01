<script lang="ts">
	let {
		message = 'Something went wrong',
		onRetry
	}: {
		message?: string;
		onRetry?: () => void;
	} = $props();
</script>

<div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
	<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
		<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	</div>
	<h3 class="text-lg font-semibold text-red-900 mb-2">Error</h3>
	<p class="text-sm text-red-700 mb-4">{message}</p>
	{#if onRetry}
		<button
			onclick={onRetry}
			class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
		>
			Try Again
		</button>
	{/if}
</div>
