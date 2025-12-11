import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { CONFIG } from '$lib/config';
import { setUser, clearUser } from './user';

export async function login(username: string, password: string, remember = false) {
	const res = await fetch(`${CONFIG.api.baseUrl}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password })
	});

	if (!res.ok) {
		throw new Error('Invalid credentials');
	}

	const data = await res.json();

	setUser(data.user, data.token, remember);

	return data.user;
}

export async function registerTeacher(payload: {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
	className: string;
	schoolName: string;
}) {
	const res = await fetch(`${CONFIG.api.baseUrl}/api/auth/register/teacher`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message || "Registration failed");
	}

	if (browser) {
		goto('/auth');
	}
}

export async function registerStudent(payload: {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	classCode: string;
}) {
	const res = await fetch(`${CONFIG.api.baseUrl}/api/auth/register/student`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.message || 'Student registration failed');
	}

	if (browser) {
		goto('/auth');
	}
}

export function logout() {
	clearUser();
}
