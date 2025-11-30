import type { ShopItem, Mascot } from './types';

// In-memory items for Sprint 1
export const shopItems: ShopItem[] = [
    {
        id: 'red-cap',
        name: 'Red Cap',
        description: 'A stylish red cap for Groeny',
        type: 'hat',
        price: 50,
        // backend still uses URL-ish paths; frontend can override with imports
        imageUrl: '/assets/shop/red-cap.png'
    },
    {
        id: 'blue-cap',
        name: 'Blue Cap',
        description: 'A cool blue cap for Groeny',
        type: 'hat',
        price: 50,
        imageUrl: '/assets/shop/blue-cap.png'
    },
    {
        id: 'bow-tie',
        name: 'Bow Tie',
        description: 'A fancy bow tie accessory',
        type: 'accessory',
        price: 60,
        imageUrl: '/assets/shop/bow-tie.png'
    },
    {
        id: 'sunglasses',
        name: 'Sunglasses',
        description: 'Cool sunglasses for sunny days',
        type: 'accessory',
        price: 40,
        imageUrl: '/assets/shop/sunglasses.png'
    },
    {
        id: 'rainbow-colors',
        name: 'Rainbow Colors',
        description: 'Change Groeny to rainbow colors!',
        type: 'color',
        price: 100,
        imageUrl: '/assets/shop/rainbow-colors.png'
    }
];

// Very simple in-memory mascot state for Sprint 1
export const mascots: Mascot[] = [
    {
        id: 'mascot-class-1',
        classId: 'class-1',
        name: 'Groeny',
        coins: 120
    }
];

export function getMascotByClassId(classId: string): Mascot | undefined {
    return mascots.find((m) => m.classId === classId);
}
