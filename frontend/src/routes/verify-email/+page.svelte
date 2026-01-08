<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let message = 'Verifying your email…';

	onMount(async () => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			message = 'Invalid verification link';
			return;
		}

		try {
			const res = await fetch(
				`http://localhost:3000/api/auth/verify-email?token=${encodeURIComponent(token)}`
			);

			const data = await res.json();
			message = data.message ?? 'Verification completed';
		} catch (err) {
			message = 'Verification failed';
		}
	});
</script>


<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md text-center">
		<h1 class="text-2xl font-bold mb-4">Email Verification</h1>
		<p class="text-slate-600">{message}</p>

		<a href="/login" class="mt-6 inline-block text-emerald-600 font-semibold">
			Go to login
		</a>
	</div>
</div>
