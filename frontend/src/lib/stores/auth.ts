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

export interface StreakInfo {
	current: number;
	longest: number;
	broken: boolean;
}

export interface MilestoneReward {
	streakDay: number;
	coinsEarned: number;
	message: string;
}

export interface StreakReset {
	previousStreak: number;
}

interface AuthState {
	user: User | null;
	token: string | null;
	classes: ClassInfo[];
	streak: StreakInfo | null;
	isLoading: boolean;
}

const initialState: AuthState = {
	user: null,
	token: null,
	classes: [],
	streak: null,
	isLoading: true,
};

// Separate store for milestone reward (must be defined before createAuthStore)
export const milestoneRewardStore = writable<MilestoneReward | null>(null);

export function clearMilestoneReward() {
	milestoneRewardStore.set(null);
}

// Separate store for streak reset info 
export const streakResetStore = writable<StreakReset | null>(null);

export function clearStreakReset() {
	streakResetStore.set(null);
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	// Load from localStorage on init
	if (browser) {
		const stored = localStorage.getItem('auth');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				// Ensure streak field exists (for backwards compatibility with old localstorage data)
				set({ 
					...initialState,
					...parsed, 
					streak: parsed.streak || null,
					isLoading: false 
				});
			} catch {
				set({ ...initialState, isLoading: false });
			}
		} else {
			set({ ...initialState, isLoading: false });
		}
	}

	return {
		subscribe,

		async login(username: string, password: string): Promise<{ success: boolean; error?: string; streakBroken?: boolean }> {
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
					streak: data.streak || null,
					isLoading: false,
				};

				set(newState);

				if (browser) {
					localStorage.setItem('auth', JSON.stringify(newState));
					// Also store userId for other components that need it
					if (data.user?.id) {
						localStorage.setItem('userId', data.user.id);
					}
				}

				// Store milestone reward event if present (for UI to display)
				if (data.milestoneReward) {
					milestoneRewardStore.set(data.milestoneReward);
				}

				// Store streak reset info if streak was broken (for UI to be shown)
				if (data.streakReset) {
					streakResetStore.set(data.streakReset);
				}

				return { 
					success: true, 
					streakBroken: data.streak?.broken || false 
				};
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
		}): Promise<{ success: boolean; error?: string; classId?: string }> {
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

				return { success: true, classId: result.class?.id };
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
export const userStreak = derived(auth, ($auth) => $auth.streak);
