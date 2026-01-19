import type { PageLoad } from './$types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
  const classId = 'class-1';

  try {
    const res = await fetch(`${API_BASE}/api/mascot/${classId}`);

    if (!res.ok) {
      console.error('Failed to load mascot for home', res.status);
      return { coins: 0 };
    }

    const mascot = await res.json();

    return {
      coins: mascot.coins
    };
  } catch (err) {
    console.error('Error loading mascot for home', err);
    return { coins: 0 };
  }
};
