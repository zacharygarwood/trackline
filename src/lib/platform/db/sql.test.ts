import { describe, expect, it } from 'vitest';
import { toSqlRow } from './sql.ts';

describe('toSqlRow', () => {
	it('keeps text, numbers, null, and blobs', () => {
		const blob = new Uint8Array([1, 2]);

		expect(toSqlRow({ a: 'x', b: 1.5, c: null, d: blob })).toEqual({
			a: 'x',
			b: 1.5,
			c: null,
			d: blob
		});
	});

	it('converts safe bigint integers to numbers', () => {
		expect(toSqlRow({ count: 3n })).toEqual({ count: 3 });
	});

	it('rejects integers too large for a number', () => {
		expect(() => toSqlRow({ count: 2n ** 60n })).toThrow('count');
	});

	it('rejects values SQLite cannot hold', () => {
		expect(() => toSqlRow({ flag: true })).toThrow('flag');
	});
});
