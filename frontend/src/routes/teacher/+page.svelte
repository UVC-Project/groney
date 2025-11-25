<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let activeTab = $state<'overview' | 'missions' | 'submissions' | 'map'>('overview');
  let isCreateClassDialogOpen = $state(false);
  let copySuccess = $state(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'missions' as const, label: 'Missions', icon: '🎯' },
    { id: 'submissions' as const, label: 'Submissions', icon: '📝' },
    { id: 'map' as const, label: 'Map', icon: '🗺️' },
  ];

  // Mock data - will be replaced with actual data from load function
  const mockClassData = {
    name: '6A',
    school: 'Middelburg School',
    classCode: 'VC3TYW',
    mascot: {
      level: 1,
      xp: 85,
      coins: 25,
    },
    students: [
      { id: '1', firstName: 'John', lastName: 'Doe', username: 'johndoe', role: 'teacher' as const },
      { id: '2', firstName: 'Ashley', lastName: 'Smith', username: 'asmith', role: 'student' as const },
      { id: '3', firstName: 'asmith', lastName: 'kia', username: 'spongebob', role: 'student' as const },
    ],
  };

  function handleLogout() {
    // TODO: Implement logout functionality
    window.location.href = '/';
  }

  function copyClassCode() {
    navigator.clipboard.writeText(mockClassData.classCode).then(() => {
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    });
  }

  function openCreateClassDialog() {
    isCreateClassDialogOpen = true;
  }

  function closeCreateClassDialog() {
    isCreateClassDialogOpen = false;
  }

  function handleCreateClass(event: Event) {
    event.preventDefault();
    // TODO: Implement class creation
    console.log('Create class');
    closeCreateClassDialog();
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 font-teacher">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
    <div class="container mx-auto px-4 lg:px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span class="text-white text-xl">🌱</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              Teacher Dashboard
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Welcome, John!
            </p>
          </div>
        </div>
        <button
          onclick={handleLogout}
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all min-h-touch-target flex-shrink-0 hover:shadow-md"
          aria-label="Logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Tab Navigation -->
  <nav class="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 sticky top-[72px] z-30">
    <div class="container mx-auto px-4 lg:px-6">
      <div class="flex gap-1 overflow-x-auto scrollbar-hide">
        {#each tabs as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="relative flex items-center gap-2 px-4 sm:px-6 py-3.5 font-medium transition-all min-h-touch-target whitespace-nowrap group"
            class:text-emerald-600={activeTab === tab.id}
            class:text-slate-600={activeTab !== tab.id}
            class:hover:text-slate-900={activeTab !== tab.id}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span class="text-lg transition-transform group-hover:scale-110">{tab.icon}</span>
            <span class="text-sm sm:text-base font-semibold">{tab.label}</span>
            {#if activeTab === tab.id}
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="container mx-auto px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
    {#if activeTab === 'overview'}
      <div class="space-y-6">
        <!-- Class Info Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 text-white/90 text-sm font-medium mb-1">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>{mockClassData.name}</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-white truncate">{mockClassData.school}</h2>
              </div>
              <button
                onclick={openCreateClassDialog}
                class="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all min-h-touch-target border border-white/20 flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Class</span>
              </button>
            </div>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-200 flex-1 sm:flex-initial">
                <code class="text-blue-900 font-mono text-base sm:text-lg font-bold tracking-wider">{mockClassData.classCode}</code>
              </div>
              <button
                onclick={copyClassCode}
                class="p-2.5 hover:bg-slate-100 rounded-lg transition-colors min-h-touch-target flex items-center justify-center gap-2 sm:gap-0"
                aria-label="Copy class code"
              >
                {#if copySuccess}
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm text-emerald-600 sm:hidden">Copied!</span>
                {:else}
                  <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-slate-600 sm:hidden">Copy</span>
                {/if}
              </button>
            </div>
            <p class="text-sm text-slate-600">Share this code with students to join your class</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <!-- Students Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Students</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-blue-600">{mockClassData.students.length}</p>
          </div>

          <!-- Mascot Level Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Level</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-emerald-600">{mockClassData.mascot.level}</p>
          </div>

          <!-- Total XP Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Total XP</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-purple-600">{mockClassData.mascot.xp}</p>
          </div>

          <!-- Coins Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Coins</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-amber-600">{mockClassData.mascot.coins}</p>
          </div>
        </div>

        <!-- Students List -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div class="px-4 sm:px-6 py-5 border-b border-slate-200/60">
            <h3 class="text-lg font-bold text-slate-800">Students</h3>
            <p class="text-sm text-slate-600 mt-1">
              {mockClassData.students.length} student{mockClassData.students.length !== 1 ? 's' : ''} in your class
            </p>
          </div>
          <div class="p-4 sm:p-6 space-y-3">
            {#each mockClassData.students as student}
              <div class="flex items-center justify-between p-3 sm:p-4 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                  <p class="text-sm text-slate-500 truncate">@{student.username}</p>
                </div>
                <span
                  class="px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2"
                  class:bg-emerald-100={student.role === 'teacher'}
                  class:text-emerald-700={student.role === 'teacher'}
                  class:bg-blue-100={student.role === 'student'}
                  class:text-blue-700={student.role === 'student'}
                >
                  {student.role}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if activeTab === 'missions'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Missions</h2>
        <p class="text-slate-600">Missions content coming soon...</p>
      </div>
    {:else if activeTab === 'submissions'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Pending Submissions</h2>
        <p class="text-slate-600">Submissions content coming soon...</p>
      </div>
    {:else if activeTab === 'map'}
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Schoolyard Map</h2>
        <p class="text-slate-600">Map content coming soon...</p>
      </div>
    {/if}
  </main>
</div>

<!-- Create Class Dialog -->
{#if isCreateClassDialogOpen}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeCreateClassDialog}
    onkeydown={(e) => e.key === 'Escape' && closeCreateClassDialog()}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="0"
    >
      <div class="px-6 py-5 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h2 id="dialog-title" class="text-xl font-bold text-slate-800">Create New Class</h2>
          <button
            onclick={closeCreateClassDialog}
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-1">Add another class to manage</p>
      </div>

      <form onsubmit={handleCreateClass} class="p-6 space-y-5">
        <div>
          <label for="class-name" class="block text-sm font-semibold text-slate-700 mb-2">
            Class Name
          </label>
          <input
            type="text"
            id="class-name"
            name="className"
            placeholder="e.g., Grade 5B"
            required
            minlength="2"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 2 characters</p>
        </div>

        <div>
          <label for="school-name" class="block text-sm font-semibold text-slate-700 mb-2">
            School Name
          </label>
          <input
            type="text"
            id="school-name"
            name="schoolName"
            placeholder="e.g., Amsterdam Primary"
            required
            minlength="2"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 2 characters</p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={closeCreateClassDialog}
            class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors min-h-touch-target"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 min-h-touch-target"
          >
            Create Class
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
