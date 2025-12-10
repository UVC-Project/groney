export type ShopItemType = 'hat' | 'accessory' | 'color';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    type: ShopItemType;
    price: number;
    imageUrl: string;
    owned?: boolean;
}

export interface Mascot {
    id: string;
    classId: string;
    name: string;
    coins: number;
    equippedHat?: string;
    equippedAccessory?: string;
    equippedColor?: string;
    updatedAt?: string;
}

export interface Purchase {
    id: string;
    userId: string;
    classId: string;
    itemId: string;
    purchasedAt: string;
}
