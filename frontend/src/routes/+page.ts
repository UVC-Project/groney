import type { PageLoad } from './$types';
import { browser } from '$app/environment';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const load: PageLoad = async ({ fetch }) => {
  if (!browser) {
    return { coins: 0 };
  }

  const raw = localStorage.getItem('auth');

  if (!raw) {
    console.warn('No auth in localStorage');
    return { coins: 0 };
  }

  const auth = JSON.parse(raw);

  const classId = auth?.classes?.[0]?.id;

  if (!classId) {
    console.warn('No classId found for user');
    return { coins: 0 };
  }

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
