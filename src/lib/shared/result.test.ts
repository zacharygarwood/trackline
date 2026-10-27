import { describe, expect, it } from 'vitest';
import { err, ok } from './result.ts';

describe('Result', () => {
	it('wraps a success value', () => {
		const result = ok(42);

		expect(result.ok).toBe(true);
		expect(result.value).toBe(42);
	});

	it('wraps an expected failure', () => {
		const result = err('too heavy');

		expect(result.ok).toBe(false);
		expect(result.error).toBe('too heavy');
	});
});
