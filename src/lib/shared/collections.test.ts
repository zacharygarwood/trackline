import { describe, expect, it } from 'vitest';
import { elementAt, first, last } from './collections.ts';

describe('first', () => {
	it('returns the first element', () => {
		expect(first(['a', 'b'])).toBe('a');
	});

	it('returns undefined for an empty list', () => {
		expect(first<string>([])).toBeUndefined();
	});
});

describe('last', () => {
	it('returns the last element', () => {
		expect(last(['a', 'b'])).toBe('b');
	});

	it('returns undefined for an empty list', () => {
		expect(last<string>([])).toBeUndefined();
	});
});

describe('elementAt', () => {
	it('returns the element at a position', () => {
		expect(elementAt(['a', 'b', 'c'], 1)).toBe('b');
	});

	it('returns undefined outside the list', () => {
		expect(elementAt(['a'], 3)).toBeUndefined();
		expect(elementAt(['a'], -1)).toBeUndefined();
	});
});
