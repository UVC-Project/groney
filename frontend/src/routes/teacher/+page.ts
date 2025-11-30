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

		// Check if all requests were successful
		if (!classResponse.ok) {
			throw new Error('Failed to fetch class data');
		}
		if (!allClassesResponse.ok) {
			throw new Error('Failed to fetch classes list');
		}
		if (!sectorsResponse.ok) {
			throw new Error('Failed to fetch sectors');
		}
		if (!missionsResponse.ok) {
			throw new Error('Failed to fetch missions');
		}
		if (!submissionsResponse.ok) {
			throw new Error('Failed to fetch submissions');
		}

		// Parse all responses
		const currentClass = await classResponse.json();
		const allClasses = await allClassesResponse.json();
		const sectors = await sectorsResponse.json();
		const missions = await missionsResponse.json();
		const submissions = await submissionsResponse.json();

		return {
			currentClass,
			allClasses,
			sectors,
			missions,
			submissions
		};
	} catch (error) {
		console.error('Error loading teacher dashboard data:', error);
		
		// Return empty data structure on error to prevent page crash
		// The UI will show appropriate empty states
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
