import type { PageLoad } from './$types';
import { browser } from '$app/environment';

const GATEWAY = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const SHOP = 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
  const userId = browser ? (localStorage.getItem('userId') ?? '') : '';

  // If SSR or userId not available yet, render empty – the browser load will rerun with userId.
  if (!userId) {
    return {
      userId: null,
      classId: null,
      coins: 0,
      equippedHat: null,
      equippedAccessory: null,
      items: []
    };
  }

  try {
    const [itemsRes, mascotRes] = await Promise.all([
      fetch(`${GATEWAY}/api/shop/items?userId=${encodeURIComponent(userId)}`),
      fetch(`${SHOP}/api/mascot/by-user/${encodeURIComponent(userId)}`)
    ]);

    const items = itemsRes.ok ? await itemsRes.json() : [];
    const mascot = mascotRes.ok ? await mascotRes.json() : null;

    return {
      userId,
      classId: mascot?.classId ?? null,
      coins: mascot?.coins ?? 0,
      equippedHat: mascot?.equippedHat ?? null,
      equippedAccessory: mascot?.equippedAccessory ?? null,
      items
    };
  } catch (err) {
    console.error('Error loading wardrobe data', err);
    return {
      userId,
      classId: null,
      coins: 0,
      equippedHat: null,
      equippedAccessory: null,
      items: []
    };
  }
};
