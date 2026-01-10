<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';

  let loading = true;
  let saving = false;
  let message = '';

  let role: 'TEACHER' | 'STUDENT';

  let firstName = '';
  let lastName = '';
  let username = '';
  let email = '';
  let password = '';
  let currentPassword = '';

  onMount(async () => {
    const profile = await auth.getProfile();

    role = profile.role;
    firstName = profile.firstName;
    lastName = profile.lastName;
    username = profile.username;
    email = profile.email ?? '';

    loading = false;
  });

  async function save() {
    saving = true;
    message = '';

    const payload: any = {
      firstName,
      lastName,
      username,
    };

    if (role === 'TEACHER') {
      payload.email = email;
    }

    if (password.trim()) {
      payload.password = password;
      payload.currentPassword = currentPassword;
    }

    const res = await auth.updateProfile(payload);
    message = res.message ?? 'Profile updated';
    password = '';
    currentPassword = '';

    saving = false;
  }
</script>

<svelte:head>
  <title>My Profile - Green Schoolyard</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <h1 class="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-6 text-center tracking-tight">
    My Profile
  </h1>

  <div class="bg-white rounded-game shadow-game-lg p-6 max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <div
        class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30"
      >
        <span class="text-3xl">👤</span>
      </div>
      <p class="text-gray-500 text-sm">Update your personal information</p>
    </div>

    <!-- Form Container -->
      {#if loading}
        <p class="text-center text-slate-600">Loading profile…</p>
      {:else}
        <form on:submit|preventDefault={save} class="space-y-4">
          {#if message}
            <div
              class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm"
            >
              {message}
            </div>
          {/if}

          <!-- First name -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5"> First Name </label>
            <input
              bind:value={firstName}
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800
							focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
							outline-none transition-all"
            />
          </div>

          <!-- Last name -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5"> Last Name </label>
            <input
              bind:value={lastName}
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800
							focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
							outline-none transition-all"
            />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5"> Username </label>
            <input
              bind:value={username}
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800
							focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
							outline-none transition-all"
            />
          </div>

          <!-- Email (teacher only) -->
          {#if role === 'TEACHER'}
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5"> Email </label>
              <input
                type="email"
                bind:value={email}
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800
								focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
								outline-none transition-all"
              />
            </div>
          {/if}

          <!-- Current password -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">
              Current Password <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="password"
              bind:value={currentPassword}
              placeholder="Required to change password"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder:text-gray-400
		focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
		outline-none transition-all"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5">
              New Password <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="password"
              bind:value={password}
              placeholder="Leave blank to keep current"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-800 placeholder:text-gray-400
							focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
							outline-none transition-all"
            />
          </div>

          <!-- Save button -->
          <button
            type="submit"
            disabled={saving}
            class="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600
						text-white font-bold rounded-xl
						hover:from-emerald-600 hover:to-teal-700
						transition-all shadow-lg shadow-emerald-500/30
						disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      {/if}
  </div>
</div>
