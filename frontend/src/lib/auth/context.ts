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

// Test teacher for development
export const TEST_TEACHER: User = {
	id: 'cmiuh3yr20000exu2jf0bhl9w', // Real teacher ID from database
	username: 'teacher1',
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
