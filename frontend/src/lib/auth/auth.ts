import { CONFIG } from '$lib/config';

export async function login(email: string, password: string) {
	const res = await fetch('http://localhost:3001/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password })
	});

	if (!res.ok) {
		throw new Error('Invalid credentials');
	}

	const data = await res.json();

	// Save token
	localStorage.setItem(CONFIG.auth.tokenKey, data.accessToken);

	return data;
}
