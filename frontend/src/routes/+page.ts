import type { PageLoad } from './$types';
import { browser } from '$app/environment';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const load: PageLoad = async ({ fetch }) => {
  if (!browser) {
    return {
      coins: 0,
      equippedHat: null,
      equippedAccessory: null
    };
  }

  const raw = localStorage.getItem('auth');

  if (!raw) {
    console.warn('No auth in localStorage');
    return {
      coins: 0,
      equippedHat: null,
      equippedAccessory: null
    };
  }

  let auth: any;
  try {
    auth = JSON.parse(raw);
  } catch {
    console.warn('Invalid auth JSON in localStorage');
    return {
      coins: 0,
      equippedHat: null,
      equippedAccessory: null
    };
  }

  const classId = auth?.classes?.[0]?.id;

  if (!classId) {
    console.warn('No classId found for user');
    return {
      coins: 0,
      equippedHat: null,
      equippedAccessory: null
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/mascot/${encodeURIComponent(classId)}`);

    if (!res.ok) {
      console.error('Failed to load mascot for home', res.status);
      return {
        coins: 0,
        equippedHat: null,
        equippedAccessory: null
      };
    }

    const mascot = await res.json();

    return {
      coins: mascot?.coins ?? 0,
      equippedHat: mascot?.equippedHat ?? null,
      equippedAccessory: mascot?.equippedAccessory ?? null
    };
  } catch (err) {
    console.error('Error loading mascot for home', err);
    return {
      coins: 0,
      equippedHat: null,
      equippedAccessory: null
    };
  }
};
