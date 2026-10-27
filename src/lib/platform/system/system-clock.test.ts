import { describe, expect, it } from 'vitest';
import { SystemClock } from './system-clock.ts';

describe('SystemClock', () => {
	it('reads the current instant', () => {
		const before = Date.now();
		const now = new SystemClock().now();

		expect(now).toBeGreaterThanOrEqual(before);
		expect(now).toBeLessThanOrEqual(Date.now());
	});

	it('reads today in the local time zone', () => {
		const local = new Date();
		const today = new SystemClock().today();

		expect(today.year).toBe(local.getFullYear());
		expect(today.month).toBe(local.getMonth() + 1);
		expect(today.day).toBe(local.getDate());
	});
});
