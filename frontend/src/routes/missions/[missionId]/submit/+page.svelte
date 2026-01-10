<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { API_BASE_URL } from '$lib/config';
  import { auth } from '$lib/stores/auth';
  import { get } from 'svelte/store';

  let { data }: { data: PageData } = $props();

  // Photo upload state
  let selectedFile = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);
  let description = $state('');
  let isDragOver = $state(false);
  
  // Submission state
  let isSubmitting = $state(false);
  let errorMessage = $state('');
  let successMessage = $state('');

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function processFile(file: File) {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      errorMessage = 'File too large. Maximum size is 5MB.';
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errorMessage = 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.';
      return;
    }
    
    errorMessage = '';
    selectedFile = file;
    
    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    previewUrl = URL.createObjectURL(file);
  }

  function removePhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    selectedFile = null;
    previewUrl = null;
    errorMessage = '';
  }

  async function handleSubmit() {
    if (!selectedFile || !data.submissionId) {
      errorMessage = 'Please select a photo to upload';
      return;
    }

    isSubmitting = true;
    errorMessage = '';

    try {
      const authState = get(auth);
      
      // Build FormData
      const formData = new FormData();
      formData.append('photo', selectedFile);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      // Upload photo
      const response = await fetch(
        `${API_BASE_URL}/api/student/submissions/${data.submissionId}/upload`,
        {
          method: 'POST',
          headers: {
            'x-user-id': authState.user?.id || '',
            'x-user-role': authState.user?.role || '',
            ...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {}),
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload photo');
      }

      successMessage = 'Photo uploaded! Your submission is pending review. 🎉';
      
      // Redirect to map after short delay
      setTimeout(() => {
        goto('/map');
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      errorMessage = err instanceof Error ? err.message : 'Failed to upload photo. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function goBackToMap() {
    goto('/map');
  }

  // Cleanup preview URL on unmount
  $effect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  });
</script>

<div class="container mx-auto px-4 py-6 max-w-lg">
  <!-- Back Button -->
  <button
    onclick={goBackToMap}
    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold mb-4 transition-all active:scale-[0.98] min-h-[44px]"
  >
    <span class="text-lg">←</span>
    <span>Back to Map</span>
  </button>

  <!-- Main Card -->
  <div class="bg-white rounded-3xl shadow-xl overflow-hidden animate-slide-up">
    <!-- Header -->
    <div class="px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-2xl">📸</span>
        <h1 class="text-xl font-bold text-white">Submit Mission</h1>
      </div>
      <p class="text-emerald-100 text-sm">Complete your task and upload proof!</p>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- Mission Info Section -->
      <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <h2 class="font-bold text-lg text-slate-800 mb-2">{data.mission.title}</h2>
        <p class="text-slate-600 text-sm leading-relaxed">{data.mission.description}</p>
      </div>

      <!-- Rewards Section -->
      <div>
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rewards</h3>
        <div class="flex flex-wrap gap-2">
          <span class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
            <span>⭐</span> +{data.mission.xpReward} XP
          </span>
          <span class="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold flex items-center gap-1.5 shadow-sm">
            <span>🪙</span> +{data.mission.coinReward} Coins
          </span>
        </div>

        <!-- Mascot Boosts -->
        {#if data.mission.thirstBoost || data.mission.hungerBoost || data.mission.happinessBoost || data.mission.cleanlinessBoost}
          <div class="flex flex-wrap gap-2 mt-3">
            {#if data.mission.thirstBoost}
              <span class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                💧 +{data.mission.thirstBoost}
              </span>
            {/if}
            {#if data.mission.hungerBoost}
              <span class="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium">
                🍎 +{data.mission.hungerBoost}
              </span>
            {/if}
            {#if data.mission.happinessBoost}
              <span class="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-medium">
                😊 +{data.mission.happinessBoost}
              </span>
            {/if}
            {#if data.mission.cleanlinessBoost}
              <span class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium">
                ✨ +{data.mission.cleanlinessBoost}
              </span>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Error Message -->
      {#if errorMessage}
        <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ❌ {errorMessage}
        </div>
      {/if}

      <!-- Success Message -->
      {#if successMessage}
        <div class="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          ✅ {successMessage}
        </div>
      {/if}

      <!-- Photo Upload Section -->
      <div>
        <h3 class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Photo Proof</h3>
        
        {#if previewUrl}
          <!-- Photo Preview -->
          <div class="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-emerald-50">
            <img 
              src={previewUrl} 
              alt="Mission proof preview" 
              class="w-full h-48 object-cover"
            />
            <button
              onclick={removePhoto}
              disabled={isSubmitting}
              class="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm disabled:opacity-50"
              aria-label="Remove photo"
            >
              ✕
            </button>
            <div class="absolute bottom-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
              📷 {selectedFile?.name}
            </div>
          </div>
        {:else}
          <!-- Upload Area -->
          <label
            class="block relative cursor-pointer"
            ondrop={handleDrop}
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onchange={handleFileSelect}
              class="sr-only"
            />
            <div 
              class="border-2 border-dashed rounded-2xl p-8 text-center transition-all
                {isDragOver 
                  ? 'border-emerald-400 bg-emerald-50 scale-[1.02]' 
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}"
            >
              <div class="text-4xl mb-3">📷</div>
              <p class="font-medium text-slate-700 mb-1">Tap to upload photo</p>
              <p class="text-xs text-slate-500">or drag and drop your image here</p>
              <p class="text-xs text-slate-400 mt-2">Max 5MB • JPEG, PNG, GIF, WebP</p>
            </div>
          </label>
        {/if}
      </div>

      <!-- Description Input -->
      <div>
        <label for="description" class="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Description (optional)
        </label>
        <textarea
          id="description"
          bind:value={description}
          disabled={isSubmitting}
          placeholder="Add any notes about your mission completion..."
          rows="3"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-700 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button
        onclick={handleSubmit}
        disabled={!selectedFile || isSubmitting || !!successMessage}
        class="btn-primary w-full py-4 text-lg"
      >
        {#if isSubmitting}
          <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Uploading...</span>
        {:else if successMessage}
          <span>✅</span>
          <span>Submitted!</span>
        {:else}
          <span>🚀</span>
          <span>Submit Mission</span>
        {/if}
      </button>

      <!-- Helper Text -->
      {#if !selectedFile && !successMessage}
        <p class="text-center text-xs text-slate-400">
          Please upload a photo to submit your mission
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-slide-up {
      animation: none;
    }
  }
</style>
