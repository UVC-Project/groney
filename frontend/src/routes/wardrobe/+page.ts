import type { PageLoad } from './$types';
import { browser } from '$app/environment';

import { SHOP_API_URL } from '$lib/config';

const GATEWAY = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const load: PageLoad = async ({ fetch }) => {
  const userId = browser ? (localStorage.getItem('userId') ?? '') : '';

  if (!userId) return { items: [], classId: null };

  try {
    const [itemsRes, mascotRes] = await Promise.all([
      fetch(`${GATEWAY}/api/shop/items?userId=${encodeURIComponent(userId)}`),
      fetch(`${SHOP_API_URL}/api/mascot/by-user/${encodeURIComponent(userId)}`)
    ]);

    const items = itemsRes.ok ? await itemsRes.json() : [];
    const mascot = mascotRes.ok ? await mascotRes.json() : null;

    return {
      items,
      classId: mascot?.classId ?? null
    };
  } catch (err) {
    console.error('Error loading wardrobe data', err);
    return { items: [], classId: null };
  }
};
