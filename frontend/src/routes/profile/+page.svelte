<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';

  let loading = $state(true);
  let saving = $state(false);
  let message = $state('');
  let messageType = $state<'success' | 'error'>('success');

  let role = $state<'TEACHER' | 'STUDENT'>('STUDENT');

  let firstName = $state('');
  let lastName = $state('');
  let username = $state('');
  let email = $state('');
  let password = $state('');
  let currentPassword = $state('');

  onMount(async () => {
    try {
      const profile = await auth.getProfile();

      role = profile.role;
      firstName = profile.firstName;
      lastName = profile.lastName;
      username = profile.username;
      email = profile.email ?? '';
    } catch (e) {
      message = "Couldn't load your profile. Try refreshing!";
      messageType = 'error';
    } finally {
      loading = false;
    }
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

    try {
      const res = await auth.updateProfile(payload);
      message = res.message ?? 'Changes saved! ✨';
      messageType = 'success';
      password = '';
      currentPassword = '';
    } catch (e) {
      message = "Couldn't save changes. Try again!";
      messageType = 'error';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>My Profile - Green Schoolyard</title>
</svelte:head>

<div class="container mx-auto px-4 py-6 max-w-4xl">
  <h1 class="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-6 text-center tracking-tight">
    My Profile
  </h1>

  <div class="card-playful max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="relative inline-block">
        <div class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-200 opacity-50 blur-sm"></div>
        <div class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <span class="text-3xl">👤</span>
        </div>
      </div>
      <h2 class="text-lg font-bold text-gray-800 mt-3">Your Information</h2>
      <p class="text-gray-500 text-sm">Update your personal details below</p>
    </div>

    <!-- Form Container -->
      {#if loading}
        <div class="surface-info text-center py-8">
          <div class="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-slate-600">Loading profile…</p>
        </div>
      {:else}
        <form onsubmit={(e) => { e.preventDefault(); save(); }} class="space-y-4">
          {#if message}
            <div class={messageType === 'success' ? 'feedback-box-success' : 'feedback-box-error'}>
              <span class="text-lg">{messageType === 'success' ? '✅' : '😅'}</span>
              <span>{message}</span>
            </div>
          {/if}

          <!-- Name Fields -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <span class="text-xs">👋</span> First Name
              </label>
              <input
                bind:value={firstName}
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800
                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                outline-none transition-all"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5"> Last Name </label>
              <input
                bind:value={lastName}
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800
                focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
                outline-none transition-all"
              />
            </div>
          </div>

          <!-- Username -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
              <span class="text-xs">@</span> Username
            </label>
            <input
              bind:value={username}
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800
							focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
							outline-none transition-all"
            />
          </div>

          <!-- Email (teacher only) -->
          {#if role === 'TEACHER'}
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                <span class="text-xs">📧</span> Email
              </label>
              <input
                type="email"
                bind:value={email}
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800
								focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
								outline-none transition-all"
              />
            </div>
          {/if}

          <!-- Password Section -->
          <div class="surface-info !p-4 space-y-3">
            <p class="text-sm font-bold text-gray-700 flex items-center gap-1">
              <span>🔒</span> Change Password <span class="text-gray-400 font-normal text-xs">(optional)</span>
            </p>
            
            <input
              type="password"
              bind:value={currentPassword}
              placeholder="Current password"
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400
              focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
              outline-none transition-all bg-white"
            />
            
            <input
              type="password"
              bind:value={password}
              placeholder="New password"
              class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400
							focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
							outline-none transition-all bg-white"
            />
          </div>

          <!-- Save button -->
          <button
            type="submit"
            disabled={saving}
            class="btn-primary w-full mt-2"
          >
            {#if saving}
              <span class="spinner"></span>
              <span>Saving...</span>
            {:else}
              <span>💾</span>
              <span>Save Changes</span>
            {/if}
          </button>
        </form>
      {/if}
  </div>
</div>
