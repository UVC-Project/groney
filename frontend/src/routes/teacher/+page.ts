import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { TeacherDashboardData } from '$lib/types';

export const load: PageLoad = async ({ fetch, parent }): Promise<TeacherDashboardData> => {
  // TODO: Get user from parent layout or session
  // For now, we'll mock the data structure
  
  // Mock user check - in production, this would check actual auth
  const isTeacher = true; // TODO: Replace with actual auth check
  
  if (!isTeacher) {
    throw redirect(302, '/');
  }

  try {
    // TODO: Implement actual API calls when backend is ready
    // Parallel loading for better performance:
    // const [currentClass, allClasses, sectors, missions, submissions] = await Promise.all([
    //   fetch('/api/teacher/class').then(r => r.json()),
    //   fetch('/api/teacher/classes').then(r => r.json()),
    //   fetch('/api/sectors').then(r => r.json()),
    //   fetch('/api/teacher/missions').then(r => r.json()),
    //   fetch('/api/teacher/submissions').then(r => r.json()),
    // ]);
    
    return {
      currentClass: null,
      allClasses: [],
      sectors: [],
      missions: [],
      pendingSubmissions: [],
    };
  } catch (error) {
    console.error('Error loading teacher dashboard data:', error);
    return {
      currentClass: null,
      allClasses: [],
      sectors: [],
      missions: [],
      pendingSubmissions: [],
      error: 'Failed to load dashboard data',
    };
  }
};
