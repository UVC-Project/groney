import { describe, it, expect } from 'vitest';
import LoginController from '../app/Controllers/LoginController';

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
	});
});
