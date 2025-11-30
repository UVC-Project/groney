export type ShopItemType = 'hat' | 'accessory' | 'color';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    type: ShopItemType;
    price: number;
    imageUrl: string;
    owned?: boolean; // frontend may use this later
}

export interface Mascot {
    id: string;
    classId: string;
    name: string;
    coins: number;
}
