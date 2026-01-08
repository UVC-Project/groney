import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default class ProfileController {
	/**
	 * Get current user's profile
	 */
	static async getProfile(req: Request, res: Response) {
		try {
			const userId = req.headers['x-user-id'] as string;

			if (!userId) {
				return res.status(401).json({ message: 'Unauthorized' });
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					firstName: true,
					lastName: true,
					username: true,
					email: true,
					role: true,
				},
			});

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			return res.json(user);
		} catch (err) {
			console.error('Get profile error:', err);
			return res.status(500).json({ message: 'Failed to fetch profile' });
		}
	}

	/**
	 * Update profile
	 */
	static async updateProfile(req: Request, res: Response) {
		try {
			const userId = req.headers['x-user-id'] as string;
			const role = req.headers['x-user-role'] as string;

			if (!userId) {
				return res.status(401).json({ message: 'Unauthorized' });
			}

			const {
				firstName,
				lastName,
				username,
				email,
				password,
			} = req.body;

			const data: any = {};

			if (firstName) data.firstName = firstName;
			if (lastName) data.lastName = lastName;
			if (username) data.username = username;

			// Teacher-only email update
			if (role === 'TEACHER' && email) {
				data.email = email;
			}

			// Optional password change
			if (password) {
				if (password.length < 8) {
					return res.status(400).json({
						message: 'Password must be at least 8 characters',
					});
				}
				data.password = await bcrypt.hash(password, 10);
			}

			const updated = await prisma.user.update({
				where: { id: userId },
				data,
				select: {
					id: true,
					firstName: true,
					lastName: true,
					username: true,
					email: true,
					role: true,
				},
			});

			return res.json({
				message: 'Profile updated successfully',
				user: updated,
			});
		} catch (err: any) {
			console.error('Update profile error:', err);
			return res.status(500).json({ message: 'Failed to update profile' });
		}
	}
}
