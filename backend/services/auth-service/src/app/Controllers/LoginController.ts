import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES_IN = '7d';

export default class LoginController {
	/**
	 * Login a user (student or teacher)
	 */
	static async login(req: Request, res: Response) {
		try {
			const { username, password } = req.body;

			if (!username || !password) {
				return res.status(400).json({ message: 'Missing username or password' });
			}

			const user = await prisma.user.findUnique({
				where: { username },
				include: {
					classMember: {
						include: {
							class: true,
						},
					},
				},
			});

			if (!user) {
				return res.status(401).json({ message: 'Invalid username or password' });
			}

			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				return res.status(401).json({ message: 'Invalid username or password' });
			}

			// Get the user's classes
			const classes = user.classMember.map((cm) => ({
				id: cm.class.id,
				name: cm.class.name,
				school: cm.class.school,
				classCode: cm.class.classCode,
			}));

			// For students, get their first (and usually only) class
			// For teachers, they may have multiple classes
			const primaryClassId = classes.length > 0 ? classes[0].id : null;

			const payload = {
				id: user.id,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				classId: primaryClassId,
			};

			const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

			return res.json({
				message: 'Login successful',
				token,
				user: {
					id: user.id,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
				classes,
			});
		} catch (err: unknown) {
			console.error('Login error:', err);
			const message = err instanceof Error ? err.message : 'Login failed';
			return res.status(500).json({ message });
		}
	}

	/**
	 * Verify JWT token and return user info
	 */
	static async verifyToken(req: Request, res: Response) {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res.status(401).json({ message: 'No token provided' });
			}

			const token = authHeader.split(' ')[1];
			const decoded = jwt.verify(token, JWT_SECRET) as {
				id: string;
				username: string;
				role: string;
			};

			const user = await prisma.user.findUnique({
				where: { id: decoded.id },
				include: {
					classMember: {
						include: {
							class: true,
						},
					},
				},
			});

			if (!user) {
				return res.status(401).json({ message: 'User not found' });
			}

			const classes = user.classMember.map((cm) => ({
				id: cm.class.id,
				name: cm.class.name,
				school: cm.class.school,
				classCode: cm.class.classCode,
			}));

			return res.json({
				user: {
					id: user.id,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
				classes,
			});
		} catch (err: unknown) {
			console.error('Token verification error:', err);
			return res.status(401).json({ message: 'Invalid token' });
		}
	}
}
