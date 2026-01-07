// src/routes/teacher/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { TeacherDashboardData } from '$lib/types/teacher';
import { API_BASE_URL, SUPPLY_API_URL } from '$lib/config';
import { browser } from '$app/environment';

// Get auth data from localStorage (browser only)
function getAuthData(): { user: { id: string; role: string } | null; token: string | null } {
	if (browser) {
		const stored = localStorage.getItem('auth');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				return { user: parsed.user, token: parsed.token };
			} catch {
				return { user: null, token: null };
			}
		}
	}
	return { user: null, token: null };
}

// Get selected class ID from localStorage (browser only)
function getSelectedClassId(): string | null {
	if (browser) {
		return localStorage.getItem('teacher_selected_class_id');
	}
	return null;
}

export const load: PageLoad = async ({ fetch, url }): Promise<TeacherDashboardData> => {
	const { user, token } = getAuthData();

	// Redirect to login if not authenticated
	if (browser && !user) {
		throw redirect(302, '/login');
	}

	// Redirect students away from teacher dashboard
	if (browser && user?.role !== 'TEACHER') {
		throw redirect(302, '/');
	}

	// Build auth headers
	const authHeaders: Record<string, string> = {};
	if (user) {
		authHeaders['x-user-id'] = user.id;
		authHeaders['x-user-role'] = user.role;
	}
	if (token) {
		authHeaders['Authorization'] = `Bearer ${token}`;
	}

	// Check for classId in URL params first, then localStorage
	const urlClassId = url.searchParams.get('classId');
	const storedClassId = getSelectedClassId();
	const selectedClassId = urlClassId || storedClassId;

	// Helper function to make authenticated requests (teacher-service)
	const authenticatedFetch = (endpoint: string) => {
		return fetch(`${API_BASE_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...authHeaders
			}
		});
	};

	// Helper function to call supply-service directly
	const supplyFetch = (endpoint: string) => {
		return fetch(`${SUPPLY_API_URL}${endpoint}`, {
			headers: {
				'Content-Type': 'application/json',
				...authHeaders
			}
		});
	};

	try {
		console.log('🔄 Loading teacher dashboard data...', { selectedClassId, userId: user?.id });

		// Build class endpoint with optional classId
		const classEndpoint = selectedClassId
			? `/api/teacher/class?classId=${selectedClassId}`
			: '/api/teacher/class';

		// Supply requests endpoint (only when we have a classId)
		const supplyRequestsPromise = selectedClassId
			? supplyFetch(`/api/teacher/supply-requests?classId=${selectedClassId}&status=PENDING`)
			: Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));

		// Fetch all data in parallel for better performance
		const [
			classResponse,
			allClassesResponse,
			sectorsResponse,
			missionsResponse,
			submissionsResponse,
			supplyRequestsResponse,
			decorationsResponse
		] = await Promise.all([
			authenticatedFetch(classEndpoint),
			authenticatedFetch('/api/teacher/classes'),
			authenticatedFetch(`/api/teacher/sectors${selectedClassId ? `?classId=${selectedClassId}` : ''}`),
			authenticatedFetch(`/api/teacher/missions${selectedClassId ? `?classId=${selectedClassId}` : ''}`),
			authenticatedFetch(`/api/teacher/submissions${selectedClassId ? `?classId=${selectedClassId}` : ''}`),
			supplyRequestsPromise,
			authenticatedFetch(`/api/teacher/decorations${selectedClassId ? `?classId=${selectedClassId}` : ''}`)
		]);

		console.log('📊 API Response Status:', {
			class: classResponse.status,
			allClasses: allClassesResponse.status,
			sectors: sectorsResponse.status,
			missions: missionsResponse.status,
			submissions: submissionsResponse.status,
			supplyRequests: supplyRequestsResponse.status,
			decorations: decorationsResponse.status
		});

		// Handle 404 for class (teacher hasn't created a class yet) - this is not an error
		const currentClass =
			classResponse.ok && classResponse.status !== 404 ? await classResponse.json() : null;

		// Check other critical requests
		if (!allClassesResponse.ok && allClassesResponse.status !== 404) {
			throw new Error(`Failed to fetch classes list: ${allClassesResponse.status}`);
		}
		if (!sectorsResponse.ok && sectorsResponse.status !== 404) {
			throw new Error(`Failed to fetch sectors: ${sectorsResponse.status}`);
		}
		if (!missionsResponse.ok && missionsResponse.status !== 404) {
			throw new Error(`Failed to fetch missions: ${missionsResponse.status}`);
		}
		if (!submissionsResponse.ok && submissionsResponse.status !== 404) {
			throw new Error(`Failed to fetch submissions: ${submissionsResponse.status}`);
		}
		// Supply requests is non-critical; handle gracefully (don’t fail dashboard)
		if (!supplyRequestsResponse.ok && supplyRequestsResponse.status !== 404) {
			console.warn(`⚠️ Failed to fetch supply requests: ${supplyRequestsResponse.status}`);
		}

		// Parse all responses (handle 404s gracefully)
		const allClasses = allClassesResponse.ok ? await allClassesResponse.json() : [];
		const sectors = sectorsResponse.ok ? await sectorsResponse.json() : [];
		const missions = missionsResponse.ok ? await missionsResponse.json() : [];
		const submissions = submissionsResponse.ok ? await submissionsResponse.json() : [];
		const supplyRequests = supplyRequestsResponse.ok ? await supplyRequestsResponse.json() : [];
		const decorations = decorationsResponse.ok ? await decorationsResponse.json() : [];

		console.log('✅ Loaded data:', {
			currentClass: currentClass ? 'Found' : 'None',
			allClasses: allClasses.length,
			sectors: sectors.length,
			missions: missions.length,
			submissions: submissions.length,
			supplyRequests: supplyRequests.length,
			decorations: decorations.length
		});

		return {
			currentClass,
			allClasses,
			sectors,
			missions,
			submissions,
			supplyRequests,
			decorations
		};
	} catch (error) {
		console.error('❌ Error loading teacher dashboard data:', error);

		// Return empty data structure with error message
		// This is for actual errors (network issues, server errors, etc.)
		return {
			currentClass: null,
			allClasses: [],
			sectors: [],
			missions: [],
			submissions: [],
			supplyRequests: [],
			decorations: [],
			error: error instanceof Error ? error.message : 'Failed to load dashboard data'
		};
	}
};
