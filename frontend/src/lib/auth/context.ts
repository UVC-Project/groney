// Auth context - now uses the auth store
// This file provides backwards compatibility with existing code

import { get } from 'svelte/store';
import { auth, type User } from '$lib/stores/auth';

export type { User } from '$lib/stores/auth';

export interface AuthContext {
	user: User | null;
	isAuthenticated: boolean;
	isTeacher: boolean;
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

// Mock auth context for testing (legacy)
export function createTestAuthContext(): AuthContext {
	const state = get(auth);
	return {
		user: state.user,
		isAuthenticated: !!state.user,
		isTeacher: state.user?.role === 'TEACHER',
	};
}

// API client with auth headers (legacy)
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {},
	user?: User | null
): Promise<Response> {
	const headers = {
		'Content-Type': 'application/json',
		...getAuthHeaders(user),
		...(options.headers || {}),
	};

	return fetch(url, {
		...options,
		headers,
	});
}
