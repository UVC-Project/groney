<script lang="ts">
  import { requestPasswordReset } from '$lib/auth/auth';

  let email = '';
  let error = '';
  let loading = false;

  async function submit() {
    error = '';
    loading = true;

    try {
      await requestPasswordReset(email);

    } catch (err: any) {
      error = 'Something went wrong. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<h1 class="text-2xl font-bold mb-4">Forgot Password</h1>

<form on:submit|preventDefault={submit} class="space-y-4 max-w-md">
  <input
    type="email"
    bind:value={email}
    placeholder="Enter your teacher email"
    required
    class="w-full border px-4 py-2 rounded"
  />

  <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded" disabled={loading}>
    {loading ? 'Sending...' : 'Request Reset'}
  </button>

  {#if error}
    <p class="text-red-600">{error}</p>
  {/if}
</form>
