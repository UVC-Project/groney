import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

// Login
router.post(
	'/login',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/login': '/api/auth/login',
		},
	})
);

// Verify token
router.get(
	'/verify',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/verify': '/api/auth/verify',
		},
	})
);

// Register teacher
router.post(
	'/register/teacher',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/register/teacher': '/api/auth/register/teacher',
		},
	})
);

// Register student
router.post(
	'/register/student',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/register/student': '/api/auth/register/student',
		},
	})
);

export default router;
