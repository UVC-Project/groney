import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const MASCOT_ENGINE_URL = process.env.MASCOT_ENGINE_URL || 'http://mascot-engine:3002';

// Proxy middleware with body handling for POST requests
router.use(
    '/mascot',
    createProxyMiddleware({
        target: MASCOT_ENGINE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api/mascot': '/api/mascot',
        },
        onProxyReq: (proxyReq, req: any) => {
            // If body was parsed by express.json(), we need to restream it
            if (req.body && Object.keys(req.body).length > 0) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
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
