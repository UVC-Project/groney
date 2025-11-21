// backend/src/shopRoutes.ts
import { Router } from 'express';
import { groenyItems, mascots, purchases } from './shopData';
import type { Mascot, Purchase } from './types';

const router = Router();

function getMascot(classId: string): Mascot {
    const mascot = mascots[classId];
    if (!mascot) {
        throw new Error('Mascot not found');
    }
    return mascot;
}

// GET /api/mascot/:classId
router.get('/mascot/:classId', (req, res) => {
    try {
        const mascot = getMascot(req.params.classId);
        res.json(mascot);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
});

// GET /api/shop/items?userId=...
router.get('/shop/items', (req, res) => {
    const userId = req.query.userId as string | undefined;

    const ownedIds = new Set(
        purchases
            .filter((p) => !userId || p.userId === userId)
            .map((p) => p.itemId)
    );

    const itemsWithOwned = groenyItems.map((item) => ({
        ...item,
        owned: ownedIds.has(item.id)
    }));

    res.json(itemsWithOwned);
});

// POST /api/shop/purchase
router.post('/shop/purchase', (req, res) => {
    const { userId, classId, itemId } = req.body as {
        userId: string;
        classId: string;
        itemId: string;
    };

    if (!userId || !classId || !itemId) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const mascot = getMascot(classId);

    const item = groenyItems.find((i) => i.id === itemId);
    if (!item) {
        return res.status(404).json({ message: 'Item not found' });
    }

    // already bought?
    const alreadyOwned = purchases.some(
        (p) => p.userId === userId && p.itemId === itemId
    );
    if (alreadyOwned) {
        return res.status(400).json({ message: 'Item already owned' });
    }

    if (mascot.coins < item.price) {
        return res.status(400).json({ message: 'Not enough coins' });
    }

    mascot.coins -= item.price;
    mascot.updatedAt = new Date().toISOString();

    const purchase: Purchase = {
        id: `purchase-${Date.now()}`,
        userId,
        classId,
        itemId,
        purchasedAt: new Date().toISOString()
    };
    purchases.push(purchase);

    res.json({ mascot, purchase });
});

// POST /api/mascot/equip
router.post('/mascot/equip', (req, res) => {
    const { classId, itemId } = req.body as {
        classId: string;
        itemId: string;
    };

    const mascot = getMascot(classId);
    const item = groenyItems.find((i) => i.id === itemId);

    if (!item) {
        return res.status(404).json({ message: 'Wearable item not found' });
    }

    switch (item.type) {
        case 'hat':
            mascot.equippedHat = item.id;
            break;
        case 'accessory':
            mascot.equippedAccessory = item.id;
            break;
        case 'color':
            mascot.equippedColor = item.id;
            break;
        default:
            return res
                .status(400)
                .json({ message: 'This item type cannot be equipped' });
    }

    mascot.updatedAt = new Date().toISOString();
    res.json(mascot);
});

export default router;
