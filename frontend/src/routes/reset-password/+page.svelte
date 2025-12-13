<script lang="ts">
  import { page } from '$app/stores';
  import { resetPassword } from '$lib/auth/auth';
  import { goto } from '$app/navigation';

  let newPassword = '';
  let confirmPassword = '';
  let error = '';
  let success = '';

  $: token = $page.url.searchParams.get('token');

  async function submit() {
    error = '';
    success = '';

    if (!token) {
      error = 'Invalid reset link';
      return;
    }

    if (newPassword.length < 8) {
      error = 'Password must be at least 8 characters';
      return;
    }

    if (newPassword !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    try {
      await resetPassword(token, newPassword);
      success = 'Password reset successful!';
      setTimeout(() => goto('/login'), 1500);
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

<h1 class="text-2xl font-bold mb-4">Reset Password</h1>

{#if !token}
  <p class="text-red-600">Invalid or missing reset token.</p>
{:else}
  <form on:submit|preventDefault={submit} class="space-y-4 max-w-md">
    <input
      type="password"
      bind:value={newPassword}
      placeholder="New password"
      class="w-full border px-4 py-2 rounded"
    />

    <input
      type="password"
      bind:value={confirmPassword}
      placeholder="Confirm password"
      class="w-full border px-4 py-2 rounded"
    />

    <button class="w-full bg-green-500 text-white py-2 rounded"> Reset Password </button>

    {#if error}
      <p class="text-red-600">{error}</p>
    {/if}

    {#if success}
      <p class="text-green-600">{success}</p>
    {/if}
  </form>
{/if}
