import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const SUBMISSION_SERVICE_URL = process.env.SUBMISSION_SERVICE_URL || 'http://submission-service:3004';

// Proxy file requests to submission-service
router.use(
  '/',
  createProxyMiddleware({
    target: SUBMISSION_SERVICE_URL,
    changeOrigin: true,
  })
);

export default router;
