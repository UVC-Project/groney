import type { LoadEvent } from '@sveltejs/kit';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type Supply = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export const load = async ({ fetch }: LoadEvent) => {
  try {
    const res = await fetch(`${API_URL}/api/supplies`);
    const supplies: Supply[] = res.ok ? await res.json() : [];

    return { supplies };
  } catch (err) {
    console.error('Failed to load supplies', err);
    return { supplies: [] as Supply[] };
  }
};
