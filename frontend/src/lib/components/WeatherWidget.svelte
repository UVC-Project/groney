<script lang="ts">
  import { onMount } from 'svelte';

  // Default coordinates: Amsterdam, Netherlands (fallback)
  const DEFAULT_LAT = 52.37;
  const DEFAULT_LON = 4.89;
  
  // Weather state
  let weather = $state<{
    temp: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    isDay: boolean;
  } | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let usingFallback = $state(false);

  // WMO Weather interpretation codes to emoji mapping
  function getWeatherEmoji(code: number, isDay: boolean): string {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code <= 3) return isDay ? '⛅' : '☁️';
    if (code <= 49) return '🌫️';
    if (code <= 59) return '�️';
    if (code <= 69) return '🌧️';
    if (code <= 79) return '❄️';
    if (code <= 84) return '🌧️';
    if (code <= 86) return '�️'; 
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  // WMO code to description
  function getWeatherDescription(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code <= 49) return 'Foggy';
    if (code <= 59) return 'Drizzle';
    if (code <= 69) return 'Rainy';
    if (code <= 79) return 'Snowy';
    if (code <= 84) return 'Rain showers';
    if (code <= 86) return 'Snow showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Unknown';
  }

  // Weather tips for kids
  function getWeatherTip(code: number): string {
    if (code === 0) return 'Perfect day for outdoor missions!';
    if (code <= 3) return 'Great weather for the schoolyard!';
    if (code <= 49) return 'Be careful in the mist!';
    if (code <= 69) return 'Check the rain barrels! 🪣';
    if (code <= 79) return 'Check if animals are warm! 🐔';
    if (code <= 86) return 'Snow day! Check on the plants 🌱';
    if (code >= 95) return 'Stay safe indoors today!';
    return 'Have a great day!';
  }

  async function fetchWeather(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
      );
      
      if (!response.ok) throw new Error('Weather unavailable');

      const data = await response.json();
      
      weather = {
        temp: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        isDay: data.current.is_day === 1
      };
    } catch (err) {
      console.error('Weather fetch error:', err);
      error = 'Weather unavailable';
    } finally {
      loading = false;
    }
  }

  function getLocation() {
    if (!navigator.geolocation) {
      // Geolocation not supported, use fallback
      usingFallback = true;
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success - use actual location
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        // Permission denied or error - use fallback silently
        console.log('Geolocation unavailable, using Amsterdam:', err.message);
        usingFallback = true;
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      },
      { timeout: 5000, maximumAge: 600000 } // 5s timeout, cache for 10min
    );
  }

  onMount(() => {
    getLocation();
    // Refresh weather every 30 minutes
    const interval = setInterval(() => getLocation(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

{#if loading}
  <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 shadow-lg animate-pulse min-w-[140px]">
    <div class="h-8 w-8 bg-white/30 rounded-full mb-2"></div>
    <div class="h-4 w-16 bg-white/30 rounded mb-1"></div>
    <div class="h-3 w-20 bg-white/30 rounded"></div>
  </div>
{:else if weather}
  {@const emoji = getWeatherEmoji(weather.weatherCode, weather.isDay)}
  <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 shadow-lg text-white min-w-[140px] relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute -right-4 -top-4 text-6xl opacity-20">
      {emoji}
    </div>
    
    <div class="relative z-10">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-3xl">{emoji}</span>
        <span class="text-2xl font-bold">{weather.temp}°</span>
      </div>
      
      <p class="text-sm font-medium capitalize opacity-90 mb-2">
        {getWeatherDescription(weather.weatherCode)}
      </p>
      
      <div class="flex gap-3 text-xs opacity-80">
        <span>💧 {weather.humidity}%</span>
        <span>💨 {weather.windSpeed} km/h</span>
      </div>
      
      <p class="text-xs mt-2 pt-2 border-t border-white/20 italic">
        {getWeatherTip(weather.weatherCode)}
      </p>
    </div>
  </div>
{:else if error}
  <div class="bg-gray-200 rounded-2xl p-4 shadow-lg text-gray-600 min-w-[140px]">
    <span class="text-2xl">🌤️</span>
    <p class="text-sm">{error}</p>
  </div>
{/if}
