<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    compact?: boolean;
  }

  let { compact = false }: Props = $props();

  const DEFAULT_LAT = 52.37;
  const DEFAULT_LON = 4.89;
  
  let weather = $state<{
    temp: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    isDay: boolean;
    cityName: string;
  } | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // WMO Weather codes to emoji - using simple strings to avoid encoding issues
  function getWeatherEmoji(code: number, isDay: boolean): string {
    if (code === 0) return isDay ? 'sun' : 'moon';
    if (code <= 3) return isDay ? 'partlycloudy' : 'cloudy';
    if (code <= 49) return 'fog';
    if (code <= 69) return 'rain';
    if (code <= 86) return 'snow';
    if (code >= 95) return 'storm';
    return 'partlycloudy';
  }

  // Map emoji keys to actual emoji characters (rendered in template)
  const emojiMap: Record<string, string> = {
    'sun': '\u2600\uFE0F',
    'moon': '\uD83C\uDF19',
    'partlycloudy': '\u26C5',
    'cloudy': '\u2601\uFE0F',
    'fog': '\uD83C\uDF2B\uFE0F',
    'rain': '\uD83C\uDF27\uFE0F',
    'snow': '\u2744\uFE0F',
    'storm': '\u26C8\uFE0F'
  };

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

  function getWeatherTip(code: number): string {
    if (code === 0) return 'Perfect day for outdoor missions!';
    if (code <= 3) return 'Great weather for the schoolyard!';
    if (code <= 49) return 'Be careful in the mist!';
    if (code <= 69) return 'Plants are getting a drink today!';
    if (code <= 86) return 'Check if animals are warm!';
    if (code >= 95) return 'Stay safe indoors today!';
    return 'Have a great day!';
  }

  async function getCityName(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!response.ok) return 'Netherlands';
      
      const data = await response.json();
      return data.address?.city || 
             data.address?.town || 
             data.address?.village || 
             data.address?.municipality ||
             'Netherlands';
    } catch {
      return 'Netherlands';
    }
  }

  async function fetchWeather(lat: number, lon: number) {
    try {
      const [weatherRes, cityName] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`),
        getCityName(lat, lon)
      ]);
      
      if (!weatherRes.ok) throw new Error('Weather unavailable');

      const data = await weatherRes.json();
      
      weather = {
        temp: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        isDay: data.current.is_day === 1,
        cityName
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
      fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        fetchWeather(DEFAULT_LAT, DEFAULT_LON);
      },
      { timeout: 5000, maximumAge: 600000 }
    );
  }

  onMount(() => {
    getLocation();
    const interval = setInterval(() => getLocation(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  });
</script>

{#if loading}
  {#if compact}
    <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-3 shadow-lg animate-pulse h-full flex items-center gap-3">
      <div class="h-8 w-8 bg-white/30 rounded-full flex-shrink-0"></div>
      <div class="flex-1">
        <div class="h-4 w-12 bg-white/30 rounded mb-1"></div>
        <div class="h-3 w-16 bg-white/30 rounded"></div>
      </div>
    </div>
  {:else}
    <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 shadow-lg animate-pulse min-w-[160px]">
      <div class="h-8 w-8 bg-white/30 rounded-full mb-2"></div>
      <div class="h-4 w-16 bg-white/30 rounded mb-1"></div>
      <div class="h-3 w-20 bg-white/30 rounded"></div>
    </div>
  {/if}
{:else if weather}
  {@const emojiKey = getWeatherEmoji(weather.weatherCode, weather.isDay)}
  {@const emoji = emojiMap[emojiKey] || emojiMap['partlycloudy']}
  
  {#if compact}
    <!-- Compact version for mobile -->
    <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-3 shadow-lg text-white h-full relative overflow-hidden">
      <div class="absolute -right-2 -top-2 text-4xl opacity-20">
        {emoji}
      </div>
      
      <div class="relative z-10 flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="text-2xl">{emoji}</span>
          <span class="text-xl font-bold">{weather.temp}°</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium opacity-90 truncate">
            {getWeatherDescription(weather.weatherCode)}
          </p>
          <p class="text-[10px] opacity-70 truncate">
            {weather.cityName}
          </p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Full version for desktop -->
    <div class="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 shadow-lg text-white min-w-[160px] relative overflow-hidden">
      <div class="absolute -right-4 -top-4 text-6xl opacity-20">
        {emoji}
      </div>
      
      <div class="relative z-10">
        <p class="text-xs opacity-75 mb-1">
          {weather.cityName}
        </p>
        
        <div class="flex items-center gap-2 mb-1">
          <span class="text-3xl">{emoji}</span>
          <span class="text-2xl font-bold">{weather.temp}°</span>
        </div>
        
        <p class="text-sm font-medium capitalize opacity-90 mb-2">
          {getWeatherDescription(weather.weatherCode)}
        </p>
        
        <div class="flex gap-3 text-xs opacity-80">
          <span>{weather.humidity}%</span>
          <span>{weather.windSpeed} km/h</span>
        </div>
        
        <p class="text-xs mt-2 pt-2 border-t border-white/20 italic">
          {getWeatherTip(weather.weatherCode)}
        </p>
      </div>
    </div>
  {/if}
{:else if error}
  {#if compact}
    <div class="bg-gray-200 rounded-2xl p-3 shadow-lg text-gray-600 h-full flex items-center">
      <p class="text-xs">{error}</p>
    </div>
  {:else}
    <div class="bg-gray-200 rounded-2xl p-4 shadow-lg text-gray-600 min-w-[160px]">
      <p class="text-sm">{error}</p>
    </div>
  {/if}
{/if}
