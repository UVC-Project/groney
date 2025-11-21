// backend/src/types.ts

export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    profileImageUrl?: string;
    role: 'student' | 'teacher';
    classId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Class {
    id: string;
    name: string;
    school: string;
    classCode: string;
    createdById?: string;
    createdAt: string;
}

export interface Mascot {
    id: string;
    classId: string;
    name: string;
    level: number;
    xp: number;
    thirst: number;
    hunger: number;
    happiness: number;
    cleanliness: number;
    coins: number;
    equippedHat?: string;
    equippedAccessory?: string;
    equippedColor?: string;
    lastFed?: string;
    lastWatered?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShopItem {
    id: string;
    name: string;
    description?: string;
    type: 'hat' | 'accessory' | 'color' | 'supply';
    price: number;
    imageUrl?: string;
    customizationData?: Record<string, unknown>;
    createdAt: string;
}

export interface Purchase {
    id: string;
    userId: string;
    itemId: string;
    classId: string;
    purchasedAt: string;
}
