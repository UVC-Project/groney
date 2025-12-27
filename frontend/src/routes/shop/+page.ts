import type { PageLoad } from './$types';
import { browser } from '$app/environment';

const GATEWAY = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const SHOP = 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
    const userId = browser ? (localStorage.getItem('userId') ?? '') : '';
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
        const mascotRes = await fetch(`${SHOP}/api/mascot/by-user/${encodeURIComponent(userId)}`);
        console.log('[shop load] mascot status:', mascotRes.status);

        if (mascotRes.ok) {
            const mascot = await mascotRes.json();
            coins = mascot?.coins ?? 0;
            classId = mascot?.classId ?? null;
        }
    }

    return { coins, items, userId: userId || null, classId };
};
