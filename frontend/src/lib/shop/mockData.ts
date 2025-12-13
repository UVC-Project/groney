import RedCapImg from '$lib/assets/images/shop/red-cap.png';
import BlueCapImg from '$lib/assets/images/shop/blue-cap.png';
import BowTieImg from '$lib/assets/images/shop/bow-tie.png';
import SunglassesImg from '$lib/assets/images/shop/sunglasses.png';

export type ShopItemType = 'hat' | 'accessory';

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

export const mockShopData: ShopPageData = {
    coins: 200,
    items: [
        {
            id: 'red-cap',
            name: 'Red Cap',
            description: 'A stylish red cap for Groeny',
            type: 'hat',
            price: 50,
            imageUrl: RedCapImg,
            owned: false
        },
        {
            id: 'blue-cap',
            name: 'Blue Cap',
            description: 'A cool blue cap for Groeny',
            type: 'hat',
            price: 50,
            imageUrl: BlueCapImg,
            owned: false
        },
        {
            id: 'bow-tie',
            name: 'Bow Tie',
            description: 'A fancy bow tie accessory',
            type: 'accessory',
            price: 60,
            imageUrl: BowTieImg,
            owned: true
        },
        {
            id: 'sunglasses',
            name: 'Sunglasses',
            description: 'Cool sunglasses for sunny days',
            type: 'accessory',
            price: 40,
            imageUrl: SunglassesImg,
            owned: true
        }
    ]
};
