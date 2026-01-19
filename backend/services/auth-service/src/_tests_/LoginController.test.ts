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
	});
});
