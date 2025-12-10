import { buildApiUrl, CONFIG } from '$lib/config';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
	const token = localStorage.getItem(CONFIG.auth.tokenKey);

	const headers: HeadersInit = {
		...(options.headers || {}),
		Authorization: token ? `Bearer ${token}` : ''
	};

	const res = await fetch(buildApiUrl(endpoint), { ...options, headers });

	if (res.status === 401) {
		// Optional: handle refresh token or redirect to login
		console.warn('Unauthorized — token may be expired');
	}

	return res;
}
