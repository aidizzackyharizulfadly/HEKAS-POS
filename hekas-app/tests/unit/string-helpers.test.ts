/**
 * Tests for string-helpers.ts — 60 tests
 */

import { describe, it, expect } from 'vitest';
import {
	truncate,
	slugify,
	capitalize,
	titleCase,
	maskPhone,
	maskEmail,
	maskGeneric,
	stripHtml,
	initials,
	template,
	normalizeWhitespace,
	escapeHtml,
	padStart,
	padEnd
} from '../../src/lib/utils/string-helpers';

describe('truncate', () => {
	it('returns string as-is if shorter than maxLength', () => {
		expect(truncate('Halo', 10)).toBe('Halo');
	});

	it('truncates with default suffix', () => {
		expect(truncate('Halo dunia yang indah', 10)).toBe('Halo duni…');
	});

	it('truncates with custom suffix', () => {
		expect(truncate('Halo dunia', 10, '...')).toBe('Halo dunia');
		expect(truncate('Halo dunia yang panjang', 10, '...')).toBe('Halo du...');
	});

	it('handles empty string', () => {
		expect(truncate('', 10)).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error - testing runtime guard
		expect(truncate(null, 10)).toBe('');
		// @ts-expect-error
		expect(truncate(undefined, 10)).toBe('');
	});

	it('returns empty when maxLength <= 0', () => {
		expect(truncate('Halo', 0)).toBe('');
		expect(truncate('Halo', -1)).toBe('');
	});

	it('trims trailing whitespace before suffix', () => {
		expect(truncate('Halo   dunia', 5)).toBe('Halo…');
	});
});

describe('slugify', () => {
	it('lowercase and replace spaces', () => {
		expect(slugify('Beras Cap Ayam')).toBe('beras-cap-ayam');
	});

	it('removes special characters', () => {
		expect(slugify('Beras Cap Ayam 5kg!')).toBe('beras-cap-ayam-5kg');
	});

	it('collapses multiple hyphens', () => {
		expect(slugify('hello---world')).toBe('hello-world');
	});

	it('trims leading and trailing hyphens', () => {
		expect(slugify('---hello world---')).toBe('hello-world');
	});

	it('handles empty string', () => {
		expect(slugify('')).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(slugify(null)).toBe('');
	});

	it('handles only special characters', () => {
		expect(slugify('!@#$%^')).toBe('');
	});

	it('strips diacritics', () => {
		expect(slugify('Café São Paulo')).toBe('cafe-sao-paulo');
	});
});

describe('capitalize', () => {
	it('uppercases first char', () => {
		expect(capitalize('halo')).toBe('Halo');
	});

	it('lowercases rest', () => {
		expect(capitalize('hALO')).toBe('Halo');
	});

	it('only capitalizes first word', () => {
		expect(capitalize('halo dunia')).toBe('Halo dunia');
	});

	it('handles empty string', () => {
		expect(capitalize('')).toBe('');
	});

	it('handles single char', () => {
		expect(capitalize('a')).toBe('A');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(capitalize(null)).toBe('');
	});
});

describe('titleCase', () => {
	it('capitalizes each word', () => {
		expect(titleCase('halo dunia')).toBe('Halo Dunia');
	});

	it('lowercases rest of each word', () => {
		expect(titleCase('HALO dunia')).toBe('Halo Dunia');
	});

	it('handles multiple spaces', () => {
		expect(titleCase('halo   dunia')).toBe('Halo Dunia');
	});

	it('handles empty string', () => {
		expect(titleCase('')).toBe('');
	});

	it('handles single word', () => {
		expect(titleCase('halo')).toBe('Halo');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(titleCase(null)).toBe('');
	});
});

describe('maskPhone', () => {
	it('masks 12-digit Indonesian phone', () => {
		expect(maskPhone('081234567890')).toBe('0812-****-7890');
	});

	it('handles phone with country code', () => {
		expect(maskPhone('6281234567890')).toBe('6281-****-7890');
	});

	it('returns as-is if too short', () => {
		expect(maskPhone('12345')).toBe('12345');
	});

	it('strips non-digit characters before masking', () => {
		expect(maskPhone('0812-3456-7890')).toBe('0812-****-7890');
	});

	it('handles empty/null', () => {
		expect(maskPhone('')).toBe('');
		// @ts-expect-error
		expect(maskPhone(null)).toBe('');
	});

	it('masks 13-digit phone', () => {
		const masked = maskPhone('62812345678901');
		expect(masked).toMatch(/^\d{4}-\*\*\*\*-\d{4}$/);
	});
});

describe('maskEmail', () => {
	it('masks local part', () => {
		expect(maskEmail('user@example.com')).toBe('us**@example.com');
	});

	it('masks short local part fully', () => {
		expect(maskEmail('ab@example.com')).toBe('**@example.com');
	});

	it('masks single char local', () => {
		expect(maskEmail('a@example.com')).toBe('*@example.com');
	});

	it('returns as-is if no @', () => {
		expect(maskEmail('noatsign')).toBe('noatsign');
	});

	it('returns as-is if @ at index 0', () => {
		expect(maskEmail('@example.com')).toBe('@example.com');
	});

	it('handles empty/null', () => {
		expect(maskEmail('')).toBe('');
		// @ts-expect-error
		expect(maskEmail(null)).toBe('');
	});

	it('masks long local part', () => {
		expect(maskEmail('verylongemail@example.com')).toBe('ve***********@example.com');
	});
});

describe('maskGeneric', () => {
	it('masks middle with default char', () => {
		expect(maskGeneric('1234567890', 2, 2)).toBe('12******90');
	});

	it('masks with custom char', () => {
		expect(maskGeneric('1234567890', 2, 2, '#')).toBe('12######90');
	});

	it('keeps entire string if keepStart + keepEnd >= length', () => {
		expect(maskGeneric('abc', 2, 2)).toBe('abc');
	});

	it('returns as-is if length 0', () => {
		expect(maskGeneric('', 2, 2)).toBe('');
	});

	it('masks all when keepStart=0 and keepEnd=0', () => {
		expect(maskGeneric('1234', 0, 0)).toBe('****');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(maskGeneric(null, 1, 1)).toBe('');
	});
});

describe('stripHtml', () => {
	it('removes simple tags', () => {
		expect(stripHtml('<b>Halo</b>')).toBe('Halo');
	});

	it('removes script tags but keeps text content', () => {
		expect(stripHtml('<script>alert(1)</script>')).toBe('alert(1)');
	});

	it('removes nested tags', () => {
		expect(stripHtml('<div><span>Halo</span> dunia</div>')).toBe('Halo dunia');
	});

	it('handles plain text', () => {
		expect(stripHtml('Halo dunia')).toBe('Halo dunia');
	});

	it('handles empty string', () => {
		expect(stripHtml('')).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(stripHtml(null)).toBe('');
	});
});

describe('initials', () => {
	it('takes first letter of each word', () => {
		expect(initials('Budi Setiawan')).toBe('BS');
	});

	it('limits to max initials', () => {
		expect(initials('Budi Setiawan Raharjo', 2)).toBe('BS');
		expect(initials('Budi Setiawan Raharjo', 3)).toBe('BSR');
	});

	it('handles single name', () => {
		expect(initials('Siti')).toBe('S');
	});

	it('handles extra whitespace', () => {
		expect(initials('  Budi   Setiawan  ')).toBe('BS');
	});

	it('returns empty for empty string', () => {
		expect(initials('')).toBe('');
	});

	it('returns empty for whitespace only', () => {
		expect(initials('   ')).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(initials(null)).toBe('');
	});

	it('default max=2', () => {
		expect(initials('A B C D E F')).toBe('AB');
	});
});

describe('template', () => {
	it('replaces single placeholder', () => {
		expect(template('Halo {name}', { name: 'Budi' })).toBe('Halo Budi');
	});

	it('replaces multiple placeholders', () => {
		expect(template('Halo {name}, total {total}', { name: 'Budi', total: 50000 })).toBe(
			'Halo Budi, total 50000'
		);
	});

	it('keeps unknown placeholders', () => {
		expect(template('Halo {name}, {unknown}', { name: 'Budi' })).toBe('Halo Budi, {unknown}');
	});

	it('handles empty replacements', () => {
		expect(template('Halo {name}', {})).toBe('Halo {name}');
	});

	it('handles number values', () => {
		expect(template('Total: {total}', { total: 100 })).toBe('Total: 100');
	});

	it('handles null/undefined values', () => {
		// @ts-expect-error - testing runtime guard
		expect(template('Halo {name}', { name: null })).toBe('Halo {name}');
		// @ts-expect-error
		expect(template('Halo {name}', { name: undefined })).toBe('Halo {name}');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(template(null, {})).toBe('');
	});
});

describe('normalizeWhitespace', () => {
	it('collapses multiple spaces', () => {
		expect(normalizeWhitespace('halo   dunia')).toBe('halo dunia');
	});

	it('replaces newlines with space', () => {
		expect(normalizeWhitespace('halo\n\ndunia')).toBe('halo dunia');
	});

	it('handles mixed whitespace', () => {
		expect(normalizeWhitespace('halo \t\n  dunia')).toBe('halo dunia');
	});

	it('trims leading/trailing', () => {
		expect(normalizeWhitespace('  halo dunia  ')).toBe('halo dunia');
	});

	it('handles empty string', () => {
		expect(normalizeWhitespace('')).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(normalizeWhitespace(null)).toBe('');
	});
});

describe('escapeHtml', () => {
	it('escapes < and >', () => {
		expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
	});

	it('escapes &', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
	});

	it('escapes quotes', () => {
		expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
		expect(escapeHtml("it's")).toBe('it&#39;s');
	});

	it('escapes all special chars together', () => {
		expect(escapeHtml('<a href="x">\'&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
	});

	it('handles plain text', () => {
		expect(escapeHtml('Halo dunia')).toBe('Halo dunia');
	});

	it('handles empty string', () => {
		expect(escapeHtml('')).toBe('');
	});

	it('handles non-string input', () => {
		// @ts-expect-error
		expect(escapeHtml(null)).toBe('');
	});
});

describe('padStart', () => {
	it('pads with default char (space)', () => {
		expect(padStart('5', 3)).toBe('  5');
	});

	it('pads with custom char', () => {
		expect(padStart('5', 3, '0')).toBe('005');
	});

	it('returns as-is if already long enough', () => {
		expect(padStart('hello', 3)).toBe('hello');
	});

	it('accepts number input', () => {
		expect(padStart(5, 3, '0')).toBe('005');
	});

	it('handles null/undefined', () => {
		// @ts-expect-error - testing runtime guard
		expect(padStart(null, 3, '0')).toBe('000');
		// @ts-expect-error
		expect(padStart(undefined, 3, '0')).toBe('000');
	});

	it('handles length 0', () => {
		expect(padStart('hello', 0)).toBe('hello');
	});
});

describe('padEnd', () => {
	it('pads with default char (space)', () => {
		expect(padEnd('5', 3)).toBe('5  ');
	});

	it('pads with custom char', () => {
		expect(padEnd('5', 3, '0')).toBe('500');
	});

	it('returns as-is if already long enough', () => {
		expect(padEnd('hello', 3)).toBe('hello');
	});

	it('accepts number input', () => {
		expect(padEnd(5, 3, '0')).toBe('500');
	});

	it('handles null/undefined', () => {
		// @ts-expect-error - testing runtime guard
		expect(padEnd(null, 3, '0')).toBe('000');
		// @ts-expect-error
		expect(padEnd(undefined, 3, '0')).toBe('000');
	});

	it('handles length 0', () => {
		expect(padEnd('hello', 0)).toBe('hello');
	});
});
