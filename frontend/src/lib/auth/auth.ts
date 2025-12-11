import { CONFIG } from '$lib/config';
import { setUser, clearUser } from './user';

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

	setUser(data.user, data.token);

	return data.user;
}

export function logout() {
	clearUser();
}
