import { writable } from "svelte/store";
import { browser } from "$app/environment";

export interface User {
	id: string;
	username: string;
	role: "TEACHER" | "STUDENT";
	classId?: string | null;
}

export const user = writable<User | null>(null);
export const token = writable<string | null>(null);

export const isAuthenticated = writable(false);
export const isTeacher = writable(false);

if (browser) {
	const savedToken = localStorage.getItem("token");
	const savedUser = localStorage.getItem("user");

	if (savedToken) token.set(savedToken);
	if (savedUser) user.set(JSON.parse(savedUser));
}

// Get current user from store (for backwards compatibility)
export function getCurrentUser(): User | null {
	const state = get(auth);
	return state.user;
}

// Get auth headers for API requests
export function getAuthHeaders(user?: User | null): Record<string, string> {
	const state = get(auth);
	const currentUser = user || state.user;
	const token = state.token;

	if (!currentUser) {
		return {};
	}

	const headers: Record<string, string> = {
		'x-user-id': currentUser.id,
		'x-user-role': currentUser.role,
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return headers;
}

// Legacy TEST_TEACHER export for backwards compatibility during migration
// This will be removed once all components use the auth store
export const TEST_TEACHER: User = {
	id: 'legacy-test-id',
	username: 'teacher1',
	firstName: 'Test',
	lastName: 'Teacher',
	role: 'TEACHER',
};

user.subscribe((u) => {
	if (!browser) return;

	if (!u) {
		localStorage.removeItem("user");
		isAuthenticated.set(false);
		isTeacher.set(false);
		return;
	}

	localStorage.setItem("user", JSON.stringify(u));
	isAuthenticated.set(true);
	isTeacher.set(u.role === "TEACHER");
});
