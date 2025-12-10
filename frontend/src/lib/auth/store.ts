import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
	id: string;
	username: string;
	role: 'TEACHER' | 'STUDENT';
	classId?: string | null;
}

export const user = writable<User | null>(null);
export const token = writable<string | null>(null);
export const isAuthenticated = writable(false);
export const isTeacher = writable(false);

// Load from localStorage (client only)
if (browser) {
	const savedToken = localStorage.getItem('token');
	const savedUser = localStorage.getItem('user');

	if (savedToken) token.set(savedToken);
	if (savedUser) user.set(JSON.parse(savedUser));
}

// Sync token
token.subscribe((val) => {
	if (!browser) return;
	if (val) localStorage.setItem('token', val);
	else localStorage.removeItem('token');
});

// Sync user
user.subscribe((val) => {
	if (!browser) return;

	if (!val) {
		localStorage.removeItem('user');
		isAuthenticated.set(false);
		isTeacher.set(false);
	} else {
		localStorage.setItem('user', JSON.stringify(val));
		isAuthenticated.set(true);
		isTeacher.set(val.role === 'TEACHER');
	}
});
