import type { PageLoad } from './$types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
  const userId = 'user-1';

  try {
    const res = await fetch(`${API_URL}/api/shop/items?userId=${userId}`);

    if (!res.ok) {
      console.error('Failed to load wardrobe items', res.status);
      return { items: [] };
    }

    const items = await res.json();

    return { items };
  } catch (err) {
    console.error('Error loading wardrobe items', err);
    return { items: [] };
  }
};