import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerifyEmail } from '../../utils/VerifyEmailMailer';

const prisma: PrismaClient = new PrismaClient();

export default class RegisterController {
	/**
	 * Register a teacher with their first class
	 */
	static async registerTeacher(req: Request, res: Response) {
		try {
			const { firstName, lastName, username, email, password, className, schoolName } = req.body;

			if (!firstName || !lastName || !username || !email || !password || !className || !schoolName) {
				return res.status(400).json({ message: 'Missing required fields' });
			}

			if (password.length < 8) {
				return res.status(400).json({ message: 'Password must be at least 8 characters long' });
			}

			const taken = await prisma.user.findUnique({
				where: { username },
			});

			if (taken) {
				return res.status(409).json({ message: 'Username is already taken' });
			}

			if (email) {
				const emailTaken = await prisma.user.findUnique({
					where: { email }
				});

				if (emailTaken) {
					return res.status(409).json({ message: 'Email is already taken' });
				}
			}

			const hashed = await bcrypt.hash(password, 10);

			// Generate unique class code
			const generateClassCode = () => {
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
				let code = '';
				for (let i = 0; i < 6; i++) {
					code += chars.charAt(Math.floor(Math.random() * chars.length));
				}
				return code;
			};

			let classCode = generateClassCode();
			let existingClass = await prisma.class.findUnique({ where: { classCode } });
			while (existingClass) {
				classCode = generateClassCode();
				existingClass = await prisma.class.findUnique({ where: { classCode } });
			}

			const verificationToken = crypto.randomBytes(32).toString('hex');
			const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

			// Create teacher, class, membership, and mascot in a transaction
			const result = await prisma.$transaction(async (tx) => {
				const teacher = await tx.user.create({
					data: {
						firstName,
						lastName,
						username,
						email,
						password: hashed,
						role: UserRole.TEACHER,
						emailVerified: false,
						emailVerificationToken: verificationToken,
						emailVerificationExp: verificationExpiry,
					},
				});

				await sendVerifyEmail(email, verificationToken);

				const cls = await tx.class.create({
					data: {
						name: className,
						school: schoolName,
						classCode,
					},
				});

				// Add teacher as member of the class
				await tx.classUser.create({
					data: {
						classId: cls.id,
						userId: teacher.id,
					},
				});

				// Create mascot for the class
				await tx.mascot.create({
					data: {
						classId: cls.id,
						thirst: 100,
						hunger: 100,
						happiness: 100,
						cleanliness: 100,
						level: 1,
						xp: 0,
						coins: 0,
					},
				});

				return { teacher, cls };
			});


			return res.status(201).json({
				message: 'Teacher registered successfully',
				user: {
					id: result.teacher.id,
					firstName: result.teacher.firstName,
					lastName: result.teacher.lastName,
					username: result.teacher.username,
					email: result.teacher.email,
					role: result.teacher.role,
				},
				class: {
					id: result.cls.id,
					name: result.cls.name,
					school: result.cls.school,
					classCode: result.cls.classCode,
				},
			});
		} catch (err: unknown) {
			console.error('Teacher registration error:', err);
			const message = err instanceof Error ? err.message : 'Registration failed';
			return res.status(500).json({ message });
		}
	}

	/**
	 * Register a student with a class code
	 */
	static async registerStudent(req: Request, res: Response) {
		try {
			const { firstName, lastName, username, password, classCode } = req.body;

			if (!firstName || !lastName || !username || !password || !classCode) {
				return res.status(400).json({ message: 'Missing required fields' });
			}

			const cls = await prisma.class.findUnique({
				where: { classCode },
			});

			if (!cls) {
				return res.status(404).json({ message: 'Invalid class code' });
			}

			if (password.length < 8) {
				return res.status(400).json({ message: 'Password must be at least 8 characters long' });
			}

			const taken = await prisma.user.findUnique({
				where: { username },
			});

			if (taken) {
				return res.status(409).json({ message: 'Username is already taken' });
			}

			const hashed = await bcrypt.hash(password, 10);

			// Create student and class membership in a transaction
			const result = await prisma.$transaction(async (tx) => {
				const student = await tx.user.create({
					data: {
						firstName,
						lastName,
						username,
						password: hashed,
						role: UserRole.STUDENT,
					},
				});

				// Add student as member of the class
				await tx.classUser.create({
					data: {
						classId: cls.id,
						userId: student.id,
					},
				});

				return student;
			});

			return res.status(201).json({
				message: 'Student registered successfully',
				user: {
					id: result.id,
					firstName: result.firstName,
					lastName: result.lastName,
					username: result.username,
					role: result.role,
				},
				classId: cls.id,
			});
		} catch (err: unknown) {
			console.error('Student registration error:', err);
			const message = err instanceof Error ? err.message : 'Registration failed';
			return res.status(500).json({ message });
		}
	}
}
