import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const MASCOT_ENGINE_URL = process.env.MASCOT_ENGINE_URL || 'http://mascot-engine:3002';

router.use(
    '/mascot',
    createProxyMiddleware({
        target: MASCOT_ENGINE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api/mascot': '/api/mascot',
        },
    })
);

router.use(
    '/level-info',
    createProxyMiddleware({
        target: MASCOT_ENGINE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api/level-info': '/api/level-info',
        },
    })
);

export default router;
