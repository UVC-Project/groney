import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify student authentication
const requireStudent = (req: Request, res: Response, next: Function) => {
	const userId = req.headers['x-user-id'] as string;
	const userRole = req.headers['x-user-role'] as string;

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized', message: 'User ID required' });
	}

	// Allow both students and teachers to access student routes
	if (userRole !== 'STUDENT' && userRole !== 'TEACHER') {
		return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
	}

	(req as any).userId = userId;
	(req as any).userRole = userRole;
	next();
};

// Verify user has access to the class
async function verifyClassAccess(userId: string, classId: string): Promise<boolean> {
	const membership = await prisma.classUser.findUnique({
		where: {
			classId_userId: {
				classId,
				userId,
			},
		},
	});
	return !!membership;
}

// GET /api/student/sectors - Get sectors with missions for a class
router.get('/sectors', requireStudent, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const classId = req.query.classId as string;

		if (!classId) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class ID is required' });
		}

		// Verify user has access to this class
		const hasAccess = await verifyClassAccess(userId, classId);
		if (!hasAccess) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		// Get all sectors with their missions for the class
		// Only return sectors that are placed on the map (gridX >= 0)
		const sectors = await prisma.sector.findMany({
			where: {
				classId,
				gridX: { gte: 0 },
				gridY: { gte: 0 },
			},
			include: {
				missions: {
					select: {
						id: true,
						title: true,
						description: true,
						xpReward: true,
						coinReward: true,
						thirstBoost: true,
						hungerBoost: true,
						happinessBoost: true,
						cleanlinessBoost: true,
					},
				},
			},
			orderBy: { createdAt: 'asc' },
		});

		res.json(sectors);
	} catch (error) {
		console.error('Error fetching student sectors:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch sectors' });
	}
});

// GET /api/student/class - Get class info (map dimensions, name, etc.)
router.get('/class', requireStudent, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const classId = req.query.classId as string;

		if (!classId) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class ID is required' });
		}

		// Verify user has access to this class
		const hasAccess = await verifyClassAccess(userId, classId);
		if (!hasAccess) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		const classData = await prisma.class.findUnique({
			where: { id: classId },
			select: {
				id: true,
				name: true,
				school: true,
				mapWidth: true,
				mapHeight: true,
			},
		});

		if (!classData) {
			return res.status(404).json({ error: 'Not Found', message: 'Class not found' });
		}

		res.json(classData);
	} catch (error) {
		console.error('Error fetching class info:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch class info' });
	}
});

// POST /api/student/missions/:missionId/accept - Accept a mission
router.post('/missions/:missionId/accept', requireStudent, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { missionId } = req.params;
		const { classId } = req.body;

		if (!classId) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class ID is required' });
		}

		// Verify user has access to this class
		const hasAccess = await verifyClassAccess(userId, classId);
		if (!hasAccess) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		// Verify mission exists and belongs to this class
		const mission = await prisma.mission.findUnique({
			where: { id: missionId },
			include: {
				sector: {
					select: { classId: true },
				},
			},
		});

		if (!mission) {
			return res.status(404).json({ error: 'Not Found', message: 'Mission not found' });
		}

		if (mission.sector.classId !== classId) {
			return res.status(403).json({ error: 'Forbidden', message: 'Mission does not belong to this class' });
		}

		// Check if user already has a pending submission for this mission
		const existingSubmission = await prisma.submission.findFirst({
			where: {
				missionId,
				userId,
				status: 'PENDING',
			},
		});

		if (existingSubmission) {
			return res.status(400).json({
				error: 'Bad Request',
				message: 'You already have a pending submission for this mission',
			});
		}

		// Create a submission record (pending status - student needs to upload photo)
		const submission = await prisma.submission.create({
			data: {
				missionId,
				userId,
				classId,
				status: 'PENDING',
			},
		});

		res.status(201).json({
			message: 'Mission accepted! Complete it and submit a photo for review.',
			submission: {
				id: submission.id,
				missionId: submission.missionId,
				status: submission.status,
			},
		});
	} catch (error) {
		console.error('Error accepting mission:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to accept mission' });
	}
});

export default router;
