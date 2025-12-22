import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const SUPPLY_SERVICE_URL = process.env.SUPPLY_SERVICE_URL;
if (!SUPPLY_SERVICE_URL) {
  throw new Error('SUPPLY_SERVICE_URL is not set');
}

// Student supply endpoints (body parsing needed -> gateway already has express.json before /api routes)
router.use(
  '/supplies',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
  })
);

export default router;
