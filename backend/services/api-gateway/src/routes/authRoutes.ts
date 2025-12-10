import { Router } from 'express';

const router = Router();

const BASE_URL = `http://localhost:3001`;

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
        console.error('Gateway POST error (auth):', err);
        return res.status(500).json({ message: 'Auth service unavailable' });
    }
}

router.post('/login', (req, res) => {
    return forwardPost('/login', req.body, res);
});

export default router;
