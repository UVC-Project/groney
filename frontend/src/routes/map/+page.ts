import type { PageLoad } from './$types';
import type { Mission } from '$lib/types';
import { API_BASE_URL } from '$lib/config';

// Disable SSR for this page
export const ssr = false;

export const load: PageLoad = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/map/missions`);

    if (!res.ok) {
      console.error('Failed to fetch missions:', res.status, await res.text());
      return { missions: [] as Mission[] };
    }

    const missions: Mission[] = await res.json();
    return { missions };
  } catch (error) {
    console.error('Error fetching missions:', error);
    return { missions: [] as Mission[] };
  }
};
