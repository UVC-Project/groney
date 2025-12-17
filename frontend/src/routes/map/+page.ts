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
}

interface Sector {
	id: string;
	name: string;
	type: string;
	gridX: number;
	gridY: number;
	gridWidth: number;
	gridHeight: number;
	missions: Mission[];
}

interface MapData {
	sectors: Sector[];
	mapWidth: number;
	mapHeight: number;
	className?: string;
}

// Get auth data from localStorage
function getAuthData(): { classId: string | null; token: string | null; userId: string | null } {
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
				};
			} catch {
				return { classId: null, token: null, userId: null };
			}
		}
	}
	return { classId: null, token: null, userId: null };
}

export const load: PageLoad = async ({ fetch }): Promise<MapData> => {
	const { classId, token, userId } = getAuthData();

	if (!classId) {
		console.log('No class ID found, returning empty map');
		return { sectors: [], mapWidth: 20, mapHeight: 16 };
	}

	// Build auth headers
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (userId) headers['x-user-id'] = userId;
	if (token) headers['Authorization'] = `Bearer ${token}`;
	
	// Get user role from localStorage
	const stored = localStorage.getItem('auth');
	if (stored) {
		try {
			const parsed = JSON.parse(stored);
			if (parsed.user?.role) {
				headers['x-user-role'] = parsed.user.role;
			}
		} catch {
			// ignore
		}
	}

	try {
		// Fetch sectors with missions for the student's class
		const [sectorsRes, classRes] = await Promise.all([
			fetch(`${API_BASE_URL}/api/student/sectors?classId=${classId}`, { headers }),
			fetch(`${API_BASE_URL}/api/student/class?classId=${classId}`, { headers }),
		]);

		let sectors: Sector[] = [];
		let mapWidth = 20;
		let mapHeight = 16;
		let className = '';

		if (sectorsRes.ok) {
			sectors = await sectorsRes.json();
		} else {
			console.error('Failed to fetch sectors:', sectorsRes.status);
		}

		if (classRes.ok) {
			const classData = await classRes.json();
			mapWidth = classData.mapWidth || 20;
			mapHeight = classData.mapHeight || 16;
			className = classData.name || '';
		}

		return { sectors, mapWidth, mapHeight, className };
	} catch (error) {
		console.error('Error fetching map data:', error);
		return { sectors: [], mapWidth: 20, mapHeight: 16 };
	}
};
