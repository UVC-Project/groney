// Temporary auth context for testing teacher dashboard
// This will be replaced by your colleague's full authentication implementation

export interface User {
	id: string;
	username: string;
	role: 'TEACHER' | 'STUDENT';
}

export interface AuthContext {
	user: User | null;
	isAuthenticated: boolean;
	isTeacher: boolean;
}

// Test teacher for development
export const TEST_TEACHER: User = {
	id: 'cmiuh3yr20000exu2jf0bhl9w', // Real teacher ID from database
	username: 'teacher1',
	role: 'TEACHER',
};

// Mock auth context for testing
export function createTestAuthContext(): AuthContext {
	return {
		user: TEST_TEACHER,
		isAuthenticated: true,
		isTeacher: true,
	};
}

// Auth headers for API requests
export function getAuthHeaders(user: User | null): Record<string, string> {
	if (!user) {
		return {};
	}

	return {
		'x-user-id': user.id,
		'x-user-role': user.role,
	};
}

// API client with auth headers
export async function authenticatedFetch(
	url: string,
	options: RequestInit = {},
	user: User | null = TEST_TEACHER
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

// For your colleague's reference - where real auth will plug in:
// 1. Replace TEST_TEACHER with real user from session/JWT
// 2. Replace createTestAuthContext() with real auth state
// 3. Replace authenticatedFetch() with real auth headers from session
// 4. Add login/logout functions
// 5. Add session management
