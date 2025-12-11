import { goto } from '$app/navigation';
import { isLoggedIn } from '$lib/auth/user';

export const handle = async ({ event, resolve }) => {
	const url = event.url.pathname;
	const loggedIn = isLoggedIn();

	const publicOnly = ['/login', '/register', '/signup'];

	const protectedRoutes = ['/', '/teacher', '/student'];

	if (loggedIn && publicOnly.some((p) => url.startsWith(p))) {
		goto('/');
		return new Response();
	}

	if (!loggedIn && protectedRoutes.some((p) => url.startsWith(p))) {
		goto('/login');
		return new Response();
	}

	return resolve(event);
};
