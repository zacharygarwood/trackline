import { describe, expect, it } from 'vitest';
import { parseNumberEntry, type NumberRange } from './number-entry.ts';

const weight: NumberRange = { min: 0, max: 500, step: 2.5 };

describe('parseNumberEntry', () => {
	it('reads a typed number', () => {
		expect(parseNumberEntry('62.5', weight)).toBe(62.5);
	});

	it('accepts a comma as the decimal separator', () => {
		expect(parseNumberEntry('62,5', weight)).toBe(62.5);
	});

	it('keeps the value within the range', () => {
		expect(parseNumberEntry('900', weight)).toBe(500);
		expect(parseNumberEntry('-5', weight)).toBe(0);
	});

	it.each(['', '  ', 'abc'])('rejects %j', (text) => {
		expect(parseNumberEntry(text, weight)).toBeUndefined();
	});
});
