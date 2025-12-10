import type { PageLoad } from './$types';

const API_URL = 'http://localhost:3005';

export const load: PageLoad = async ({ fetch }) => {
    const userId = 'user-1';
    const classId = 'class-1';

    try {
        const [itemsRes, mascotRes] = await Promise.all([
            fetch(`${API_URL}/api/shop/items?userId=${userId}`),
            fetch(`${API_URL}/api/mascot/${classId}`)
        ]);

        if (itemsRes.ok && mascotRes.ok) {
            const items = await itemsRes.json();
            const mascot = await mascotRes.json();

            return {
                coins: mascot.coins,
                items,
                userId,
                classId
            };
        } else {
            console.error('Failed to load shop data', {
                itemsStatus: itemsRes.status,
                mascotStatus: mascotRes.status
            });
        }
    } catch (err) {
        console.error('Error loading shop data', err);
    }

    return {
        coins: 0,
        items: [],
        userId,
        classId
    };
};
