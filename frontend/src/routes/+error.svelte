<script lang="ts">
  import { page } from '$app/state';
  import SadGif from '$lib/assets/images/groney-gif/sad.gif';
  import CryGif from '$lib/assets/images/groney-gif/cry.gif';

  let status = $derived(page.status);
  let message = $derived(page.error?.message || 'Something went wrong');

  // Use cry gif for 500 errors, sad for 404
  let groenyGif = $derived(status >= 500 ? CryGif : SadGif);
  
  // Kid-friendly error messages
  let friendlyTitle = $derived(
    status === 404 
      ? "Oops! Page not found" 
      : status >= 500 
        ? "Oh no! Something broke" 
        : "Uh oh! Something went wrong"
  );

  let friendlyMessage = $derived(
    status === 404 
      ? "Groeny looked everywhere but couldn't find this page!" 
      : status >= 500 
        ? "Groeny is feeling a bit sick. Our team is working to fix it!" 
        : "Something unexpected happened. Let's try again!"
  );

  let emoji = $derived(status === 404 ? "🔍" : status >= 500 ? "🩹" : "😕");
</script>

<div class="min-h-screen bg-gradient-to-b from-sky-100 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
  <div class="text-center max-w-md mx-auto">
    <!-- Error Code Badge -->
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-lg mb-6">
      <span class="text-2xl">{emoji}</span>
      <span class="text-4xl font-extrabold text-gray-700">{status}</span>
    </div>

    <!-- Sad Groeny -->
    <div class="relative mb-6">
      <div class="absolute -inset-4 rounded-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 opacity-60 blur-md"></div>
      <div class="relative w-48 h-48 mx-auto rounded-full border-4 border-white flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl overflow-hidden">
        <img 
          src={groenyGif} 
          alt="Sad Groeny" 
          class="w-36 drop-shadow-lg"
        />
      </div>
    </div>

    <!-- Error Message Card -->
    <div class="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6 mb-6">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">
        {friendlyTitle}
      </h1>
      <p class="text-gray-600 mb-4">
        {friendlyMessage}
      </p>
      
      {#if status !== 404}
        <p class="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 font-mono">
          {message}
        </p>
      {/if}
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <a 
        href="/"
        class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        Go Home
      </a>
      
      <button 
        onclick={() => history.back()}
        class="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 font-bold py-3 px-6 rounded-2xl hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Go Back
      </button>
    </div>

    <!-- Fun tip for 404 -->
    {#if status === 404}
      <p class="mt-6 text-sm text-gray-500">
        💡 Tip: Check the URL or use the navigation below!
      </p>
    {/if}
  </div>
</div>
