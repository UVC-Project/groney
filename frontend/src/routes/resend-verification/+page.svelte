<script lang="ts">
  import { API_BASE_URL } from '$lib/config';

  let email = '';
  let message = '';
  let loading = false;

  async function submit() {
    loading = true;
    message = '';

    const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    message = data.message;
    loading = false;
  }
</script>

<div
  class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4"
>
  <div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-4">Resend verification email</h1>

    <p class="text-slate-600 text-center mb-6">
      Enter your email and we’ll resend the verification link.
    </p>

    <form on:submit|preventDefault={submit} class="space-y-4">
      <input
        type="email"
        bind:value={email}
        required
        placeholder="Your email address"
        class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
      />

      <button
        disabled={loading}
        class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600
				text-white font-semibold rounded-lg shadow-lg"
      >
        {loading ? 'Sending…' : 'Resend email'}
      </button>
    </form>

    {#if message}
      <p class="mt-4 text-sm text-emerald-700 text-center">
        {message}
      </p>
    {/if}

    <div class="mt-6 text-center">
      <a href="/login" class="text-emerald-600 font-semibold"> ← Back to login </a>
    </div>
  </div>
</div>
