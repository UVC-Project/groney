import { describe, it, expect } from 'vitest';
import LoginController from '../app/Controllers/LoginController';

// Milestone rewards matching the constants in LoginController
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

// Helper function to check if a milestone should be rewarded (replicates login method logic)
function shouldRewardMilestone(
	currentStreak: number,
	previousStreak: number,
	lastMilestoneReached: number
): boolean {
	const streakChanged = currentStreak !== previousStreak;
	const milestoneReward = STREAK_MILESTONES[currentStreak] || 0;
	let newLastMilestoneReached = lastMilestoneReached;

	// If streak was broken/reset, reset milestone tracking
	if (currentStreak === 1 && streakChanged) {
		newLastMilestoneReached = 0;
	}

	return streakChanged && milestoneReward > 0 && currentStreak > newLastMilestoneReached;
}

// Helper function to get yesterday's date in Amsterdam timezone (for testing)
function getAmsterdamYesterday(): Date {
	const now = new Date();
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
	const today = new Date(Date.UTC(year, month, day));
	return new Date(today.getTime() - 24 * 60 * 60 * 1000);
}

// Helper function to get a date N days ago in Amsterdam timezone (for testing)
function getAmsterdamDaysAgo(daysAgo: number): Date {
	const now = new Date();
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
	const today = new Date(Date.UTC(year, month, day));
	return new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

describe('LoginController', () => {
	describe('calculateStreak', () => {
		describe('first login (no previous login date)', () => {
			it('should start streak at 1 when user logs in for the first time', () => {
				//  User has never logged in before
				const lastLoginDate = null;
				const currentStreak = 0;
				const longestStreak = 0;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(1);
			});

			it('should set longest streak to 1 when user logs in for the first time with no prior streak history', () => {
				// User has never logged in before
				const lastLoginDate = null;
				const currentStreak = 0;
				const longestStreak = 0;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.longestStreak).toBe(1);
			});

			it('should preserve existing longest streak if it is greater than 1 on first login', () => {
				//  Edge case - user has a longest streak from before (e.g., data migration)
				const lastLoginDate = null;
				const currentStreak = 0;
				const longestStreak = 5;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.longestStreak).toBe(5);
				expect(result.currentStreak).toBe(1);
			});

			it('should not mark streak as broken on first login', () => {
				//  User has never logged in before
				const lastLoginDate = null;
				const currentStreak = 0;
				const longestStreak = 0;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.streakBroken).toBe(false);
			});
		});

		describe('same-day login (already logged in today)', () => {
			it('should not change current streak when logging in again on the same day', () => {
				// User already logged in today with an active streak
				const lastLoginDate = new Date(); // Today
				const currentStreak = 5;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(5);
			});

			it('should not change longest streak when logging in again on the same day', () => {
				// User already logged in today
				const lastLoginDate = new Date(); // Today
				const currentStreak = 5;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.longestStreak).toBe(10);
			});

			it('should return the same streak values for multiple logins on the same day', () => {
				// User logged in earlier today with streak of 1
				const lastLoginDate = new Date(); // Today
				const currentStreak = 1;
				const longestStreak = 1;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert - both values should remain unchanged
				expect(result.currentStreak).toBe(1);
				expect(result.longestStreak).toBe(1);
			});

			it('should not mark streak as broken on same-day login', () => {
				// User already logged in today
				const lastLoginDate = new Date(); // Today
				const currentStreak = 7;
				const longestStreak = 14;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.streakBroken).toBe(false);
			});
		});

		describe('next-day login (logged in yesterday)', () => {
			it('should increment current streak by 1 when logging in the day after previous login', () => {
				// User logged in yesterday with streak of 1
				const lastLoginDate = getAmsterdamYesterday();
				const currentStreak = 1;
				const longestStreak = 1;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(2);
			});

			it('should increment streak from any value when logging in the next day', () => {
				// User logged in yesterday with streak of 5
				const lastLoginDate = getAmsterdamYesterday();
				const currentStreak = 5;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(6);
			});

			it('should update longest streak when new streak exceeds previous longest', () => {
				// User logged in yesterday with streak of 10, longest was 10
				const lastLoginDate = getAmsterdamYesterday();
				const currentStreak = 10;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert - new streak of 11 should become the longest
				expect(result.currentStreak).toBe(11);
				expect(result.longestStreak).toBe(11);
			});

			it('should preserve longest streak when new streak does not exceed it', () => {
				// User logged in yesterday with streak of 5, longest was 20
				const lastLoginDate = getAmsterdamYesterday();
				const currentStreak = 5;
				const longestStreak = 20;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert - streak increments but longest stays the same
				expect(result.currentStreak).toBe(6);
				expect(result.longestStreak).toBe(20);
			});

			it('should not mark streak as broken when logging in the next day', () => {
				// User logged in yesterday, continuing their streak
				const lastLoginDate = getAmsterdamYesterday();
				const currentStreak = 7;
				const longestStreak = 14;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.streakBroken).toBe(false);
			});
		});

		describe('missed day login (gap of 2+ days)', () => {
			it('should reset streak to 1 when user misses at least one day between logins', () => {
				// User last logged in 2 days ago with streak of 5
				const lastLoginDate = getAmsterdamDaysAgo(2);
				const currentStreak = 5;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(1);
			});

			it('should reset streak to 1 when gap is multiple days (e.g., 7 days)', () => {
				// User last logged in 7 days ago with streak of 12
				const lastLoginDate = getAmsterdamDaysAgo(7);
				const currentStreak = 12;
				const longestStreak = 20;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.currentStreak).toBe(1);
			});

			it('should preserve longest streak when streak is reset due to missed days', () => {
				// User last logged in 3 days ago with streak of 8, longest was 15
				const lastLoginDate = getAmsterdamDaysAgo(3);
				const currentStreak = 8;
				const longestStreak = 15;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// streak resets but longest is preserved
				expect(result.currentStreak).toBe(1);
				expect(result.longestStreak).toBe(15);
			});

			it('should mark streak as broken when user had an active streak', () => {
				// User last logged in 2 days ago with streak of 10
				const lastLoginDate = getAmsterdamDaysAgo(2);
				const currentStreak = 10;
				const longestStreak = 10;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				// Assert
				expect(result.streakBroken).toBe(true);
			});

			it('should not mark streak as broken when user had no active streak (streak was already 0)', () => {
				// User last logged in 5 days ago with no active streak
				const lastLoginDate = getAmsterdamDaysAgo(5);
				const currentStreak = 0;
				const longestStreak = 5;

				// Act
				const result = LoginController.calculateStreak(
					lastLoginDate,
					currentStreak,
					longestStreak
				);

				//  streak starts at 1 but wasn't "broken" since there was no active streak
				expect(result.currentStreak).toBe(1);
				expect(result.streakBroken).toBe(false);
			});
		});

		describe('milestone unlocking', () => {
			describe('milestone unlocks at exact threshold', () => {
				it('should unlock 3-day milestone when streak reaches exactly 3', () => {
					// User logs in and streak changes from 2 to 3
					const currentStreak = 3;
					const previousStreak = 2;
					const lastMilestoneReached = 0;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(true);
					expect(STREAK_MILESTONES[3]).toBe(2); // Verify milestone reward value
				});

				it('should unlock 5-day milestone when streak reaches exactly 5', () => {
					// User logs in and streak changes from 4 to 5
					const currentStreak = 5;
					const previousStreak = 4;
					const lastMilestoneReached = 3; // Already reached 3-day milestone

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(true);
					expect(STREAK_MILESTONES[5]).toBe(5);
				});

				it('should unlock 7-day milestone when streak reaches exactly 7', () => {
					// User logs in and streak changes from 6 to 7
					const currentStreak = 7;
					const previousStreak = 6;
					const lastMilestoneReached = 5;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(true);
					expect(STREAK_MILESTONES[7]).toBe(7);
				});

				it('should unlock 14-day milestone when streak reaches exactly 14', () => {
					// User logs in and streak changes from 13 to 14
					const currentStreak = 14;
					const previousStreak = 13;
					const lastMilestoneReached = 7;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(true);
					expect(STREAK_MILESTONES[14]).toBe(10);
				});
			});

			describe('milestone does not unlock before threshold', () => {
				it('should not unlock 3-day milestone when streak is 2', () => {
					// User logs in and streak changes from 1 to 2
					const currentStreak = 2;
					const previousStreak = 1;
					const lastMilestoneReached = 0;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(false);
					expect(STREAK_MILESTONES[2]).toBeUndefined();
				});

				it('should not unlock 5-day milestone when streak is 4', () => {
					// User logs in and streak changes from 3 to 4
					const currentStreak = 4;
					const previousStreak = 3;
					const lastMilestoneReached = 3; // Already reached 3-day milestone

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(false);
					expect(STREAK_MILESTONES[4]).toBeUndefined();
				});

				it('should not unlock 7-day milestone when streak is 6', () => {
					// User logs in and streak changes from 5 to 6
					const currentStreak = 6;
					const previousStreak = 5;
					const lastMilestoneReached = 5;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(false);
					expect(STREAK_MILESTONES[6]).toBeUndefined();
				});
			});

			describe('milestone cannot unlock twice', () => {
				it('should not unlock 3-day milestone again if already reached', () => {
					// User logs in again on same day after already reaching 3-day milestone
					const currentStreak = 3;
					const previousStreak = 3; // Same streak (no change, already logged in today)
					const lastMilestoneReached = 3; // Already reached this milestone

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(false);
				});

				it('should not unlock 5-day milestone again if already reached in previous login', () => {
					// User logs in and streak is still 5, but milestone was already unlocked
					const currentStreak = 5;
					const previousStreak = 5; // No streak change (same-day login)
					const lastMilestoneReached = 5; // Already reached this milestone

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// Assert
					expect(shouldReward).toBe(false);
				});

				it('should not unlock milestone when current streak equals lastMilestoneReached', () => {
					// User reaches milestone, then logs in again on same day
					const currentStreak = 7;
					const previousStreak = 7;
					const lastMilestoneReached = 7;

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// should not reward because streak is not greater than lastMilestoneReached
					expect(shouldReward).toBe(false);
				});

				it('should unlock next milestone after previous one was reached', () => {
					// User already reached 5-day milestone, now reaching 7-day milestone
					const currentStreak = 7;
					const previousStreak = 6;
					const lastMilestoneReached = 5; // Already reached 5, but not 7

					// Act
					const shouldReward = shouldRewardMilestone(
						currentStreak,
						previousStreak,
						lastMilestoneReached
					);

					// should unlock 7-day milestone
					expect(shouldReward).toBe(true);
				});
			});

			describe('milestone reset when streak breaks', () => {
				it('should reset milestone tracking when streak breaks and resets to 1', () => {
					// User had streak of 10 (reached milestones), then missed days
					// Now logging in again, streak resets to 1
					const currentStreak: number = 1;
					const previousStreak: number = 10; // Streak was broken

					// Act - simulate the logic when streak resets
					const streakChanged = currentStreak !== previousStreak;
					let newLastMilestoneReached = 7;
					
					// If streak was broken/reset, reset milestone tracking
					if (currentStreak === 1 && streakChanged) {
						newLastMilestoneReached = 0;
					}

					// milestone tracking should be reset
					expect(newLastMilestoneReached).toBe(0);
					
					// Now check if 3-day milestone can be unlocked again (after reset)
					const shouldReward = shouldRewardMilestone(
						3, // Future login reaching 3 days
						2,
						0 // Reset milestone tracking
					);
					
					expect(shouldReward).toBe(true);
				});
			});

			describe('multiple milestone thresholds', () => {
				it('should correctly identify all milestone days', () => {
					const milestoneDays = [3, 5, 7, 14, 30, 60, 90, 180, 365];
					
					milestoneDays.forEach(day => {
						expect(STREAK_MILESTONES[day]).toBeGreaterThan(0);
					});
				});

				it('should return 0 reward for non-milestone days', () => {
					const nonMilestoneDays = [1, 2, 4, 6, 8, 10, 15, 20, 50, 100];
					
					nonMilestoneDays.forEach(day => {
						expect(STREAK_MILESTONES[day] || 0).toBe(0);
					});
				});
			});
		});
	});
});
