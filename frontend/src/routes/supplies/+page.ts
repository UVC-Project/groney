import type { PageLoad } from './$types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export type Supply = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await fetch(`${API_URL}/api/supplies`);

    if (!res.ok) {
      console.error('Failed to fetch supplies:', res.status);
      return { supplies: [] as Supply[] };
    }

    const supplies = (await res.json()) as Supply[];

    return { supplies };
  } catch (error) {
    console.error('Failed to load supplies:', error);
    return { supplies: [] as Supply[] };
  }
};
