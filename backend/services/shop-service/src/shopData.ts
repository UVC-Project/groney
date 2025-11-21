import type { ShopItem, Purchase, Mascot } from './types';

export const groenyItems: ShopItem[] = [
    {
        id: 'red-cap',
        name: 'Red Cap',
        description: 'A stylish red cap for Groeny',
        type: 'hat',
        price: 50,
        imageUrl: '/assets/shop/red-cap.png',
        customizationData: { slot: 'hat' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'blue-cap',
        name: 'Blue Cap',
        description: 'A cool blue cap for Groeny',
        type: 'hat',
        price: 50,
        imageUrl: '/assets/shop/blue-cap.png',
        customizationData: { slot: 'hat' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'bow-tie',
        name: 'Bow Tie',
        description: 'A fancy bow tie accessory',
        type: 'accessory',
        price: 60,
        imageUrl: '/assets/shop/bow-tie.png',
        customizationData: { slot: 'accessory' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'sunglasses',
        name: 'Sunglasses',
        description: 'Cool sunglasses for sunny days',
        type: 'accessory',
        price: 40,
        imageUrl: '/assets/shop/sunglasses.png',
        customizationData: { slot: 'accessory' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'rainbow-colors',
        name: 'Rainbow Colors',
        description: 'Change Groeny to rainbow colors!',
        type: 'color',
        price: 100,
        imageUrl: '/assets/shop/rainbow-colors.png',
        customizationData: { slot: 'color' },
        createdAt: new Date().toISOString()
    }
];

export const purchases: Purchase[] = [];

export const mascots: Record<string, Mascot> = {
    'class-1': {
        id: 'mascot-class-1',
        classId: 'class-1',
        name: 'Groeny',
        level: 1,
        xp: 0,
        thirst: 100,
        hunger: 100,
        happiness: 100,
        cleanliness: 100,
        coins: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
};
