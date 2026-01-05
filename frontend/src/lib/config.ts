// API Configuration for Teacher Dashboard

// API Base URL - points to API Gateway
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
	// Auth Service endpoints (via API Gateway)
	teacher: {
		classes: '/api/teacher/classes',
		class: '/api/teacher/class',
		createClass: '/api/teacher/create-class',
		switchClass: '/api/teacher/switch-class',
	},
	// Mission Service endpoints (via API Gateway)
	mission: {
		sectors: '/api/teacher/sectors',
		missions: '/api/teacher/missions',
		create: '/api/teacher/missions',
		update: (id: string) => `/api/teacher/missions/${id}`,
		delete: (id: string) => `/api/teacher/missions/${id}`,
		initialize: '/api/teacher/initialize',
	},
	// Submission Service endpoints (via API Gateway)
	submission: {
		list: '/api/teacher/submissions',
		review: (id: string) => `/api/submissions/${id}/review`,
	},
};

// Helper to build full URL
export function buildApiUrl(endpoint: string): string {
	return `${API_BASE_URL}${endpoint}`;
}

// Environment-specific configuration
export const CONFIG = {
	api: {
		baseUrl: API_BASE_URL,
		timeout: 10000, // 10 seconds
	},
	auth: {
		// For your colleague's auth implementation
		tokenKey: 'groney_auth_token',
		refreshTokenKey: 'groney_refresh_token',
	},
};

export const SUPPLY_API_URL = API_BASE_URL;

export const MASCOT_ENGINE_URL = API_BASE_URL;

export const SHOP_API_URL = API_BASE_URL;
