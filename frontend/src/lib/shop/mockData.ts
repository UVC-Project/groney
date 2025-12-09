// src/lib/shop/mockData.ts

export type ShopItemType = 'hat' | 'accessory' | 'color';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    type: ShopItemType;
    price: number;
    imageUrl: string;
    owned: boolean;
}

export interface ShopPageData {
    coins: number;
    items: ShopItem[];
}

// Sprint 1: in-memory catalog (frontend only)
export const mockShopData: ShopPageData = {
    coins: 200,
    items: [
        {
            id: 'red-cap',
            name: 'Red Cap',
            description: 'A stylish red cap for Groeny',
            type: 'hat',
            price: 50,
            imageUrl: '/assets/shop/red-cap.png.png',
            owned: false
        },
        {
            id: 'blue-cap',
            name: 'Blue Cap',
            description: 'A cool blue cap for Groeny',
            type: 'hat',
            price: 50,
            imageUrl: '/assets/shop/blue-cap.png.png',
            owned: false
        },
        {
            id: 'bow-tie',
            name: 'Bow Tie',
            description: 'A fancy bow tie accessory',
            type: 'accessory',
            price: 60,
            imageUrl: '/assets/shop/bow-tie.png.png',
            owned: true
        },
        {
            id: 'sunglasses',
            name: 'Sunglasses',
            description: 'Cool sunglasses for sunny days',
            type: 'accessory',
            price: 40,
            imageUrl: '/assets/shop/sunglasses.png.png',
            owned: true
        },
        {
            id: 'rainbow-colors',
            name: 'Rainbow Colors',
            description: 'Change Groeny to rainbow colors!',
            type: 'color',
            price: 100,
            imageUrl: '/assets/shop/rainbow-colors.png.png',
            owned: false
        }
    ]
};
