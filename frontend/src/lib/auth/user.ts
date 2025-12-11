import { writable } from 'svelte/store';

export const user = writable(getUser());

export function getUser() {
	if (typeof localStorage === 'undefined') return null;
	const raw = localStorage.getItem('groney_user');
	return raw ? JSON.parse(raw) : null;
}

export function getToken() {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem('groney_auth_token');
}

export function isLoggedIn() {
	return !!getToken();
}

export function setUser(newUser: any, token: string) {
	localStorage.setItem('groney_user', JSON.stringify(newUser));
	localStorage.setItem('groney_auth_token', token);

	user.set(newUser);
}

export function clearUser() {
	localStorage.removeItem('groney_user');
	localStorage.removeItem('groney_auth_token');

	user.set(null);
}
