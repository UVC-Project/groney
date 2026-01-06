import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';
const JWT_EXPIRES_IN = '7d';

// Streak milestone rewards: day -> coins
const STREAK_MILESTONES: Record<number, number> = {
	3: 2,
	5: 5,
	7: 7,
	14: 10,
	30: 15,
	60: 25,
	90: 40,
	180: 75,
	365: 150,
};

// Motivational messages for milestone rewards
const MILESTONE_MESSAGES: string[] = [
	"You're on fire!",
	"Great consistency!",
	"Grooney is proud of you!",
	"Keep the streak alive!",
	"Awesome job showing up!",
];

/**
 * Get coin reward for a streak milestone, or 0 if not a milestone
 */
function getMilestoneReward(streakDay: number): number {
	return STREAK_MILESTONES[streakDay] || 0;
}

/**
 * Get a random motivational message for milestone rewards
 */
function getRandomMilestoneMessage(): string {
	const index = Math.floor(Math.random() * MILESTONE_MESSAGES.length);
	return MILESTONE_MESSAGES[index];
}


//Milesetone reward event data for the UI

interface MilestoneRewardEvent {
	streakDay: number;
	coinsEarned: number;
	message: string;
}

//Get today's date in Amsterdam timezone as a date object 
function getAmsterdamToday(): Date {
	const now = new Date();
	// Format date parts in Amsterdam timezone
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Amsterdam',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const parts = formatter.formatToParts(now);
	const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
	const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
	const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
	
	// Return a date representning midnight in Amsterdam (stored as UTC equivalent)
	return new Date(Date.UTC(year, month, day));
}

//Get yesterday's date in Amsterdam timezone

function getAmsterdamYesterday(): Date {
	const today = getAmsterdamToday();
	return new Date(today.getTime() - 24 * 60 * 60 * 1000);
}

//Convert a date to Amsterdam date for comparison 

function toAmsterdamDay(date: Date): Date {
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Amsterdam',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const parts = formatter.formatToParts(date);
	const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
	const month = parseInt(parts.find(p => p.type === 'month')?.value || '1') - 1;
	const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');
	
	return new Date(Date.UTC(year, month, day));
}

interface StreakResult {
	currentStreak: number;
	longestStreak: number;
	streakBroken: boolean;
}

export default class LoginController {
//Calculate streak based on last login date 

	static calculateStreak(
		lastLoginDate: Date | null,
		currentStreak: number,
		longestStreak: number
	): StreakResult {
		const today = getAmsterdamToday();
		const yesterday = getAmsterdamYesterday();

		// First time login ever
		if (!lastLoginDate) {
			return {
				currentStreak: 1,
				longestStreak: Math.max(1, longestStreak),
				streakBroken: false,
			};
		}

		const lastLoginDay = toAmsterdamDay(lastLoginDate);

		// Already logged in today - no change
		if (lastLoginDay.getTime() === today.getTime()) {
			return {
				currentStreak,
				longestStreak,
				streakBroken: false,
			};
		}

		// Logged in yesterday - continue streak
		if (lastLoginDay.getTime() === yesterday.getTime()) {
			const newStreak = currentStreak + 1;
			return {
				currentStreak: newStreak,
				longestStreak: Math.max(newStreak, longestStreak),
				streakBroken: false,
			};
		}

		// Missed one or more days - streak broken, reset to 1
		return {
			currentStreak: 1,
			longestStreak: longestStreak, // Keep longest unchanged
			streakBroken: currentStreak > 0, // Was there a streak to break?
		};
	}

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

			// Calculate streak for students
			let streakData: StreakResult | null = null;
			let milestoneRewardEvent: MilestoneRewardEvent | null = null;
			if (user.role === 'STUDENT') {
				streakData = LoginController.calculateStreak(
					user.lastLoginDate,
					user.currentStreak,
					user.longestStreak
				);

				// Determine if streak changed (not already logged in today)
				const streakChanged = streakData.currentStreak !== user.currentStreak;
				
				// Determine new lastMilestoneReached value
				let newLastMilestoneReached = user.lastMilestoneReached;
				
				// If streak was broken/reset, reset milestone tracking
				if (streakData.streakBroken || (streakChanged && streakData.currentStreak === 1)) {
					newLastMilestoneReached = 0;
				}
				
				// Check if current streak is a milestone and hasn't been rewarded yet
				const milestoneReward = getMilestoneReward(streakData.currentStreak);
				const shouldRewardMilestone = streakChanged && 
					milestoneReward > 0 && 
					streakData.currentStreak > newLastMilestoneReached;
				
				// Grant milestone coins to the class mascot
				if (shouldRewardMilestone && user.classMember.length > 0) {
					const classId = user.classMember[0].classId;
					await prisma.mascot.updateMany({
						where: { classId },
						data: {
							coins: {
								increment: milestoneReward,
							},
						},
					});
					newLastMilestoneReached = streakData.currentStreak;
					
					// Create milestone reward event for the UI
					milestoneRewardEvent = {
						streakDay: streakData.currentStreak,
						coinsEarned: milestoneReward,
						message: getRandomMilestoneMessage(),
					};
					
					console.log(`🎉 Streak milestone ${streakData.currentStreak} days reached by ${user.username}! Awarded ${milestoneReward} coins.`);
				}

				// Update user's streak data in database
				await prisma.user.update({
					where: { id: user.id },
					data: {
						currentStreak: streakData.currentStreak,
						longestStreak: streakData.longestStreak,
						lastLoginDate: getAmsterdamToday(),
						lastMilestoneReached: newLastMilestoneReached,
					},
				});
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
				// Include streak data for students
				...(streakData && {
					streak: {
						current: streakData.currentStreak,
						longest: streakData.longestStreak,
						broken: streakData.streakBroken,
					},
				}),
				// Include milestone reward event if earned
				...(milestoneRewardEvent && {
					milestoneReward: milestoneRewardEvent,
				}),
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

			// Calculate if streak was broken for students (check without updating)
			let streakData = null;
			if (user.role === 'STUDENT') {
				const today = getAmsterdamToday();
				const yesterday = getAmsterdamYesterday();
				const lastLoginDay = user.lastLoginDate ? toAmsterdamDay(user.lastLoginDate) : null;

				// Check if streak is still valid (logged in today or yesterday)
				const streakValid = lastLoginDay && (
					lastLoginDay.getTime() === today.getTime() ||
					lastLoginDay.getTime() === yesterday.getTime()
				);

				streakData = {
					current: user.currentStreak,
					longest: user.longestStreak,
					broken: !streakValid && user.currentStreak > 0,
				};
			}

			return res.json({
				user: {
					id: user.id,
					username: user.username,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
				},
				classes,
				...(streakData && { streak: streakData }),
			});
		} catch (err: unknown) {
			console.error('Token verification error:', err);
			return res.status(401).json({ message: 'Invalid token' });
		}
	}
}
