import { writable } from 'svelte/store';

function loadStoredUser() {
	if (typeof window === "undefined") return null;

	const raw =
		sessionStorage.getItem("groney_user") ||
		localStorage.getItem("groney_user");

	return raw ? JSON.parse(raw) : null;
}

export const user = writable(loadStoredUser());

export function getUser() {
	return loadStoredUser();
}

export function getToken() {
	if (typeof window === "undefined") return null;

	return (
		sessionStorage.getItem("groney_auth_token") ||
		localStorage.getItem("groney_auth_token")
	);
}

export function setUser(data: any, token: string, remember = false) {
	if (typeof window === 'undefined') return;

	// Persist depending on remember me
	if (remember) {
		localStorage.setItem("groney_user", JSON.stringify(data));
		localStorage.setItem("groney_auth_token", token);
	} else {
		sessionStorage.setItem("groney_user", JSON.stringify(data));
		sessionStorage.setItem("groney_auth_token", token);
	}

	user.set(data);
}

export function clearUser() {
	if (typeof window === 'undefined') return;

	// Clear everywhere
	localStorage.removeItem("groney_user");
	localStorage.removeItem("groney_auth_token");
	sessionStorage.removeItem("groney_user");
	sessionStorage.removeItem("groney_auth_token");

	user.set(null);
}
