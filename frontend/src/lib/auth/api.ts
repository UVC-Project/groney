import { token } from "$lib/auth/context";

export async function api(path: string, options: RequestInit = {}) {
	let currentToken: string | null = null;

	token.subscribe((t) => (currentToken = t))();

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...((options.headers as Record<string, string>) || {})
	};

	if (currentToken) {
		headers["Authorization"] = `Bearer ${currentToken}`;
	}

	const res = await fetch(`http://localhost:3001${path}`, {
		...options,
		headers
	});

	let data;
	try {
		data = await res.json();
	} catch {
		throw new Error("Invalid JSON response");
	}

	if (!res.ok) {
		throw new Error(data.message || "API error");
	}

	return data;
}
