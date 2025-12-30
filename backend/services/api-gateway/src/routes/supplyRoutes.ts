import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const SUPPLY_SERVICE_URL =
  process.env.SUPPLY_SERVICE_URL || 'http://localhost:3007';

/**
 * Student: list supplies
 * GET /api/supplies
 */
router.use(
  '/supplies',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
  })
);

/**
 * Student: create supply request
 * POST /api/supply-requests
 */
router.use(
  '/supply-requests',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  })
);

export default router;
