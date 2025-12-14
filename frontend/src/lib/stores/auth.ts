import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { API_BASE_URL } from '$lib/config';

export interface User {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	role: 'TEACHER' | 'STUDENT';
}

export interface ClassInfo {
	id: string;
	name: string;
	school: string;
	classCode: string;
}

interface AuthState {
	user: User | null;
	token: string | null;
	classes: ClassInfo[];
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	token: null,
	classes: [],
	isLoading: true,
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	// Load from localStorage on init
	if (browser) {
		const stored = localStorage.getItem('auth');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				set({ ...parsed, isLoading: false });
			} catch {
				set({ ...initialState, isLoading: false });
			}
		} else {
			set({ ...initialState, isLoading: false });
		}
	}

	return {
		subscribe,

		async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
			try {
				const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ username, password }),
				});

				const data = await response.json();

				if (!response.ok) {
					return { success: false, error: data.message || 'Login failed' };
				}

				const newState: AuthState = {
					user: data.user,
					token: data.token,
					classes: data.classes || [],
					isLoading: false,
				};

				set(newState);

				if (browser) {
					localStorage.setItem('auth', JSON.stringify(newState));
				}

				return { success: true };
			} catch (error) {
				console.error('Login error:', error);
				return { success: false, error: 'Network error. Please try again.' };
			}
		},

		async registerTeacher(data: {
			firstName: string;
			lastName: string;
			username: string;
			password: string;
			className: string;
			schoolName: string;
		}): Promise<{ success: boolean; error?: string }> {
			try {
				const response = await fetch(`${API_BASE_URL}/api/auth/register/teacher`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});

				const result = await response.json();

				if (!response.ok) {
					return { success: false, error: result.message || 'Registration failed' };
				}

				return { success: true };
			} catch (error) {
				console.error('Registration error:', error);
				return { success: false, error: 'Network error. Please try again.' };
			}
		},

		async registerStudent(data: {
			firstName: string;
			lastName: string;
			username: string;
			password: string;
			classCode: string;
		}): Promise<{ success: boolean; error?: string }> {
			try {
				const response = await fetch(`${API_BASE_URL}/api/auth/register/student`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(data),
				});

				const result = await response.json();

				if (!response.ok) {
					return { success: false, error: result.message || 'Registration failed' };
				}

				return { success: true };
			} catch (error) {
				console.error('Registration error:', error);
				return { success: false, error: 'Network error. Please try again.' };
			}
		},

		logout() {
			set({ ...initialState, isLoading: false });
			if (browser) {
				localStorage.removeItem('auth');
			}
		},

		getAuthHeaders(): Record<string, string> {
			let token: string | null = null;
			let user: User | null = null;

			subscribe((state) => {
				token = state.token;
				user = state.user;
			})();

			if (!token || !user) {
				return {};
			}

			return {
				Authorization: `Bearer ${token}`,
				'x-user-id': user.id,
				'x-user-role': user.role,
			};
		},
	};
}

export const auth = createAuthStore();

// Derived stores for convenience
export const user = derived(auth, ($auth) => $auth.user);
export const isAuthenticated = derived(auth, ($auth) => !!$auth.user && !!$auth.token);
export const isTeacher = derived(auth, ($auth) => $auth.user?.role === 'TEACHER');
export const isStudent = derived(auth, ($auth) => $auth.user?.role === 'STUDENT');
export const isLoading = derived(auth, ($auth) => $auth.isLoading);
export const userClasses = derived(auth, ($auth) => $auth.classes);
