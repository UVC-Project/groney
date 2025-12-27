import type { PageLoad } from './$types';
import { browser } from '$app/environment';

const SHOP_SERVICE_URL = 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
  if (!browser) {
    return { coins: 0, equippedHat: null, equippedAccessory: null };
  }

  const userId = localStorage.getItem('userId') ?? '';
  if (!userId) {
    return { coins: 0, equippedHat: null, equippedAccessory: null };
  }

  try {
    const res = await fetch(
      `${SHOP_SERVICE_URL}/api/mascot/by-user/${encodeURIComponent(userId)}?t=${Date.now()}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      return { coins: 0, equippedHat: null, equippedAccessory: null };
    }

    const mascot = await res.json();

    return {
      coins: mascot?.coins ?? 0,
      equippedHat: mascot?.equippedHat ?? null,
      equippedAccessory: mascot?.equippedAccessory ?? null
    };
  } catch (err) {
    console.error('Error loading mascot for home', err);
    return { coins: 0, equippedHat: null, equippedAccessory: null };
  }
};
