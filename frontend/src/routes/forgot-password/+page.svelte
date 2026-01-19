<script lang="ts">
	import { auth } from '$lib/stores/auth';

	let email = '';
	let message = '';
	let loading = false;

	async function submit() {
		loading = true;
		message = '';
		const res = await auth.requestPasswordReset(email);
		message = res.message ?? '';
		loading = false;
	}
</script>

<svelte:head>
	<title>Forgot Password - Green Schoolyard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		
		<!-- Header -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
				<span class="text-4xl">🌱</span>
			</div>
			<h1 class="text-3xl font-bold text-slate-800">Forgot your password?</h1>
			<p class="text-slate-600 mt-2">
				No worries — we’ll send you a reset link
			</p>
		</div>

		<!-- Card -->
		<div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
			<form on:submit|preventDefault={submit} class="space-y-5">

				<!-- Info / success message -->
				{#if message}
					<div class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
						{message}
					</div>
				{/if}

				<!-- Email -->
				<div>
					<label
						for="email"
						class="block text-sm font-semibold text-slate-700 mb-2"
					>
						Email address
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						required
						placeholder="Enter your registered email"
						class="w-full px-4 py-3 border border-slate-300 rounded-lg
						focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
						outline-none transition-all"
					/>
				</div>

				<!-- Button -->
				<button
					type="submit"
					disabled={loading}
					class="btn-primary w-full"
				>
					{#if loading}
						<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Sending…
					{:else}
						Send reset link
					{/if}
				</button>
			</form>

			<!-- Back to login -->
			<div class="mt-6 pt-6 border-t border-slate-200 text-center">
				<a
					href="/login"
					class="text-emerald-600 font-semibold hover:text-emerald-700 transition"
				>
					← Back to login
				</a>
			</div>
		</div>
	</div>
</div>
