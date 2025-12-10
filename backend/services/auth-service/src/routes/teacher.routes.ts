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

// GET /api/teacher/classes - Returns all classes for a teacher
router.get('/classes', requireTeacher, async (req: Request, res: Response) => {
	try {
		const userId = (req as any).userId;

		// Find all classes where this user is the teacher
		const classes = await prisma.class.findMany({
			where: {
				teacherId: userId,
			},
			select: {
				id: true,
				name: true,
				school: true,
				classCode: true,
				createdAt: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

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

		// Get teacher's user record to find activeClassId
		const teacher = await prisma.user.findUnique({
			where: { id: userId },
			select: { activeClassId: true },
		});

		let classId = teacher?.activeClassId;

		// If no active class set, use the most recent class
		if (!classId) {
			const recentClass = await prisma.class.findFirst({
				where: { teacherId: userId },
				orderBy: { createdAt: 'desc' },
				select: { id: true },
			});
			classId = recentClass?.id;
		}

		if (!classId) {
			return res.status(404).json({ error: 'Not Found', message: 'No class found for this teacher' });
		}

		// Get the class with full details
		const teacherClass = await prisma.class.findUnique({
			where: { id: classId },
			include: {
				mascot: true,
				users: {
					select: {
						id: true,
						username: true,
						role: true,
						createdAt: true,
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
			mascot: teacherClass.mascot ? {
				level: teacherClass.mascot.level,
				xp: teacherClass.mascot.xp,
				coins: teacherClass.mascot.coins,
				thirst: teacherClass.mascot.thirst,
				hunger: teacherClass.mascot.hunger,
				happiness: teacherClass.mascot.happiness,
				cleanliness: teacherClass.mascot.cleanliness,
			} : null,
			students: teacherClass.users.map(user => ({
				id: user.id,
				firstName: user.username, // TODO: Add firstName/lastName to schema
				lastName: '',
				username: user.username,
				role: user.role.toLowerCase(),
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

		// Check if class name already exists for this teacher
		const existingClassName = await prisma.class.findFirst({
			where: {
				teacherId: userId,
				name: className,
			},
		});
		if (existingClassName) {
			return res.status(400).json({ error: 'Bad Request', message: 'You already have a class with this name' });
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

		// Create class with mascot in a transaction
		const newClass = await prisma.$transaction(async (tx) => {
			// Create the class
			const createdClass = await tx.class.create({
				data: {
					name: className,
					school: schoolName,
					classCode,
					teacherId: userId,
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

			// Set this as the teacher's active class
			await tx.user.update({
				where: { id: userId },
				data: { activeClassId: createdClass.id },
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

		// Verify the class belongs to this teacher
		const teacherClass = await prisma.class.findFirst({
			where: {
				id: classId,
				teacherId: userId,
			},
		});

		if (!teacherClass) {
			return res.status(403).json({ error: 'Forbidden', message: 'You do not have access to this class' });
		}

		// Update teacher's activeClassId
		await prisma.user.update({
			where: { id: userId },
			data: { activeClassId: classId },
		});

		res.json({ 
			message: 'Class switched successfully', 
			classId,
			className: teacherClass.name,
		});
	} catch (error) {
		console.error('Error switching class:', error);
		res.status(500).json({ error: 'Internal Server Error', message: 'Failed to switch class' });
	}
});

export default router;