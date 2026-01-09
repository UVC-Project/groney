import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import crypto from 'crypto';
import { sendVerifyEmail } from '../../utils/VerifyEmailMailer';

const prisma = new PrismaClient();

export default class EmailVerificationController {
	/**
	 * Verify email
	 */
	static async verify(req: Request, res: Response) {
		const rawToken = req.query.token;

		if (typeof rawToken !== "string") {
			return res.status(400).json({ message: "Invalid verification token" });
		}

		const token = rawToken.trim();

		const user = await prisma.user.findFirst({
			where: {
				emailVerificationToken: token,
			},
		});

		if (!user) {
			return res.status(400).json({
				message: "Verification link is invalid or already used",
			});
		}

		if (
			user.emailVerificationExp &&
			user.emailVerificationExp.getTime() < Date.now()
		) {
			return res.status(400).json({
				message: "Verification link has expired",
			});
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerified: true,
				emailVerificationToken: null,
				emailVerificationExp: null,
			},
		});

		return res.json({
			message: "Email verified successfully",
		});
	}



	/**
	 * Resend verification email
	 */
	static async resend(req: Request, res: Response) {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}

		const user = await prisma.user.findFirst({
			where: {
				email,
				role: UserRole.TEACHER,
			},
		});

		// Always return same response (anti-enumeration)
		if (!user || user.emailVerified) {
			return res.json({
				message: 'If the email exists, a verification link has been sent',
			});
		}

		const token = crypto.randomBytes(32).toString('hex');
		const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerificationToken: token,
				emailVerificationExp: expiry,
			},
		});

		await sendVerifyEmail(user.email!, token);

		return res.json({
			message: 'If the email exists, a verification link has been sent',
		});
	}
}
