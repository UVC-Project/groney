import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const SUPPLY_SERVICE_URL = process.env.SUPPLY_SERVICE_URL || 'http://localhost:3007';

/**
 * Helper: forward JSON body for POST/PATCH/PUT requests.
 * (http-proxy-middleware does not always forward parsed body automatically when using express.json())
 */
function forwardJsonBody(proxyReq: any, req: any) {
  const hasBody =
    req.body &&
    typeof req.body === 'object' &&
    Object.keys(req.body).length > 0;

  if (!hasBody) return;

  const bodyData = JSON.stringify(req.body);
  proxyReq.setHeader('Content-Type', 'application/json');
  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
}

/**
 * Proxy: /api/supplies -> SUPPLY_SERVICE_URL/api/supplies
 *
 * Supports:
 * - GET /api/supplies
 */
router.use(
  '/supplies',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: forwardJsonBody
  })
);

/**
 * Proxy: /api/supply-requests -> SUPPLY_SERVICE_URL/api/supply-requests
 *
 * Supports:
 * - POST /api/supply-requests
 */
router.use(
  '/supply-requests',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: forwardJsonBody
  })
);

/**
 * ✅ IMPORTANT: Teacher routes were missing before
 * Proxy: /api/teacher/supply-requests -> SUPPLY_SERVICE_URL/api/teacher/supply-requests
 *
 * Supports:
 * - GET  /api/teacher/supply-requests?classId=...&status=PENDING
 * - POST /api/teacher/supply-requests/:id/status   (approve/reject)
 */
router.use(
  '/teacher/supply-requests',
  createProxyMiddleware({
    target: SUPPLY_SERVICE_URL,
    changeOrigin: true,
    onProxyReq: forwardJsonBody
  })
);

export default router;
