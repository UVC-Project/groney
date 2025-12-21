import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { PrismaClient, ActivityType, ItemType } from '@prisma/client';

config();

const prisma = new PrismaClient();

const app = express();
const PORT = Number(process.env.PORT ?? process.env.SHOP_SERVICE_PORT ?? 3005);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'shop-service',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shop-service' });
});

/**
 * GET /api/shop/items?userId=...
 * Returns all shop items and marks which ones are owned by the user.
 */
app.get('/api/shop/items', async (req, res) => {
  const userId = req.query.userId as string | undefined;

  try {
    const items = await prisma.shopItem.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const ownedIds = new Set<string>();
    if (userId) {
      const owned = await prisma.purchase.findMany({
        where: { userId },
        select: { itemId: true }
      });

      for (const p of owned) ownedIds.add(p.itemId);
    }

    const itemsWithOwned = items.map((item) => ({
      ...item,
      owned: userId ? ownedIds.has(item.id) : false
    }));

    res.json(itemsWithOwned);
  } catch (err) {
    console.error('Error fetching shop items:', err);
    res.status(500).json({ message: 'Failed to fetch shop items' });
  }
});

/**
 * GET /api/mascot/:classId
 * Returns the mascot for a class.
 */
app.get('/api/mascot/:classId', async (req, res) => {
  const { classId } = req.params;

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId }
    });

    if (!mascot) {
      return res.status(404).json({ message: 'Mascot not found' });
    }

    res.json(mascot);
  } catch (err) {
    console.error('Error fetching mascot:', err);
    res.status(500).json({ message: 'Failed to fetch mascot' });
  }
});

/**
 * POST /api/shop/purchase
 * Body: { userId, classId, itemId }
 * Transaction:
 *  - verify mascot exists
 *  - verify item exists
 *  - verify not already owned (requires @@unique([userId, itemId]) on Purchase)
 *  - verify enough coins
 *  - decrement coins
 *  - create purchase
 *  - create activity log
 */
app.post('/api/shop/purchase', async (req, res) => {
  const { userId, classId, itemId } = req.body as {
    userId?: string;
    classId?: string;
    itemId?: string;
  };

  if (!userId || !classId || !itemId) {
    return res.status(400).json({ message: 'Missing userId, classId or itemId' });
  }

  try {
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const mascot = await tx.mascot.findUnique({
        where: { classId }
      });

      if (!mascot) {
        throw new Error('MASCOT_NOT_FOUND');
      }

      const alreadyOwned = await tx.purchase.findUnique({
        where: { userId_itemId: { userId, itemId } }
      });

      if (alreadyOwned) {
        throw new Error('ALREADY_OWNED');
      }

      if (mascot.coins < item.price) {
        throw new Error('NOT_ENOUGH_COINS');
      }

      const updatedMascot = await tx.mascot.update({
        where: { id: mascot.id },
        data: {
          coins: { decrement: item.price }
        }
      });

      const purchase = await tx.purchase.create({
        data: {
          userId,
          classId,
          itemId
        }
      });

      // If your schema requires other Activity fields (e.g. "title" etc),
      // adjust this data shape to match.
      await tx.activity.create({
        data: {
          classId,
          userId,
          type: ActivityType.PURCHASE,
          content: `bought ${item.name}`
        }
      });

      return { updatedMascot, purchase };
    });

    res.json({ mascot: result.updatedMascot, purchase: result.purchase });
  } catch (err: any) {
    if (err?.message === 'MASCOT_NOT_FOUND') {
      return res.status(404).json({ message: 'Mascot not found' });
    }
    if (err?.message === 'ALREADY_OWNED') {
      return res.status(400).json({ message: 'Item already owned' });
    }
    if (err?.message === 'NOT_ENOUGH_COINS') {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    console.error('Error purchasing item:', err);
    res.status(500).json({ message: 'Failed to purchase item' });
  }
});

/**
 * POST /api/mascot/equip
 * Body: { classId, itemId, userId? }
 * Equips hat or accessory (no colors).
 * Optional ownership check if userId provided.
 */
app.post('/api/mascot/equip', async (req, res) => {
  const { classId, itemId, userId } = req.body as {
    classId?: string;
    itemId?: string;
    userId?: string;
  };

  if (!classId || !itemId) {
    return res.status(400).json({ message: 'Missing classId or itemId' });
  }

  try {
    const mascot = await prisma.mascot.findUnique({
      where: { classId }
    });

    if (!mascot) {
      return res.status(404).json({ message: 'Mascot not found' });
    }

    const item = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return res.status(404).json({ message: 'Wearable item not found' });
    }

    // Optional: enforce that the user owns the item before equipping it
    if (userId) {
      const owned = await prisma.purchase.findUnique({
        where: { userId_itemId: { userId, itemId } }
      });

      if (!owned) {
        return res.status(403).json({ message: 'You do not own this item' });
      }
    }

    // Expecting Prisma enum values (HAT, ACCESSORY). If your schema uses strings, adjust accordingly.
    if (item.type === ItemType.HAT) {
      const updated = await prisma.mascot.update({
        where: { id: mascot.id },
        data: { equippedHat: item.id }
      });
      return res.json(updated);
    }

    if (item.type === ItemType.ACCESSORY) {
      const updated = await prisma.mascot.update({
        where: { id: mascot.id },
        data: { equippedAccessory: item.id }
      });
      return res.json(updated);
    }

    return res.status(400).json({ message: 'This item type cannot be equipped' });
  } catch (err) {
    console.error('Error equipping item:', err);
    res.status(500).json({ message: 'Failed to equip item' });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

app.listen(PORT, () => {
  console.log(`Shop service running on port ${PORT}`);
});
