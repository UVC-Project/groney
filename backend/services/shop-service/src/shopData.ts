import type { ShopItem, Mascot, Purchase } from './types';

export const shopItems: ShopItem[] = [
    {
        id: 'red-cap',
        name: 'Red Cap',
        description: 'A stylish red cap for Groeny',
        type: 'hat',
        price: 50,
        imageUrl: 'frontend/src/lib/assets/images/shop/red-cap.png'
    },
    {
        id: 'blue-cap',
        name: 'Blue Cap',
        description: 'A cool blue cap for Groeny',
        type: 'hat',
        price: 50,
        imageUrl: 'frontend/src/lib/assets/images/shop/blue-cap.png'
    },
    {
        id: 'bow-tie',
        name: 'Bow Tie',
        description: 'A fancy bow tie accessory',
        type: 'accessory',
        price: 60,
        imageUrl: 'frontend/src/lib/assets/images/shop/bow-tie.png'
    },
    {
        id: 'sunglasses',
        name: 'Sunglasses',
        description: 'Cool sunglasses for sunny days',
        type: 'accessory',
        price: 40,
        imageUrl: 'frontend/src/lib/assets/images/shop/sunglasses.png'
    },
];

export const mascots: Mascot[] = [
    {
        id: 'mascot-class-1',
        classId: 'class-1',
        name: 'Groeny',
        coins: 1000000,
        equippedHat: undefined,
        equippedAccessory: undefined,
        equippedColor: undefined,
        updatedAt: new Date().toISOString()
    }
];

export const purchases: Purchase[] = [];

export function getMascotByClassId(classId: string): Mascot | undefined {
    return mascots.find((m) => m.classId === classId);
}
