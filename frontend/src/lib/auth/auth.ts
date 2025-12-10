import { CONFIG } from '$lib/config';

export async function login(username: string, password: string) {
	const res = await fetch(`${CONFIG.api.baseUrl}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});


	if (!res.ok) {
		throw new Error('Invalid credentials');
	}

	const data = await res.json();

	// Save token
	localStorage.setItem(CONFIG.auth.tokenKey, data.token);

	// Save user info
	localStorage.setItem('groney_user', JSON.stringify(data.user));

	return data.user;
}

export function logout() {
	localStorage.removeItem(CONFIG.auth.tokenKey);
	localStorage.removeItem('groney_user');
}
