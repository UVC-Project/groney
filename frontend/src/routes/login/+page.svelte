<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/stores/auth';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isLoading = true;

		const result = await auth.login(username, password);

		if (result.success) {
			// Get user role and redirect accordingly
			auth.subscribe((state) => {
				if (state.user?.role === 'TEACHER') {
					goto('/teacher');
				} else {
					goto('/');
				}
			})();
		} else {
			error = result.error || 'Login failed';
		}

		isLoading = false;
	}
</script>

<svelte:head>
	<title>Login - Green Schoolyard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
				<span class="text-4xl">🌱</span>
			</div>
			<h1 class="text-3xl font-bold text-slate-800">Welcome Back!</h1>
			<p class="text-slate-600 mt-2">Sign in to your Green Schoolyard account</p>
		</div>

		<!-- Login Form -->
		<div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
			<form onsubmit={handleSubmit} class="space-y-5">
				{#if error}
					<div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				{/if}

				<div>
					<label for="username" class="block text-sm font-semibold text-slate-700 mb-2">
						Username
					</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						required
						class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="Enter your username"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="Enter your password"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
				>
					{#if isLoading}
						<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					{:else}
						Sign In
					{/if}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-200 text-center">
				<p class="text-slate-600">
					Don't have an account?
				</p>
				<div class="flex gap-4 mt-3">
					<a
						href="/register?type=teacher"
						class="flex-1 py-2.5 px-4 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-all text-center"
					>
						I'm a Teacher
					</a>
					<a
						href="/register?type=student"
						class="flex-1 py-2.5 px-4 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all text-center"
					>
						I'm a Student
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
