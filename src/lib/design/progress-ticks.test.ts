import { describe, expect, it } from 'vitest';
import { filledTicks } from './progress-ticks.ts';

describe('filledTicks', () => {
	it('fills the share of ticks the value has reached, rounded to the nearest tick', () => {
		expect(filledTicks({ value: 1359, max: 2200, ticks: 40 })).toBe(25);
	});

	it('fills every tick at or past the target', () => {
		expect(filledTicks({ value: 2200, max: 2200, ticks: 40 })).toBe(40);
		expect(filledTicks({ value: 3000, max: 2200, ticks: 40 })).toBe(40);
	});

	it('fills nothing without a positive target or a positive value', () => {
		expect(filledTicks({ value: 500, max: 0, ticks: 40 })).toBe(0);
		expect(filledTicks({ value: -5, max: 100, ticks: 40 })).toBe(0);
	});
});
