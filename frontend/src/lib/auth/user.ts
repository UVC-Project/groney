export function getUser() {
	if (typeof localStorage === 'undefined') return null;
	const raw = localStorage.getItem('groney_user');
	return raw ? JSON.parse(raw) : null;
}

export function getToken() {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem('groney_auth_token');
}
