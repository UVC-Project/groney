import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const MISSION_SERVICE_URL = process.env.MISSION_SERVICE_URL || 'http://mission-service:3003';

// Proxy all student routes to mission-service
// The path coming in is the full path like /api/student/sectors
// We just forward it as-is since mission-service expects /api/student/sectors
router.use(
	'/',
	createProxyMiddleware({
		target: MISSION_SERVICE_URL,
		changeOrigin: true,
		onProxyReq: (proxyReq, req, _res) => {
			// Forward auth headers
			const userId = req.headers['x-user-id'];
			const userRole = req.headers['x-user-role'];
			const auth = req.headers['authorization'];
			
			if (userId) proxyReq.setHeader('x-user-id', userId as string);
			if (userRole) proxyReq.setHeader('x-user-role', userRole as string);
			if (auth) proxyReq.setHeader('authorization', auth as string);
		},
	})
);

export default router;
