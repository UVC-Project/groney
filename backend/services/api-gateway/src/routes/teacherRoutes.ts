import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requireAuth, requireTeacher, passAuthContext } from '../middleware/auth.middleware';

const router = Router();

// Service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const MISSION_SERVICE_URL = process.env.MISSION_SERVICE_URL || 'http://localhost:3003';
const SUBMISSION_SERVICE_URL = process.env.SUBMISSION_SERVICE_URL || 'http://localhost:3004';

// Apply authentication middleware to all teacher routes
router.use(requireAuth);
router.use(requireTeacher);
router.use(passAuthContext);

// Auth Service routes - Class management
router.use(
	'/classes',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/classes': '/api/teacher/classes',
		},
		onProxyReq: (proxyReq, req) => {
			// Forward authentication headers
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

router.use(
	'/class',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/class': '/api/teacher/class',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

router.use(
	'/create-class',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/create-class': '/api/teacher/create-class',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

router.use(
	'/switch-class',
	createProxyMiddleware({
		target: AUTH_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/switch-class': '/api/teacher/switch-class',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

// Mission Service routes - Sectors, Missions, Initialization
router.use(
	'/sectors',
	createProxyMiddleware({
		target: MISSION_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/sectors': '/api/teacher/sectors',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

router.use(
	'/missions',
	createProxyMiddleware({
		target: MISSION_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/missions': '/api/teacher/missions',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

router.use(
	'/initialize',
	createProxyMiddleware({
		target: MISSION_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/initialize': '/api/teacher/initialize',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

// Submission Service routes - Submissions review
router.use(
	'/submissions',
	createProxyMiddleware({
		target: SUBMISSION_SERVICE_URL,
		changeOrigin: true,
		pathRewrite: {
			'^/api/teacher/submissions': '/api/teacher/submissions',
		},
		onProxyReq: (proxyReq, req) => {
			if (req.headers['x-user-id']) {
				proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
			}
			if (req.headers['x-user-role']) {
				proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
			}
		},
	})
);

export default router;
