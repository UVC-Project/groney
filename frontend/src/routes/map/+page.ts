import type { PageLoad } from './$types';
import type { Mission } from '$lib/types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch('/map/missions');

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
