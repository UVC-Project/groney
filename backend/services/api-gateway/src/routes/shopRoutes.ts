import { Router } from 'express';

const router = Router();

const shopHost = process.env.SHOP_SERVICE_HOST ?? 'shop-service';
const shopPort = process.env.SHOP_SERVICE_PORT ?? '3005';
const BASE_URL = `http://${shopHost}:${shopPort}/api`;

async function forwardGet(path: string, res: any) {
    try {
        const response = await fetch(`${BASE_URL}${path}`);
        const json = await response.json().catch(() => ({}));
        return res.status(response.status).json(json);
    } catch (err) {
        console.error('Gateway GET error:', err);
        return res.status(500).json({ message: 'Shop service unavailable' });
    }
}

async function forwardPost(path: string, body: any, res: any) {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const json = await response.json().catch(() => ({}));
        return res.status(response.status).json(json);
    } catch (err) {
        console.error('Gateway POST error:', err);
        return res.status(500).json({ message: 'Shop service unavailable' });
    }
}

router.get('/shop/items', (req, res) => {
    const query = req.originalUrl.split('?')[1];
    const suffix = query ? `/shop/items?${query}` : '/shop/items';
    return forwardGet(suffix, res);
});

router.post('/shop/purchase', (req, res) => {
    return forwardPost('/shop/purchase', req.body, res);
});

router.post('/mascot/equip', (req, res) => {
    return forwardPost('/mascot/equip', req.body, res);
});

router.post('/mascot/unequip', (req, res) => {
    return forwardPost('/mascot/unequip', req.body, res);
});

export default router;
