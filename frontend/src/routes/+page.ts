import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { MASCOT_ENGINE_URL } from '$lib/config';

export const ssr = false;

export interface MascotData {
  id: string;
  classId: string;
  thirst: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
  level: number;
  xp: number;
  coins: number;
  equippedHat: string | null;
  equippedAccessory: string | null;
  health: number;
  state: 'normal' | 'sad' | 'sick';
  levelProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  decayRates: {
    thirst: number;
    hunger: number;
    happiness: number;
    cleanliness: number;
  };
}

const defaultMascot: MascotData = {
  id: '',
  classId: '',
  thirst: 100,
  hunger: 100,
  happiness: 100,
  cleanliness: 100,
  level: 1,
  xp: 0,
  coins: 0,
  equippedHat: null,
  equippedAccessory: null,
  health: 100,
  state: 'normal',
  levelProgress: { current: 0, required: 100, percentage: 0 },
  decayRates: { thirst: 1, hunger: 2, happiness: 3, cleanliness: 2 },
};

export const load: PageLoad = async ({ fetch }) => {
  if (!browser) {
    return { mascot: defaultMascot };
  }

  // Get userId from auth storage (stored as JSON object)
  let userId = '';
  try {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      userId = parsed?.user?.id ?? '';
    }
  } catch {
    // Fallback to direct userId if auth parsing fails
    userId = localStorage.getItem('userId') ?? '';
  }

  if (!userId) {
    return { mascot: defaultMascot };
  }

  try {
    const res = await fetch(
      `${MASCOT_ENGINE_URL}/api/mascot/by-user/${encodeURIComponent(userId)}?t=${Date.now()}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      console.error('Mascot fetch failed:', res.status, await res.text());
      return { mascot: defaultMascot };
    }

    const mascot: MascotData = await res.json();
    return { mascot };
  } catch (err) {
    console.error('Error loading mascot for home', err);
    return { mascot: defaultMascot };
  }
};
