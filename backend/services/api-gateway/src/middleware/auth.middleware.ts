import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
declare global {
	namespace Express {
		interface Request {
			userId?: string;
			userRole?: string;
		}
	}
}

/**
 * Middleware to verify user is authenticated
 * TODO: Implement proper JWT token validation
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
	// For now, we'll use a simple header-based auth
	// In production, this should validate JWT tokens
	const userId = req.headers['x-user-id'] as string;

	if (!userId) {
		return res.status(401).json({
			error: 'Unauthorized',
			message: 'Authentication required',
		});
	}

	// Store userId in request for downstream use
	req.userId = userId;
	next();
};

/**
 * Middleware to verify user has teacher role
 * This should be used after requireAuth
 */
export const requireTeacher = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Get user role from header (temporary)
		// TODO: Fetch from database or JWT token
		const userRole = req.headers['x-user-role'] as string;

		if (!userRole || userRole !== 'TEACHER') {
			return res.status(403).json({
				error: 'Forbidden',
				message: 'Teacher access required',
			});
		}

		req.userRole = userRole;
		next();
	} catch (error) {
		console.error('Error in requireTeacher middleware:', error);
		return res.status(500).json({
			error: 'Internal Server Error',
			message: 'Failed to verify teacher role',
		});
	}
};

/**
 * Middleware to verify teacher owns/manages the class being accessed
 * This should be used after requireTeacher
 */
export const requireClassOwnership = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.userId;
		const classId = req.params.classId || req.body.classId || req.query.classId;

		if (!classId) {
			// If no classId in request, skip this check
			// (some endpoints don't require specific class access)
			return next();
		}

		// TODO: Implement actual class ownership verification
		// This should query the database to verify teacher owns the class
		// For now, we'll pass through and let individual services handle it

		next();
	} catch (error) {
		console.error('Error in requireClassOwnership middleware:', error);
		return res.status(500).json({
			error: 'Internal Server Error',
			message: 'Failed to verify class ownership',
		});
	}
};

/**
 * Middleware to pass authentication context to downstream services
 */
export const passAuthContext = (req: Request, res: Response, next: NextFunction) => {
	// Forward authentication headers to downstream services
	if (req.userId) {
		req.headers['x-user-id'] = req.userId;
	}
	if (req.userRole) {
		req.headers['x-user-role'] = req.userRole;
	}
	next();
};
