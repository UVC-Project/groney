import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Middleware to verify teacher role
const requireTeacher = (req: Request, res: Response, next: Function) => {
	const userId = req.headers['x-user-id'] as string;

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
	}

	(req as any).userId = userId;
	next();
};

// Helper to get teacher's first class (since activeClassId is removed)
async function getTeacherFirstClassId(userId: string): Promise<string | null> {
	const membership = await prisma.classUser.findFirst({
		where: { userId },
		include: { class: true },
		orderBy: { class: { createdAt: 'desc' } },
	});
	return membership?.classId || null;
}

// GET /api/teacher/classes - Returns all classes for a teacher
router.get('/classes', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;

		// Find all classes where this user is a member (teacher)
		const memberships = await prisma.classUser.findMany({
			where: { userId },
			include: {
				class: {
					select: {
						id: true,
						name: true,
						school: true,
						classCode: true,
						createdAt: true,
					},
				},
			},
			orderBy: { class: { createdAt: 'desc' } },
		});

		const classes = memberships.map((m) => m.class);
		res.json(classes);
	} catch (error) {
		console.error('Error fetching teacher classes:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch classes' });
	}
});

// GET /api/teacher/class - Returns current active class with mascot and students
router.get('/class', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;

		// Get teacher's first class (most recent)
		const classId = await getTeacherFirstClassId(userId);

		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Get the class with full details
		const teacherClass = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				mascot: true,
				members: {
					include: {
						user: {
							select: {
								id: true,
								firstName: true,
								lastName: true,
								username: true,
								role: true,
								createdAt: true,
							},
						},
					},
				},
			},
		});

		if (!teacherClass) {
			return res.status(404).json({ error: 'Not Found', message: 'Class not found' });
		}

		// Transform to match frontend expectations
		const response = {
			id: teacherClass.id,
			name: teacherClass.name,
			school: teacherClass.school,
			classCode: teacherClass.classCode,
			mascot: teacherClass.mascot
				? {
						level: teacherClass.mascot.level,
						xp: teacherClass.mascot.xp,
						coins: teacherClass.mascot.coins,
						thirst: teacherClass.mascot.thirst,
						hunger: teacherClass.mascot.hunger,
						happiness: teacherClass.mascot.happiness,
						cleanliness: teacherClass.mascot.cleanliness,
					}
				: null,
			students: teacherClass.members
				.filter((m) => m.user.role === 'STUDENT')
				.map((m) => ({
					id: m.user.id,
					firstName: m.user.firstName,
					lastName: m.user.lastName,
					username: m.user.username,
					role: m.user.role.toLowerCase(),
				})),
		};

		res.json(response);
	} catch (error) {
		console.error('Error fetching teacher class:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to fetch class' });
	}
});

// POST /api/teacher/create-class - Creates new class with initialization
router.post('/create-class', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { className, schoolName } = req.body;

		// Validation
		if (!className || className.length < 2) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class name must be at least 2 characters' });
		}
		if (!schoolName || schoolName.length < 2) {
			return res.status(400).json({ error: 'Bad Request', message: 'School name must be at least 2 characters' });
		}

		// Generate unique class code (6 characters)
		const generateClassCode = () => {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			let code = '';
			for (let i = 0; i < 6; i++) {
				code += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return code;
		};

		let classCode = generateClassCode();

		// Ensure code is unique
		let existingClass = await prisma.class.findUnique({ where: { classCode } });
		while (existingClass) {
			classCode = generateClassCode();
			existingClass = await prisma.class.findUnique({ where: { classCode } });
		}

		// Create class with mascot and teacher membership in a transaction
		const newClass = await prisma.$transaction(async (tx) => {
			// Create the class
			const createdClass = await tx.class.create({
				data: {
					name: className,
					school: schoolName,
					classCode,
				},
			});

			// Add teacher as a member of the class
			await tx.classUser.create({
				data: {
					classId: createdClass.id,
					userId,
				},
			});

			// Create the mascot for the class
			await tx.mascot.create({
				data: {
					classId: createdClass.id,
					thirst: 100,
					hunger: 100,
					happiness: 100,
					cleanliness: 100,
					level: 1,
					xp: 0,
					coins: 0,
				},
			});

			return createdClass;
		});

		res.status(201).json({
			id: newClass.id,
			name: newClass.name,
			school: newClass.school,
			classCode: newClass.classCode,
			message: 'Class created successfully',
		});
	} catch (error) {
		console.error('Error creating class:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to create class' });
	}
});

// POST /api/teacher/switch-class - Switches teacher's active class
router.post('/switch-class', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;
		const { classId } = req.body;

		if (!classId) {
			return res.status(400).json({ error: 'Bad Request', message: 'Class ID is required' });
		}

		// Verify the teacher is a member of this class
		const membership = await prisma.classUser.findUnique({
			where: {
				classId_userId: {
					classId,
					userId,
				},
			},
			include: { class: true },
		});

		if (!membership) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		// Note: Since activeClassId is removed, we just verify access
		// The frontend should handle which class is "active" via state

		res.json({
			message: 'Class switched successfully',
			classId,
			className: membership.class.name,
		});
	} catch (error) {
		console.error('Error switching class:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to switch class' });
	}
});

export default router;