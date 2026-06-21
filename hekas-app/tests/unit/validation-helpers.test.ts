/**
 * Unit tests untuk validation-helpers.
 */
import { describe, it, expect } from 'vitest';
import {
	composeValidators,
	required,
	minLength,
	maxLength,
	numberRange,
	positiveNumber,
	nonNegativeNumber,
	pattern,
	PATTERNS,
	oneOf,
	isFutureDate,
	isPastDate,
	sanitizeString,
	clampNumber,
	roundHalf
} from '../../src/lib/utils/validation-helpers';

describe('composeValidators', () => {
	it('all pass → valid', () => {
		const r = composeValidators('hello', required(), minLength(3));
		expect(r.valid).toBe(true);
	});

	it('first fail short-circuit', () => {
		const r = composeValidators('', required(), minLength(3));
		expect(r.valid).toBe(false);
		expect(r.error).toBeTruthy();
	});

	it('chained validation messages', () => {
		const r = composeValidators('hi', required(), minLength(5, 'Terlalu pendek'));
		expect(r.valid).toBe(false);
		expect(r.error).toBe('Terlalu pendek');
	});

	it('empty validators → always valid', () => {
		const r = composeValidators('anything');
		expect(r.valid).toBe(true);
	});
});

describe('required', () => {
	it('non-empty string → valid', () => {
		expect(required()('hello').valid).toBe(true);
	});

	it('empty string → invalid', () => {
		const r = required();
		expect(r('').valid).toBe(false);
	});

	it('whitespace-only → invalid', () => {
		expect(required()('   ').valid).toBe(false);
	});

	it('null/undefined → invalid', () => {
		expect(required()(null).valid).toBe(false);
		expect(required()(undefined).valid).toBe(false);
	});

	it('empty array → invalid', () => {
		expect(required()([]).valid).toBe(false);
	});

	it('non-empty array → valid', () => {
		expect(required()([1, 2]).valid).toBe(true);
	});

	it('zero is valid (not empty)', () => {
		expect(required()(0).valid).toBe(true);
	});
});

describe('minLength', () => {
	it('exact length → valid', () => {
		expect(minLength(5)('hello').valid).toBe(true);
	});

	it('longer → valid', () => {
		expect(minLength(5)('hello world').valid).toBe(true);
	});

	it('shorter → invalid', () => {
		expect(minLength(5)('hi').valid).toBe(false);
	});

	it('custom error message', () => {
		expect(minLength(3, 'Custom msg')('hi').error).toBe('Custom msg');
	});

	it('non-string → invalid', () => {
		expect(minLength(5)(123 as any).valid).toBe(false);
	});

	it('empty string + min 0 → valid', () => {
		expect(minLength(0)('').valid).toBe(true);
	});
});

describe('maxLength', () => {
	it('exact length → valid', () => {
		expect(maxLength(5)('hello').valid).toBe(true);
	});

	it('shorter → valid', () => {
		expect(maxLength(5)('hi').valid).toBe(true);
	});

	it('longer → invalid', () => {
		expect(maxLength(5)('hello world').valid).toBe(false);
	});
});

describe('numberRange', () => {
	it('in range → valid', () => {
		expect(numberRange(1, 10)(5).valid).toBe(true);
	});

	it('below min → invalid', () => {
		expect(numberRange(1, 10)(0).valid).toBe(false);
	});

	it('above max → invalid', () => {
		expect(numberRange(1, 10)(11).valid).toBe(false);
	});

	it('boundary values', () => {
		expect(numberRange(1, 10)(1).valid).toBe(true);
		expect(numberRange(1, 10)(10).valid).toBe(true);
	});

	it('NaN → invalid', () => {
		expect(numberRange(1, 10)(NaN).valid).toBe(false);
	});

	it('non-number → invalid', () => {
		expect(numberRange(1, 10)('5' as any).valid).toBe(false);
	});
});

describe('positiveNumber', () => {
	it('positive → valid', () => {
		expect(positiveNumber()(5).valid).toBe(true);
	});

	it('zero → invalid', () => {
		expect(positiveNumber()(0).valid).toBe(false);
	});

	it('negative → invalid', () => {
		expect(positiveNumber()(-1).valid).toBe(false);
	});

	it('NaN → invalid', () => {
		expect(positiveNumber()(NaN).valid).toBe(false);
	});
});

describe('nonNegativeNumber', () => {
	it('zero → valid', () => {
		expect(nonNegativeNumber()(0).valid).toBe(true);
	});

	it('positive → valid', () => {
		expect(nonNegativeNumber()(5).valid).toBe(true);
	});

	it('negative → invalid', () => {
		expect(nonNegativeNumber()(-1).valid).toBe(false);
	});
});

describe('pattern', () => {
	it('matches → valid', () => {
		expect(pattern(PATTERNS.email)('test@example.com').valid).toBe(true);
	});

	it('not match → invalid', () => {
		expect(pattern(PATTERNS.email)('invalid-email').valid).toBe(false);
	});

	it('custom pattern (PIN 6 digit)', () => {
		expect(pattern(PATTERNS.pin6Digit)('123456').valid).toBe(true);
		expect(pattern(PATTERNS.pin6Digit)('12345').valid).toBe(false);
		expect(pattern(PATTERNS.pin6Digit)('1234567').valid).toBe(false);
	});
});

describe('PATTERNS', () => {
	it('email valid', () => {
		expect(PATTERNS.email.test('user@domain.com')).toBe(true);
		expect(PATTERNS.email.test('user+tag@sub.domain.co.id')).toBe(true);
	});

	it('email invalid', () => {
		expect(PATTERNS.email.test('no-at-sign')).toBe(false);
		expect(PATTERNS.email.test('@no-user.com')).toBe(false);
		expect(PATTERNS.email.test('no-domain@')).toBe(false);
	});

	it('phone ID valid', () => {
		expect(PATTERNS.phoneId.test('081234567890')).toBe(true);
		expect(PATTERNS.phoneId.test('+6281234567890')).toBe(true);
		expect(PATTERNS.phoneId.test('62812345678')).toBe(true);
	});

	it('phone ID invalid', () => {
		expect(PATTERNS.phoneId.test('0712345678')).toBe(false); // bukan 08
		expect(PATTERNS.phoneId.test('0812')).toBe(false); // terlalu pendek
	});

	it('username valid', () => {
		expect(PATTERNS.username.test('admin')).toBe(true);
		expect(PATTERNS.username.test('user_123')).toBe(true);
	});

	it('username invalid', () => {
		expect(PATTERNS.username.test('ab')).toBe(false); // too short
		expect(PATTERNS.username.test('user@domain')).toBe(false); // @
	});
});

describe('oneOf', () => {
	const validator1 = oneOf<string>(['cash', 'qris', 'debit']);
	const validator2 = oneOf<string>(['cash', 'qris']);
	const validator3 = oneOf<string>(['a', 'b'], 'Invalid choice');

	it('value in allowed → valid', () => {
		expect(validator1('cash').valid).toBe(true);
	});

	it('value not in allowed → invalid', () => {
		expect(validator2('crypto').valid).toBe(false);
	});

	it('custom error message', () => {
		expect(validator3('c').error).toBe('Invalid choice');
	});
});

describe('date validators', () => {
	it('isFutureDate → true untuk besok', () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expect(isFutureDate(tomorrow)).toBe(true);
	});

	it('isFutureDate → false untuk kemarin', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(isFutureDate(yesterday)).toBe(false);
	});

	it('isPastDate → true untuk kemarin', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(isPastDate(yesterday)).toBe(true);
	});

	it('isPastDate → false untuk besok', () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		expect(isPastDate(tomorrow)).toBe(false);
	});

	it('invalid input → false', () => {
		expect(isFutureDate('invalid')).toBe(false);
		expect(isPastDate('invalid')).toBe(false);
	});
});

describe('sanitizeString', () => {
	it('trim whitespace', () => {
		expect(sanitizeString('  hello  ')).toBe('hello');
	});

	it('collapse multiple spaces', () => {
		expect(sanitizeString('hello   world')).toBe('hello world');
	});

	it('combine trim + collapse', () => {
		expect(sanitizeString('  hello   world  ')).toBe('hello world');
	});

	it('tabs and newlines juga di-collapse', () => {
		expect(sanitizeString('hello\tworld\nfoo')).toBe('hello world foo');
	});

	it('empty string', () => {
		expect(sanitizeString('')).toBe('');
	});

	it('non-string → empty', () => {
		expect(sanitizeString(123 as any)).toBe('');
	});

	it('preserve internal hyphens', () => {
		expect(sanitizeString('  PT Sumber-Makmur  ')).toBe('PT Sumber-Makmur');
	});
});

describe('clampNumber', () => {
	it('value in range → unchanged', () => {
		expect(clampNumber(5, 1, 10)).toBe(5);
	});

	it('value below min → clamp to min', () => {
		expect(clampNumber(-5, 0, 10)).toBe(0);
	});

	it('value above max → clamp to max', () => {
		expect(clampNumber(15, 0, 10)).toBe(10);
	});

	it('NaN → return min', () => {
		expect(clampNumber(NaN, 0, 10)).toBe(0);
	});

	it('exact boundaries', () => {
		expect(clampNumber(0, 0, 10)).toBe(0);
		expect(clampNumber(10, 0, 10)).toBe(10);
	});

	it('negative range', () => {
		expect(clampNumber(-5, -10, -1)).toBe(-5);
		expect(clampNumber(0, -10, -1)).toBe(-1);
		expect(clampNumber(-15, -10, -1)).toBe(-10);
	});
});

describe('roundHalf', () => {
	it('round .5 ke atas (Math.round)', () => {
		expect(roundHalf(1.5)).toBe(2);
		expect(roundHalf(2.5)).toBe(3);
	});

	it('round < .5 ke bawah', () => {
		expect(roundHalf(1.4)).toBe(1);
	});

	it('round negative', () => {
		expect(roundHalf(-1.5)).toBe(-1); // JS Math.round rounds half to +∞
	});

	it('NaN → 0', () => {
		expect(roundHalf(NaN)).toBe(0);
	});

	it('integer unchanged', () => {
		expect(roundHalf(5)).toBe(5);
	});
});
