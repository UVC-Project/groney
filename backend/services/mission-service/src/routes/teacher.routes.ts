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

// Helper function to get teacher's active class ID (using ClassUser join table)
async function getActiveClassId(userId: string, requestedClassId?: string): Promise<string | null> {
	// If a specific classId is requested, verify access and return it
	if (requestedClassId) {
		const hasAccess = await verifyTeacherOwnsClass(userId, requestedClassId);
		return hasAccess ? requestedClassId : null;
	}
	
	// Otherwise, get the most recent class the user is a member of
	const membership = await prisma.classUser.findFirst({
		where: { userId },
		include: { class: true },
		orderBy: { class: { createdAt: 'desc' } },
	});

	return membership?.classId || null;
}

// Helper function to verify teacher is a member of the class
async function verifyTeacherOwnsClass(userId: string, classId: string): Promise<boolean> {
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

// GET /api/teacher/sectors - Returns all sectors for teacher's class
// Accepts optional ?classId= query param to specify which class
router.get('/sectors', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const requestedClassId = req.query.classId as string | undefined;

		// Get teacher's active class ID (with optional override)
		const classId = await getActiveClassId(userId, requestedClassId);

		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Get all sectors for this class
		const sectors = await prisma.sector.findMany({
			where: {
				classId,
			},
			orderBy: {
				createdAt: 'asc',
			},
		});

		res.json(sectors);
	} catch (error) {
		console.error('Error fetching sectors:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch sectors' });
	}
});

// POST /api/teacher/sectors - Create a new sector
router.post('/sectors', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { name, type } = req.body;

		// Validation
		if (!name || name.length < 2) {
			return res.status(400).json({ error: 'Bad Request', message: 'Sector name must be at least 2 characters' });
		}
		const validTypes = ['TREES', 'FLOWERS', 'POND', 'ANIMALS', 'GARDEN', 'PLAYGROUND', 'COMPOST', 'OTHER', 'CHICKENS'];
		if (!type || !validTypes.includes(type)) {
			return res.status(400).json({ error: 'Bad Request', message: 'Invalid sector type' });
		}

		const classId = await getActiveClassId(userId);
		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Check if sector name already exists in this class
		const existingSector = await prisma.sector.findFirst({
			where: {
				classId,
				name,
			},
		});
		if (existingSector) {
			return res.status(400).json({ error: 'Bad Request', message: 'A sector with this name already exists' });
		}

		// Create the sector
		const sector = await prisma.sector.create({
			data: {
				classId,
				name,
				type,
			},
		});

		console.log('Created sector:', sector.id);
		res.status(201).json(sector);
	} catch (error) {
		console.error('Error creating sector:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create sector' });
	}
});

// DELETE /api/teacher/sectors/:id - Delete a sector
router.delete('/sectors/:id', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const sectorId = req.params.id;

		const classId = await getActiveClassId(userId);
		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Verify sector belongs to teacher's class
		const sector = await prisma.sector.findFirst({
			where: {
				id: sectorId,
				classId,
			},
			include: {
				missions: true,
			},
		});

		if (!sector) {
			return res.status(404).json({ error: 'Not Found', message: 'Sector not found' });
		}

		// Delete the sector (cascades to missions due to schema)
		await prisma.sector.delete({
			where: { id: sectorId },
		});

		console.log('Deleted sector:', sectorId, 'with', sector.missions.length, 'missions');
		res.json({ success: true, message: 'Sector deleted successfully', deletedMissions: sector.missions.length });
	} catch (error) {
		console.error('Error deleting sector:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete sector' });
	}
});

// GET /api/teacher/missions - Returns all missions for teacher's class with sector info
// Accepts optional ?classId= query param to specify which class
router.get('/missions', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const requestedClassId = req.query.classId as string | undefined;

		// Get teacher's active class ID (with optional override)
		const classId = await getActiveClassId(userId, requestedClassId);

		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Get all missions for this class through sectors
		const missions = await prisma.mission.findMany({
			where: {
				sector: {
					classId,
				},
			},
			include: {
				sector: {
					select: {
						id: true,
						name: true,
						type: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		res.json(missions);
	} catch (error) {
		console.error('Error fetching missions:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch missions' });
	}
});

// POST /api/teacher/missions - Creates new mission (teacher-only)
router.post('/missions', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const {
			sectorId,
			title,
			description,
			xpReward = 10,
			coinReward = 5,
			thirstBoost = 0,
			hungerBoost = 0,
			happinessBoost = 0,
			cleanlinessBoost = 0,
		} = req.body;

		// Validation
		if (!sectorId || !title || !description) {
			return res.status(400).json({
				error: 'Bad Request',
				message: 'Sector ID, title, and description are required',
			});
		}

		// Verify sector exists and belongs to teacher's class
		const sector = await prisma.sector.findUnique({
			where: { id: sectorId },
			include: { class: true },
		});

		if (!sector) {
			return res.status(404).json({ error: 'Not Found', message: 'Sector not found' });
		}

		// Verify teacher is a member of this class
		const isMember = await verifyTeacherOwnsClass(userId, sector.classId);
		if (!isMember) {
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to create missions for this sector',
			});
		}

		// Create the mission
		const mission = await prisma.mission.create({
			data: {
				sectorId,
				title,
				description,
				xpReward,
				coinReward,
				thirstBoost,
				hungerBoost,
				happinessBoost,
				cleanlinessBoost,
			},
			include: {
				sector: {
					select: {
						id: true,
						name: true,
						type: true,
					},
				},
			},
		});

		res.status(201).json(mission);
	} catch (error) {
		console.error('Error creating mission:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create mission' });
	}
});

// PUT /api/teacher/missions/:id - Updates existing mission
router.put('/missions/:id', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { id } = req.params;
		const updates = req.body;

		// Get the mission with sector and class info
		const mission = await prisma.mission.findUnique({
			where: { id },
			include: {
				sector: {
					include: {
						class: true,
					},
				},
			},
		});

		if (!mission) {
			return res.status(404).json({ error: 'Not Found', message: 'Mission not found' });
		}

		// Verify teacher is a member of this class
		const isMember = await verifyTeacherOwnsClass(userId, mission.sector.classId);
		if (!isMember) {
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to update this mission',
			});
		}

		// Update the mission
		const updatedMission = await prisma.mission.update({
			where: { id },
			data: updates,
			include: {
				sector: {
					select: {
						id: true,
						name: true,
						type: true,
					},
				},
			},
		});

		res.json(updatedMission);
	} catch (error) {
		console.error('Error updating mission:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to update mission' });
	}
});

// DELETE /api/teacher/missions/:id - Deletes mission
router.delete('/missions/:id', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { id } = req.params;

		// Get the mission with sector and class info
		const mission = await prisma.mission.findUnique({
			where: { id },
			include: {
				sector: {
					include: {
						class: true,
					},
				},
			},
		});

		if (!mission) {
			return res.status(404).json({ error: 'Not Found', message: 'Mission not found' });
		}

		// Verify teacher is a member of this class
		const isMember = await verifyTeacherOwnsClass(userId, mission.sector.classId);
		if (!isMember) {
			return res.status(403).json({
				error: 'Forbidden',
				message: 'You do not have permission to delete this mission',
			});
		}

		// Delete the mission
		await prisma.mission.delete({
			where: { id },
		});

		res.json({ success: true, message: 'Mission deleted successfully' });
	} catch (error) {
		console.error('Error deleting mission:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to delete mission' });
	}
});

// POST /api/teacher/initialize - Initializes sectors and missions for a class
router.post('/initialize', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { classId } = req.body;

		if (!classId) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class ID is required' });
		}

		// Verify the class belongs to this teacher
		const isOwner = await verifyTeacherOwnsClass(userId, classId);
		if (!isOwner) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		// Check if already initialized
		const existingSectors = await prisma.sector.count({
			where: { classId },
		});

		if (existingSectors > 0) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class already initialized' });
		}

		// Initialize sectors and missions in a transaction
		await prisma.$transaction(async (tx) => {
			// Create 5 default sectors
			const sectors = await Promise.all([
				tx.sector.create({ data: { classId, name: 'Trees', type: 'TREES' } }),
				tx.sector.create({ data: { classId, name: 'Flowers', type: 'FLOWERS' } }),
				tx.sector.create({ data: { classId, name: 'Pond', type: 'POND' } }),
				tx.sector.create({ data: { classId, name: 'Chickens', type: 'CHICKENS' } }),
				tx.sector.create({ data: { classId, name: 'Garden', type: 'GARDEN' } }),
			]);

			// Create default missions for each sector
			const missions = [
				// Trees missions
				{
					sectorId: sectors[0].id,
					title: 'Water the Trees',
					description: 'Water all trees in the schoolyard',
					xpReward: 15,
					coinReward: 10,
					thirstBoost: 20,
					happinessBoost: 5,
				},
				{
					sectorId: sectors[0].id,
					title: 'Remove Dead Branches',
					description: 'Clean up fallen branches and leaves',
					xpReward: 20,
					coinReward: 15,
					happinessBoost: 10,
					cleanlinessBoost: 15,
				},

				// Flowers missions
				{
					sectorId: sectors[1].id,
					title: 'Plant New Flowers',
					description: 'Plant seasonal flowers in the beds',
					xpReward: 25,
					coinReward: 20,
					thirstBoost: 10,
					hungerBoost: 5,
					happinessBoost: 15,
					cleanlinessBoost: 5,
				},
				{
					sectorId: sectors[1].id,
					title: 'Weed the Flower Beds',
					description: 'Remove weeds from flower areas',
					xpReward: 10,
					coinReward: 8,
					thirstBoost: 5,
					happinessBoost: 5,
					cleanlinessBoost: 10,
				},

				// Pond missions
				{
					sectorId: sectors[2].id,
					title: 'Clean the Pond',
					description: 'Remove debris from the pond',
					xpReward: 30,
					coinReward: 25,
					thirstBoost: 15,
					happinessBoost: 10,
					cleanlinessBoost: 20,
				},
				{
					sectorId: sectors[2].id,
					title: 'Feed the Ducks',
					description: 'Give food to the pond ducks',
					xpReward: 15,
					coinReward: 12,
					hungerBoost: 15,
					happinessBoost: 20,
				},

				// Chickens missions
				{
					sectorId: sectors[3].id,
					title: 'Feed the Chickens',
					description: 'Give food and fresh water to chickens',
					xpReward: 15,
					coinReward: 12,
					thirstBoost: 10,
					hungerBoost: 20,
					happinessBoost: 15,
				},
				{
					sectorId: sectors[3].id,
					title: 'Collect Eggs',
					description: 'Gather eggs from the chicken coop',
					xpReward: 20,
					coinReward: 18,
					hungerBoost: 10,
					happinessBoost: 15,
				},

				// Garden missions
				{
					sectorId: sectors[4].id,
					title: 'Harvest Vegetables',
					description: 'Collect ripe vegetables from the garden',
					xpReward: 20,
					coinReward: 18,
					thirstBoost: 5,
					hungerBoost: 25,
					happinessBoost: 20,
				},
				{
					sectorId: sectors[4].id,
					title: 'Water the Garden',
					description: 'Water all plants in the vegetable garden',
					xpReward: 15,
					coinReward: 10,
					thirstBoost: 25,
					happinessBoost: 10,
				},
			];

			await tx.mission.createMany({ data: missions });
		});

		res.json({ message: 'Class initialized successfully with sectors and missions' });
	} catch (error) {
		console.error('Error initializing class:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to initialize class' });
	}
});

export default router;
