import type { PageLoad } from './$types';

// Disable SSR - this page requires auth context
export const ssr = false;

export const load: PageLoad = async ({ params }) => {
  // UI-only for now - just pass the mission ID
  // Real data loading to be implemented 
  return {
    missionId: params.missionId,
    // Mock data for UI development
    mission: {
      id: params.missionId,
      title: 'Water the Garden Plants',
      description: 'Go to the school garden and water all the plants in the vegetable section. Make sure the soil is moist but not flooded. Take a photo showing the watered plants.',
      xpReward: 50,
      coinReward: 25,
      thirstBoost: 10,
      hungerBoost: 0,
      happinessBoost: 5,
      cleanlinessBoost: 0,
    }
  };
};

