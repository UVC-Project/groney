import { API_BASE_URL } from '$lib/config';

export function getStatColor(value: number): string {
  if (value >= 51) return 'text-green-600';
  if (value >= 25) return 'text-yellow-600';
  return 'text-red-600';
}

export function resolvePhotoUrl(photoUrl: string | null, apiBaseUrl = API_BASE_URL): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('/api/')) return `${apiBaseUrl}${photoUrl}`;
  return photoUrl;
}
