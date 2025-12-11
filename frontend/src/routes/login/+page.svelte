<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/auth/auth';

  let activeTab: 'login' | 'teacher' | 'student' = 'login';

  let loginUsername = '';
  let loginPassword = '';
  let loginError = '';

  let tFirst = '';
  let tLast = '';
  let tUsername = '';
  let tPassword = '';
  let tClassCode = '';
  let tSchool = '';
  let teacherError = '';

  let sFirst = '';
  let sLast = '';
  let sUsername = '';
  let sPassword = '';
  let sClassCode = '';
  let studentError = '';

  function switchTab(tab: any) {
    activeTab = tab;
    loginError = teacherError = studentError = '';
  }

  async function submitLogin() {
    try {
      await login(loginUsername, loginPassword);
      goto('/');
    } catch (e: any) {
      loginError = e.message || 'Login failed';
    }
  }
</script>

<div
  class="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-green-100 p-6"
>
  <div class="w-full max-w-md bg-white rounded-[28px] shadow-xl p-10">
    <div class="flex justify-center mb-4">
      <div class="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center">
        <span class="text-4xl text-blue-700">🍃</span>
      </div>
    </div>

    <h1 class="text-3xl font-extrabold text-center text-gray-800">Green Schoolyards</h1>
    <p class="text-center text-gray-600 mb-8">
      Help your class mascot grow by caring for your schoolyard!
    </p>

    <div class="flex bg-gray-200 rounded-full p-1 mb-8">
      <button
        on:click={() => switchTab('login')}
        class="flex-1 py-2 rounded-full text-center
				{activeTab === 'login' ? 'bg-white font-semibold shadow-sm' : 'text-gray-600'}"
      >
        Login
      </button>

      <button
        on:click={() => switchTab('teacher')}
        class="flex-1 py-2 rounded-full text-center
				{activeTab === 'teacher' ? 'bg-white font-semibold shadow-sm' : 'text-gray-600'}"
      >
        👩‍🏫 Teacher
      </button>

      <button
        on:click={() => switchTab('student')}
        class="flex-1 py-2 rounded-full text-center
				{activeTab === 'student' ? 'bg-white font-semibold shadow-sm' : 'text-gray-600'}"
      >
        Student
      </button>
    </div>

    {#if activeTab === 'login'}
      <form on:submit|preventDefault={submitLogin} class="space-y-4">
        <label class="text-gray-700 font-semibold">Username</label>
        <input
          bind:value={loginUsername}
          placeholder="Enter your username"
          class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
        />

        <label class="text-gray-700 font-semibold">Password</label>
        <input
          type="password"
          bind:value={loginPassword}
          placeholder="Enter your password"
          class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
        />

        <button
          type="submit"
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
        >
          Login
        </button>

        {#if loginError}
          <p class="text-red-600 text-center">{loginError}</p>
        {/if}
      </form>
    {/if}

    {#if activeTab === 'teacher'}
      <div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="text-gray-700 font-semibold">First Name</label>
            <input
              bind:value={tFirst}
              placeholder="First name"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
            />
          </div>

          <div class="flex-1">
            <label class="text-gray-700 font-semibold">Last Name</label>
            <input
              bind:value={tLast}
              placeholder="Last name"
              class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
            />
          </div>
        </div>

        <div>
          <label class="text-gray-700 font-semibold">Username</label>
          <input
            bind:value={tUsername}
            placeholder="Choose a username"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="text-gray-700 font-semibold">Password</label>
          <input
            type="password"
            bind:value={tPassword}
            placeholder="At least 6 characters"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="text-gray-700 font-semibold">Class Name</label>
          <input
            bind:value={tClassCode}
            placeholder="e.g., Grade 3A"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label class="text-gray-700 font-semibold">School Name</label>
          <input
            bind:value={tSchool}
            placeholder="e.g., Amsterdam Primary"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
        >
          Create Teacher Account
        </button>

        {#if teacherError}
          <p class="text-red-600 text-center">{teacherError}</p>
        {/if}
      </div>
    {/if}

    {#if activeTab === 'student'}
      <div class="space-y-4">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="text-gray-700 font-semibold">First Name</label>
            <input
              bind:value={sFirst}
              placeholder="First name"
              class="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>

          <div class="flex-1">
            <label class="text-gray-700 font-semibold">Last Name</label>
            <input
              bind:value={sLast}
              placeholder="Last name"
              class="w-full border border-gray-300 rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <div>
          <label class="text-gray-700 font-semibold">Username</label>
          <input
            bind:value={sUsername}
            placeholder="Choose a username"
            class="w-full border border-gray-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label class="text-gray-700 font-semibold">Password</label>
          <input
            type="password"
            bind:value={sPassword}
            placeholder="At least 6 characters"
            class="w-full border border-gray-300 rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label class="font-semibold text-gray-700">Class Code</label>
          <input
            bind:value={sClassCode}
            placeholder="ASK YOUR TEACHER FOR THE CODE"
            class="w-full border border-gray-300 rounded-xl px-4 py-3 uppercase tracking-wider text-gray-500"
          />
        </div>

        <button
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition"
        >
          Join Class
        </button>

        {#if studentError}
          <p class="text-red-600 text-center">{studentError}</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
