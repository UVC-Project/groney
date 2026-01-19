import type { PageLoad } from './$types';
import { mockShopData } from '$lib/shop/mockData';

export const load: PageLoad = async () => {
    // Sprint 1: just return mock data.
    return {
        coins: mockShopData.coins,
        items: mockShopData.items
    };
};
