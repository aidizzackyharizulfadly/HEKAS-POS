/**
 * Unit tests untuk lib/api/ — pure functions only.
 * (HTTP/mock integration di-test manual + e2e playwright)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { recordFailedAttempt, clearAttempts, canAttemptPin, getLockoutRemaining } from '../../src/lib/auth/pin';

describe('auth/pin (attempts)', () => {
	const TEST_USER = 'test_user_attempts';

	beforeEach(() => {
		clearAttempts(TEST_USER);
	});

	it('canAttemptPin returns true initially', () => {
		expect(canAttemptPin(TEST_USER)).toBe(true);
	});

	it('recordFailedAttempt decrements attemptsLeft', () => {
		const r1 = recordFailedAttempt(TEST_USER);
		expect(r1.attemptsLeft).toBe(4);
		expect(r1.lockedMs).toBe(0);

		const r2 = recordFailedAttempt(TEST_USER);
		expect(r2.attemptsLeft).toBe(3);
	});

	it('locks after 5 failed attempts', () => {
		for (let i = 0; i < 5; i++) recordFailedAttempt(TEST_USER);
		const remaining = getLockoutRemaining(TEST_USER);
		expect(remaining).toBeGreaterThan(0);
		expect(remaining).toBeLessThanOrEqual(15 * 60 * 1000);
	});

	it('clearAttempts resets state', () => {
		recordFailedAttempt(TEST_USER);
		clearAttempts(TEST_USER);
		expect(canAttemptPin(TEST_USER)).toBe(true);
		expect(getLockoutRemaining(TEST_USER)).toBe(0);
	});
});
