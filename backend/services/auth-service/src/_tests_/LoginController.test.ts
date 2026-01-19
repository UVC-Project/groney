import { describe, it, expect } from 'vitest';
import LoginController from '../app/Controllers/LoginController';

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
	});
});
