import type { PageLoad } from './$types';
import { API_BASE_URL } from '$lib/config';
import { get } from 'svelte/store';
import { auth } from '$lib/stores/auth';
import { browser } from '$app/environment';

// Disable SSR - this page requires auth context
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  const missionId = params.missionId;
  
  // Default mission data (fallback)
  let mission = {
    id: missionId,
    title: 'Loading...',
    description: '',
    xpReward: 0,
    coinReward: 0,
    thirstBoost: 0,
    hungerBoost: 0,
    happinessBoost: 0,
    cleanlinessBoost: 0,
  };
  
  let submissionId: string | null = null;

  if (browser) {
    try {
      const authState = get(auth);
      const classId = authState.classes?.[0]?.id;

      if (authState.user && classId) {
        // Fetch user's pending submissions to find the one for this mission
        const response = await fetch(
          `${API_BASE_URL}/api/student/my-missions?classId=${classId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': authState.user.id,
              'x-user-role': authState.user.role,
              ...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {}),
            },
          }
        );

        if (response.ok) {
          const myMissions = await response.json();
          
          // Find the submission for this mission
          const myMission = myMissions.find((m: any) => m.mission.id === missionId);
          
          if (myMission) {
            submissionId = myMission.submissionId;
            mission = {
              id: myMission.mission.id,
              title: myMission.mission.title,
              description: myMission.mission.description,
              xpReward: myMission.mission.xpReward,
              coinReward: myMission.mission.coinReward,
              thirstBoost: myMission.mission.thirstBoost || 0,
              hungerBoost: myMission.mission.hungerBoost || 0,
              happinessBoost: myMission.mission.happinessBoost || 0,
              cleanlinessBoost: myMission.mission.cleanlinessBoost || 0,
            };
          }
        }
      }
    } catch (error) {
      console.error('Error loading mission data:', error);
    }
  }

  return {
    missionId,
    submissionId,
    mission,
  };
};
