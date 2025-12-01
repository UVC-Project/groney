import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { TeacherDashboardData } from '$lib/types/teacher';
import { API_BASE_URL } from '$lib/config';
import { TEST_TEACHER, getAuthHeaders } from '$lib/auth/context';

export const load: PageLoad = async ({ fetch }): Promise<TeacherDashboardData> => {
	// TODO: Replace TEST_TEACHER with real user from session when auth is implemented
	const authHeaders = getAuthHeaders(TEST_TEACHER);

	// Helper function to make authenticated requests
	const authenticatedFetch = (url: string) => {
		return fetch(`${API_BASE_URL}${url}`, {
			headers: {
				'Content-Type': 'application/json',
				...authHeaders,
			},
		});
	};

	try {
		console.log('🔄 Loading teacher dashboard data...');
		
		// Fetch all data in parallel for better performance
		const [classResponse, allClassesResponse, sectorsResponse, missionsResponse, submissionsResponse] =
			await Promise.all([
				authenticatedFetch('/api/teacher/class'),
				authenticatedFetch('/api/teacher/classes'),
				authenticatedFetch('/api/teacher/sectors'),
				authenticatedFetch('/api/teacher/missions'),
				authenticatedFetch('/api/teacher/submissions')
			]);

		console.log('📊 API Response Status:', {
			class: classResponse.status,
			allClasses: allClassesResponse.status,
			sectors: sectorsResponse.status,
			missions: missionsResponse.status,
			submissions: submissionsResponse.status,
		});

		// Handle 404 for class (teacher hasn't created a class yet) - this is not an error
		const currentClass = classResponse.ok && classResponse.status !== 404 
			? await classResponse.json() 
			: null;

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

		// Parse all responses (handle 404s gracefully)
		const allClasses = allClassesResponse.ok ? await allClassesResponse.json() : [];
		const sectors = sectorsResponse.ok ? await sectorsResponse.json() : [];
		const missions = missionsResponse.ok ? await missionsResponse.json() : [];
		const submissions = submissionsResponse.ok ? await submissionsResponse.json() : [];

		console.log('✅ Loaded data:', {
			currentClass: currentClass ? 'Found' : 'None',
			allClasses: allClasses.length,
			sectors: sectors.length,
			missions: missions.length,
			submissions: submissions.length,
		});

		return {
			currentClass,
			allClasses,
			sectors,
			missions,
			submissions
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
			error: error instanceof Error ? error.message : 'Failed to load dashboard data'
		};
	}
};
