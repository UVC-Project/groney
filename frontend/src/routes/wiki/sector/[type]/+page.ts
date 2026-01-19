import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/config';
import { browser } from '$app/environment';

// Disable SSR for this page
export const ssr = false;

interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  thirstBoost?: number;
  hungerBoost?: number;
  happinessBoost?: number;
  cleanlinessBoost?: number;
  missionStatus?: string;
}

interface Sector {
  id: string;
  name: string;
  type: string;
  missions: Mission[];
}

// Get auth data from localStorage
function getAuthData(): { classId: string | null; token: string | null; userId: string | null; role: string | null } {
  if (browser) {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const classId = parsed.classes?.[0]?.id || null;
        return {
          classId,
          token: parsed.token,
          userId: parsed.user?.id,
          role: parsed.user?.role,
        };
      } catch {
        return { classId: null, token: null, userId: null, role: null };
      }
    }
  }
  return { classId: null, token: null, userId: null, role: null };
}

// Get teacher's selected class from localStorage
function getTeacherClassId(): string | null {
  if (browser) {
    return localStorage.getItem('teacher_selected_class_id');
  }
  return null;
}

export const load: PageLoad = async ({ params, fetch }) => {
  const sectorType = params.type?.toUpperCase();
  const { classId: studentClassId, token, userId, role } = getAuthData();

  // For teachers, use their selected class
  const isTeacher = role === 'TEACHER';
  const classId = isTeacher ? getTeacherClassId() : studentClassId;

  console.log('[Wiki] Loading missions for sector type:', sectorType);
  console.log('[Wiki] Auth data:', { classId, userId, role, isTeacher, hasToken: !!token });

  // If not logged in, return empty missions
  if (!classId || !userId) {
    console.log('[Wiki] Not logged in or no class, returning empty missions');
    return { 
      sectorType,
      missions: [],
      sectorName: null,
      isLoggedIn: !!userId,
    };
  }

  // Build auth headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) headers['x-user-id'] = userId;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (role) headers['x-user-role'] = role;

  try {
    // Use different endpoint based on role
    const endpoint = isTeacher 
      ? `${API_BASE_URL}/api/teacher/sectors?classId=${classId}`
      : `${API_BASE_URL}/api/student/sectors?classId=${classId}`;
    
    console.log('[Wiki] Fetching from:', endpoint);
    
    const sectorsRes = await fetch(endpoint, { headers });

    if (!sectorsRes.ok) {
      console.error('[Wiki] Failed to fetch sectors:', sectorsRes.status);
      return { 
        sectorType,
        missions: [],
        sectorName: null,
        isLoggedIn: true,
      };
    }

    const sectors: Sector[] = await sectorsRes.json();
    console.log('[Wiki] Fetched sectors:', sectors.length, 'sectors');
    console.log('[Wiki] Sector types:', sectors.map(s => s.type));
    
    // Find sectors matching this type and collect their missions
    const matchingSectors = sectors.filter(s => s.type.toUpperCase() === sectorType);
    console.log('[Wiki] Matching sectors for', sectorType, ':', matchingSectors.length);
    
    // For teachers, we need to fetch missions separately since teacher endpoint might not include them
    let missions: any[] = [];
    
    if (isTeacher && matchingSectors.length > 0) {
      // Fetch missions for teacher
      const missionsRes = await fetch(`${API_BASE_URL}/api/teacher/missions?classId=${classId}`, { headers });
      if (missionsRes.ok) {
        const allMissions = await missionsRes.json();
        console.log('[Wiki] Teacher missions fetched:', allMissions.length);
        
        // Filter missions by matching sector IDs
        const matchingSectorIds = new Set(matchingSectors.map(s => s.id));
        missions = allMissions
          .filter((m: any) => matchingSectorIds.has(m.sectorId))
          .map((m: any) => {
            const sector = matchingSectors.find(s => s.id === m.sectorId);
            return {
              ...m,
              sectorName: sector?.name,
              missionStatus: 'available', // Teachers see all as available
            };
          });
      }
    } else {
      // For students, missions are included in sectors
      missions = matchingSectors.flatMap(s => {
        console.log('[Wiki] Sector', s.name, 'has', s.missions?.length || 0, 'missions');
        return (s.missions || []).map(m => ({
          ...m,
          sectorName: s.name,
        }));
      });
    }

    console.log('[Wiki] Total missions found:', missions.length);

    // Get the first sector name for display (if multiple sectors of same type)
    const sectorName = matchingSectors.length > 0 ? matchingSectors[0].name : null;

    return { 
      sectorType,
      missions,
      sectorName,
      isLoggedIn: true,
    };
  } catch (error) {
    console.error('[Wiki] Error fetching missions:', error);
    return { 
      sectorType,
      missions: [],
      sectorName: null,
      isLoggedIn: true,
    };
  }
};
