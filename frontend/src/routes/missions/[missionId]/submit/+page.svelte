<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  let { data }: { data: PageData } = $props();

  // Photo upload state
  let selectedFile = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);
  let description = $state('');
  let isDragOver = $state(false);

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
  }

  function handleSubmit() {
    // UI only - no real submit behavior yet
    console.log('Submit clicked (UI only)', { 
      missionId: data.missionId, 
      file: selectedFile?.name,
      description 
    });
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
    class="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors group"
  >
    <span class="text-xl group-hover:-translate-x-1 transition-transform">←</span>
    <span class="font-medium">Back to Map</span>
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
              class="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
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
              accept="image/*"
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
          placeholder="Add any notes about your mission completion..."
          rows="3"
          class="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl resize-none focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all text-slate-700 placeholder:text-slate-400"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <button
        onclick={handleSubmit}
        disabled={!selectedFile}
        class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg rounded-2xl 
          hover:from-emerald-600 hover:to-teal-700 
          disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed
          transition-all shadow-lg hover:shadow-xl active:scale-[0.98]
          flex items-center justify-center gap-2"
      >
        <span>🚀</span>
        Submit Mission
      </button>

      <!-- Helper Text -->
      {#if !selectedFile}
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

