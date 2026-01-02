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

// Calculate cooldown status for a mission (CLASS-WIDE cooldown)
// If anyone in the class completed the mission, it's on cooldown for everyone
async function getMissionCooldownStatus(missionId: string, classId: string, cooldownHours: number, maxCompletions: number | null) {
	// Get ALL completed submissions for this mission in this class (not just this user)
	const completedSubmissions = await prisma.submission.findMany({
		where: {
			missionId,
			classId,
			status: 'COMPLETED',
		},
		orderBy: { updatedAt: 'desc' },
	});

	const completionCount = completedSubmissions.length;

	// Check if max completions reached (class-wide)
	if (maxCompletions !== null && completionCount >= maxCompletions) {
		return {
			available: false,
			reason: 'max_completions',
			completionCount,
			maxCompletions,
			cooldownEndsAt: null,
			hoursRemaining: null,
		};
	}

	// Check cooldown from last completion by ANYONE in the class
	if (completedSubmissions.length > 0) {
		const lastCompletion = completedSubmissions[0];
		const cooldownEndsAt = new Date(lastCompletion.updatedAt.getTime() + cooldownHours * 60 * 60 * 1000);
		const now = new Date();

		if (now < cooldownEndsAt) {
			const hoursRemaining = Math.ceil((cooldownEndsAt.getTime() - now.getTime()) / (60 * 60 * 1000));
			return {
				available: false,
				reason: 'cooldown',
				completionCount,
				maxCompletions,
				cooldownEndsAt: cooldownEndsAt.toISOString(),
				hoursRemaining,
			};
		}
	}

	return {
		available: true,
		reason: null,
		completionCount,
		maxCompletions,
		cooldownEndsAt: null,
		hoursRemaining: null,
	};
}

// GET /api/student/sectors - Get sectors with calculated status & urgency
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

		// Fetch Sectors AND Mascot in parallel
		const [sectors, mascot] = await Promise.all([
			prisma.sector.findMany({
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
							cooldownHours: true,
							maxCompletions: true,
							category: true,
						},
					},
				},
				orderBy: { createdAt: 'asc' },
			}),
			prisma.mascot.findUnique({
				where: { classId }
			})
		]);

		// Define Critical Threshold (Mascot needs help!)
		const CRITICAL_LEVEL = 30;

		// Add status and urgency to each mission
		const sectorsWithStatus = await Promise.all(
			sectors.map(async (sector) => ({
				...sector,
				missions: await Promise.all(
					sector.missions.map(async (mission) => {
						const cooldownStatus = await getMissionCooldownStatus(
							mission.id,
							classId,
							mission.cooldownHours,
							mission.maxCompletions
						);

						// Check if THIS user has a pending submission (my active mission)
						const myPendingSubmission = await prisma.submission.findFirst({
							where: {
								missionId: mission.id,
								userId,
								status: 'PENDING',
							},
						});

						// Check if ANYONE ELSE in the class has a pending submission (mission taken)
						const otherPendingSubmission = await prisma.submission.findFirst({
							where: {
								missionId: mission.id,
								classId,
								status: 'PENDING',
								userId: { not: userId },
							},
							include: {
								user: {
									select: { firstName: true, lastName: true },
								},
							},
						});

						// Determine mission status for display
						let missionStatus: 'available' | 'my_active' | 'taken' | 'cooldown' | 'max_reached';
						if (myPendingSubmission) {
							missionStatus = 'my_active';
						} else if (otherPendingSubmission) {
							missionStatus = 'taken';
						} else if (!cooldownStatus.available) {
							missionStatus = cooldownStatus.reason === 'max_completions' ? 'max_reached' : 'cooldown';
						} else {
							missionStatus = 'available';
						}

						// If Mascot stat < 30 AND Mission boosts that stat => URGENT
						let isUrgent = false;
						if (mascot && missionStatus === 'available') {
							if (mascot.thirst < CRITICAL_LEVEL && (mission.thirstBoost || 0) > 0) isUrgent = true;
							if (mascot.hunger < CRITICAL_LEVEL && (mission.hungerBoost || 0) > 0) isUrgent = true;
							if (mascot.happiness < CRITICAL_LEVEL && (mission.happinessBoost || 0) > 0) isUrgent = true;
							if (mascot.cleanliness < CRITICAL_LEVEL && (mission.cleanlinessBoost || 0) > 0) isUrgent = true;
						}

						return {
							...mission,
							cooldownStatus,
							missionStatus,
							isUrgent,
							myPendingSubmissionId: myPendingSubmission?.id || null,
							takenBy: otherPendingSubmission ? {
								firstName: otherPendingSubmission.user.firstName,
								lastName: otherPendingSubmission.user.lastName,
							} : null,
						};
					})
				),
			}))
		);

		res.json(sectorsWithStatus);
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

		if (mission.status !== 'AVAILABLE') {
			throw new Error('MISSION_TAKEN');
		}

		await prisma.mission.update({
			where: { id: missionId },
			data: { status: 'IN_PROGRESS' }
		});

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
				submissionId: existingSubmission.id,
			});
		}

		// Check if someone else in the class already has this mission (it's taken)
		const takenByOther = await prisma.submission.findFirst({
			where: {
				missionId,
				classId,
				status: 'PENDING',
				userId: { not: userId },
			},
			include: {
				user: {
					select: { firstName: true },
				},
			},
		});

		if (takenByOther) {
			return res.status(400).json({
				error: 'Bad Request',
				message: `This mission is already being done by ${takenByOther.user.firstName}`,
			});
		}

		// Check cooldown status (CLASS-WIDE)
		const cooldownStatus = await getMissionCooldownStatus(
			missionId,
			classId,
			mission.cooldownHours,
			mission.maxCompletions
		);

		if (!cooldownStatus.available) {
			if (cooldownStatus.reason === 'max_completions') {
				return res.status(400).json({
					error: 'Bad Request',
					message: `This mission has reached the maximum completions (${cooldownStatus.maxCompletions}) for your class`,
					cooldownStatus,
				});
			} else {
				return res.status(400).json({
					error: 'Bad Request',
					message: `Mission is on cooldown. Available in ${cooldownStatus.hoursRemaining} hour(s)`,
					cooldownStatus,
				});
			}
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

// GET /api/student/my-missions - Get user's active (pending) missions
router.get('/my-missions', requireStudent, async (req: Request, res: Response) => {
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

		// Get user's pending submissions with mission details
		const myMissions = await prisma.submission.findMany({
			where: {
				userId,
				classId,
				status: 'PENDING',
			},
			include: {
				mission: {
					include: {
						sector: {
							select: { id: true, name: true, type: true },
						},
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		res.json(myMissions.map(sub => ({
			submissionId: sub.id,
			acceptedAt: sub.createdAt,
			mission: {
				id: sub.mission.id,
				title: sub.mission.title,
				description: sub.mission.description,
				xpReward: sub.mission.xpReward,
				coinReward: sub.mission.coinReward,
				thirstBoost: sub.mission.thirstBoost,
				hungerBoost: sub.mission.hungerBoost,
				happinessBoost: sub.mission.happinessBoost,
				cleanlinessBoost: sub.mission.cleanlinessBoost,
				sector: sub.mission.sector,
			},
		})));
	} catch (error) {
		console.error('Error fetching my missions:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch your missions' });
	}
});

export default router;
