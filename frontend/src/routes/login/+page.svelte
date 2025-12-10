<script lang="ts">
	import { login } from '$lib/auth/auth';

	let email = '';
	let password = '';
	let error = '';

	async function submit() {
		try {
			await login(email, password);
			window.location.href = '/dashboard';
		} catch (e: any) {
			error = e.message;
		}
	}
</script>

<form on:submit|preventDefault={submit}>
	<input bind:value={email} placeholder="Email" />
	<input type="password" bind:value={password} placeholder="Password" />
	<button type="submit">Login</button>
	{#if error}<p>{error}</p>{/if}
</form>
