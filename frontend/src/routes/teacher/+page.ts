import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { TeacherDashboardData } from '$lib/types/teacher';

export const load: PageLoad = async ({ fetch }): Promise<TeacherDashboardData> => {
	// TODO: Add session/auth check when authentication is implemented
	// For now, we'll let the API endpoints handle authorization

	try {
		// Fetch all data in parallel for better performance
		const [classResponse, allClassesResponse, sectorsResponse, missionsResponse, submissionsResponse] =
			await Promise.all([
				fetch('/api/teacher/class'),
				fetch('/api/teacher/classes'),
				fetch('/api/teacher/sectors'),
				fetch('/api/teacher/missions'),
				fetch('/api/teacher/submissions')
			]);

		// Handle 404 for class (teacher hasn't created a class yet) - this is not an error
		const currentClass = classResponse.ok && classResponse.status !== 404 
			? await classResponse.json() 
			: null;

		// Check other critical requests
		if (!allClassesResponse.ok && allClassesResponse.status !== 404) {
			throw new Error('Failed to fetch classes list');
		}
		if (!sectorsResponse.ok && sectorsResponse.status !== 404) {
			throw new Error('Failed to fetch sectors');
		}
		if (!missionsResponse.ok && missionsResponse.status !== 404) {
			throw new Error('Failed to fetch missions');
		}
		if (!submissionsResponse.ok && submissionsResponse.status !== 404) {
			throw new Error('Failed to fetch submissions');
		}

		// Parse all responses (handle 404s gracefully)
		const allClasses = allClassesResponse.ok ? await allClassesResponse.json() : [];
		const sectors = sectorsResponse.ok ? await sectorsResponse.json() : [];
		const missions = missionsResponse.ok ? await missionsResponse.json() : [];
		const submissions = submissionsResponse.ok ? await submissionsResponse.json() : [];

		return {
			currentClass,
			allClasses,
			sectors,
			missions,
			submissions
		};
	} catch (error) {
		console.error('Error loading teacher dashboard data:', error);
		
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
