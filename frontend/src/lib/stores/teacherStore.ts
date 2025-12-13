import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'teacher_selected_class_id';

// Get initial value from localStorage if available
function getInitialClassId(): string | null {
	if (browser) {
		return localStorage.getItem(STORAGE_KEY);
	}
	return null;
}

// Create the store
function createSelectedClassStore() {
	const { subscribe, set, update } = writable<string | null>(getInitialClassId());

	return {
		subscribe,
		set: (classId: string | null) => {
			if (browser) {
				if (classId) {
					localStorage.setItem(STORAGE_KEY, classId);
				} else {
					localStorage.removeItem(STORAGE_KEY);
				}
			}
			set(classId);
		},
		clear: () => {
			if (browser) {
				localStorage.removeItem(STORAGE_KEY);
			}
			set(null);
		}
	};
}

export const selectedClassId = createSelectedClassStore();
