import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import { shopItems, getMascotByClassId, purchases } from './shopData';
import type { Mascot, Purchase } from './types';

config();

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

app.get('/api/shop/items', (req, res) => {
  const userId = req.query.userId as string | undefined;

  const ownedIds = new Set(
      purchases
          .filter((p) => !userId || p.userId === userId)
          .map((p) => p.itemId)
  );

  const itemsWithOwned = shopItems.map((item) => ({
    ...item,
    owned: ownedIds.has(item.id)
  }));

  res.json(itemsWithOwned);
});

app.get('/api/mascot/:classId', (req, res) => {
  const { classId } = req.params;
  const mascot = getMascotByClassId(classId);

  if (!mascot) {
    return res.status(404).json({ message: 'Mascot not found' });
  }

  res.json(mascot);
});

app.post('/api/shop/purchase', (req, res) => {
  const { userId, classId, itemId } = req.body as {
    userId?: string;
    classId?: string;
    itemId?: string;
  };

  if (!userId || !classId || !itemId) {
    return res.status(400).json({ message: 'Missing userId, classId or itemId' });
  }

  const mascot = getMascotByClassId(classId);
  if (!mascot) {
    return res.status(404).json({ message: 'Mascot not found' });
  }

  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

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

app.post('/api/mascot/equip', (req, res) => {
  const { classId, itemId } = req.body as {
    classId?: string;
    itemId?: string;
  };

  if (!classId || !itemId) {
    return res.status(400).json({ message: 'Missing classId or itemId' });
  }

  const mascot = getMascotByClassId(classId);
  if (!mascot) {
    return res.status(404).json({ message: 'Mascot not found' });
  }

  const item = shopItems.find((i) => i.id === itemId);
  if (!item) {
    return res.status(404).json({ message: 'Wearable item not found' });
  }

  if (item.type === 'hat') {
    mascot.equippedHat = item.id;
  } else if (item.type === 'accessory') {
    mascot.equippedAccessory = item.id;
  } else {
    return res.status(400).json({ message: 'This item type cannot be equipped' });
  }

  mascot.updatedAt = new Date().toISOString();
  res.json(mascot);
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
