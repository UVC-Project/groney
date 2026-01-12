import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const CALCULATION_SERVICE_URL =
  process.env.CALCULATION_SERVICE_URL || 'http://calculation-service:3006';

/**
 * CO2 Calculation Routes
 * POST /api/calculate/co2 - Calculate CO2 for missions
 * GET /api/calculate/co2/class/:classId - Get class CO2 aggregation
 * GET /api/calculate/co2/factors - Get CO2 factors configuration
 */
router.use(
  '/calculate',
  createProxyMiddleware({
    target: CALCULATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/calculate': '/api/calculate',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  })
);

export default router;
