import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify teacher role
const requireTeacher = (req: Request, res: Response, next: Function) => {
	// TODO: Implement actual authentication middleware
	// For now, we'll assume the user is authenticated and userId is in req.user
	const userId = req.headers['x-user-id'] as string;

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
	}

	// Store userId for use in route handlers
	(req as any).userId = userId;
	next();
};

// GET /api/teacher/submissions - Returns pending submissions for teacher's class
router.get('/submissions', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;

		// Get teacher's current class
		const teacherClass = await prisma.class.findFirst({
			where: {
				teacherId: userId,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		if (!teacherClass) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Get all pending submissions for this class
		const submissions = await prisma.submission.findMany({
			where: {
				classId: teacherClass.id,
				status: 'PENDING',
			},
			include: {
				mission: {
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
				user: {
					select: {
						id: true,
						username: true,
						role: true,
					},
				},
			},
			orderBy: {
				createdAt: 'asc', // Oldest first
			},
		});

		// Transform to match frontend expectations
		const response = submissions.map((submission) => ({
			id: submission.id,
			missionId: submission.missionId,
			mission: {
				id: submission.mission.id,
				title: submission.mission.title,
				description: submission.mission.description,
			},
			student: {
				id: submission.user.id,
				firstName: submission.user.username, // TODO: Add firstName/lastName to schema
				lastName: '',
				username: submission.user.username,
			},
			photoUrl: submission.photoUrl,
			submittedAt: submission.createdAt.toISOString(),
			status: submission.status.toLowerCase(),
		}));

		res.json(response);
	} catch (error) {
		console.error('Error fetching submissions:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch submissions' });
	}
});

// POST /api/submissions/:id/review - Review a submission (approve/reject)
router.post('/submissions/:id/review', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { id } = req.params;
		const { status } = req.body;

		// Validate status
		if (!status || !['completed', 'rejected'].includes(status)) {
			return res.status(400).json({
				error: 'Bad Request',
				message: 'Status must be either "completed" or "rejected"',
			});
		}

		// Get the submission with class info
		const submission = await prisma.submission.findUnique({
			where: { id },
			include: {
				class: true,
				mission: true,
			},
		});

		if (!submission) {
			return res.status(404).json({ error: 'Not Found', message: 'Submission not found' });
		}

		// Verify teacher owns this class
		if (submission.class.teacherId !== userId) {
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to review this submission',
			});
		}

		// Verify submission is pending
		if (submission.status !== 'PENDING') {
			return res.status(400).json({
				error: 'Bad Request',
				message: 'Submission has already been reviewed',
			});
		}

		// Update submission status
		const dbStatus = status === 'completed' ? 'COMPLETED' : 'REJECTED';

		const updatedSubmission = await prisma.$transaction(async (tx) => {
			// Update submission
			const updated = await tx.submission.update({
				where: { id },
				data: {
					status: dbStatus,
					updatedAt: new Date(),
				},
			});

			// If approved, award XP and coins to mascot
			if (status === 'completed') {
				const mascot = await tx.mascot.findUnique({
					where: { classId: submission.classId },
				});

				if (mascot) {
					// Calculate new stats (capped at 100)
					const newThirst = Math.min(100, mascot.thirst + submission.mission.thirstBoost);
					const newHunger = Math.min(100, mascot.hunger + submission.mission.hungerBoost);
					const newHappiness = Math.min(100, mascot.happiness + submission.mission.happinessBoost);
					const newCleanliness = Math.min(100, mascot.cleanliness + submission.mission.cleanlinessBoost);

					// Update mascot
					await tx.mascot.update({
						where: { id: mascot.id },
						data: {
							xp: mascot.xp + submission.mission.xpReward,
							coins: mascot.coins + submission.mission.coinReward,
							thirst: newThirst,
							hunger: newHunger,
							happiness: newHappiness,
							cleanliness: newCleanliness,
						},
					});

					// Create activity feed entry
					await tx.activity.create({
						data: {
							classId: submission.classId,
							userId: submission.userId,
							type: 'MISSION_COMPLETED',
							content: `completed ${submission.mission.title}`,
							imageUrl: submission.photoUrl,
						},
					});
				}
			}

			return updated;
		});

		res.json({
			id: updatedSubmission.id,
			status: updatedSubmission.status.toLowerCase(),
			message: `Submission ${status === 'completed' ? 'approved' : 'rejected'} successfully`,
		});
	} catch (error) {
		console.error('Error reviewing submission:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to review submission' });
	}
});

export default router;
