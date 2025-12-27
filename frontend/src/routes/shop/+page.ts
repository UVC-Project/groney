import type { PageLoad } from './$types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const load: PageLoad = async ({ fetch }) => {
    const userId = 'user-1';
    const classId = 'class-1';

    try {
        const [itemsRes, mascotRes] = await Promise.all([
            fetch(`${API_URL}/api/shop/items?userId=${userId}`),
            fetch(`${API_URL}/api/mascot/${classId}`)
        ]);

        const items = itemsRes.ok ? await itemsRes.json() : [];
        const mascot = mascotRes.ok ? await mascotRes.json() : null;

        return {
            coins: mascot?.coins ?? 0,
            items,
            userId,
            classId
        };
    } catch (err) {
        console.error('Error loading shop data', err);
        return {
            coins: 0,
            items: [],
            userId,
            classId
        };
    }
};
