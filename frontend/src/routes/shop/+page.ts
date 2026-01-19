import type { PageLoad } from './$types';
import { browser } from '$app/environment';
import { MASCOT_ENGINE_URL } from '$lib/config';

const GATEWAY = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Disable SSR since we need localStorage
export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
    // Get userId from auth storage (same pattern as homepage)
    let userId = '';
    if (browser) {
        try {
            const authData = localStorage.getItem('auth');
            if (authData) {
                const parsed = JSON.parse(authData);
                userId = parsed?.user?.id ?? '';
            }
        } catch {
            userId = localStorage.getItem('userId') ?? '';
        }
    }
    console.log('[shop load] userId:', userId);

    const itemsRes = await fetch(
      userId
        ? `${GATEWAY}/api/shop/items?userId=${encodeURIComponent(userId)}`
        : `${GATEWAY}/api/shop/items`
    );
    const items = itemsRes.ok ? await itemsRes.json() : [];

    let coins = 0;
    let classId: string | null = null;

    if (userId) {
        // Fetch from mascot-engine to get accurate coin balance
        const mascotRes = await fetch(`${MASCOT_ENGINE_URL}/api/mascot/by-user/${encodeURIComponent(userId)}`);
        console.log('[shop load] mascot status:', mascotRes.status);

        if (mascotRes.ok) {
            const mascot = await mascotRes.json();
            coins = mascot?.coins ?? 0;
            classId = mascot?.classId ?? null;
        }
    }

    return { coins, items, userId: userId || null, classId };
};
