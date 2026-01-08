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

// Request new password
router.post(
	'/password-reset/request',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/password-reset/request': '/api/auth/password-reset/request',
		},
	})
);

// Reset password
router.post(
	'/password-reset/reset',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/password-reset/reset': '/api/auth/password-reset/reset',
		},
	})
);

// Get profile
router.get(
	'/profile',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/profile': '/api/auth/profile',
		},
	})
);

// Update profile
router.put(
	'/profile/update',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/auth/profile/update': '/api/auth/profile/update',
		},
	})
);

export default router;